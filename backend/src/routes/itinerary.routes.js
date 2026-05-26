import { Router } from "express";
import { buildTravelPlan } from "../controllers/itinerary.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post("/plan", asyncHandler(buildTravelPlan));

export default router;
