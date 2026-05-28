import { env } from "../config/env.js";
import { getCachedJson, setCachedJson } from "../config/cache.js";
import { hostCities } from "../data/worldcup2026.data.js";

function normalizeText(value = "") {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function descriptionFromCode(code) {
  const map = new Map([
    [0, "Despejado"],
    [1, "Mayormente despejado"],
    [2, "Parcialmente nublado"],
    [3, "Nublado"],
    [45, "Niebla"],
    [48, "Niebla con escarcha"],
    [51, "Llovizna ligera"],
    [53, "Llovizna moderada"],
    [55, "Llovizna intensa"],
    [61, "Lluvia ligera"],
    [63, "Lluvia moderada"],
    [65, "Lluvia intensa"],
    [71, "Nieve ligera"],
    [73, "Nieve moderada"],
    [75, "Nieve intensa"],
    [80, "Chubascos ligeros"],
    [81, "Chubascos moderados"],
    [82, "Chubascos intensos"],
    [95, "Tormenta"],
    [96, "Tormenta con granizo ligero"],
    [99, "Tormenta con granizo intenso"]
  ]);
  return map.get(Number(code)) || "Condicion variable";
}

function hostCityCoordinates(city) {
  const target = normalizeText(city);
  const host = hostCities.find((item) => normalizeText(item.name) === target);
  if (!host?.lat || !host?.lon) return null;
  return { lat: host.lat, lon: host.lon, name: host.name };
}

async function geocodeCity(city) {
  const params = new URLSearchParams({
    name: city,
    count: "1",
    language: "es",
    format: "json"
  });
  const response = await fetch(`${env.openMeteoGeocodingUrl}?${params.toString()}`);
  if (!response.ok) {
    const error = new Error(`Open-Meteo geocoding failed (${response.status})`);
    error.statusCode = 502;
    throw error;
  }

  const data = await response.json();
  const first = data?.results?.[0];
  if (!first) {
    const error = new Error(`No se encontro geocodificacion para ${city}`);
    error.statusCode = 404;
    throw error;
  }

  return {
    lat: first.latitude,
    lon: first.longitude,
    name: first.name || city
  };
}

export async function getWeatherByCity(city) {
  if (!city) {
    const error = new Error("city is required for weather");
    error.statusCode = 400;
    throw error;
  }

  const cacheKey = `weather:${city.toLowerCase()}`;
  const cached = await getCachedJson(cacheKey);
  if (cached?.weather) return cached.weather;

  const location = hostCityCoordinates(city) || (await geocodeCity(city));
  const params = new URLSearchParams({
    latitude: String(location.lat),
    longitude: String(location.lon),
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code",
    timezone: "auto"
  });
  const response = await fetch(`${env.openMeteoBaseUrl}?${params.toString()}`);
  if (!response.ok) {
    const error = new Error(`Open-Meteo request failed (${response.status})`);
    error.statusCode = 502;
    throw error;
  }

  const data = await response.json();
  const current = data.current || {};
  const weather = {
    city: location.name || city,
    temperatureC: current.temperature_2m ?? null,
    feelsLikeC: current.apparent_temperature ?? null,
    description: descriptionFromCode(current.weather_code),
    humidity: current.relative_humidity_2m ?? null,
    windSpeed: current.wind_speed_10m ?? null
  };

  await setCachedJson(cacheKey, { weather }, 10 * 60);
  return weather;
}
