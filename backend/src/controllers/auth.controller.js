import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function login(req, res) {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ ok: false, error: "email is required" });
  }
  const token = jwt.sign({ email }, env.jwtSecret, { expiresIn: "1h" });
  return res.json({ ok: true, token });
}
