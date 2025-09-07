import type { Request, Response } from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";

import { SECRET_VARIABLES } from "../config/secret-variable.js";
import { PrismaClient, Role, type SupplierDocument } from "../generated/prisma/client.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

const prisma = new PrismaClient();

// Multer file filter to accept only PDF files
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed."));
  }
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/suppliers");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB in bytes
    files: 3,
  },
});

// Apply to be a supplier
export const applySupplier = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.user!;
  const files = req.files as Express.Multer.File[];

  try {
    // Ensure a file has been uploaded
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Documents are required to apply." });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { supplierProfile: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isSupplier) {
      return res.status(400).json({ message: "User is already a supplier or has an application in progress." });
    }

    // Create a new supplier profile
    const supplierProfile = await prisma.supplierProfile.create({
      data: {
        userId: user.id,
        supplierStatus: "PENDING",
      },
    });

    // Create SupplierDocument records and link them to the new SupplierProfile
    const documents = files.map((file) => ({
      supplierProfileId: supplierProfile.id,
      fileName: file.originalname,
      fileUrl: file.path,
      fileType: file.mimetype,
    }));

    await prisma.supplierDocument.createMany({
      data: documents,
    });

    // Update user's isSupplier status
    await prisma.user.update({
      where: { id },
      data: { isSupplier: true },
    });

    return res.status(200).json({ message: "Supplier application submitted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong.", error });
  }
};

// Get supplier profile (including status and documents)
export const getSupplierProfile = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.user!;

  try {
    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: id },
      include: {
        documents: true,
        user: {
          select: {
            role: true,
          },
        },
      },
    });

    if (!supplierProfile) {
      return res.status(404).json({ message: "Supplier profile not found." });
    }

    // Determine what information to show based on supplier status and role
    type ResponseData = {
      status: string | null;
      rejectionReason?: string | null;
      documents?: SupplierDocument[];
      profile?: {
        businessName?: string | null;
        address?: string | null;
        city?: string | null;
        state?: string | null;
        zipCode?: string | null;
      } | null;
    };

    const responseData: ResponseData = {
      status: supplierProfile.supplierStatus,
      rejectionReason: supplierProfile.rejectionReason,
      documents: supplierProfile.documents,
      profile: null,
    };

    if (supplierProfile.supplierStatus === "APPROVED") {
      responseData.profile = {
        businessName: supplierProfile.businessName,
        address: supplierProfile.address,
        city: supplierProfile.city,
        state: supplierProfile.state,
        zipCode: supplierProfile.zipCode,
      };
    }

    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong.", error });
  }
};

// Update supplier profile (for APPROVED suppliers)
export const updateSupplierProfile = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.user!;
  const { businessName, address, city, state, zipCode } = req.body;

  try {
    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: id },
    });

    if (!supplierProfile || supplierProfile.supplierStatus !== "APPROVED") {
      return res.status(403).json({ message: "You are not authorized to update this profile." });
    }

    const updatedProfile = await prisma.supplierProfile.update({
      where: { userId: id },
      data: {
        businessName,
        address,
        city,
        state,
        zipCode,
      },
    });

    return res.status(200).json({ message: "Profile updated successfully.", profile: updatedProfile });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong.", error });
  }
};

// Delete supplier profile
export const deleteSupplierProfile = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.user!;

  try {
    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: id },
    });

    if (!supplierProfile) {
      return res.status(404).json({ message: "Supplier profile not found." });
    }

    await prisma.supplierProfile.delete({
      where: { userId: id },
    });

    await prisma.user.update({
      where: { id },
      data: { isSupplier: false },
    });

    return res.status(200).json({ message: "Supplier profile deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong.", error });
  }
};

// Helper function to send files with appropriate headers for viewing or downloading
const sendFileWithHeaders = (res: Response, filePath: string, fileName: string, fileType: string, isView: boolean) => {
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found on server." });
  }

  if (isView) {
    // Stream the file for viewing
    res.setHeader("Content-Type", fileType);
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } else {
    // Use res.download() for downloading, which handles headers and streaming automatically
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("File download failed:", err);
        return res.status(500).json({ message: "Failed to download file." });
      }
    });
  }
};

// Generate a secure download link with a JWT token
export const generateDownloadOrViewLink = async (req: AuthenticatedRequest, res: Response) => {
  const { id: fileId } = req.params;
  const { id: userId, role } = req.user!;
  let token = "";

  try {
    if (!fileId) {
      return res.status(400).json({ message: "File ID is required." });
    }

    const file = await prisma.supplierDocument.findUnique({
      where: { id: fileId },
      include: {
        supplierProfile: true,
      },
    });

    if (!file) {
      return res.status(404).json({ message: "File not found." });
    }

    if (role === Role.SUPPLIER || role === Role.USER) {
      // Check for ownership
      if (file.supplierProfile?.userId !== userId) {
        return res.status(403).json({ message: "You do not have permission to access this file." });
      }

      token = jwt.sign(
        { fileId: file.id, supplierProfileId: file.supplierProfileId, accessType: "download" },
        SECRET_VARIABLES.jwt_secret,
        { expiresIn: "15m" } // Link valid for 15 minutes
      );
    } else if (role === Role.ADMIN || role === Role.REVIEWER) {
      token = jwt.sign(
        { fileId: file.id, accessType: "view" },
        SECRET_VARIABLES.jwt_secret,
        { expiresIn: "30m" } // Link valid for 30 minutes
      );
    } else {
      return res.status(403).json({ message: "You do not have permission to access this file." });
    }

    return res
      .status(200)
      .json({ downloadUrl: `${SECRET_VARIABLES.base_url}/suppliers/documents/download?token=${token}` });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong.", error });
  }
};

// Download the file using the secure token
export const accessFile = async (req: AuthenticatedRequest, res: Response) => {
  const { fileUrl, fileName, fileType, accessType } = req.dbFile as {
    fileUrl: string;
    fileName: string;
    fileType: string;
    accessType: "download" | "view";
  };

  try {
    return sendFileWithHeaders(res, fileUrl, fileName, fileType, accessType === "view");
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong.", error });
  }
};
