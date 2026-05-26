import { env } from "../config/env.js";
import { getCachedJson, setCachedJson } from "../config/cache.js";
import { addDays, parseIso8601DurationToMinutes } from "../utils/date.utils.js";

const AMADEUS_TOKEN_CACHE_KEY = "amadeus:oauth-token";

function assertAmadeusCredentials() {
  if (!env.amadeusClientId || !env.amadeusClientSecret) {
    const error = new Error("Amadeus credentials are missing in .env");
    error.statusCode = 400;
    throw error;
  }
}

async function getAmadeusToken() {
  assertAmadeusCredentials();
  const cached = await getCachedJson(AMADEUS_TOKEN_CACHE_KEY);
  if (cached?.accessToken && cached?.expiresAt && cached.expiresAt > Date.now()) {
    return cached.accessToken;
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: env.amadeusClientId,
    client_secret: env.amadeusClientSecret
  });

  const response = await fetch(`${env.amadeusBaseUrl}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  if (!response.ok) {
    const error = new Error(`Amadeus token request failed (${response.status})`);
    error.statusCode = 502;
    throw error;
  }

  const data = await response.json();
  const expiresIn = Number(data.expires_in || 1799);
  const payload = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (expiresIn - 30) * 1000
  };
  await setCachedJson(AMADEUS_TOKEN_CACHE_KEY, payload, Math.max(expiresIn - 30, 120));
  return payload.accessToken;
}

async function amadeusGet(path) {
  const token = await getAmadeusToken();
  const response = await fetch(`${env.amadeusBaseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = new Error(`Amadeus API request failed (${response.status})`);
    error.statusCode = 502;
    throw error;
  }

  return response.json();
}

export async function resolveCityToIata(city) {
  const query = city?.trim();
  if (!query) {
    const error = new Error("City is required to resolve IATA");
    error.statusCode = 400;
    throw error;
  }

  const cacheKey = `amadeus:iata:${query.toLowerCase()}`;
  const cached = await getCachedJson(cacheKey);
  if (cached?.iata) return cached.iata;

  const params = new URLSearchParams({
    subType: "CITY,AIRPORT",
    keyword: query,
    "page[limit]": "1",
    "view": "LIGHT"
  });

  const data = await amadeusGet(`/v1/reference-data/locations?${params.toString()}`);
  const iata = data?.data?.[0]?.iataCode || null;

  if (!iata) {
    const error = new Error(`Could not resolve IATA for city: ${query}`);
    error.statusCode = 404;
    throw error;
  }

  await setCachedJson(cacheKey, { iata }, 24 * 60 * 60);
  return iata;
}

export async function searchFlightOffers({
  originIata,
  destinationIata,
  departureDate,
  adults = 1
}) {
  const params = new URLSearchParams({
    originLocationCode: originIata,
    destinationLocationCode: destinationIata,
    departureDate,
    adults: String(adults),
    currencyCode: "USD",
    max: "20"
  });

  const data = await amadeusGet(`/v2/shopping/flight-offers?${params.toString()}`);
  return (data.data || []).map((offer) => {
    const itinerary = offer.itineraries?.[0];
    const firstSegment = itinerary?.segments?.[0];
    const lastSegment = itinerary?.segments?.[itinerary?.segments?.length - 1];
    const duration = itinerary?.duration || "";
    return {
      id: offer.id,
      price: Number(offer.price?.grandTotal || 0),
      currency: offer.price?.currency || "USD",
      duration,
      durationMinutes: parseIso8601DurationToMinutes(duration),
      stops: Math.max((itinerary?.segments?.length || 1) - 1, 0),
      departureAt: firstSegment?.departure?.at || "",
      arrivalAt: lastSegment?.arrival?.at || "",
      carrierCode: firstSegment?.carrierCode || "",
      originIata,
      destinationIata,
      validatingAirlineCodes: offer.validatingAirlineCodes || []
    };
  });
}

export async function getFlexibleFlightOffers({
  originCity,
  destinationCity,
  departureDate,
  adults = 1
}) {
  if (!departureDate) {
    const error = new Error("departureDate is required");
    error.statusCode = 400;
    throw error;
  }

  const [originIata, destinationIata] = await Promise.all([
    resolveCityToIata(originCity),
    resolveCityToIata(destinationCity)
  ]);

  const offsets = [-2, -1, 0, 1, 2];
  const requests = offsets.map(async (offset) => {
    const date = addDays(departureDate, offset);
    const offers = await searchFlightOffers({
      originIata,
      destinationIata,
      departureDate: date,
      adults
    });
    return offers.map((offer) => ({
      ...offer,
      departureDate: date,
      dayOffset: offset
    }));
  });

  const nestedOffers = await Promise.all(requests);
  const offers = nestedOffers.flat();

  return {
    originIata,
    destinationIata,
    offers
  };
}
