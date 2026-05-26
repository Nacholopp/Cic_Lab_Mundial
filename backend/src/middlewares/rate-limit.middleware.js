import rateLimit from "express-rate-limit";

export const globalRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: "Too many requests, try again in a minute."
  }
});
