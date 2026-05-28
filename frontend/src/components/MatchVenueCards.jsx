import { CalendarDays, Clock, MapPin } from "lucide-react";
import { teamCountries } from "../data/teamCountries.js";

function flagForTeam(teamName) {
  const team = teamCountries.find((item) => item.name === teamName);
  if (!team?.flag) return null;
  return `https://flagcdn.com/w80/${team.flag}.png`;
}

function timeLabel(match) {
  if (match.localKickoff) return match.localKickoff;
  if (match.timeUtc) return `${match.timeUtc.slice(0, 5)} UTC`;
  return "Hora por confirmar";
}

function TeamBadge({ name }) {
  const flagUrl = flagForTeam(name);
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md bg-slate-100 px-2 py-1.5">
      {flagUrl ? <img src={flagUrl} alt={name} className="h-6 w-8 rounded-sm object-cover" /> : <div className="h-6 w-8 rounded-sm bg-slate-300" />}
      <span className="truncate text-sm font-black text-slate-900">{name}</span>
    </div>
  );
}

export default function MatchVenueCards({ matches }) {
  if (!matches?.length) return null;

  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-black">Enfrentamientos en esta sede</h2>
      <p className="mt-1 text-sm font-medium text-slate-600">Vista rapida de partidos con equipos, fecha, hora y estadio.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {matches.map((match) => (
          <article key={match.id} className="overflow-hidden rounded-md border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-3 py-2">
              <span className="rounded-full bg-brandRed/10 px-2 py-1 text-xs font-black uppercase tracking-[0.14em] text-brandRed">
                {match.stage || "Partido"}
              </span>
              <span className="text-xs font-bold text-slate-600">{match.date}</span>
            </div>
            <div className="grid gap-3 p-3">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <TeamBadge name={match.homeTeam} />
                <span className="text-xs font-black uppercase tracking-[0.16em] text-brandRed">vs</span>
                <TeamBadge name={match.awayTeam} />
              </div>
              <div className="grid gap-1.5 text-sm font-semibold text-slate-700">
                <p className="inline-flex items-center gap-2">
                  <CalendarDays size={15} className="text-brandRed" />
                  {match.date}
                </p>
                <p className="inline-flex items-center gap-2">
                  <Clock size={15} className="text-brandRed" />
                  {timeLabel(match)}
                </p>
                <p className="inline-flex items-center gap-2">
                  <MapPin size={15} className="text-brandRed" />
                  {match.city} - {match.venue || "Estadio por confirmar"}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
