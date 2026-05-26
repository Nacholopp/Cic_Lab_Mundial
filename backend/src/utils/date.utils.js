export function addDays(dateString, offsetDays) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export function parseIso8601DurationToMinutes(duration) {
  if (!duration || typeof duration !== "string") return Number.MAX_SAFE_INTEGER;
  const match = duration.match(/P(?:\d+D)?T(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  return hours * 60 + minutes;
}
