const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const payload = await response.json();
  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error || "Request failed");
  }
  return payload;
}

export function buildPlan(body) {
  return request("/itinerary/plan", {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export function fetchAirports(city) {
  return request(`/flights/airports?city=${encodeURIComponent(city)}`);
}

export function fetchMatches() {
  return request("/matches");
}

export function fetchCurrentTime(timezone = "Europe/Madrid") {
  return request(`/time?timezone=${encodeURIComponent(timezone)}`);
}

export function fetchDestinationGuide(city, originCity = "") {
  const params = new URLSearchParams({ city });
  if (originCity) params.set("originCity", originCity);
  return request(`/places/destination?${params.toString()}`);
}

export function apiAssetUrl(url) {
  if (!url || !url.startsWith("/api/")) return url;
  return `${API_URL.replace(/\/api$/, "")}${url}`;
}
