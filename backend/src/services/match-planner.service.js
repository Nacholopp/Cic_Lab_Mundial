import { fallbackWorldCupMatches, hostCities } from "../data/worldcup2026.data.js";

const cityAliases = new Map([
  ["ciudad de mexico", "Mexico City"],
  ["mexico city", "Mexico City"],
  ["cdmx", "Mexico City"],
  ["new york", "New York/New Jersey"],
  ["new jersey", "New York/New Jersey"],
  ["nyc", "New York/New Jersey"],
  ["san francisco", "San Francisco Bay Area"],
  ["bay area", "San Francisco Bay Area"],
  ["santa clara", "San Francisco Bay Area"],
  ["la", "Los Angeles"],
  ["los angeles", "Los Angeles"],
  ["guadalajara", "Guadalajara"],
  ["monterrey", "Monterrey"],
  ["toronto", "Toronto"],
  ["vancouver", "Vancouver"],
  ["dallas", "Dallas"],
  ["miami", "Miami"],
  ["seattle", "Seattle"],
  ["houston", "Houston"],
  ["atlanta", "Atlanta"],
  ["boston", "Boston"],
  ["kansas city", "Kansas City"],
  ["philadelphia", "Philadelphia"]
]);

const knownCityCoordinates = new Map([
  ["madrid", { lat: 40.4168, lon: -3.7038 }],
  ["barcelona", { lat: 41.3874, lon: 2.1686 }],
  ["london", { lat: 51.5072, lon: -0.1276 }],
  ["paris", { lat: 48.8566, lon: 2.3522 }],
  ["buenos aires", { lat: -34.6037, lon: -58.3816 }],
  ["rio de janeiro", { lat: -22.9068, lon: -43.1729 }],
  ["sao paulo", { lat: -23.5558, lon: -46.6396 }],
  ["bogota", { lat: 4.711, lon: -74.0721 }],
  ["lima", { lat: -12.0464, lon: -77.0428 }],
  ["montevideo", { lat: -34.9011, lon: -56.1645 }],
  ["chicago", { lat: 41.8781, lon: -87.6298 }],
  ["washington", { lat: 38.9072, lon: -77.0369 }],
  ["denver", { lat: 39.7392, lon: -104.9903 }],
  ["phoenix", { lat: 33.4484, lon: -112.074 }],
  ["san diego", { lat: 32.7157, lon: -117.1611 }],
  ["montreal", { lat: 45.5019, lon: -73.5674 }],
  ["ottawa", { lat: 45.4215, lon: -75.6972 }],
  ["calgary", { lat: 51.0447, lon: -114.0719 }]
]);

const worldCupGroups = {
  A: ["Mexico", "South Africa", "South Korea", "Czech Republic"],
  B: ["Canada", "Switzerland", "Qatar", "Bosnia and Herzegovina"],
  C: ["Brazil", "Morocco", "Haiti", "Scotland"],
  D: ["United States", "Paraguay", "Australia", "Turkey"],
  E: ["Germany", "Curacao", "Ivory Coast", "Ecuador"],
  F: ["Netherlands", "Japan", "Tunisia", "Sweden"],
  G: ["Belgium", "Egypt", "Iran", "New Zealand"],
  H: ["Spain", "Cape Verde", "Saudi Arabia", "Uruguay"],
  I: ["France", "Senegal", "Norway", "Iraq"],
  J: ["Argentina", "Algeria", "Austria", "Jordan"],
  K: ["Portugal", "Uzbekistan", "Colombia", "DR Congo"],
  L: ["England", "Croatia", "Ghana", "Panama"]
};

