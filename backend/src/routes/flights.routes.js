import { Router } from "express";
import { findFlights } from "../controllers/flights.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post("/search", asyncHandler(findFlights));

export default router;
