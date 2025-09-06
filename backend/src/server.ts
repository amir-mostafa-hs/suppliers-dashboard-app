import cookieParser from "cookie-parser";
import express from "express";

import { SECRET_VARIABLES } from "./config/secret-variable.js";
import { PrismaClient } from "./generated/prisma/client.js";
import userRoutes from "./routes/user.routes.js";

const app = express();
const prisma = new PrismaClient();
const port = SECRET_VARIABLES.port;

app.use(cookieParser(), express.json());

app.get("/", (req, res) => {
  res.send("Backend API is running 🚀");
});

// user endpoint
app.use("/user", userRoutes);

app.listen(port, async () => {
  console.log(`Server is running on http://localhost:${port}`);
  await prisma.$connect();
  console.log("Connected to the database.");
});
