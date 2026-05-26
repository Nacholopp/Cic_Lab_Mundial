import { ChevronDown, Search, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { teamCountries } from "../data/teamCountries.js";

const flagUrl = (flag) => `https://flagcdn.com/w160/${flag}.png`;

function cardStyle(team) {
  const [first, second, third] = team.colors;
  return {
    background: `linear-gradient(135deg, ${first} 0%, ${first} 34%, ${second} 34%, ${second} 66%, ${third} 66%, ${third} 100%)`
  };
}

export default function TeamCountrySelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = teamCountries.find((team) => team.name === value);
  const previewTeam = selected || teamCountries.find((team) => team.name === "Spain");

  const filteredTeams = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return teamCountries;
    return teamCountries.filter((team) => `${team.name} ${team.region}`.toLowerCase().includes(normalizedQuery));
  }, [query]);

  const chooseTeam = (team) => {
    onChange(team.name);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="relative">
      <label className="text-sm font-bold">Seleccion a seguir</label>
      <button
        type="button"
        className="mt-1 flex w-full items-center gap-3 rounded-lg border border-slate-300 p-2 text-left text-white shadow-sm outline-none transition hover:border-brandBlue focus:border-brandBlue focus:ring-2 focus:ring-brandBlue/20"
        style={cardStyle(previewTeam)}
        onClick={() => setOpen((current) => !current)}
      >
        <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-md bg-white/85 p-2 shadow-sm">
          <img src={flagUrl(previewTeam.flag)} alt={previewTeam.name} className="h-full w-full rounded object-cover" />
        </div>
        <div className="min-w-0 flex-1 rounded-md bg-black/35 px-3 py-2 backdrop-blur-sm">
          <p className="truncate text-lg font-black">{selected ? previewTeam.name : "Elige tu seleccion"}</p>
          <p className="mt-1 truncate text-xs font-bold uppercase tracking-[0.18em] text-white/75">
            {previewTeam.region}
          </p>
        </div>
        <ChevronDown className={`shrink-0 drop-shadow transition ${open ? "rotate-180" : ""}`} size={20} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-950 shadow-2xl">
          <div className="flex items-center gap-2 border-b border-slate-200 p-3">
            <Search size={18} className="text-slate-400" />
            <input
              className="w-full bg-transparent text-sm font-semibold outline-none"
              placeholder="Busca pais o confederacion"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoFocus
            />
          </div>
          <div className="grid max-h-[420px] gap-2 overflow-y-auto p-2 sm:grid-cols-2">
            {filteredTeams.map((team) => {
              const isSelected = value === team.name;
              return (
                <button
                  key={team.name}
                  type="button"
                  className="relative min-h-20 overflow-hidden rounded-md p-2 text-left text-white shadow-sm ring-1 ring-black/5 transition hover:scale-[1.01] hover:shadow-md"
                  style={cardStyle(team)}
                  onClick={() => chooseTeam(team)}
                >
                  <div className="absolute inset-0 bg-black/15" />
                  <div className="absolute bottom-1 right-2 text-4xl font-black uppercase tracking-normal text-white/10">
                    {team.name}
                  </div>
                  <div className="relative flex items-center gap-3">
                    <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded bg-white/90 p-1.5">
                      <img src={flagUrl(team.flag)} alt={team.name} className="h-full w-full rounded-sm object-cover" />
                    </div>
                    <div className="min-w-0 flex-1 rounded bg-black/35 px-2 py-1.5 backdrop-blur-sm">
                      <p className="truncate text-sm font-black">{team.name}</p>
                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/75">{team.region}</p>
                    </div>
                    {isSelected && <Star size={17} fill="currentColor" className="shrink-0 drop-shadow" />}
                  </div>
                </button>
              );
            })}
            {!filteredTeams.length && (
              <p className="col-span-full px-3 py-6 text-center text-sm font-semibold text-slate-500">
                Sin resultados.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
