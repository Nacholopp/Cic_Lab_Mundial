import { env } from "../config/env.js";
import { getCachedJson, setCachedJson } from "../config/cache.js";

export async function getUpcomingMatches() {
  const cacheKey = `sportsdb:next:${env.sportsDbLeagueId}`;
  const cached = await getCachedJson(cacheKey);
  if (cached?.matches) return cached.matches;

  const url = `${env.sportsDbBaseUrl}/${env.sportsDbApiKey}/eventsnextleague.php?id=${env.sportsDbLeagueId}`;
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error(`TheSportsDB request failed (${response.status})`);
    error.statusCode = 502;
    throw error;
  }

  const payload = await response.json();
  const matches = (payload.events || []).map((event) => ({
    id: event.idEvent,
    homeTeam: event.strHomeTeam,
    awayTeam: event.strAwayTeam,
    date: event.dateEvent,
    timeUtc: event.strTime,
    venue: event.strVenue,
    city: event.strCity,
    thumbnail: event.strThumb || null
  }));

  await setCachedJson(cacheKey, { matches }, 30);
  return matches;
}
