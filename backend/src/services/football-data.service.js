import { env } from "../config/env.js";
import { hostCities } from "../data/worldcup2026.data.js";

const cityAliases = new Map([
  ["ciudad de mexico", "Mexico City"],
  ["cdmx", "Mexico City"],
  ["new york", "New York/New Jersey"],
  ["new jersey", "New York/New Jersey"],
  ["santa clara", "San Francisco Bay Area"],
  ["san francisco", "San Francisco Bay Area"],
  ["la", "Los Angeles"]
]);

function normalizeText(value = "") {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function canonicalCityName(city = "") {
  const normalized = normalizeText(city);
  return cityAliases.get(normalized) || city.trim();
}

function hostCityForCityName(city = "") {
  const canonical = canonicalCityName(city);
  return hostCities.find((item) => normalizeText(item.name) === normalizeText(canonical)) || null;
}

function hostCityForVenueName(venue = "") {
  const target = normalizeText(venue);
  if (!target) return null;
  return (
    hostCities.find((item) => normalizeText(item.stadium) === target) ||
    hostCities.find((item) => target.includes(normalizeText(item.stadium)) || normalizeText(item.stadium).includes(target)) ||
    null
  );
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

function normalizeFootballDataMatch(match) {
  const utcDate = match.utcDate ? new Date(match.utcDate) : null;
  if (!utcDate || Number.isNaN(utcDate.getTime())) return null;

  const date = utcDate.toISOString().slice(0, 10);
  const timeUtc = utcDate.toISOString().slice(11, 19);
  const areaName = match.area?.name || "";
  const venueName = match.venue || "";
  const inferredCity = canonicalCityName(venueName || areaName);
  const hostCity = hostCityForVenueName(venueName) || hostCityForCityName(inferredCity);
  const timezone = hostCity?.timezone || null;

  return {
    id: `fd-${match.id}`,
    homeTeam: match.homeTeam?.name || "TBD",
    awayTeam: match.awayTeam?.name || "TBD",
    date,
    timeUtc,
    timezone,
    localKickoff: localKickoff(date, timeUtc, timezone),
    venue: venueName || hostCity?.stadium || null,
    city: hostCity?.name || inferredCity || null,
    stage: match.stage || match.group || "World Cup 2026",
    thumbnail: null,
    source: "Football-Data.org"
  };
}

export async function getFootballDataWorldCupMatches() {
  if (!env.footballDataApiKey) return [];

  const headers = { "X-Auth-Token": env.footballDataApiKey };
  const params = new URLSearchParams({
    dateFrom: "2026-06-01",
    dateTo: "2026-08-01"
  });
  const response = await fetch(`${env.footballDataBaseUrl}/competitions/WC/matches?${params.toString()}`, { headers });
  if (!response.ok) {
    const error = new Error(`Football-Data request failed (${response.status})`);
    error.statusCode = 502;
    throw error;
  }

  const payload = await response.json();
  const matches = (payload.matches || [])
    .map(normalizeFootballDataMatch)
    .filter(Boolean)
    .sort((a, b) => `${a.date}T${a.timeUtc}`.localeCompare(`${b.date}T${b.timeUtc}`));
  return matches;
}
