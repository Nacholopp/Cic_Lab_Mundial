import { env } from "../config/env.js";
import { getCachedJson, setCachedJson } from "../config/cache.js";
import { fallbackWorldCupMatches, hostCities } from "../data/worldcup2026.data.js";
import { getFootballDataWorldCupMatches } from "./football-data.service.js";

const cityAliases = new Map([
  ["ciudad de mexico", "Mexico City"],
  ["cdmx", "Mexico City"],
  ["new york", "New York/New Jersey"],
  ["new jersey", "New York/New Jersey"],
  ["santa clara", "San Francisco Bay Area"],
  ["san francisco", "San Francisco Bay Area"],
  ["la", "Los Angeles"]
]);

const venueAliases = new Map([
  ["reliant stadium", "NRG Stadium"],
  ["nrg stadium", "NRG Stadium"],
  ["at&t stadium", "AT&T Stadium"],
  ["att stadium", "AT&T Stadium"]
]);

function normalizeText(value = "") {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function canonicalCityName(city) {
  const normalized = normalizeText(city);
  return cityAliases.get(normalized) || city?.trim() || "";
}

function hostCityForMatch(event) {
  const rawCity = event.strCity || event.strVenueLocation || "";
  const canonical = canonicalCityName(rawCity);
  const byCity = hostCities.find((hostCity) => normalizeText(hostCity.name) === normalizeText(canonical));
  if (byCity) return byCity;

  const normalizedVenue = normalizeText(event.strVenue || "");
  const aliasVenue = venueAliases.get(normalizedVenue);
  return hostCities.find((hostCity) => {
    const stadium = normalizeText(hostCity.stadium);
    return normalizedVenue.includes(stadium) || stadium.includes(normalizedVenue) || hostCity.stadium === aliasVenue;
  });
}

function localKickoff(date, timeUtc, timezone) {
  if (!date || !timeUtc || !timezone) return null;
  const kickoff = new Date(`${date}T${timeUtc.replace("Z", "")}Z`);
  if (Number.isNaN(kickoff.getTime())) return null;

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone
  }).format(kickoff);
}

function normalizeEvent(event) {
  const hostCity = hostCityForMatch(event);
  const date = event.dateEvent || event.strTimestamp?.slice(0, 10) || null;
  const timeUtc = event.strTime || (event.strTimestamp ? event.strTimestamp.slice(11, 19) : null);
  const timezone = hostCity?.timezone || null;

  return {
    id: event.idEvent,
    homeTeam: event.strHomeTeam || "TBD",
    awayTeam: event.strAwayTeam || "TBD",
    date,
    timeUtc,
    timezone,
    localKickoff: localKickoff(date, timeUtc, timezone),
    venue: event.strVenue || hostCity?.stadium || null,
    city: hostCity?.name || canonicalCityName(event.strCity),
    stage: event.strRound || event.strEventAlternate || event.strLeague || "World Cup 2026",
    thumbnail: event.strThumb || null,
    source: "TheSportsDB"
  };
}

async function fetchSportsDb(path) {
  const url = `${env.sportsDbBaseUrl}/${env.sportsDbApiKey}/${path}`;
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error(`TheSportsDB request failed (${response.status})`);
    error.statusCode = 502;
    throw error;
  }

  return response.json();
}

function fallbackMatches() {
  return fallbackWorldCupMatches.map((match) => {
    const hostCity = hostCities.find((city) => normalizeText(city.name) === normalizeText(match.city));
    return {
      ...match,
      timezone: hostCity?.timezone || null,
      localKickoff: localKickoff(match.date, match.timeUtc, hostCity?.timezone),
      source: "Fallback schedule seed"
    };
  });
}

const FIFA_WC_COMPETITION_ID = "17";
const FIFA_WC_2026_SEASON_ID = "285023";

