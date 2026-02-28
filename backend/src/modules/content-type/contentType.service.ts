import { pool } from "../../db";
import { ApiError } from "../../utils/apiError";

export const createContentType = async (
  name: string,
  slug: string,
  description?: string
) => {
  const existing = await pool.query(
    "SELECT * FROM content_types WHERE slug = $1",
    [slug]
  );

  if (existing.rows.length > 0) {
    throw new ApiError(400, "Content type slug already exists");
  }

  const result = await pool.query(
    `INSERT INTO content_types (name, slug, description)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, slug, description]
  );

  return result.rows[0];
};