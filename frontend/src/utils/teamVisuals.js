import { teamCountries } from "../data/teamCountries.js";

const aliasToTeamName = new Map([
  ["usa", "United States"],
  ["united states of america", "United States"],
  ["korea republic", "South Korea"],
  ["south korea", "South Korea"],
  ["ir iran", "Iran"],
  ["iran", "Iran"],
  ["turkiye", "Turkey"],
  ["czechia", "Czech Republic"],
  ["cabo verde", "Cape Verde"]
]);

function normalize(value = "") {
  return value
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function resolveTeam(teamName = "") {
  const normalized = normalize(teamName);
  const canonical = aliasToTeamName.get(normalized) || teamName;
  const fallback = { name: canonical || teamName, flag: null };
  return teamCountries.find((team) => normalize(team.name) === normalize(canonical)) || fallback;
}

export function teamFlagUrl(teamName = "", width = 80) {
  const team = resolveTeam(teamName);
  if (!team.flag) return null;
  return `https://flagcdn.com/w${width}/${team.flag}.png`;
}

export function teamFifaUrl(teamName = "") {
  const encoded = encodeURIComponent((teamName || "").trim().toLowerCase().replace(/\s+/g, "-"));
  return `https://www.fifa.com/worldcup/teams/${encoded}`;
}

