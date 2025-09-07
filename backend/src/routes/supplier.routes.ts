import { Router } from "express";

import {
  accessFile,
  applySupplier,
  deleteSupplierProfile,
  generateDownloadOrViewLink,
  getSupplierProfile,
  updateSupplierProfile,
} from "../controllers/supplier.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { checkSupplierStatus } from "../middlewares/check-supplier-status.middleware.js";
import { authenticateDownloadToken } from "../middlewares/download-auth.middleware.js";
import { multerFiles } from "../middlewares/multer.middleware.js";

const router: Router = Router();

/**
 * @URL : /suppliers/apply
 * @Method : POST
 * @Status : PRIVATE
 * @Description : apply to be a supplier
 */
router.post("/apply", authenticateToken, checkSupplierStatus, multerFiles, applySupplier);

/**
 * @URL : /suppliers/profile
 * @Method : GET
 * @Status : PRIVATE
 * @Description : get supplier profile
 */
router.get("/profile", authenticateToken, getSupplierProfile);

/**
 * @URL : /suppliers/profile
 * @Method : PUT
 * @Status : PRIVATE
 * @Description : update supplier profile
 */
router.put("/profile", authenticateToken, updateSupplierProfile);

/**
 * @URL : /suppliers/delete
 * @Method : DELETE
 * @Status : PRIVATE
 * @Description : delete supplier profile
 */
router.delete("/delete", authenticateToken, deleteSupplierProfile);

/**
 * @URL : /suppliers/documents/:id/link
 * @Method : GET
 * @Status : PRIVATE
 * @Description : generate a download link for a specific document
 */
router.get("/documents/:id/link", authenticateToken, generateDownloadOrViewLink);

// Download a document using a secure, temporary token
/**
 * @URL : /suppliers/documents/download
 * @Method : GET
 * @Status : PRIVATE
 * @Description : download a document using a secure, temporary token
 */
router.get("/documents/download", authenticateDownloadToken, accessFile);

export default router;
