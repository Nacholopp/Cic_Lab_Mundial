import { Router } from "express";
import { listMatches } from "../controllers/matches.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.get("/", asyncHandler(listMatches));

export default router;
