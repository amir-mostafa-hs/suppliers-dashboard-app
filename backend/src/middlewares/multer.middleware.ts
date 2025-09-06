import type { NextFunction, Request, Response } from "express";

import { upload } from "../controllers/supplier.controller.js";

export const multerFiles = (req: Request, res: Response, next: NextFunction) => {
  upload.array("documents", 3)(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ message: "File size limit exceeded. Each file must be less than 5 MB." });
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({ message: `Too many files. Please upload a maximum of 3 files.` });
      }
      // Handle file type error from Multer's fileFilter
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};
