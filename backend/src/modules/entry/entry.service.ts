import { pool } from "@/db";
import { ApiError } from "@/utils/apiError";
import { validateEntry } from "./entry.validation";

export const createEntry = async (
  contentTypeId: number,
  entryData: Record<string, any>
) => {
  const fieldsResult = await pool.query(
    "SELECT * FROM fields WHERE content_type_id = $1",
    [contentTypeId]
  );

  const fields = fieldsResult.rows;

  if (fields.length === 0) {
    throw new ApiError(400, "No fields defined for this content type");
  }

  const errors = validateEntry(entryData, fields);

  if (errors) {
    throw new ApiError(400, errors.join(", "));
  }

  const insertResult = await pool.query(
    "INSERT INTO entries (content_type_id, data) VALUES ($1, $2) RETURNING *",
    [contentTypeId, entryData]
  );

  return insertResult.rows[0];
};