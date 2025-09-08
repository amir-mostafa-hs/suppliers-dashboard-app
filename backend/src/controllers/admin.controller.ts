import type { Response } from "express";
import { PrismaClient, Role, SupplierStatus, type User } from "prisma/generated/prisma/client.js";

import logger from "../config/logger.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { sendNotification } from "../services/notification.service.js";

const prisma = new PrismaClient();

// Get a list of all users with search and filter options
export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  const { role, email, status } = req.query;
  const userRole = req.user?.role;
  let users: User[] = [];

  try {
    if (userRole === Role.ADMIN) {
      users = await prisma.user.findMany({
        where: {
          ...(role && { role: role as Role }),
          ...(email && { email: { contains: email as string, mode: "insensitive" } }),
        },
        include: {
          supplierProfile: {
            ...(status && {
              where: {
                supplierStatus: status as SupplierStatus,
              },
            }),
            include: {
              documents: true,
            },
          },
        },
      });
    } else {
      if (role === Role.USER || role === Role.SUPPLIER) {
        users = await prisma.user.findMany({
          where: {
            ...(role && { role: role as Role }),
            ...(email && { email: { contains: email as string, mode: "insensitive" } }),
          },
          include: {
            supplierProfile: {
              ...(status && {
                where: {
                  supplierStatus: status as SupplierStatus,
                },
              }),
              include: {
                documents: true,
              },
            },
          },
        });
      }
    }
    return res.status(200).json(users);
  } catch (error) {
    logger.error("Error fetching users:", error);
    return res.status(500).json({ message: "Something went wrong.", error });
  }
};

// Get a specific user by ID
export const getUserById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userRole = req.user?.role;
  let user: User | null = null;

  try {
    if (!id) {
      return res.status(400).json({ message: "User ID is required." });
    }

    if (userRole === Role.ADMIN) {
      user = await prisma.user.findUnique({
        where: { id },
        include: {
          supplierProfile: {
            include: {
              documents: true,
            },
          },
        },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { id, OR: [{ role: "SUPPLIER" }, { role: "USER" }] },
        include: {
          supplierProfile: {
            include: {
              documents: true,
            },
          },
        },
      });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(user);
  } catch (error) {
    logger.error("Error fetching user by ID:", error);
    return res.status(500).json({ message: "Something went wrong.", error });
  }
};

// Update a user's role
export const updateUserRole = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  const userRole = req.user?.role;

  try {
    if (!Object.values(Role).includes(role)) {
      return res.status(400).json({ message: "Invalid role specified." });
    }

    if (!id) {
      return res.status(400).json({ message: "User ID is required." });
    }

    if (userRole !== Role.ADMIN) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, role: true },
    });

    logger.info(`User role updated: ${updatedUser.id} to ${updatedUser.role}`);

    return res.status(200).json({ message: "User role updated successfully.", user: updatedUser });
  } catch (error) {
    logger.error("Error updating user role:", error);
    return res.status(500).json({ message: "Something went wrong.", error });
  }
};

// Approve a supplier's application
export const approveSupplier = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!supplierProfile) {
      return res.status(404).json({ message: "Supplier application not found." });
    }

    if (supplierProfile.supplierStatus === SupplierStatus.APPROVED) {
      return res.status(400).json({ message: "Supplier application is already approved." });
    }

    const approvedProfile = await prisma.supplierProfile.update({
      where: { id },
      data: {
        supplierStatus: SupplierStatus.APPROVED,
      },
    });

    await prisma.user.update({
      where: { id: supplierProfile.userId },
      data: { role: Role.SUPPLIER },
    });

    // Send email notification
    const subject = "Your Supplier Application Has Been Approved!";
    const body = `<p>Congratulations! Your application to become a supplier has been approved.</p>`;
    await sendNotification(supplierProfile.userId, supplierProfile.user!.email, subject, body);

    logger.info(`Supplier application approved: ${approvedProfile.id} for user ${supplierProfile.userId}`);

    return res.status(200).json({ message: "Supplier application approved successfully.", profile: approvedProfile });
  } catch (error) {
    logger.error("Error approving supplier application:", error);
    return res.status(500).json({ message: "Something went wrong.", error });
  }
};

// Reject a supplier's application with a reason
export const rejectSupplier = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { rejectionReason } = req.body || {};

  try {
    if (!id) {
      return res.status(400).json({ message: "User ID is required." });
    }

    if (!rejectionReason) {
      return res.status(400).json({ message: "A rejection reason is required." });
    }

    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!supplierProfile) {
      return res.status(404).json({ message: "Supplier application not found." });
    }

    if (supplierProfile.supplierStatus === SupplierStatus.REJECTED) {
      return res.status(400).json({ message: "Supplier application is already rejected." });
    }

    if (supplierProfile.supplierStatus === SupplierStatus.APPROVED) {
      return res.status(400).json({ message: "Approved supplier applications cannot be rejected." });
    }

    const rejectedProfile = await prisma.supplierProfile.update({
      where: { id },
      data: {
        supplierStatus: SupplierStatus.REJECTED,
        rejectionReason,
      },
    });

    // await prisma.user.update({
    //   where: { id: supplierProfile.userId },
    //   data: { isSupplier: false },
    // });

    // Send email notification
    const subject = "Your Supplier Application Has Been Rejected.";
    const body = `<p>We're sorry, but your application has been rejected.<br />-------------------------<br />Reason:<br />${rejectionReason}</p>`;
    await sendNotification(supplierProfile.userId, supplierProfile.user!.email, subject, body);

    logger.info(`Supplier application rejected: ${rejectedProfile.id} for user ${supplierProfile.userId}`);

    return res.status(200).json({ message: "Supplier application rejected successfully.", profile: rejectedProfile });
  } catch (error) {
    logger.error("Error rejecting supplier application:", error);
    return res.status(500).json({ message: "Something went wrong.", error });
  }
};
