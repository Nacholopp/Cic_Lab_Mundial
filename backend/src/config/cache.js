import Redis from "ioredis";
import { env } from "./env.js";

const memoryCache = new Map();

let redisClient = null;
let redisEnabled = false;

if (env.redisUrl) {
  redisClient = new Redis(env.redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    retryStrategy: null
  });

  redisClient.on("error", () => {
    redisEnabled = false;
  });

  redisClient
    .connect()
    .then(() => {
      redisEnabled = true;
      console.log("Redis cache connected");
    })
    .catch(() => {
      redisEnabled = false;
      redisClient.disconnect();
      console.warn("Redis unavailable, using in-memory cache");
    });
}

function nowMs() {
  return Date.now();
}

function memoryGet(key) {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= nowMs()) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value;
}

function memorySet(key, value, ttlSeconds) {
  memoryCache.set(key, {
    value,
    expiresAt: nowMs() + ttlSeconds * 1000
  });
}

export async function getCachedJson(key) {
  if (redisEnabled && redisClient) {
    const raw = await redisClient.get(key);
    return raw ? JSON.parse(raw) : null;
  }
  return memoryGet(key);
}

export async function setCachedJson(key, value, ttlSeconds) {
  if (redisEnabled && redisClient) {
    await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
    return;
  }
  memorySet(key, value, ttlSeconds);
}

export function isRedisEnabled() {
  return redisEnabled;
}
