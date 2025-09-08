import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role, type SupplierDocument, type User } from "prisma/generated/prisma/client.js";

import { SECRET_VARIABLES } from "../config/secret-variable.js";

export interface AuthenticatedRequest extends Request {
  user?: User;
  dbFile?: SupplierDocument | { accessType: "download" | "view" };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies["authorization"];

  if (token == null) {
    return res.status(401).json({ message: "Authentication token is required." });
  }

  jwt.verify(
    token,
    SECRET_VARIABLES.jwt_secret,
    (err: jwt.VerifyErrors | null, decoded: string | jwt.JwtPayload | undefined) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token." });
      }
      req.user = decoded as User;
      next();
    }
  );
};

export const checkAdminOrReviewerRole = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== Role.ADMIN && req.user.role !== Role.REVIEWER)) {
    return res.status(403).json({ message: "Access forbidden: Insufficient permissions." });
  }
  next();
};
