import { Request, Response } from "express";
import { pool } from "../db";

export const createEntry = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const entryData = req.body;

        const contentTypeResult = await pool.query(
            `SELECT id FROM content_types WHERE slug = $1`,
            [slug]
        );

        if (contentTypeResult.rows.length === 0) {
            return res.status(404).json({ message: "Content type not found" });
        }

        const contentTypeId = contentTypeResult.rows[0].id;

        const fieldsResult = await pool.query(
            `SELECT * FROM fields WHERE content_type_id = $1`,
            [contentTypeId]
        );

        const fields = fieldsResult.rows;

        const validationError = validateEntry(entryData, fields, contentTypeId);

        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const insertResult = await pool.query(
            `INSERT INTO entries (content_type_id, data)
       VALUES ($1, $2)
       RETURNING *`,
            [contentTypeId, entryData]
        );

        res.status(201).json(insertResult.rows[0]);

    } catch (error) {
        res.status(500).json({ error: "Error creating entry" });
    }
};

// Validation

const validateEntry = async (
  entryData: any,
  fields: any[],
  contentTypeId: number
) => {
  const errors: string[] = [];

  const fieldMap = new Map();
  fields.forEach(field => fieldMap.set(field.slug, field));

  for (const key of Object.keys(entryData)) {
    if (!fieldMap.has(key)) {
      errors.push(`${key} is not a valid field`);
    }
  }

  for (const field of fields) {
    const value = entryData[field.slug];

    if (field.is_required && (value === undefined || value === null)) {
      errors.push(`${field.slug} is required`);
      continue;
    }

    if (value !== undefined) {

      switch (field.field_type) {

        case "string":
          if (typeof value !== "string") {
            errors.push(`${field.slug} must be a string`);
          }
          break;

        case "number":
          if (typeof value !== "number") {
            errors.push(`${field.slug} must be a number`);
          }

          if (field.options?.min !== undefined &&
              value < field.options.min) {
            errors.push(`${field.slug} must be >= ${field.options.min}`);
          }

          if (field.options?.max !== undefined &&
              value > field.options.max) {
            errors.push(`${field.slug} must be <= ${field.options.max}`);
          }

          break;

        case "boolean":
          if (typeof value !== "boolean") {
            errors.push(`${field.slug} must be a boolean`);
          }
          break;

        case "select":
          if (
            field.options?.values &&
            !field.options.values.includes(value)
          ) {
            errors.push(
              `${field.slug} must be one of allowed values`
            );
          }
          break;

        case "json":
          if (typeof value !== "object") {
            errors.push(`${field.slug} must be a valid JSON object`);
          }
          break;

        default:
          break;
      }

      if (field.is_unique) {
        const existing = await pool.query(
          `SELECT 1 FROM entries
           WHERE content_type_id = $1
           AND data->>$2 = $3
           LIMIT 1`,
          [contentTypeId, field.slug, String(value)]
        );

        if (existing.rows.length > 0) {
          errors.push(`${field.slug} must be unique`);
        }
      }
    }
  }

  return errors.length > 0 ? errors : null;
};