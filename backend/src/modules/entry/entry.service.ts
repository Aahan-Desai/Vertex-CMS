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
// Get all entries
export const getEntries = async (
  contentTypeId: number,
  filters: Record<string, any> = {}
) => {
  const fieldsResult = await pool.query(
    "SELECT slug, field_type FROM fields WHERE content_type_id = $1",
    [contentTypeId]
  );

  const fields = fieldsResult.rows;

  const fieldMap = new Map(
    fields.map((f) => [f.slug, f.field_type])
  );

  let query = `
    SELECT * FROM entries
    WHERE content_type_id = $1
  `;

  const values: any[] = [contentTypeId];
  let paramIndex = 2;

  for (const key of Object.keys(filters)) {
    if (!fieldMap.has(key)) {
      throw new ApiError(400, `Invalid filter field: ${key}`);
    }

    const fieldType = fieldMap.get(key);

    if (fieldType === "number") {
      query += ` AND (data->>'${key}')::numeric = $${paramIndex}`;
      values.push(Number(filters[key]));
    } else if (fieldType === "boolean") {
      query += ` AND (data->>'${key}')::boolean = $${paramIndex}`;
      values.push(filters[key] === "true");
    } else {
      query += ` AND data->>'${key}' = $${paramIndex}`;
      values.push(filters[key]);
    }

    paramIndex++;
  }

  query += " ORDER BY created_at DESC";

  const result = await pool.query(query, values);

  return result.rows;
};
// Get entry by id
export const getEntryById = async (
  contentTypeId: number,
  entryId: number
) => {
  const result = await pool.query(
    "SELECT * FROM entries WHERE id = $1 AND content_type_id = $2",
    [entryId, contentTypeId]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, "Entry not found");
  }

  return result.rows[0];
};
// Update entry
export const updateEntry = async (
  contentTypeId: number,
  entryId: number,
  updateData: Record<string, any>
) => {
  const existingResult = await pool.query(
    "SELECT * FROM entries WHERE id = $1 AND content_type_id = $2",
    [entryId, contentTypeId]
  );

  if (existingResult.rows.length === 0) {
    throw new ApiError(404, "Entry not found");
  }

  const existingEntry = existingResult.rows[0];

  const fieldsResult = await pool.query(
    "SELECT * FROM fields WHERE content_type_id = $1",
    [contentTypeId]
  );

  const fields = fieldsResult.rows;

  const errors = validateEntry(updateData, fields, "update");

  if (errors) {
    throw new ApiError(400, errors.join(", "));
  }

  const mergedData = {
    ...existingEntry.data,
    ...updateData,
  };
// Update entry
  const updatedResult = await pool.query(
    "UPDATE entries SET data = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
    [mergedData, entryId]
  );

  return updatedResult.rows[0];
};
// Delete entry

export const deleteEntry = async (
  contentTypeId: number,
  entryId: number
) => {
 const result = await pool.query(
  "DELETE FROM entries WHERE id = $1 AND content_type_id = $2 RETURNING *",
  [entryId, contentTypeId]
);

if (result.rows.length === 0) {
  throw new ApiError(404, "Entry not found");
}

return { message: "Entry deleted successfully" };
};