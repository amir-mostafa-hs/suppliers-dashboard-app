import { Router } from "express";

import {
  createUser,
  deleteUserProfile,
  getUserProfile,
  loginUser,
  logoutUser,
  updateUserProfile,
} from "../controllers/user.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rate-limiter.middleware.js";

const router: Router = Router();

/**
 * @URL : /users/register
 * @Method : POST
 * @Status : PUBLIC
 * @Description : create a new user
 */
router.post("/register", authLimiter, createUser);

/**
 * @URL : /users/login
 * @Method : POST
 * @Status : PUBLIC
 * @Description : login a user
 */
router.post("/login", authLimiter, loginUser);

/**
 * @URL : /users/logout
 * @Method : POST
 * @Status : PRIVATE
 * @Description : logout a user
 */
router.post("/logout", authenticateToken, logoutUser);

/**
 * @URL : /users/profile
 * @Method : GET
 * @Status : PRIVATE
 * @Description : get a user's profile
 */
router.get("/profile", authenticateToken, getUserProfile);

/**
 * @URL : /users/profile
 * @Method : PUT
 * @Status : PRIVATE
 * @Description : update a user's profile
 */
router.put("/profile", authenticateToken, updateUserProfile);

/**
 * @URL : /users/delete
 * @Method : DELETE
 * @Status : PRIVATE
 * @Description : delete a user's profile
 */
router.delete("/delete", authenticateToken, deleteUserProfile);

export default router;
