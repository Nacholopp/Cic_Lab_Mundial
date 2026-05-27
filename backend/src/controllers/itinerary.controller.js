import { getFlexibleFlightOffers } from "../services/ignav.service.js";
import { rankFlights, buildItinerary, explainRecommendation } from "../services/recommendation.service.js";
import { buildMatchPlan } from "../services/match-planner.service.js";
import { getUpcomingMatches } from "../services/thesportsdb.service.js";
import { getWeatherByCity } from "../services/weather.service.js";
import { getDestinationGuide } from "../services/places.service.js";
import { hostCities } from "../data/worldcup2026.data.js";
import { addDays } from "../utils/date.utils.js";

function normalizeText(value = "") {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function hostCityByName(city) {
  const target = normalizeText(city);
  return hostCities.find((item) => normalizeText(item.name) === target) || null;
}

const knownCityCoordinates = new Map([
  ["madrid", { lat: 40.4168, lon: -3.7038 }],
  ["barcelona", { lat: 41.3874, lon: 2.1686 }],
  ["paris", { lat: 48.8566, lon: 2.3522 }],
  ["london", { lat: 51.5072, lon: -0.1276 }]
]);

function cityCoordinates(city) {
  const hostCity = hostCityByName(city);
  if (hostCity?.lat && hostCity?.lon) return { lat: hostCity.lat, lon: hostCity.lon };
  return knownCityCoordinates.get(normalizeText(city)) || null;
}

function dateMinusDays(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function datePlusDays(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

async function buildFollowTeamRoute({
  matches,
  originCity,
  adults,
  cabinClass,
  maxStops,
  originAirport,
  destinationAirport,
  preferences
}) {
  const sortedMatches = [...matches].sort((a, b) => `${a.date}T${a.timeUtc || "00:00:00"}`.localeCompare(`${b.date}T${b.timeUtc || "00:00:00"}`));
  if (!sortedMatches.length) {
    return {
      routeFlights: [],
      routeSegments: [],
      combinedOffers: []
    };
  }

  const stops = [];
  const first = sortedMatches[0];
  stops.push({
    fromCity: originCity,
    toCity: first.city,
    matchId: first.id,
    departureDate: dateMinusDays(first.date, 1),
    originAirport,
    destinationAirport
  });

  for (let index = 1; index < sortedMatches.length; index += 1) {
    const previousMatch = sortedMatches[index - 1];
    const currentMatch = sortedMatches[index];
    if (normalizeText(previousMatch.city) === normalizeText(currentMatch.city)) continue;

    stops.push({
      fromCity: previousMatch.city,
      toCity: currentMatch.city,
      matchId: currentMatch.id,
      departureDate: dateMinusDays(currentMatch.date, 1),
      originAirport: null,
      destinationAirport: null
    });
  }

  const lastMatch = sortedMatches[sortedMatches.length - 1];
  if (normalizeText(lastMatch.city) !== normalizeText(originCity)) {
    stops.push({
      fromCity: lastMatch.city,
      toCity: originCity,
      matchId: `${lastMatch.id}-return`,
      departureDate: addDays(lastMatch.date, 1),
      originAirport: null,
      destinationAirport: originAirport
    });
  }

  const routeFlights = [];
  const combinedOffers = [];

  for (const stop of stops) {
    try {
      const search = await getFlexibleFlightOffers({
        originCity: stop.fromCity,
        destinationCity: stop.toCity,
        departureDate: stop.departureDate,
        adults,
        cabinClass,
        maxStops,
        originAirport: stop.originAirport,
        destinationAirport: stop.destinationAirport
      });
      const ranked = rankFlights(search.offers, preferences);
      if (ranked.recommended) {
        routeFlights.push({
          ...stop,
          recommended: ranked.recommended,
          cheapest: ranked.cheapest,
          fastest: ranked.fastest
        });
      }
      combinedOffers.push(...search.offers);
    } catch {
      routeFlights.push({
        ...stop,
        recommended: null,
        cheapest: null,
        fastest: null
      });
    }
  }

  const routeSegments = routeFlights.map((flight, index) => {
    return {
      id: `${index + 1}-${flight.fromCity}-${flight.toCity}`,
      fromCity: flight.fromCity,
      toCity: flight.toCity,
      fromCoordinates: cityCoordinates(flight.fromCity),
      toCoordinates: cityCoordinates(flight.toCity),
      departureDate: flight.departureDate,
      flight: flight.recommended
    };
  });

  return { routeFlights, routeSegments, combinedOffers };
}

function buildWatchSpots(city) {
  return [
    {
      name: `Fan zone de ${city}`,
      type: "Pantalla gigante",
      area: "Zona centro",
      note: "Ideal para ver partidos principales con ambiente de torneo."
    },
    {
      name: `Sports bar internacional`,
      type: "Bar deportivo",
      area: city,
      note: "Buena opcion para partidos simultaneos y horarios nocturnos."
    },
    {
      name: `Punto de encuentro de aficionados`,
      type: "Quedada local",
      area: city,
      note: "Recomendado para seguir a tu seleccion con otros fans."
    }
  ];
}

export async function buildTravelPlan(req, res) {
  const body = req.body || {};
  const {
    mode = "travel_city",
    favoriteTeam: rawFavoriteTeam,
    originCity: rawOriginCity,
    destinationCity: rawDestinationCity,
    departureDate: rawDepartureDate,
    endDate: rawEndDate = null,
    adults = 1,
    preferences = [],
    budget = null,
    originCoordinates = null,
    originAirport = null,
    destinationAirport = null,
    cabinClass = "economy",
    maxStops = 1
  } = body;
  const destinationCity =
    rawDestinationCity?.toString().trim() ||
    body.requestedDestinationCity?.toString().trim() ||
    body.destination_city?.toString().trim() ||
    body.destination?.toString().trim() ||
    body.profile?.destinationCity?.toString().trim() ||
    destinationAirport?.city?.toString().trim() ||
    "";
  const originCity =
    rawOriginCity?.toString().trim() ||
    body.origin_city?.toString().trim() ||
    body.origin?.toString().trim() ||
    body.profile?.originCity?.toString().trim() ||
    originAirport?.city?.toString().trim() ||
    "";
  const favoriteTeam = rawFavoriteTeam?.toString().trim() || "";
  const departureDate = rawDepartureDate?.toString().trim() || "";
  const endDate = mode === "follow_team" ? (rawEndDate || departureDate || null) : rawEndDate;
  const effectiveInputDestination = destinationCity || body.requestedDestinationCity?.toString().trim() || "";

  if (!originCity) {
    return res.status(400).json({ ok: false, error: "originCity is required" });
  }

  if (mode !== "stay_origin" && !departureDate) {
    return res.status(400).json({ ok: false, error: "departureDate is required for travel modes" });
  }

  if (mode === "travel_city" && !effectiveInputDestination) {
    return res.status(400).json({ ok: false, error: "destinationCity is required for travel_city mode" });
  }

  if (mode === "follow_team" && !favoriteTeam) {
    return res.status(400).json({ ok: false, error: "favoriteTeam is required for follow_team mode" });
  }

  if (mode === "follow_team" && departureDate && endDate && departureDate > endDate) {
    return res.status(400).json({ ok: false, error: "endDate must be on or after departureDate" });
  }

  const matches = await getUpcomingMatches();
  const matchPlan = buildMatchPlan({
    matches,
    mode,
    originCity,
    destinationCity: effectiveInputDestination,
    favoriteTeam,
    departureDate,
    endDate,
    originCoordinates
  });

  const effectiveDestinationCity = matchPlan.selectedCity || effectiveInputDestination || originCity;
  let originIata = null;
  let destinationIata = null;
  let offers = [];
  let flightError = null;

  let followTeamRoute = { routeFlights: [], routeSegments: [], combinedOffers: [] };
  if (mode === "follow_team" && matchPlan.hasExactMatches) {
    followTeamRoute = await buildFollowTeamRoute({
      matches: matchPlan.matches,
      originCity,
      adults,
      cabinClass,
      maxStops,
      originAirport,
      destinationAirport,
      preferences
    });
    offers = followTeamRoute.combinedOffers;
    const firstFlight = followTeamRoute.routeFlights.find((leg) => leg.recommended)?.recommended || null;
    originIata = firstFlight?.originIata || null;
    destinationIata = firstFlight?.destinationIata || null;
  } else if (mode !== "stay_origin" && originCity.toLowerCase() !== effectiveDestinationCity.toLowerCase()) {
    try {
      const flightSearch = await getFlexibleFlightOffers({
        originCity,
        destinationCity: effectiveDestinationCity,
        departureDate,
        adults,
        originAirport,
        destinationAirport,
        cabinClass,
        maxStops
      });
      originIata = flightSearch.originIata;
      destinationIata = flightSearch.destinationIata;
      offers = flightSearch.offers;
    } catch (error) {
      flightError = error.message;
    }
  }

  const rankedFlights = rankFlights(offers, preferences);
  const relevantMatches = matchPlan.hasExactMatches ? matchPlan.matches : matchPlan.alternatives;
  const itinerary = buildItinerary(relevantMatches, originCity, effectiveDestinationCity, mode);
  const recommendationText = explainRecommendation({
    preferences,
    recommended: rankedFlights.recommended
  });

  let weather = null;
  let weatherError = null;
  try {
    const itineraryDates = itinerary.map((item) => item.date).filter(Boolean).sort();
    const weatherStart = itineraryDates[0] || departureDate || new Date().toISOString().slice(0, 10);
    const weatherEnd = itineraryDates[itineraryDates.length - 1] || endDate || datePlusDays(weatherStart, 4);
    weather = await getWeatherByCity(effectiveDestinationCity, {
      startDate: weatherStart,
      endDate: weatherEnd
    });
  } catch (error) {
    weatherError = error.message;
  }

  const recommendedPrice = rankedFlights.recommended?.price || 0;
  const estimatedTotalCost = recommendedPrice * adults;
  const watchSpots = mode === "stay_origin" ? buildWatchSpots(originCity) : [];
  const destinationGuide = await getDestinationGuide({
    city: effectiveDestinationCity,
    originCity
  });
  const budgetStatus =
    budget == null
      ? "no_budget_provided"
      : estimatedTotalCost <= Number(budget)
        ? "within_budget"
        : "over_budget";

  res.json({
    ok: true,
    profile: {
      mode,
      favoriteTeam,
      originCity,
      destinationCity: effectiveDestinationCity,
      requestedDestinationCity: destinationCity,
      originIata,
      destinationIata,
      departureDate,
      endDate,
      adults,
      preferences,
      budget,
      budgetPerPerson: req.body?.budgetPerPerson ?? null,
      originAirport,
      destinationAirport,
      cabinClass,
      maxStops
    },
    matchPlan,
    watchSpots,
    flights: rankedFlights,
    flightError,
    matches: relevantMatches,
    itinerary,
    recommendationText,
    weather,
    weatherError,
    destinationGuide,
    followTeamRoute: {
      legs: followTeamRoute.routeFlights,
      segments: followTeamRoute.routeSegments
    },
    dataSources: {
      matches: "TheSportsDB league 4429 with fallback World Cup 2026 seed",
      maps: destinationGuide.dataSources
    },
    costs: {
      estimatedTotalCost,
      currency: rankedFlights.recommended?.currency || "USD",
      budgetStatus
    },
    savedItineraryId: null
  });
}

export async function listMyItineraries(req, res) {
  return res.json({
    ok: true,
    itineraries: []
  });
}
