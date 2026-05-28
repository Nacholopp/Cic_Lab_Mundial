import { env } from "../config/env.js";
import { getCachedJson, setCachedJson } from "../config/cache.js";

const WIKIPEDIA_SUMMARY_BASE = "https://en.wikipedia.org/api/rest_v1/page/summary";

function normalizeText(value = "") {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function compact(value = "") {
  return value.toString().trim().replace(/\s+/g, " ");
}

function relevantTeams(match) {
  return [match.homeTeam, match.awayTeam].filter((team) => team && normalizeText(team) !== "tbd");
}

function googlePhotoProxyUrl(photoName, width = 900) {
  const params = new URLSearchParams({
    name: photoName,
    width: String(width)
  });
  return `/api/matches/photo?${params.toString()}`;
}

async function fetchGooglePlacePhoto(match) {
  if (!env.googleMapsApiKey || !match?.venue) return null;

  const queryParts = [
    match.venue,
    match.city,
    "FIFA World Cup 2026 stadium"
  ].filter(Boolean);

  const response = await fetch(`${env.googlePlacesBaseUrl}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": env.googleMapsApiKey,
      "X-Goog-FieldMask": "places.displayName,places.photos"
    },
    body: JSON.stringify({
      textQuery: compact(queryParts.join(" ")),
      maxResultCount: 1
    })
  });

  if (!response.ok) return null;
  const payload = await response.json();
  const photoName = payload?.places?.[0]?.photos?.[0]?.name || null;
  if (!photoName) return null;

  return {
    imageUrl: googlePhotoProxyUrl(photoName),
    imageSource: "Google Places"
  };
}

async function wikipediaImage(title) {
  if (!title) return null;
  const response = await fetch(`${WIKIPEDIA_SUMMARY_BASE}/${encodeURIComponent(title)}`);
  if (!response.ok) return null;
  const data = await response.json();
  const imageUrl = data?.originalimage?.source || data?.thumbnail?.source || null;
  if (!imageUrl) return null;
  return {
    imageUrl,
    imageSource: "Wikipedia"
  };
}

async function fetchPublicMatchImage(match) {
  const teams = relevantTeams(match);
  const candidates = [
    match.venue,
    teams.length ? `${teams[0]} national football team` : null,
    teams.length > 1 ? `${teams[1]} national football team` : null,
    match.city ? `${match.city} stadium` : null
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      const image = await wikipediaImage(candidate);
      if (image) return image;
    } catch {
      // Try the next match-specific candidate.
    }
  }

  return null;
}

export async function getMatchImage(match) {
  if (!match) return null;
  if (match.thumbnail) {
    return {
      imageUrl: match.thumbnail,
      imageSource: match.source || "Match provider"
    };
  }

  const cacheKey = `match-image:${match.id}:${match.venue || ""}:${match.homeTeam || ""}:${match.awayTeam || ""}`;
  const cached = await getCachedJson(cacheKey);
  if (cached) return cached;

  let image = null;
  try {
    image = await fetchGooglePlacePhoto(match);
  } catch {
    image = null;
  }

  if (!image) {
    image = await fetchPublicMatchImage(match);
  }

  if (image) {
    await setCachedJson(cacheKey, image, 60 * 60 * 24 * 7);
  }

  return image;
}

export async function enrichMatchesWithImages(matches = []) {
  return Promise.all(
    matches.map(async (match) => {
      const image = await getMatchImage(match).catch(() => null);
      return {
        ...match,
        imageUrl: image?.imageUrl || match.thumbnail || null,
        imageSource: image?.imageSource || (match.thumbnail ? match.source : null)
      };
    })
  );
}

export async function proxyGooglePlacePhoto(req, res) {
  if (!env.googleMapsApiKey) {
    return res.status(404).json({ ok: false, error: "Google Places API key is not configured" });
  }

  const photoName = req.query.name?.toString();
  const width = Math.min(Number(req.query.width) || 900, 1600);
  if (!photoName || !photoName.startsWith("places/") || !photoName.includes("/photos/")) {
    return res.status(400).json({ ok: false, error: "Invalid photo name" });
  }

  const params = new URLSearchParams({
    key: env.googleMapsApiKey,
    maxWidthPx: String(width),
    skipHttpRedirect: "true"
  });
  const response = await fetch(`${env.googlePlacesBaseUrl}/${photoName}/media?${params.toString()}`);
  if (!response.ok) {
    return res.status(response.status).json({ ok: false, error: "Google Places photo request failed" });
  }

  const payload = await response.json();
  if (!payload?.photoUri) {
    return res.status(404).json({ ok: false, error: "Photo URI not found" });
  }

  res.redirect(payload.photoUri);
}
