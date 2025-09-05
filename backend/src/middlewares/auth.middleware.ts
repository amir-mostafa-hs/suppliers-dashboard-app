import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { SECRET_VARIABLES } from "../config/secret-variable.js";
import type { User } from "../generated/prisma/index.js";

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({ message: "Authentication token is required." });
  }

  jwt.verify(token, SECRET_VARIABLES.jwt_secret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }
    req.user = user as User;
    next();
  });
};
