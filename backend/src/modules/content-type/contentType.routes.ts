import { Router } from "express";
import { createContentTypeHandler } from "./contentType.controller";

const router = Router();

router.post("/", createContentTypeHandler);

export default router;
