import { getFlexibleFlightOffers } from "../services/ignav.service.js";
import { rankFlights, buildItinerary, explainRecommendation } from "../services/recommendation.service.js";
import { buildMatchPlan } from "../services/match-planner.service.js";
import { getUpcomingMatches } from "../services/thesportsdb.service.js";
import { getWeatherByCity } from "../services/weather.service.js";
import { getDestinationGuide } from "../services/places.service.js";

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
  const {
    mode = "travel_city",
    favoriteTeam,
    originCity,
    destinationCity,
    departureDate,
    adults = 1,
    preferences = [],
    budget = null,
    originCoordinates = null,
    originAirport = null,
    destinationAirport = null,
    cabinClass = "economy",
    maxStops = 1
  } = req.body || {};

  if (!originCity) {
    return res.status(400).json({
      ok: false,
      error: "originCity is required"
    });
  }

  if (mode !== "stay_origin" && !departureDate) {
    return res.status(400).json({ ok: false, error: "departureDate is required for travel modes" });
  }

  if (mode === "travel_city" && !destinationCity) {
    return res.status(400).json({ ok: false, error: "destinationCity is required for travel_city mode" });
  }

  if (mode === "follow_team" && !favoriteTeam) {
    return res.status(400).json({ ok: false, error: "favoriteTeam is required for follow_team mode" });
  }

  const matches = await getUpcomingMatches();
  const matchPlan = buildMatchPlan({
    matches,
    mode,
    originCity,
    destinationCity,
    favoriteTeam,
    departureDate,
    originCoordinates
  });

  const effectiveDestinationCity = matchPlan.selectedCity || destinationCity || originCity;
  let originIata = null;
  let destinationIata = null;
  let offers = [];
  let flightError = null;

  if (mode !== "stay_origin" && originCity.toLowerCase() !== effectiveDestinationCity.toLowerCase()) {
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
    weather = await getWeatherByCity(effectiveDestinationCity);
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
    dataSources: {
      matches: "TheSportsDB league 4429 with fallback World Cup 2026 seed",
      maps: destinationGuide.dataSources
    },
    costs: {
      estimatedTotalCost,
      currency: rankedFlights.recommended?.currency || "USD",
      budgetStatus
    }
  });
}
