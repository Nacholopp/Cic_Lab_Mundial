import { worldCupGroups } from "../data/worldCupGroups.js";

function buildGroupMatchups(teams) {
  const matchups = [];
  for (let i = 0; i < teams.length; i += 1) {
    for (let j = i + 1; j < teams.length; j += 1) {
      matchups.push(`${teams[i]} vs ${teams[j]}`);
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
            <p className="mt-2 text-sm font-semibold text-slate-600">{teams.join(" - ")}</p>
            <ul className="mt-3 space-y-1">
              {buildGroupMatchups(teams).map((matchup) => (
                <li key={matchup} className="text-sm font-medium text-slate-800">
                  {matchup}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
