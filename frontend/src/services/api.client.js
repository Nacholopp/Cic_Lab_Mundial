const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers,
      ...options
    });
  } catch {
    throw new Error(`No se pudo conectar con el backend (${API_URL}). Revisa que este arrancado.`);
  }

  const raw = await response.text();
  let payload = {};
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    payload = {};
  }

  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error || "Request failed");
  }
  return payload;
}

export function buildPlan(body, authToken = null) {
  return request("/itinerary/plan", {
    method: "POST",
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    body: JSON.stringify(body)
  });
}

export function registerUser(body) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export function loginUser(body) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export function checkEmailExists(email) {
  return request(`/auth/check-email?email=${encodeURIComponent(email)}`);
}

export function fetchCurrentUser(authToken) {
  return request("/auth/me", {
    headers: { Authorization: `Bearer ${authToken}` }
  });
}

export function fetchMyItineraries(authToken) {
  return request("/itinerary/mine", {
    headers: { Authorization: `Bearer ${authToken}` }
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
