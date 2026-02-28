import { Request, Response, NextFunction } from "express";
import * as contentService from "./contentType.service";

export const createContentTypeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, slug, description } = req.body;

    const contentType = await contentService.createContentType(
      name,
      slug,
      description
    );

    res.status(201).json({
      success: true,
      data: contentType,
    });
  } catch (error) {
    next(error);
  }
};