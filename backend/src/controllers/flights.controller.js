import { getFlexibleFlightOffers } from "../services/amadeus.service.js";
import { rankFlights } from "../services/recommendation.service.js";

export async function findFlights(req, res) {
  const { originCity, destinationCity, departureDate, adults = 1, preferences = [] } = req.body || {};

  if (!originCity || !destinationCity || !departureDate) {
    return res.status(400).json({
      ok: false,
      error: "originCity, destinationCity and departureDate are required"
    });
  }

  const { originIata, destinationIata, offers } = await getFlexibleFlightOffers({
    originCity,
    destinationCity,
    departureDate,
    adults
  });

  const ranking = rankFlights(offers, preferences);

  return res.json({
    ok: true,
    originIata,
    destinationIata,
    offers,
    ranking
  });
}
