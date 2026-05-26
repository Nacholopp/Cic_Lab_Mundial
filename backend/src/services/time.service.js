import { env } from "../config/env.js";
import { getCachedJson, setCachedJson } from "../config/cache.js";

export async function getCurrentTimeByTimezone(timezone = "Europe/Madrid") {
  const cacheKey = `timeapi:${timezone}`;
  const cached = await getCachedJson(cacheKey);
  if (cached?.time) return cached.time;

  const response = await fetch(env.timeApiBaseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ region: timezone })
  });

  if (!response.ok) {
    const error = new Error(`Time API request failed (${response.status})`);
    error.statusCode = 502;
    throw error;
  }

  const data = await response.json();
  const time = {
    datetime: data.datetime,
    timezone: data.timezone || timezone,
    timezoneOffset: data.timezone_offset || null,
    dayOfWeek: data.day_of_week || null,
    dayOfYear: data.day_of_year || null,
    timestamp: data.timestamp || null
  };

  await setCachedJson(cacheKey, { time }, 30);
  return time;
}
