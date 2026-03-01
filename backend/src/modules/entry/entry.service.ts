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

export const getEntries = async (contentTypeId: number) => {
  const result = await pool.query(
    "SELECT * FROM entries WHERE content_type_id = $1 ORDER BY created_at DESC",
    [contentTypeId]
  );

  return result.rows;
};

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

  const updatedResult = await pool.query(
    "UPDATE entries SET data = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
    [mergedData, entryId]
  );

  return updatedResult.rows[0];
};