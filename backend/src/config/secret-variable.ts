import path from "node:path";

import { config } from "dotenv";

config({
  path: [path.resolve(import.meta.dirname, "../../.env"), path.resolve(import.meta.dirname, "./db/.docker.env")],
});

interface Variables {
  port: number;
  db_name: string;
  db_user: string;
  db_password: string;
  db_url: string;
  jwt_secret: string;
}

export const SECRET_VARIABLES: Variables = {
  port: Number(process.env.PORT) || 5050,
  db_name: process.env.POSTGRES_USER || "",
  db_user: process.env.POSTGRES_PASSWORD || "",
  db_password: process.env.POSTGRES_DB || "",
  db_url: process.env.DATABASE_URL || "",
  jwt_secret: process.env.JWT_SECRET || "",
};
