import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { isRedisEnabled } from "./config/cache.js";
import { globalRateLimit } from "./middlewares/rate-limit.middleware.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import flightsRoutes from "./routes/flights.routes.js";
import matchesRoutes from "./routes/matches.routes.js";
import placesRoutes from "./routes/places.routes.js";
import timeRoutes from "./routes/time.routes.js";
import itineraryRoutes from "./routes/itinerary.routes.js";

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.use(globalRateLimit);

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "worldcup-fan-planner-backend",
    redis: isRedisEnabled(),
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/flights", flightsRoutes);
app.use("/api/matches", matchesRoutes);
app.use("/api/places", placesRoutes);
app.use("/api/time", timeRoutes);
app.use("/api/itinerary", itineraryRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
