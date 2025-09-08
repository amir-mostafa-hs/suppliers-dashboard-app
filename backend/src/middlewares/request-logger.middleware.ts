import type { NextFunction, Request, Response } from "express";

import logger from "../config/logger.js";

// Log the incoming request
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.http(`Incoming request: ${req.ip} | ${req.method} | ${req.originalUrl}`);
  next();
};
