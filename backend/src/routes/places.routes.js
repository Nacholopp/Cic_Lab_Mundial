import { Router } from "express";
import { destinationGuide } from "../controllers/places.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.get("/destination", asyncHandler(destinationGuide));

export default router;
