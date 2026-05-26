function preferenceWeights(preferences = []) {
  const normalized = preferences.map((item) => item.toLowerCase());
  return {
    price: normalized.includes("barato") ? 0.65 : 0.45,
    time: normalized.includes("rapido") ? 0.5 : 0.3,
    stops: normalized.includes("comodo") ? 0.45 : 0.25,
    football: normalized.includes("futbol") ? 0.35 : 0.15
  };
}

function normalize(value, min, max) {
  if (max === min) return 0;
  return (value - min) / (max - min);
}

export function rankFlights(offers, preferences) {
  if (!offers?.length) return { cheapest: null, fastest: null, recommended: null, alternatives: [] };

  const weights = preferenceWeights(preferences);
  const prices = offers.map((x) => x.price);
  const durations = offers.map((x) => x.durationMinutes);
  const stops = offers.map((x) => x.stops);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  const minStops = Math.min(...stops);
  const maxStops = Math.max(...stops);

  const scored = offers.map((offer) => {
    const priceScore = normalize(offer.price, minPrice, maxPrice);
    const durationScore = normalize(offer.durationMinutes, minDuration, maxDuration);
    const stopsScore = normalize(offer.stops, minStops, maxStops);
    const footballScore = Math.abs(offer.dayOffset) / 2;
    const score =
      priceScore * weights.price +
      durationScore * weights.time +
      stopsScore * weights.stops +
      footballScore * weights.football;

    return {
      ...offer,
      score: Number(score.toFixed(4))
    };
  });

  const sortedByScore = [...scored].sort((a, b) => a.score - b.score);
  const cheapest = [...scored].sort((a, b) => a.price - b.price)[0];
  const fastest = [...scored].sort((a, b) => a.durationMinutes - b.durationMinutes)[0];
  const recommended = sortedByScore[0];
  const alternatives = sortedByScore.slice(1, 4);

  return {
    cheapest,
    fastest,
    recommended,
    alternatives
  };
}

export function buildItinerary(matches, originCity, destinationCity) {
  const selectedMatches = (matches || []).slice(0, 3);
  return selectedMatches.map((match, index) => ({
    day: index + 1,
    date: match.date,
    location: match.city || destinationCity || "TBD",
    title: `${match.homeTeam} vs ${match.awayTeam}`,
    note:
      index === 0
        ? `Vuelo desde ${originCity} a ${destinationCity}.`
        : "Dia dedicado al partido y desplazamiento local."
  }));
}

export function explainRecommendation({ preferences, recommended }) {
  if (!recommended) return "No se pudo generar recomendacion.";
  const tags = preferences?.length ? preferences.join(", ") : "balance";
  return `Recomendacion basada en preferencias (${tags}), precio ${recommended.price} ${recommended.currency}, duracion ${recommended.duration} y ${recommended.stops} escalas.`;
}