function hostCityFromFifaStadium(stadium = {}) {
  const rawCity = stadium?.CityName?.[0]?.Description || "";
  const rawStadiumName = stadium?.Name?.[0]?.Description || "";
  const cityCandidate = canonicalCityName(rawCity);

  const byCity = hostCities.find((hostCity) => normalizeText(hostCity.name) === normalizeText(cityCandidate));
  if (byCity) return byCity;

  return (
    hostCities.find((hostCity) => normalizeText(rawStadiumName).includes(normalizeText(hostCity.name))) ||
    hostCities.find((hostCity) => normalizeText(rawStadiumName).includes("new york") && normalizeText(hostCity.name) === "new york/new jersey") ||
    null
  );
}

function normalizeFifaMatch(match) {
  const hostCity = hostCityFromFifaStadium(match.Stadium || {});
  const date = match.Date ? new Date(match.Date) : null;
  if (!date || Number.isNaN(date.getTime())) return null;

  const homeName = match.Home?.TeamName?.[0]?.Description || match.PlaceHolderA || "TBD";
  const awayName = match.Away?.TeamName?.[0]?.Description || match.PlaceHolderB || "TBD";
  const venue = hostCity?.stadium || match.Stadium?.Name?.[0]?.Description || null;
  const city = hostCity?.name || canonicalCityName(match.Stadium?.CityName?.[0]?.Description || "") || null;

  return {
    id: `fifa-${match.IdMatch}`,
    homeTeam: homeName,
    awayTeam: awayName,
    date: date.toISOString().slice(0, 10),
    timeUtc: date.toISOString().slice(11, 19),
    timezone: hostCity?.timezone || null,
    localKickoff: hostCity?.timezone ? localKickoff(date.toISOString().slice(0, 10), date.toISOString().slice(11, 19), hostCity.timezone) : null,
    venue,
    city,
    stage: match.StageName?.[0]?.Description || match.GroupName?.[0]?.Description || "World Cup 2026",
    thumbnail: null,
    source: "FIFA API"
  };
}

async function getFifaWorldCupMatches() {
  const params = new URLSearchParams({
    idCompetition: FIFA_WC_COMPETITION_ID,
    idSeason: FIFA_WC_2026_SEASON_ID,
    count: "220"
  });
  const response = await fetch(`https://api.fifa.com/api/v3/calendar/matches?${params.toString()}`);
  if (!response.ok) {
    const error = new Error(`FIFA API request failed (${response.status})`);
    error.statusCode = 502;
    throw error;
  }
  const payload = await response.json();
  return (payload.Results || []).map(normalizeFifaMatch).filter((match) => match?.date);
}

export async function getUpcomingMatches() {
  const cacheKey = `sportsdb:worldcup2026:${env.sportsDbLeagueId}`;
  const cached = await getCachedJson(cacheKey);
  if (cached?.matches) return cached.matches;

  try {
    const fifaMatches = await getFifaWorldCupMatches();
    if (fifaMatches.length) {
      await setCachedJson(cacheKey, { matches: fifaMatches }, 60 * 60);
      return fifaMatches;
    }
  } catch {
    // Fallback to alternative providers below.
  }

  try {
    const footballDataMatches = await getFootballDataWorldCupMatches();
    if (footballDataMatches.length) {
      await setCachedJson(cacheKey, { matches: footballDataMatches }, 60 * 60);
      return footballDataMatches;
    }
  } catch {
    // Fallback to TheSportsDB below.
  }

  let events = [];
  try {
    const seasonPayload = await fetchSportsDb(`eventsseason.php?id=${env.sportsDbLeagueId}&s=2026`);
    events = seasonPayload.events || [];
  } catch (error) {
    const nextPayload = await fetchSportsDb(`eventsnextleague.php?id=${env.sportsDbLeagueId}`);
    events = nextPayload.events || [];
  }

  const matches = events.map(normalizeEvent).filter((match) => match.date);
  const usableMatches = matches.length ? matches : fallbackMatches();

  await setCachedJson(cacheKey, { matches: usableMatches }, 60 * 60);
  return usableMatches;
}
