import { env } from "../config/env.js";
import { getCachedJson, setCachedJson } from "../config/cache.js";

const AIRPORTS_CACHE_KEY = "airports:public-json";

const fallbackAirports = [
  { iata: "MAD", name: "Adolfo Suarez Madrid-Barajas Airport", city: "Madrid", country: "Spain" },
  { iata: "BCN", name: "Barcelona-El Prat Airport", city: "Barcelona", country: "Spain" },
  { iata: "LIS", name: "Humberto Delgado Airport", city: "Lisbon", country: "Portugal" },
  { iata: "CDG", name: "Paris Charles de Gaulle Airport", city: "Paris", country: "France" },
  { iata: "ORY", name: "Paris Orly Airport", city: "Paris", country: "France" },
  { iata: "FCO", name: "Rome Fiumicino Airport", city: "Rome", country: "Italy" },
  { iata: "MUC", name: "Munich Airport", city: "Munich", country: "Germany" },
  { iata: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany" },
  { iata: "BRU", name: "Brussels Airport", city: "Brussels", country: "Belgium" },
  { iata: "CRL", name: "Brussels South Charleroi Airport", city: "Brussels", country: "Belgium" },
  { iata: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "United States" },
  { iata: "LHR", name: "Heathrow Airport", city: "London", country: "United Kingdom" },
  { iata: "DFW", name: "Dallas/Fort Worth International Airport", city: "Dallas", country: "United States" },
  { iata: "DAL", name: "Dallas Love Field", city: "Dallas", country: "United States" },
  { iata: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "United States" },
  { iata: "EWR", name: "Newark Liberty International Airport", city: "Newark", country: "United States" },
  { iata: "LGA", name: "LaGuardia Airport", city: "New York", country: "United States" },
  { iata: "MEX", name: "Mexico City International Airport", city: "Mexico City", country: "Mexico" },
  { iata: "NLU", name: "Felipe Angeles International Airport", city: "Mexico City", country: "Mexico" },
  { iata: "GDL", name: "Guadalajara International Airport", city: "Guadalajara", country: "Mexico" },
  { iata: "MTY", name: "Monterrey International Airport", city: "Monterrey", country: "Mexico" },
  { iata: "YYZ", name: "Toronto Pearson International Airport", city: "Toronto", country: "Canada" },
  { iata: "YTZ", name: "Billy Bishop Toronto City Airport", city: "Toronto", country: "Canada" },
  { iata: "YVR", name: "Vancouver International Airport", city: "Vancouver", country: "Canada" },
  { iata: "MIA", name: "Miami International Airport", city: "Miami", country: "United States" },
  { iata: "FLL", name: "Fort Lauderdale-Hollywood International Airport", city: "Miami", country: "United States" },
  { iata: "ATL", name: "Hartsfield-Jackson Atlanta International Airport", city: "Atlanta", country: "United States" },
  { iata: "SEA", name: "Seattle-Tacoma International Airport", city: "Seattle", country: "United States" },
  { iata: "IAH", name: "George Bush Intercontinental Airport", city: "Houston", country: "United States" },
  { iata: "HOU", name: "William P. Hobby Airport", city: "Houston", country: "United States" },
  { iata: "BOS", name: "Boston Logan International Airport", city: "Boston", country: "United States" },
  { iata: "PHL", name: "Philadelphia International Airport", city: "Philadelphia", country: "United States" },
  { iata: "SFO", name: "San Francisco International Airport", city: "San Francisco", country: "United States" },
  { iata: "SJC", name: "San Jose International Airport", city: "San Francisco Bay Area", country: "United States" },
  { iata: "OAK", name: "Oakland International Airport", city: "San Francisco Bay Area", country: "United States" },
  { iata: "MCI", name: "Kansas City International Airport", city: "Kansas City", country: "United States" }
];

function normalizeText(value = "") {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizeAirport(raw) {
  const iata = raw.iata || raw.iata_code || raw.IATA || "";
  if (!iata || iata === "\\N") return null;
  return {
    iata: iata.toUpperCase(),
    name: raw.name || raw.airport || raw.airport_name || iata.toUpperCase(),
    city: raw.city || raw.municipality || raw.town || "",
    country: raw.country || raw.iso || raw.country_name || "",
    lat: raw.lat || raw.latitude || null,
    lon: raw.lon || raw.lng || raw.longitude || null
  };
}

async function loadAirports() {
  const cached = await getCachedJson(AIRPORTS_CACHE_KEY);
  if (cached?.airports?.length) return cached.airports;

  try {
    const response = await fetch(env.airportsDataUrl);
    if (!response.ok) throw new Error(`Airport data request failed (${response.status})`);
    const data = await response.json();
    const rows = Array.isArray(data) ? data : Object.values(data || {});
    const airports = rows.map(normalizeAirport).filter(Boolean);
    await setCachedJson(AIRPORTS_CACHE_KEY, { airports }, 7 * 24 * 60 * 60);
    return airports;
  } catch {
    return fallbackAirports;
  }
}

function scoreAirport(airport, query) {
  const target = normalizeText(query);
  const city = normalizeText(airport.city);
  const name = normalizeText(airport.name);
  const iata = normalizeText(airport.iata);
  if (iata === target) return 0;
  if (city === target) return 1;
  if (city.includes(target) || target.includes(city)) return 2;
  if (name.includes(target)) return 3;
  return 9;
}

export async function searchAirportsByCity(city, limit = 12) {
  const query = city?.trim();
  if (!query) return [];

  const target = normalizeText(query);
  const airports = await loadAirports();
  const merged = [...airports, ...fallbackAirports]
    .filter((airport) => {
      const haystack = normalizeText(`${airport.iata} ${airport.name} ${airport.city} ${airport.country}`);
      return haystack.includes(target);
    })
    .sort((a, b) => scoreAirport(a, query) - scoreAirport(b, query) || a.iata.localeCompare(b.iata));

  const seen = new Set();
  return merged
    .filter((airport) => {
      if (seen.has(airport.iata)) return false;
      seen.add(airport.iata);
      return true;
    })
    .slice(0, limit);
}

export async function resolveAirportSelection(city, selection = null) {
  if (selection?.mode === "airport" && selection.iata) {
    return [
      {
        iata: selection.iata.toUpperCase(),
        name: selection.name || selection.iata.toUpperCase(),
        city: selection.city || city,
        country: selection.country || ""
      }
    ];
  }

  const airports = await searchAirportsByCity(city, 8);
  if (!airports.length) {
    const error = new Error(`No airports found for city: ${city}`);
    error.statusCode = 404;
    throw error;
  }
  return airports;
}
