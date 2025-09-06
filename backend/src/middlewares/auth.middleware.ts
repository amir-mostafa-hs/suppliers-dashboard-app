import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { SECRET_VARIABLES } from "../config/secret-variable.js";
import type { User } from "../generated/prisma/index.js";

export interface AuthenticatedRequest extends Request {
  user?: User;
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
