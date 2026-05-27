import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Trophy } from "lucide-react";
import { worldCupGroups } from "../data/worldCupGroups.js";
import { knockoutBracket } from "../data/worldCupBracket.js";
import TeamBadge from "../components/TeamBadge.jsx";
import { usePlannerStore } from "../store/planner.store.js";
import { teamFlagUrl } from "../utils/teamVisuals.js";

function TeamChip({ team }) {
  const flag = teamFlagUrl(team, 160);
  const style = flag
    ? {
        backgroundImage: `linear-gradient(rgba(255,255,255,0.82), rgba(255,255,255,0.82)), url(${flag})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }
    : undefined;
  return (
    <div className="flex items-center gap-2 rounded-md border border-slate-200 px-2 py-2" style={style}>
      <TeamBadge team={team} width={32} className="h-4 w-6" />
      <span className="text-sm font-semibold text-slate-800">{team}</span>
    </div>
  );
}

function GroupsView() {
  const entries = Object.entries(worldCupGroups);
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {entries.map(([group, teams]) => (
        <article key={group} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-brandRed">Grupo {group}</p>
          <div className="mt-3 grid gap-2">
            {teams.map((team) => (
              <TeamChip key={`${group}-${team}`} team={team} />
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}

function BracketMatch({ home, away }) {
  const homeFlag = teamFlagUrl(home, 160);
  const awayFlag = teamFlagUrl(away, 160);
  return (
    <div className="rounded-md border border-slate-200 bg-white p-2 shadow-sm">
      <div
        className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1"
        style={
          homeFlag
            ? {
                backgroundImage: `linear-gradient(rgba(255,255,255,0.84), rgba(255,255,255,0.84)), url(${homeFlag})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }
            : undefined
        }
      >
        <span className="text-sm font-semibold text-slate-800">{home}</span>
      </div>
      <div
        className="mt-1 flex items-center justify-between gap-2"
        style={
          awayFlag
            ? {
                backgroundImage: `linear-gradient(rgba(255,255,255,0.84), rgba(255,255,255,0.84)), url(${awayFlag})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }
            : undefined
        }
      >
        <span className="text-sm font-semibold text-slate-800">{away}</span>
      </div>
    </div>
  );
}

function BracketView() {
  const roundOf32 = knockoutBracket.roundOf32;
  const roundOf16 = useMemo(() => Array.from({ length: 8 }, (_, i) => `Ganador R32-${i * 2 + 1} vs Ganador R32-${i * 2 + 2}`), []);
  const quarterFinals = useMemo(() => Array.from({ length: 4 }, (_, i) => `Ganador R16-${i * 2 + 1} vs Ganador R16-${i * 2 + 2}`), []);
  const semiFinals = useMemo(() => Array.from({ length: 2 }, (_, i) => `Ganador QF-${i * 2 + 1} vs Ganador QF-${i * 2 + 2}`), []);

  return (
    <section className="grid gap-4 lg:grid-cols-4">
      <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-600">Dieciseisavos</h3>
        <div className="mt-3 grid gap-2">
          {roundOf32.map((m, i) => (
            <BracketMatch key={m.id} home={`${m.home} (${i + 1})`} away={m.away} />
          ))}
        </div>
      </article>
      <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-600">Octavos</h3>
        <div className="mt-3 grid gap-2">
          {roundOf16.map((text, i) => (
            <BracketMatch key={text} home={`R16-${i + 1}`} away={text} />
          ))}
        </div>
      </article>
      <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-600">Cuartos y semis</h3>
        <div className="mt-3 grid gap-2">
          {quarterFinals.map((text, i) => (
            <BracketMatch key={text} home={`QF-${i + 1}`} away={text} />
          ))}
          {semiFinals.map((text, i) => (
            <BracketMatch key={text} home={`SF-${i + 1}`} away={text} />
          ))}
        </div>
      </article>
      <article className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-[0.12em] text-brandRed">Final</h3>
        <div className="mt-3 rounded-md border border-brandRed/30 bg-brandRed/5 p-4 text-center">
          <p className="text-sm font-bold text-slate-800">Ganador SF-1 vs Ganador SF-2</p>
          <p className="mt-2 text-xs font-semibold text-slate-500">Partido por el titulo</p>
          <Trophy className="mx-auto mt-3 text-brandRed" size={28} />
        </div>
      </article>
    </section>
  );
}

export default function Tournament() {
  const { plan, profile } = usePlannerStore();
  const [tab, setTab] = useState("groups");

  if (!plan || !profile) return <Navigate to="/" replace />;

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-6 text-slate-950">
      <div className="mx-auto max-w-7xl">
        <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-black text-slate-700">
          <ArrowLeft size={16} />
          Volver al panel
        </Link>
        <h1 className="text-3xl font-black">Torneo 2026</h1>
        <p className="mt-1 text-sm font-medium text-slate-600">Grupos completos y arbol de clasificacion hasta la final.</p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setTab("groups")}
            className={`rounded-md px-4 py-2 text-sm font-black ${tab === "groups" ? "bg-brandBlue text-white" : "bg-white text-slate-700"}`}
          >
            Fase de grupos
          </button>
          <button
            type="button"
            onClick={() => setTab("bracket")}
            className={`rounded-md px-4 py-2 text-sm font-black ${tab === "bracket" ? "bg-brandBlue text-white" : "bg-white text-slate-700"}`}
          >
            Arbol eliminatorio
          </button>
        </div>
        <div className="mt-5">{tab === "groups" ? <GroupsView /> : <BracketView />}</div>
      </div>
    </main>
  );
}
