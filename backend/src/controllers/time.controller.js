import { getCurrentTimeByTimezone } from "../services/time.service.js";

export async function getTime(req, res) {
  const timezone = req.query.timezone || "Europe/Madrid";
  const time = await getCurrentTimeByTimezone(timezone);
  res.json({ ok: true, time });
}
