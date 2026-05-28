import { env } from "../config/env.js";
import { getCachedJson, setCachedJson } from "../config/cache.js";
import { hostCities } from "../data/worldcup2026.data.js";
import { getCityImageUrl } from "./city-image.service.js";

const fallbackAttractions = {
  "Mexico City": [
    ["Centro Historico", "Patrimonio, plazas y arquitectura colonial cerca de varias conexiones de metro."],
    ["Museo Nacional de Antropologia", "Una de las visitas culturales mas potentes antes o despues de partido."],
    ["Coyoacan", "Barrio caminable con comida, plazas y ambiente local."]
  ],
  Guadalajara: [
    ["Centro de Guadalajara", "Catedral, plazas historicas y restaurantes clasicos."],
    ["Tlaquepaque", "Artesania, musica y terrazas para una tarde tranquila."],
    ["Hospicio Cabanas", "Museo y arquitectura reconocida por UNESCO."]
  ],
  Monterrey: [
    ["Parque Fundidora", "Gran zona urbana para caminar, comer y conectar con el centro."],
    ["Paseo Santa Lucia", "Canal peatonal con restaurantes y vistas de ciudad."],
    ["Barrio Antiguo", "Bares, cultura y vida nocturna cerca del centro."]
  ],
  Dallas: [
    ["Dallas Arts District", "Museos y arquitectura en una zona facil de recorrer."],
    ["Deep Ellum", "Murales, musica y comida informal."],
    ["Klyde Warren Park", "Parque urbano con food trucks y ambiente familiar."]
  ],
  "New York/New Jersey": [
    ["Liberty State Park", "Vistas de Manhattan y acceso practico desde New Jersey."],
    ["The High Line", "Paseo elevado para combinar con comida y tiendas."],
    ["Times Square", "Icono turistico para primera visita."]
  ],
  "Los Angeles": [
    ["Santa Monica", "Playa, muelle y restaurantes para dia libre."],
    ["Griffith Observatory", "Vistas de ciudad y del letrero de Hollywood."],
    ["Downtown LA", "Mercados, arquitectura y conexiones de transporte."]
  ],
  Miami: [
    ["South Beach", "Playa, Art Deco y restaurantes."],
    ["Wynwood", "Murales, cafes y ambiente nocturno."],
    ["Little Havana", "Cultura cubana y comida local."]
  ],
  Toronto: [
    ["CN Tower", "Mirador iconico junto al centro."],
    ["Distillery District", "Zona historica con tiendas y restaurantes."],
    ["Toronto Islands", "Vistas del skyline y paseo relajado."]
  ],
  Vancouver: [
    ["Stanley Park", "Naturaleza, vistas y rutas caminables."],
    ["Granville Island", "Mercado publico y comida local."],
    ["Gastown", "Zona historica con restaurantes y bares."]
  ]
};