function normalizeText(value = "") {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function canonicalCityName(city) {
  const normalized = normalizeText(city);
  return cityAliases.get(normalized) || city?.trim() || "";
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function haversineMiles(from, to) {
  const earthRadiusMiles = 3958.8;
  const dLat = toRadians(to.lat - from.lat);
  const dLon = toRadians(to.lon - from.lon);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function cityMatches(match, city) {
  const target = normalizeText(canonicalCityName(city));
  return normalizeText(canonicalCityName(match.city)).includes(target) || target.includes(normalizeText(match.city));
}

function teamMatches(match, team) {
  const target = normalizeText(team);
  if (!target) return false;
  return normalizeText(match.homeTeam).includes(target) || normalizeText(match.awayTeam).includes(target);
}

function dateMatches(match, startDate, endDate) {
  if (!startDate && !endDate) return true;
  if (startDate && match.date < startDate) return false;
  if (endDate && match.date > endDate) return false;
  return true;
}

function withFallbackMatches(matches = []) {
  const usable = matches.filter((match) => match.city && match.date);
  return usable.length ? usable : fallbackWorldCupMatches;
}

function addDays(dateString, offsetDays) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function groupForTeam(team) {
  const target = normalizeText(team);
  for (const [group, teams] of Object.entries(worldCupGroups)) {
    if (teams.some((name) => normalizeText(name) === target)) {
      return { group, teams };
    }
  }
  return null;
}

function inferredMatchesForTeam({ favoriteTeam, departureDate, endDate }) {
  const groupData = groupForTeam(favoriteTeam);
  if (!groupData) return [];

  const opponents = groupData.teams.filter((team) => normalizeText(team) !== normalizeText(favoriteTeam));
  if (!opponents.length) return [];

  const baseDate = departureDate || "2026-06-11";
  const dates = opponents.map((_, index) => addDays(baseDate, index * 4));
  const validDates = dates.filter((date) => !endDate || date <= endDate);
  const selectedDates = validDates.length ? validDates : dates.slice(0, 1);

  return selectedDates.map((date, index) => {
    const host = hostCities[(Math.abs(favoriteTeam.length * 7 + index * 13)) % hostCities.length];
    const isHome = index % 2 === 0;
    return {
      id: `projected-${normalizeText(favoriteTeam)}-${index + 1}`,
      homeTeam: isHome ? favoriteTeam : opponents[index],
      awayTeam: isHome ? opponents[index] : favoriteTeam,
      date,
      timeUtc: "19:00:00",
      venue: host.stadium,
      city: host.name,
      stage: `Group ${groupData.group} (estimado)`,
      source: "Projected group fixtures",
      localKickoff: null
    };
  });
}

export function findNearestHostCity(city, coordinates = null) {
  const canonical = canonicalCityName(city);
  const exact = hostCities.find((hostCity) => normalizeText(hostCity.name) === normalizeText(canonical));
  if (exact) {
    return { ...exact, distanceMiles: 0, distanceKm: 0, isExact: true };
  }

  const fallbackCoordinates = knownCityCoordinates.get(normalizeText(city));
  const usableCoordinates = coordinates?.lat && coordinates?.lon ? coordinates : fallbackCoordinates;

  if (!usableCoordinates?.lat || !usableCoordinates?.lon) {
    return { ...hostCities[0], distanceMiles: null, distanceKm: null, isExact: false };
  }

  const origin = { lat: Number(usableCoordinates.lat), lon: Number(usableCoordinates.lon) };
  const nearest = hostCities
    .map((hostCity) => {
      const distanceMiles = haversineMiles(origin, hostCity);
      return {
        ...hostCity,
        distanceMiles: Math.round(distanceMiles),
        distanceKm: Math.round(distanceMiles * 1.60934),
        isExact: false
      };
    })
    .sort((a, b) => a.distanceMiles - b.distanceMiles)[0];

  return nearest;
}

export function buildMatchPlan({
  matches,
  mode,
  originCity,
  destinationCity,
  favoriteTeam,
  departureDate,
  endDate,
  originCoordinates
}) {
  const sourceMatches = withFallbackMatches(matches)
    .filter((match) => dateMatches(match, departureDate, endDate))
    .sort((a, b) => `${a.date}T${a.timeUtc || "00:00:00"}`.localeCompare(`${b.date}T${b.timeUtc || "00:00:00"}`));
  const allMatchesSorted = withFallbackMatches(matches).sort((a, b) =>
    `${a.date}T${a.timeUtc || "00:00:00"}`.localeCompare(`${b.date}T${b.timeUtc || "00:00:00"}`)
  );
  const selectedMode = mode || "travel_city";
  let selectedCity = canonicalCityName(destinationCity || originCity);
  let exactMatches = [];
  let notice = null;

  if (selectedMode === "stay_origin") {
    selectedCity = canonicalCityName(originCity);
    exactMatches = sourceMatches.filter((match) => cityMatches(match, selectedCity));
    if (!exactMatches.length) {
      notice = {
        type: "local_watch_plan",
        title: "No hay partidos asignados en tu ciudad",
        message: "Te mostramos horarios destacados del Mundial para verlos en tu ciudad."
      };
    }
  }

  if (selectedMode === "travel_city") {
    selectedCity = canonicalCityName(destinationCity);
    exactMatches = sourceMatches.filter((match) => cityMatches(match, selectedCity));
    if (!exactMatches.length) {
      notice = {
        type: "no_destination_matches",
        title: "No hay partidos para ese destino y fecha",
        message: "Estas son opciones similares en otras sedes cercanas o activas del calendario."
      };
    }
  }

  if (selectedMode === "follow_team") {
    exactMatches = sourceMatches.filter((match) => teamMatches(match, favoriteTeam));
    selectedCity = exactMatches[0]?.city || canonicalCityName(destinationCity || originCity);
    if (exactMatches.length < 2) {
      const inferred = inferredMatchesForTeam({ favoriteTeam, departureDate, endDate });
      const existingIds = new Set(exactMatches.map((match) => match.id));
      const merged = [...exactMatches, ...inferred.filter((match) => !existingIds.has(match.id))];
      exactMatches = merged.sort((a, b) =>
        `${a.date}T${a.timeUtc || "00:00:00"}`.localeCompare(`${b.date}T${b.timeUtc || "00:00:00"}`)
      );
      selectedCity = exactMatches[0]?.city || selectedCity;
    }
    if (!exactMatches.length) {
      const teamMatchesOutsideRange = allMatchesSorted.filter((match) => teamMatches(match, favoriteTeam));
      notice = {
        type: "no_team_matches",
        title: "No hay partidos encontrados para esa seleccion",
        message: teamMatchesOutsideRange.length
          ? "No hay partidos de esa seleccion en el rango elegido. Te mostramos sus siguientes partidos disponibles."
          : "No hay partidos de esa seleccion en la fuente actual. Te proponemos sedes activas para ajustar el plan."
      };
      if (teamMatchesOutsideRange.length) {
        exactMatches = teamMatchesOutsideRange.slice(0, 8);
        selectedCity = exactMatches[0]?.city || canonicalCityName(destinationCity || originCity);
      }
    }
  }

  const alternatives = sourceMatches
    .filter((match) => !exactMatches.some((selected) => selected.id === match.id))
    .slice(0, 6);

  return {
    mode: selectedMode,
    selectedCity,
    matches: exactMatches,
    alternatives,
    notice,
    hasExactMatches: exactMatches.length > 0
  };
}
