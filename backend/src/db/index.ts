import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "headless_cms",
  password: process.env.DB_PASSWORD || "Aahan2004",
  port: parseInt(process.env.DB_PORT || "5432"),
});