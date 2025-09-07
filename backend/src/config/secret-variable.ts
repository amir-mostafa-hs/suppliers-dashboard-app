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
  base_url: string;
  redis_host: string;
  redis_port: number;
  brevo_server: string;
  brevo_port: number;
  brevo_username: string;
  brevo_password: string;
  brevo_email: string;
}

export const SECRET_VARIABLES: Variables = {
  port: Number(process.env.PORT) || 5050,
  db_name: process.env.POSTGRES_USER || "",
  db_user: process.env.POSTGRES_PASSWORD || "",
  db_password: process.env.POSTGRES_DB || "",
  db_url: process.env.DATABASE_URL || "",
  jwt_secret: process.env.JWT_SECRET || "",
  base_url: process.env.BASE_URL || "",
  redis_host: process.env.REDIS_HOST || "",
  redis_port: Number(process.env.REDIS_PORT) || 6379,
  brevo_server: process.env.BREVO_SERVER || "",
  brevo_port: Number(process.env.BREVO_PORT) || 587,
  brevo_username: process.env.BREVO_USERNAME || "",
  brevo_password: process.env.BREVO_PASSWORD || "",
  brevo_email: process.env.BREVO_EMAIL || "",
};
