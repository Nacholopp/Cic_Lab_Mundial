import { env } from "../config/env.js";
import { getCachedJson, setCachedJson } from "../config/cache.js";

function normalizeText(value = "") {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export async function geocodeCity(city) {
  const query = city?.trim();
  if (!query) return null;

  const cacheKey = `geocode:city:${normalizeText(query)}`;
  const cached = await getCachedJson(cacheKey);
  if (cached?.lat && cached?.lon) return cached;

  try {
    const params = new URLSearchParams({
      name: query,
      count: "1",
      language: "en",
      format: "json"
    });
    const response = await fetch(`${env.openMeteoGeocodingUrl}?${params.toString()}`);
    if (!response.ok) return null;
    const payload = await response.json();
    const first = payload?.results?.[0];
    if (!first?.latitude || !first?.longitude) return null;

    const result = {
      lat: Number(first.latitude),
      lon: Number(first.longitude),
      name: first.name || query,
      country: first.country || null
    };
    await setCachedJson(cacheKey, result, 30 * 24 * 60 * 60);
    return result;
  } catch {
    return null;
  }
}
