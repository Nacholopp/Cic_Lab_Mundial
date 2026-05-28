import { getUpcomingMatches } from "../services/thesportsdb.service.js";
import { enrichMatchesWithImages } from "../services/match-image.service.js";

export async function listMatches(req, res) {
  const matches = await getUpcomingMatches();
  const ordered = [...matches].sort((a, b) =>
    `${a.date}T${a.timeUtc || "00:00:00"}`.localeCompare(`${b.date}T${b.timeUtc || "00:00:00"}`)
  );
  const enriched = await enrichMatchesWithImages(ordered);
  res.json({ ok: true, matches: enriched });
}
