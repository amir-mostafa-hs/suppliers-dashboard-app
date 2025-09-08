import cookieParser from "cookie-parser";
import express from "express";
import { PrismaClient } from "prisma/generated/prisma/client.js";

import logger from "./config/logger.js";
import { SECRET_VARIABLES } from "./config/secret-variable.js";
import { apiLimiter } from "./middlewares/rate-limiter.middleware.js";
import { requestLogger } from "./middlewares/request-logger.middleware.js";
import adminRoutes from "./routes/admin.routes.js";
import supplierRoutes from "./routes/supplier.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();
const prisma = new PrismaClient();
const port = SECRET_VARIABLES.port;

// Global middlewares
app.use(cookieParser(), express.json(), express.urlencoded({ extended: true }));

// Custom middleware to log each request
app.use(requestLogger);

// Apply the general API rate limiter to all requests
app.use(apiLimiter);

// health check endpoint
app.get("/", (req, res) => {
  res.send("Backend API is running 🚀");
});

// admin endpoint
app.use("/admin", adminRoutes);

// supplier endpoint
app.use("/suppliers", supplierRoutes);

// user endpoint
app.use("/users", userRoutes);

app.listen(port, async () => {
  logger.info(`Server is running on http://localhost:${port}`);
  await prisma.$connect();
  logger.info("Connected to the database.");
});
