import { getFlexibleFlightOffers } from "../services/amadeus.service.js";
import { rankFlights, buildItinerary, explainRecommendation } from "../services/recommendation.service.js";
import { buildMatchPlan } from "../services/match-planner.service.js";
import { getUpcomingMatches } from "../services/thesportsdb.service.js";
import { getWeatherByCity } from "../services/weather.service.js";

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
    originCoordinates = null
  } = req.body || {};

  if (!originCity || !departureDate) {
    return res.status(400).json({
      ok: false,
      error: "originCity and departureDate are required"
    });
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

  if (originCity.toLowerCase() !== effectiveDestinationCity.toLowerCase()) {
    try {
      const flightSearch = await getFlexibleFlightOffers({
        originCity,
        destinationCity: effectiveDestinationCity,
        departureDate,
        adults
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
      budget
    },
    matchPlan,
    flights: rankedFlights,
    flightError,
    matches: relevantMatches,
    itinerary,
    recommendationText,
    weather,
    weatherError,
    costs: {
      estimatedTotalCost,
      currency: rankedFlights.recommended?.currency || "USD",
      budgetStatus
    }
  });
}
