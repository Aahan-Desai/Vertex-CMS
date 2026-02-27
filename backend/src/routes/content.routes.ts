import { Router } from "express";
import { createEntry } from "../controllers/content.controller";

const router = Router();

router.post("/:slug", createEntry);

export default router;
