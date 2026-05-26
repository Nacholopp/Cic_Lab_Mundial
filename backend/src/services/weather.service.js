import { env } from "../config/env.js";
import { getCachedJson, setCachedJson } from "../config/cache.js";

export async function getWeatherByCity(city) {
  if (!city) {
    const error = new Error("city is required for weather");
    error.statusCode = 400;
    throw error;
  }

  if (!env.openWeatherApiKey) {
    const error = new Error("OPENWEATHER_API_KEY is missing in .env");
    error.statusCode = 400;
    throw error;
  }

  const cacheKey = `weather:${city.toLowerCase()}`;
  const cached = await getCachedJson(cacheKey);
  if (cached?.weather) return cached.weather;

  const params = new URLSearchParams({
    q: city,
    appid: env.openWeatherApiKey,
    units: "metric"
  });
  const response = await fetch(`${env.openWeatherBaseUrl}?${params.toString()}`);
  if (!response.ok) {
    const error = new Error(`OpenWeather request failed (${response.status})`);
    error.statusCode = 502;
    throw error;
  }

  const data = await response.json();
  const weather = {
    city: data.name,
    temperatureC: data.main?.temp ?? null,
    feelsLikeC: data.main?.feels_like ?? null,
    description: data.weather?.[0]?.description || "",
    humidity: data.main?.humidity ?? null,
    windSpeed: data.wind?.speed ?? null
  };

  await setCachedJson(cacheKey, { weather }, 10 * 60);
  return weather;
}
