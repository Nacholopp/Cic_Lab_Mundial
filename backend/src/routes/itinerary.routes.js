import { Router } from "express";
import { buildTravelPlan, listMyItineraries } from "../controllers/itinerary.controller.js";
import { optionalAuth, requireAuth } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post("/plan", optionalAuth, asyncHandler(buildTravelPlan));
router.get("/mine", requireAuth, asyncHandler(listMyItineraries));

export default router;
