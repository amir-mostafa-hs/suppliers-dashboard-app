import cookieParser from "cookie-parser";
import express from "express";

import logger from "./config/logger.js";
import { SECRET_VARIABLES } from "./config/secret-variable.js";
import { PrismaClient } from "./generated/prisma/client.js";
import { requestLogger } from "./middlewares/request-logger.middleware.js";
import adminRoutes from "./routes/admin.routes.js";
import supplierRoutes from "./routes/supplier.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();
const prisma = new PrismaClient();
const port = SECRET_VARIABLES.port;

app.use(cookieParser(), express.json(), requestLogger);

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
