import express from "express";

import { SECRET_VARIABLES } from "./config/secret-variable.js";
import { PrismaClient } from "./generated/prisma/client.js";
import userRoutes from "./routes/user.routes.js";

const app = express();
const prisma = new PrismaClient();
const port = SECRET_VARIABLES.port;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend API is running 🚀");
});

// users endpoint
app.use("/users", userRoutes);

app.listen(port, async () => {
  console.log(`Server is running on http://localhost:${port}`);
  await prisma.$connect();
  console.log("Connected to the database.");
});
