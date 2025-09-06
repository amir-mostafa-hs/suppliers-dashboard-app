// src/middlewares/auth.middleware.ts
import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

import { SECRET_VARIABLES } from "../config/secret-variable.js";
import { PrismaClient, type User } from "../generated/prisma/client.js";
import type { AuthenticatedRequest } from "./auth.middleware.js";

const prisma = new PrismaClient();

export const authenticateDownloadToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { token } = req.query;

  if (token == null || typeof token !== "string") {
    return res.status(401).json({ message: "Download token is required." });
  }

  try {
    const decoded = jwt.verify(token, SECRET_VARIABLES.jwt_secret) as jwt.JwtPayload;
    req.user = decoded as User;

    const file = await prisma.supplierDocument.findUnique({ where: { id: decoded.fileId } });
    if (!file) {
      return res.status(404).json({ message: "File not found." });
    }

    if (file.supplierProfileId !== decoded.supplierProfileId) {
      return res.status(403).json({ message: "You do not have permission to download this file." });
    }

    req.dbFile = file;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired download token.", error });
  }
};
