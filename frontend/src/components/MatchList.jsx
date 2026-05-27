import { CalendarDays, Clock, MapPin } from "lucide-react";
import { teamFifaUrl } from "../utils/teamVisuals.js";
import { formatKickoffForTimezone, formatUtcLabel } from "../utils/matchTime.js";
import TeamBadge from "./TeamBadge.jsx";

export default function MatchList({
  matches,
  title = "Partidos",
  emptyText = "Sin partidos para esta seleccion.",
  travelerTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
}) {
  if (!matches?.length) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-black">{title}</h2>
        <p className="mt-2 text-sm font-medium text-slate-500">{emptyText}</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-black">{title}</h2>
      <div className="mt-3 grid gap-3">
        {matches.map((match) => (
          <article key={match.id} className="rounded-md border border-slate-200 p-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-sm font-black text-slate-950">
                    <span className="inline-flex items-center gap-1.5">
                    <TeamBadge team={match.homeTeam} width={40} className="h-4 w-6" />
                    <a href={teamFifaUrl(match.homeTeam)} target="_blank" rel="noreferrer" className="hover:underline">
                      {match.homeTeam}
                    </a>
                  </span>
                  <span className="text-slate-500">vs</span>
                  <span className="inline-flex items-center gap-1.5">
                    <TeamBadge team={match.awayTeam} width={40} className="h-4 w-6" />
                    <a href={teamFifaUrl(match.awayTeam)} target="_blank" rel="noreferrer" className="hover:underline">
                      {match.awayTeam}
                    </a>
                  </span>
                </div>
                <p className="mt-1 text-xs font-bold uppercase text-slate-500">{match.stage || "Partido"}</p>
              </div>
              <div className="rounded-md bg-slate-100 px-2 py-1 text-xs font-black text-slate-700">
                {match.city || "Sede por confirmar"}
              </div>
            </div>
            <div className="mt-3 grid gap-2 text-sm font-medium text-slate-600 sm:grid-cols-3">
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={16} className="text-brandRed" />
                {match.date || "Fecha por confirmar"}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock size={16} className="text-brandRed" />
                <span>
                  <span className="block">Hora sede: {match.localKickoff || formatUtcLabel(match.timeUtc)}</span>
                  <span className="block text-xs text-slate-500">
                    Tu hora ({travelerTimezone}):{" "}
                    {formatKickoffForTimezone({
                      date: match.date,
                      timeUtc: match.timeUtc,
                      timezone: travelerTimezone
                    }) || formatUtcLabel(match.timeUtc)}
                  </span>
                </span>
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin size={16} className="text-brandRed" />
                {match.venue || "Estadio por confirmar"}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
