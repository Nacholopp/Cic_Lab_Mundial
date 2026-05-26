import { Router } from "express";
import { getTime } from "../controllers/time.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.get("/", asyncHandler(getTime));

export default router;
