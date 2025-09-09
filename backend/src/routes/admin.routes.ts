import { Router } from "express";

import {
  approveSupplier,
  getAllUsers,
  getUserById,
  rejectSupplier,
  updateUserRole,
} from "../controllers/admin.controller.js";
import { adminDownloadDocument, generateDownloadOrViewLink } from "../controllers/supplier.controller.js";
import { authenticateToken, checkAdminOrReviewerRole } from "../middlewares/auth.middleware.js";

const router: Router = Router();

// Apply the role-based middleware to all admin routes
router.use(authenticateToken, checkAdminOrReviewerRole);

/**
 * @URL : /admin/users
 * @Method : GET
 * @Status : PRIVATE
 * @Description : get a list of all users
 */
router.get("/users", getAllUsers);

/**
 * @URL : /admin/users/:id
 * @Method : GET
 * @Status : PRIVATE
 * @Description : get a specific user by ID
 */
router.get("/users/:id", getUserById);

/**
 * @URL : /admin/users/:id/role
 * @Method : PUT
 * @Status : PRIVATE
 * @Description : update a specific user's role
 */
router.put("/users/:id/role", updateUserRole);

/**
 * @URL : /admin/users/:id/role
 * @Method : PATCH
 * @Status : PRIVATE
 * @Description : update a specific user's role
 */
router.patch("/users/:id/role", updateUserRole);

/**
 * @URL : /admin/suppliers/:id
 * @Method : GET
 * @Status : PRIVATE
 * @Description : get supplier details by user ID
 */
router.get("/suppliers/:id", getUserById);

/**
 * @URL : /admin/suppliers/:id/approve
 * @Method : POST
 * @Status : PRIVATE
 * @Description : approve a specific supplier
 */
router.post("/suppliers/:id/approve", approveSupplier);

/**
 * @URL : /admin/suppliers/:id/approve
 * @Method : PATCH
 * @Status : PRIVATE
 * @Description : approve a specific supplier
 */
router.patch("/suppliers/:id/approve", approveSupplier);

/**
 * @URL : /admin/suppliers/:id/reject
 * @Method : POST
 * @Status : PRIVATE
 * @Description : reject a specific supplier
 */
router.post("/suppliers/:id/reject", rejectSupplier);

/**
 * @URL : /admin/suppliers/:id/reject
 * @Method : PATCH
 * @Status : PRIVATE
 * @Description : reject a specific supplier
 */
router.patch("/suppliers/:id/reject", rejectSupplier);

/**
 * @URL : /admin/suppliers/:id/documents/:documentId/download
 * @Method : GET
 * @Status : PRIVATE
 * @Description : download a supplier document
 */
router.get("/suppliers/:id/documents/:documentId/download", adminDownloadDocument);

/**
 * @URL : /admin/suppliers/documents/:id/link
 * @Method : GET
 * @Status : PRIVATE
 * @Description : generate a view link for a specific document
 */
router.get("/suppliers/documents/:id/link", generateDownloadOrViewLink);

export default router;
