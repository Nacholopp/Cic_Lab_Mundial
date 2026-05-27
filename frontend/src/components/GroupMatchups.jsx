import { worldCupGroups } from "../data/worldCupGroups.js";
import { teamFifaUrl } from "../utils/teamVisuals.js";
import TeamBadge from "./TeamBadge.jsx";

function buildGroupMatchups(teams) {
  const matchups = [];
  for (let i = 0; i < teams.length; i += 1) {
    for (let j = i + 1; j < teams.length; j += 1) {
      matchups.push({ homeTeam: teams[i], awayTeam: teams[j], id: `${teams[i]}-${teams[j]}` });
    }
  }
  return matchups;
}

export default function GroupMatchups() {
  const entries = Object.entries(worldCupGroups);

  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-black">Grupos y enfrentamientos</h2>
      <p className="mt-1 text-sm font-medium text-slate-600">
        Vista completa A-L para mantener referencia del torneo en todo momento.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {entries.map(([group, teams]) => (
          <article key={group} className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brandRed">Grupo {group}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {teams.map((team) => (
                <span key={team} className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                  <TeamBadge team={team} width={32} className="h-3.5 w-5" />
                  <a href={teamFifaUrl(team)} target="_blank" rel="noreferrer" className="hover:underline">
                    {team}
                  </a>
                </span>
              ))}
            </div>
            <ul className="mt-3 space-y-1">
              {buildGroupMatchups(teams).map((matchup) => (
                <li key={matchup.id} className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                  <TeamBadge team={matchup.homeTeam} width={32} className="h-3.5 w-5" />
                  <a href={teamFifaUrl(matchup.homeTeam)} target="_blank" rel="noreferrer" className="hover:underline">
                    {matchup.homeTeam}
                  </a>
                  <span className="text-slate-500">vs</span>
                  <TeamBadge team={matchup.awayTeam} width={32} className="h-3.5 w-5" />
                  <a href={teamFifaUrl(matchup.awayTeam)} target="_blank" rel="noreferrer" className="hover:underline">
                    {matchup.awayTeam}
                  </a>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
