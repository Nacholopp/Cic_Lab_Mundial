import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

function tokenFromRequest(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) return null;
  return authHeader.slice(7).trim();
}

function decodeToken(token) {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch {
    return null;
  }
}

export function optionalAuth(req, res, next) {
  const token = tokenFromRequest(req);
  if (!token) {
    req.authUser = null;
    return next();
  }

  const payload = decodeToken(token);
  req.authUser = payload
    ? {
        id: payload.sub,
        email: payload.email,
        username: payload.username
      }
    : null;
  return next();
}

export function requireAuth(req, res, next) {
  const token = tokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ ok: false, error: "Authentication required" });
  }

  const payload = decodeToken(token);
  if (!payload?.sub) {
    return res.status(401).json({ ok: false, error: "Invalid auth token" });
  }

  req.authUser = {
    id: payload.sub,
    email: payload.email,
    username: payload.username
  };
  return next();
}
