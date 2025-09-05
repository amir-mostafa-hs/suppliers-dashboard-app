import { Router } from "express";

import {
  createUser,
  deleteUserProfile,
  getUserProfile,
  loginUser,
  updateUserProfile,
} from "../controllers/user.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router: Router = Router();

/**
 * @URL : /user/register
 * @Method : POST
 * @Status : PUBLIC
 * @Description : create a new user
 */
router.post("/register", createUser);

/**
 * @URL : /user/login
 * @Method : POST
 * @Status : PUBLIC
 * @Description : login a user
 */
router.post("/login", loginUser);

/**
 * @URL : /user/profile
 * @Method : GET
 * @Status : PRIVATE
 * @Description : get a user's profile
 */
router.get("/profile", authenticateToken, getUserProfile);

/**
 * @URL : /user/profile
 * @Method : PUT
 * @Status : PRIVATE
 * @Description : update a user's profile
 */
router.put("/profile", authenticateToken, updateUserProfile);

/**
 * @URL : /user/profile
 * @Method : PUT
 * @Status : PRIVATE
 * @Description : update a user's profile
 */
router.delete("/profile", authenticateToken, deleteUserProfile);

export default router;
