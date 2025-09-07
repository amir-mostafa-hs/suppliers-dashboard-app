import cookieParser from "cookie-parser";
import express from "express";

import { SECRET_VARIABLES } from "./config/secret-variable.js";
import { PrismaClient } from "./generated/prisma/client.js";
import adminRoutes from "./routes/admin.routes.js";
import supplierRoutes from "./routes/supplier.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();
const prisma = new PrismaClient();
const port = SECRET_VARIABLES.port;

app.use(cookieParser(), express.json());

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
  console.log(`Server is running on http://localhost:${port}`);
  await prisma.$connect();
  console.log("Connected to the database.");
});
