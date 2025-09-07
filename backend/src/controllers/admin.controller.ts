import type { Response } from "express";

import { PrismaClient, Role, SupplierStatus, type User } from "../generated/prisma/client.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

const prisma = new PrismaClient();

// This is a placeholder for the notification service.
// In a real application, this would send a push notification, email, etc.
const sendNotification = async (userId: string, message: string) => {
  console.log(`Sending notification to user ${userId}: ${message}`);
  // Implement the actual notification logic here.
};

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

    return res.status(200).json({ message: "User role updated successfully.", user: updatedUser });
  } catch (error) {
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

    await sendNotification(supplierProfile.userId, "Your supplier application has been approved!");

    return res.status(200).json({ message: "Supplier application approved successfully.", profile: approvedProfile });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong.", error });
  }
};

// Reject a supplier's application with a reason
export const rejectSupplier = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;

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

    await sendNotification(supplierProfile.userId, "Your supplier application has been rejected.");

    return res.status(200).json({ message: "Supplier application rejected successfully.", profile: rejectedProfile });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong.", error });
  }
};
