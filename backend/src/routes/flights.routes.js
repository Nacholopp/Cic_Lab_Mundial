import { Router } from "express";
import { findAirports, findFlights } from "../controllers/flights.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.get("/airports", asyncHandler(findAirports));
router.post("/search", asyncHandler(findFlights));

export default router;
