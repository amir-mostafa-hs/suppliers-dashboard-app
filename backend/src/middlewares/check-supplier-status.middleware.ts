import type { NextFunction, Response } from "express";
import { PrismaClient } from "prisma/generated/prisma/client.js";

import type { AuthenticatedRequest } from "./auth.middleware.js";

const prisma = new PrismaClient();

export const checkSupplierStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.user!;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { isSupplier: true },
    });

    if (user && user.isSupplier) {
      return res.status(400).json({ message: "User is already a supplier or has an application in progress." });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Failed to check supplier status.", error });
  }
};
