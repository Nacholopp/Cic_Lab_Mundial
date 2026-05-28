import { Router } from "express";
import { listMatches } from "../controllers/matches.controller.js";
import { proxyGooglePlacePhoto } from "../services/match-image.service.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.get("/", asyncHandler(listMatches));
router.get("/photo", asyncHandler(proxyGooglePlacePhoto));

export default router;
