import express from "express";
import { SECRET_VARIABLES } from "./config/secret-variable.js";

const app = express();
const port = SECRET_VARIABLES.PORT;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend API is running 🚀");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
