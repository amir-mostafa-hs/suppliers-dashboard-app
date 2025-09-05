import argon2 from "argon2";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { SECRET_VARIABLES } from "../config/secret-variable.js";
import { PrismaClient, type User } from "../generated/prisma/client.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

const prisma = new PrismaClient();

// Create a new user
export const createUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const hashedPassword = await argon2.hash(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "USER",
      },
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_VARIABLES.jwt_secret, {
      expiresIn: "24h",
    });

    return res.status(201).json({ message: "User created successfully.", token });
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      // Prisma error code for unique constraint violation
      return res.status(409).json({ message: "Email already exists.", error });
    }
    return res.status(500).json({ message: "Something went wrong.", error });
  }
};

// User login
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const passwordMatch = await argon2.verify(user.password, password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET_VARIABLES.jwt_secret,
      { expiresIn: "24h" } // Token expires in 24 hours
    );

    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong.", error });
  }
};

// Get a user's profile
export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.user!;

  try {
    if (!id) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, isSupplier: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong.", error });
  }
};

// Update a user's profile
export const updateUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.user!;
  const { password, oldPassword, email } = req.body;

  const updatedData: Partial<User> = {
    email,
  };

  try {
    if (!id) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the user is trying to update their password
    if (password) {
      if (!oldPassword) {
        return res.status(400).json({ message: "Old password is required to change password." });
      }

      const passwordMatch = await argon2.verify(user.password, oldPassword);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Incorrect old password." });
      }

      const hashedPassword = await argon2.hash(password);
      updatedData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updatedData,
      select: { id: true, email: true, role: true, isSupplier: true },
    });

    return res.status(200).json({ message: "User profile updated successfully.", user: updatedUser });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong.", error });
  }
};

// Get a user's profile
export const deleteUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.user!;

  try {
    if (!id) {
      return res.status(400).json({ message: "User ID is required." });
    }

    await prisma.user.delete({ where: { id } });

    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong.", error });
  }
};
