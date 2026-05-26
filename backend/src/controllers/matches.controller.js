import { getUpcomingMatches } from "../services/thesportsdb.service.js";

export async function listMatches(req, res) {
  const matches = await getUpcomingMatches();
  res.json({ ok: true, matches });
}
