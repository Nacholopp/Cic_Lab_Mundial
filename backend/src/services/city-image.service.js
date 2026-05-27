const WIKIPEDIA_SUMMARY_BASE = "https://en.wikipedia.org/api/rest_v1/page/summary";
const TELEPORT_BASE = "https://api.teleport.org/api";

const teleportSlugByCity = new Map([
  ["atlanta", "atlanta"],
  ["boston", "boston"],
  ["dallas", "dallas"],
  ["guadalajara", "guadalajara"],
  ["houston", "houston"],
  ["kansas city", "kansas-city"],
  ["los angeles", "los-angeles"],
  ["mexico city", "mexico-city"],
  ["miami", "miami"],
  ["monterrey", "monterrey"],
  ["new york/new jersey", "new-york"],
  ["new york", "new-york"],
  ["philadelphia", "philadelphia"],
  ["san francisco bay area", "san-francisco-bay-area"],
  ["san francisco", "san-francisco-bay-area"],
  ["seattle", "seattle"],
  ["toronto", "toronto"],
  ["vancouver", "vancouver"]
]);

function normalizeText(value = "") {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function buildCandidates(city) {
  const clean = city?.trim() || "";
  return [clean, `${clean} city`, `${clean}, metropolitan area`].filter(Boolean);
}

async function teleportCityImage(city) {
  const slug = teleportSlugByCity.get(normalizeText(city));
  if (!slug) return null;
  const response = await fetch(`${TELEPORT_BASE}/urban_areas/slug:${slug}/images/`);
  if (!response.ok) return null;
  const payload = await response.json();
  return payload?.photos?.[0]?.image?.web || payload?.photos?.[0]?.image?.mobile || null;
}

async function summaryForTitle(title) {
  const response = await fetch(`${WIKIPEDIA_SUMMARY_BASE}/${encodeURIComponent(title)}`);
  if (!response.ok) return null;
  const data = await response.json();
  return data?.originalimage?.source || data?.thumbnail?.source || null;
}

function unsplashFallback(city) {
  return `https://source.unsplash.com/1600x900/?${encodeURIComponent(`${city} skyline`)}`;
}

export async function getCityImageUrl(city) {
  if (!city) return null;

  try {
    const teleport = await teleportCityImage(city);
    if (teleport) return teleport;
  } catch {
    // fallback
  }

  for (const candidate of buildCandidates(city)) {
    try {
      const image = await summaryForTitle(candidate);
      if (image) return image;
    } catch {
      // continue trying candidates
    }
  }

  return unsplashFallback(city);
}
