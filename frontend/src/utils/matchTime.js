export function formatUtcLabel(timeUtc) {
  if (!timeUtc) return "Hora por confirmar";
  return `${timeUtc.slice(0, 5)} UTC`;
}

export function formatKickoffForTimezone({ date, timeUtc, timezone, locale = "es-ES" }) {
  if (!date || !timeUtc || !timezone) return null;
  const kickoff = new Date(`${date}T${timeUtc.replace("Z", "")}Z`);
  if (Number.isNaN(kickoff.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone
  }).format(kickoff);
}

