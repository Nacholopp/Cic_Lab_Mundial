import { env } from "../config/env.js";
import { getCachedJson, setCachedJson } from "../config/cache.js";
import { hostCities } from "../data/worldcup2026.data.js";

const weatherCodeMap = {
  0: "Despejado",
  1: "Mayormente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla con escarcha",
  51: "Llovizna ligera",
  53: "Llovizna moderada",
  55: "Llovizna intensa",
  61: "Lluvia ligera",
  63: "Lluvia moderada",
  65: "Lluvia intensa",
  71: "Nieve ligera",
  73: "Nieve moderada",
  75: "Nieve intensa",
  80: "Chubascos ligeros",
  81: "Chubascos moderados",
  82: "Chubascos fuertes",
  95: "Tormenta",
  96: "Tormenta con granizo ligero",
  99: "Tormenta con granizo fuerte"
};

function weatherCodeLabel(code) {
  return weatherCodeMap[code] || "Condicion variable";
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function subtractYear(dateString) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCFullYear(date.getUTCFullYear() - 1);
  return date.toISOString().slice(0, 10);
}

function daysBetween(from, to) {
  const a = new Date(`${from}T00:00:00Z`).getTime();
  const b = new Date(`${to}T00:00:00Z`).getTime();
  return Math.floor((b - a) / (1000 * 60 * 60 * 24));
}

async function geocodeCity(city) {
  const known = hostCities.find((item) => item.name.toLowerCase() === city.toLowerCase());
  if (known) {
    return {
      city: known.name,
      country: known.country,
      latitude: known.lat,
      longitude: known.lon,
      timezone: known.timezone || "auto"
    };
  }

  const params = new URLSearchParams({
    name: city,
    count: "1",
    language: "es",
    format: "json"
  });
  const response = await fetch(`${env.openMeteoGeocodeBaseUrl}/search?${params.toString()}`);
  if (!response.ok) {
    const error = new Error(`Open-Meteo geocoding failed (${response.status})`);
    error.statusCode = 502;
    throw error;
  }
  const data = await response.json();
  const result = data?.results?.[0];
  if (!result) {
    const fuzzy = hostCities.find((item) => item.name.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(item.name.toLowerCase()));
    if (fuzzy) {
      return {
        city: fuzzy.name,
        country: fuzzy.country,
        latitude: fuzzy.lat,
        longitude: fuzzy.lon,
        timezone: fuzzy.timezone || "auto"
      };
    }
    const error = new Error(`No geocoding result for city: ${city}`);
    error.statusCode = 404;
    throw error;
  }
  return {
    city: result.name,
    country: result.country || "",
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone || "auto"
  };
}

function buildWeatherFromDaily(location, payload, source) {
  const currentCode = payload?.current?.weather_code ?? payload?.daily?.weather_code?.[0] ?? null;
  const dailyDays = (payload?.daily?.time || []).map((date, index) => ({
    date,
    temperatureMaxC: payload?.daily?.temperature_2m_max?.[index] ?? null,
    temperatureMinC: payload?.daily?.temperature_2m_min?.[index] ?? null,
    precipitationProbabilityMax: payload?.daily?.precipitation_probability_max?.[index] ?? null,
    weatherCode: payload?.daily?.weather_code?.[index] ?? null,
    description: weatherCodeLabel(payload?.daily?.weather_code?.[index])
  }));

  return {
    city: location.city,
    country: location.country,
    timezone: payload?.timezone || location.timezone,
    temperatureC: payload?.current?.temperature_2m ?? dailyDays?.[0]?.temperatureMaxC ?? null,
    feelsLikeC: null,
    description: weatherCodeLabel(currentCode),
    humidity: payload?.current?.relative_humidity_2m ?? null,
    windSpeed: payload?.current?.wind_speed_10m ?? null,
    source,
    daily: dailyDays
  };
}

function fallbackEstimatedWeather(city, startDate, endDate) {
  const known = hostCities.find((item) => item.name.toLowerCase() === city.toLowerCase());
  const month = Number((startDate || "").split("-")[1] || "6");
  const warmBase = known?.country === "CA" ? 18 : known?.country === "MX" ? 27 : 25;
  const monthOffset = month >= 11 || month <= 2 ? -6 : month >= 6 && month <= 8 ? 3 : 0;
  const avg = warmBase + monthOffset;
  const days = Math.max(1, Math.min(7, daysBetween(startDate, endDate) + 1));
  const daily = Array.from({ length: days }).map((_, index) => ({
    date: addDays(startDate, index),
    temperatureMaxC: avg + 4,
    temperatureMinC: avg - 3,
    precipitationProbabilityMax: 30,
    weatherCode: 2,
    description: "Parcialmente nublado"
  }));

  return {
    city: known?.name || city,
    country: known?.country || "",
    timezone: known?.timezone || "N/A",
    temperatureC: avg,
    feelsLikeC: avg + 1,
    description: "Estimacion climaticamente probable",
    humidity: 58,
    windSpeed: 4.5,
    source: "Estimated fallback",
    daily
  };
}

export async function getWeatherByCity(city, options = {}) {
  if (!city) {
    const error = new Error("city is required for weather");
    error.statusCode = 400;
    throw error;
  }

  const startDate = options.startDate || new Date().toISOString().slice(0, 10);
  const endDate = options.endDate || addDays(startDate, 4);

  const cacheKey = `weather:openmeteo:${city.toLowerCase()}:${startDate}:${endDate}`;
  const cached = await getCachedJson(cacheKey);
  if (cached?.weather) return cached.weather;

  try {
    const location = await geocodeCity(city);
    const today = new Date().toISOString().slice(0, 10);
    const isForecastRange = daysBetween(today, startDate) <= 15;

    if (isForecastRange) {
      const forecastParams = new URLSearchParams({
        latitude: String(location.latitude),
        longitude: String(location.longitude),
        timezone: location.timezone || "auto",
        start_date: startDate,
        end_date: endDate,
        current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
        daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max"
      });
      const forecastResponse = await fetch(`${env.openMeteoBaseUrl}/forecast?${forecastParams.toString()}`);
      if (forecastResponse.ok) {
        const forecast = await forecastResponse.json();
        const weather = buildWeatherFromDaily(location, forecast, "Open-Meteo Forecast");
        await setCachedJson(cacheKey, { weather }, 10 * 60);
        return weather;
      }
    }

    const archiveParams = new URLSearchParams({
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      timezone: location.timezone || "auto",
      start_date: subtractYear(startDate),
      end_date: subtractYear(endDate),
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum"
    });
    const archiveResponse = await fetch(`${env.openMeteoBaseUrl}/archive?${archiveParams.toString()}`);
    if (archiveResponse.ok) {
      const archive = await archiveResponse.json();
      const weather = buildWeatherFromDaily(location, archive, "Open-Meteo Historical Reference");
      await setCachedJson(cacheKey, { weather }, 30 * 60);
      return weather;
    }
  } catch {
    // fallback below
  }

  const weather = fallbackEstimatedWeather(city, startDate, endDate);
  await setCachedJson(cacheKey, { weather }, 5 * 60);
  return weather;
}
