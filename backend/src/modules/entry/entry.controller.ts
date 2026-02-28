import { Request, Response, NextFunction } from "express";
import { pool } from "@/db";
import { ApiError } from "@/utils/apiError";
import { createEntry } from "./entry.service";

export const createEntryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    const entryData = req.body;

    const contentTypeResult = await pool.query(
      "SELECT id FROM content_types WHERE slug = $1",
      [slug]
    );

    if (contentTypeResult.rows.length === 0) {
      throw new ApiError(404, "Content type not found");
    }

    const contentTypeId = contentTypeResult.rows[0].id;

    const entry = await createEntry(contentTypeId, entryData);

    res.status(201).json({
      success: true,
      data: entry,
    });
  } catch (error) {
    next(error);
  }
};