function normalizeText(value = "") {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function findHostCity(city = "") {
  const target = normalizeText(city);
  return (
    hostCities.find((hostCity) => normalizeText(hostCity.name) === target) ||
    hostCities.find((hostCity) => normalizeText(hostCity.name).includes(target) || target.includes(normalizeText(hostCity.name))) ||
    hostCities.find((hostCity) => normalizeText(hostCity.stadium).includes(target))
  );
}

function googleMapsSearchUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function googleMapsDirectionsUrl(origin, destination) {
  const params = new URLSearchParams({
    api: "1",
    destination
  });
  if (origin) params.set("origin", origin);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function fallbackList(city) {
  const items = fallbackAttractions[city] || [
    [`Centro de ${city}`, "Zona central recomendada para una primera toma de contacto."],
    [`Museos de ${city}`, "Buena opcion si quieres turismo tranquilo entre partidos."],
    [`Miradores y parques de ${city}`, "Plan flexible para ajustar segun horarios de partido."]
  ];

  return items.map(([name, description]) => ({
    name,
    description,
    category: "turismo",
    address: city,
    source: "fallback",
    mapsUrl: googleMapsSearchUrl(`${name} ${city}`)
  }));
}

async function fetchGoogleRestaurants(city, hostCity) {
  if (!env.googleMapsApiKey) return [];

  try {
    const response = await fetch(`${env.googlePlacesBaseUrl}/places:searchText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": env.googleMapsApiKey,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating,places.googleMapsUri"
      },
      body: JSON.stringify({
        textQuery: `restaurants near ${hostCity?.stadium || city}`,
        maxResultCount: 6
      })
    });

    if (!response.ok) return [];
    const payload = await response.json();
    return (payload.places || []).map((place) => ({
      name: place.displayName?.text || "Restaurante",
      address: place.formattedAddress || city,
      rating: place.rating || null,
      source: "Google Places",
      mapsUrl: place.googleMapsUri || googleMapsSearchUrl(`${place.displayName?.text || "restaurant"} ${city}`)
    }));
  } catch {
    return [];
  }
}

async function fetchGeoapifyAttractions(city, hostCity) {
  if (!env.geoapifyApiKey || !hostCity?.lat || !hostCity?.lon) return [];

  const params = new URLSearchParams({
    categories: "tourism.sights,tourism.attraction,entertainment.culture",
    filter: `circle:${hostCity.lon},${hostCity.lat},18000`,
    bias: `proximity:${hostCity.lon},${hostCity.lat}`,
    limit: "8",
    apiKey: env.geoapifyApiKey
  });

  let payload = null;
  try {
    const response = await fetch(`${env.geoapifyBaseUrl}/places?${params.toString()}`);
    if (!response.ok) return [];
    payload = await response.json();
  } catch {
    return [];
  }

  return (payload.features || []).map((feature) => {
    const props = feature.properties || {};
    return {
      name: props.name || props.address_line1 || "Punto de interes",
      description: props.categories?.slice(0, 3).join(", ") || "Punto turistico recomendado.",
      category: "turismo",
      address: props.formatted || city,
      source: "Geoapify Places",
      mapsUrl: googleMapsSearchUrl(`${props.name || props.address_line1} ${city}`)
    };
  });
}

export async function getDestinationGuide({ city, originCity }) {
  const hostCity = findHostCity(city) || { name: city, stadium: null, lat: null, lon: null };
  const cacheKey = `places:guide:${hostCity.name}:${originCity || ""}`;
  const cached = await getCachedJson(cacheKey);
  if (cached) return cached;

  const [restaurants, apiAttractions, cityImageUrl] = await Promise.all([
    fetchGoogleRestaurants(hostCity.name, hostCity),
    fetchGeoapifyAttractions(hostCity.name, hostCity),
    getCityImageUrl(hostCity.name).catch(() => null)
  ]);

  const guide = {
    city: hostCity.name,
    stadium: hostCity.stadium,
    coordinates: hostCity.lat && hostCity.lon ? { lat: hostCity.lat, lon: hostCity.lon } : null,
    maps: {
      city: googleMapsSearchUrl(hostCity.name),
      stadium: googleMapsSearchUrl(`${hostCity.stadium || hostCity.name}`),
      directionsFromOrigin: googleMapsDirectionsUrl(originCity, hostCity.stadium || hostCity.name),
      restaurants: googleMapsSearchUrl(`restaurants near ${hostCity.stadium || hostCity.name}`)
    },
    restaurants: restaurants.length
      ? restaurants
      : [
          {
            name: `Restaurantes cerca de ${hostCity.stadium || hostCity.name}`,
            address: hostCity.name,
            rating: null,
            source: "Google Maps link",
            mapsUrl: googleMapsSearchUrl(`restaurants near ${hostCity.stadium || hostCity.name}`)
          }
        ],
    attractions: apiAttractions.length ? apiAttractions : fallbackList(hostCity.name),
    cityImageUrl: cityImageUrl || null,
    dataSources: {
      restaurants: env.googleMapsApiKey ? "Google Places API" : "Google Maps search link",
      attractions: apiAttractions.length ? "Geoapify Places API" : "Curated fallback list",
      directions: "Google Maps URLs"
    }
  };

  await setCachedJson(cacheKey, guide, 60 * 60 * 24);
  return guide;
}
