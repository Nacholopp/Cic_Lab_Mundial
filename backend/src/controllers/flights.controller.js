import { searchAirportsByCity } from "../services/airports.service.js";
import { getFlexibleFlightOffers } from "../services/ignav.service.js";
import { rankFlights } from "../services/recommendation.service.js";

export async function findAirports(req, res) {
  const { city } = req.query || {};
  if (!city) {
    return res.status(400).json({ ok: false, error: "city is required" });
  }

  const airports = await searchAirportsByCity(city);
  return res.json({ ok: true, airports });
}

export async function findFlights(req, res) {
  const {
    originCity,
    destinationCity,
    departureDate,
    adults = 1,
    preferences = [],
    originAirport = null,
    destinationAirport = null,
    cabinClass = "economy",
    maxStops = 1
  } = req.body || {};

  if (!originCity || !destinationCity || !departureDate) {
    return res.status(400).json({
      ok: false,
      error: "originCity, destinationCity and departureDate are required"
    });
  }

  const flightSearch = await getFlexibleFlightOffers({
    originCity,
    destinationCity,
    departureDate,
    adults,
    originAirport,
    destinationAirport,
    cabinClass,
    maxStops
  });

  const ranking = rankFlights(flightSearch.offers, preferences);

  return res.json({
    ok: true,
    originIata: flightSearch.originIata,
    destinationIata: flightSearch.destinationIata,
    originAirports: flightSearch.originAirports,
    destinationAirports: flightSearch.destinationAirports,
    offers: flightSearch.offers,
    ranking
  });
}
