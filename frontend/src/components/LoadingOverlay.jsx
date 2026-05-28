import { Trophy } from "lucide-react";
import { fifa26Logo } from "../data/worldCupVisuals.js";

export default function LoadingOverlay({ message = "Cargando" }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#4f82c4] px-6 text-white">
      <div className="absolute inset-0 loading-field-pattern opacity-45" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#5f9ce0]/85 via-[#3d74b8]/90 to-[#11345f]/95" />
      <div className="relative flex min-h-[420px] w-full max-w-xl flex-col items-center justify-center text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 text-sm font-black uppercase tracking-[0.22em] shadow-lg shadow-slate-950/20 backdrop-blur">
          <Trophy size={17} />
          Mundial 2026
        </div>
        <div className="relative flex h-56 w-56 items-center justify-center sm:h-72 sm:w-72">
          <div className="absolute inset-0 rounded-full border border-white/35 loading-logo-orbit" />
          <div className="absolute inset-8 rounded-full border border-cyan-100/30 loading-logo-orbit-reverse" />
          <div className="loading-logo-card flex h-44 w-36 items-center justify-center rounded-2xl bg-black p-4 shadow-2xl shadow-slate-950/35 ring-1 ring-white/20 sm:h-56 sm:w-44">
            <img src={fifa26Logo} alt="FIFA World Cup 26" className="h-full w-full object-contain" />
          </div>
        </div>
        <p className="mt-8 text-3xl font-black uppercase tracking-[0.14em] sm:text-4xl">{message}</p>
        <div className="mt-5 flex items-center gap-2" aria-hidden="true">
          <span className="loading-dot" />
          <span className="loading-dot loading-dot-delay-1" />
          <span className="loading-dot loading-dot-delay-2" />
        </div>
      </div>
    </div>
  );
}
