import { Pool } from "pg";

export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "headless_cms",
  password: "Aahan2004",
  port: 5432,
});