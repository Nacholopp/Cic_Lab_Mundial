import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), "..", ".env") });
dotenv.config();

function numberFromEnv(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: numberFromEnv(process.env.PORT, 4000),
  corsOrigin: (process.env.CORS_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim()),
  databaseUrl: process.env.DATABASE_URL || "",
  redisUrl: process.env.REDIS_URL || "",
  jwtSecret: process.env.JWT_SECRET || "replace_me",
  ignavApiKey: process.env.IGNAV_API_KEY || "",
  ignavBaseUrl: process.env.IGNAV_BASE_URL || "https://ignav.com/api",
  airportsDataUrl:
    process.env.AIRPORTS_DATA_URL || "https://raw.githubusercontent.com/mwgg/Airports/master/airports.json",
  sportsDbApiKey: process.env.THESPORTSDB_API_KEY || "3",
  sportsDbBaseUrl:
    process.env.THESPORTSDB_BASE_URL || "https://www.thesportsdb.com/api/v1/json",
  sportsDbLeagueId: process.env.THESPORTSDB_LEAGUE_ID || "4429",
  timeApiBaseUrl: process.env.TIME_API_BASE_URL || "https://timeapi.bio/timeapi/time",
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY || "",
  openWeatherBaseUrl:
    process.env.OPENWEATHER_BASE_URL || "https://api.openweathermap.org/data/2.5/weather"
};
