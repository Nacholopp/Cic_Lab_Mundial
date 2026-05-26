import { featuredTeams, qualifiedRegions } from "../data/worldCupVisuals.js";

export default function TeamShowcase() {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-brandRed">Mundial 2026</p>
          <h2 className="text-2xl font-black text-slate-950">Selecciones clasificadas</h2>
        </div>
        <p className="text-sm font-medium text-slate-600">48 equipos, 16 ciudades, 3 paises anfitriones</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {featuredTeams.map((team) => (
          <article
            key={team.name}
            className="group relative min-h-56 overflow-hidden rounded-lg border border-white/70 bg-slate-950 shadow-sm"
          >
            <img
              src={team.image}
              alt={`Ambiente de futbol para ${team.name}`}
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className={`absolute inset-0 bg-gradient-to-br ${team.color} opacity-70 mix-blend-multiply`} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
            <div className="relative flex h-full min-h-56 flex-col justify-between p-4 text-white">
              <div className="flex items-center justify-between">
                <img
                  src={`https://flagcdn.com/w80/${team.badge}.png`}
                  alt={`Bandera de ${team.name}`}
                  className="h-10 w-14 rounded object-cover shadow-lg ring-2 ring-white/80"
                  loading="lazy"
                />
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">
                  {team.group}
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-black">{team.name}</h3>
                <p className="mt-1 text-sm font-medium text-white/85">{team.note}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {qualifiedRegions.map((region) => (
          <article key={region.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase text-slate-950">{region.label}</h3>
              <span className="text-xs font-bold text-slate-500">{region.teams.length} selecciones</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {region.teams.map((team) => (
                <span key={team} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {team}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
