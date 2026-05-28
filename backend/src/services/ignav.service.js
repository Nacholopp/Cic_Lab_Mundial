import { env } from "../config/env.js";
import { addDays } from "../utils/date.utils.js";
import { resolveAirportSelection } from "./airports.service.js";

function assertIgnavKey() {
  if (!env.ignavApiKey) {
    const error = new Error("Ignav API key is missing in .env");
    error.statusCode = 400;
    throw error;
  }
}

function durationToMinutes(value) {
  if (!value) return 0;
  if (typeof value === "number") return value;
  const hours = value.match(/(\d+)\s*h/i)?.[1] || 0;
  const minutes = value.match(/(\d+)\s*m/i)?.[1] || 0;
  return Number(hours) * 60 + Number(minutes);
}

function findFirstNumber(...values) {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number) && number > 0) return number;
  }
  return 0;
}

function extractOffers(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.fares)) return payload.fares;
  if (Array.isArray(payload?.offers)) return payload.offers;
  if (Array.isArray(payload?.itineraries)) return payload.itineraries;
  if (Array.isArray(payload?.results)) return payload.results;
  if (payload && typeof payload === "object") return [payload];
  return [];
}

function normalizeOffer(raw, context, index) {
  const price = findFirstNumber(
    raw.price,
    raw.total,
    raw.amount,
    raw.total_amount,
    raw.fare,
    raw.value,
    raw?.pricing?.total,
    raw?.price?.amount,
    raw?.price?.total
  );
  if (!price) return null;

  const segments = raw?.outbound?.segments || raw?.itinerary?.segments || [];
  const duration =
    raw.duration || raw.total_duration || raw?.itinerary?.duration || raw?.outbound?.duration_minutes || "";
  const stops = Number(
    raw.stops ??
      raw.max_stops ??
      raw.number_of_stops ??
      raw?.itinerary?.stops ??
      Math.max(segments.length - 1, 0)
  );

  return {
    id: raw.id || raw.ignav_id || `${context.originIata}-${context.destinationIata}-${context.departureDate}-${index}`,
    price,
    currency: raw.currency || raw?.price?.currency || "USD",
    duration: typeof duration === "number" ? `${duration} min` : duration || (stops === 0 ? "Directo" : "Duracion por confirmar"),
    durationMinutes: durationToMinutes(duration),
    stops: Number.isFinite(stops) ? stops : 0,
    departureDate: context.departureDate,
    departureAt: raw.departure_at || raw.departureAt || raw.departure_time || segments[0]?.departure_time_local || "",
    arrivalAt:
      raw.arrival_at ||
      raw.arrivalAt ||
      raw.arrival_time ||
      segments[segments.length - 1]?.arrival_time_local ||
      "",
    carrierCode:
      raw.airline ||
      raw.carrier ||
      raw.carrier_code ||
      raw?.outbound?.carrier ||
      segments[0]?.marketing_carrier_code ||
      "",
    originIata: context.originIata,
    destinationIata: context.destinationIata,
    cabinClass: context.cabinClass,
    dayOffset: context.dayOffset,
    source: "ignav"
  };
}

async function searchIgnavOneWayFare({
  originIata,
  destinationIata,
  departureDate,
  cabinClass = "economy",
  maxStops = 1,
  dayOffset = 0
}) {
  assertIgnavKey();

  const response = await fetch(`${env.ignavBaseUrl}/fares/one-way`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": env.ignavApiKey
    },
    body: JSON.stringify({
      origin: originIata,
      destination: destinationIata,
      departure_date: departureDate,
      cabin_class: cabinClass,
      max_stops: maxStops
    })
  });

  if (!response.ok) {
    const error = new Error(`Ignav API request failed (${response.status})`);
    error.statusCode = 502;
    throw error;
  }

  const payload = await response.json();
  return extractOffers(payload)
    .map((offer, index) =>
      normalizeOffer(offer, { originIata, destinationIata, departureDate, cabinClass, maxStops, dayOffset }, index)
    )
    .filter(Boolean);
}

export async function getFlexibleFlightOffers({
  originCity,
  destinationCity,
  departureDate,
  adults = 1,
  cabinClass = "economy",
  maxStops = 1,
  originAirport = null,
  destinationAirport = null
}) {
  if (!departureDate) {
    const error = new Error("departureDate is required");
    error.statusCode = 400;
    throw error;
  }

  const [originAirports, destinationAirports] = await Promise.all([
    resolveAirportSelection(originCity, originAirport),
    resolveAirportSelection(destinationCity, destinationAirport)
  ]);

  const offsets = [0, -1, 1];
  const selectedOrigins = originAirports.slice(0, 1);
  const selectedDestinations = destinationAirports.slice(0, 1);
  const collectedOffers = [];
  const errors = [];
  let sawRateLimit = false;

  for (const origin of selectedOrigins) {
    for (const destination of selectedDestinations) {
      for (const offset of offsets) {
        try {
          const offers = await searchIgnavOneWayFare({
            originIata: origin.iata,
            destinationIata: destination.iata,
            departureDate: addDays(departureDate, offset),
            cabinClass,
            maxStops,
            dayOffset: offset
          });
          collectedOffers.push(...offers);
          if (collectedOffers.length >= 15) break;
        } catch (error) {
          if (error?.message?.includes("(429)")) sawRateLimit = true;
          errors.push(error.message);
          if (error?.message?.includes("(402)")) {
            // Avoid exhausting credits or failing repeatedly with payment-required responses.
            break;
          }
        }
      }
      if (collectedOffers.length >= 15) break;
    }
    if (collectedOffers.length >= 15) break;
  }

  const sortedOffers = collectedOffers.sort((a, b) => a.price - b.price);
  const best = sortedOffers[0] || null;
  if (!sortedOffers.length && errors.length) {
    const error = new Error(
      sawRateLimit
        ? "Ignav rate limit alcanzado temporalmente. Reintenta en unos segundos."
        : errors[0]
    );
    error.statusCode = 502;
    throw error;
  }

  return {
    originIata: best?.originIata || originAirports[0]?.iata || null,
    destinationIata: best?.destinationIata || destinationAirports[0]?.iata || null,
    originAirports,
    destinationAirports,
    adults,
    offers: sortedOffers
  };
}
