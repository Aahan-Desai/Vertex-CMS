import { Router } from "express";
import { createEntryHandler } from "./entry.controller";

const router = Router();

router.post("/:slug", createEntryHandler);

export default router;