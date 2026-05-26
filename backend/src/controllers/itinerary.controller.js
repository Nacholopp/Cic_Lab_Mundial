import { getFlexibleFlightOffers } from "../services/amadeus.service.js";
import { rankFlights, buildItinerary, explainRecommendation } from "../services/recommendation.service.js";
import { getUpcomingMatches } from "../services/thesportsdb.service.js";
import { getWeatherByCity } from "../services/weather.service.js";

function teamMatchFilter(matches, favoriteTeam) {
  if (!favoriteTeam) return matches;
  const target = favoriteTeam.toLowerCase();
  const filtered = matches.filter(
    (item) =>
      item.homeTeam?.toLowerCase().includes(target) || item.awayTeam?.toLowerCase().includes(target)
  );
  return filtered.length ? filtered : matches;
}

export async function buildTravelPlan(req, res) {
  const {
    favoriteTeam,
    originCity,
    destinationCity,
    departureDate,
    adults = 1,
    preferences = [],
    budget = null
  } = req.body || {};

  if (!favoriteTeam || !originCity || !destinationCity || !departureDate) {
    return res.status(400).json({
      ok: false,
      error: "favoriteTeam, originCity, destinationCity and departureDate are required"
    });
  }

  const [{ originIata, destinationIata, offers }, matches] = await Promise.all([
    getFlexibleFlightOffers({
      originCity,
      destinationCity,
      departureDate,
      adults
    }),
    getUpcomingMatches()
  ]);

  const rankedFlights = rankFlights(offers, preferences);
  const relevantMatches = teamMatchFilter(matches, favoriteTeam).slice(0, 10);
  const itinerary = buildItinerary(relevantMatches, originCity, destinationCity);
  const recommendationText = explainRecommendation({
    preferences,
    recommended: rankedFlights.recommended
  });

  let weather = null;
  let weatherError = null;
  try {
    weather = await getWeatherByCity(destinationCity);
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
      favoriteTeam,
      originCity,
      destinationCity,
      originIata,
      destinationIata,
      departureDate,
      adults,
      preferences,
      budget
    },
    flights: rankedFlights,
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
