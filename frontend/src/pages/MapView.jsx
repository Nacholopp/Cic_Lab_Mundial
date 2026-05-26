import { Link, Navigate } from "react-router-dom";
import WorldMap from "../components/WorldMap.jsx";
import { usePlannerStore } from "../store/planner.store.js";

export default function MapView() {
  const { profile } = usePlannerStore();
  if (!profile) return <Navigate to="/" replace />;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Mapa de Trayectos</h1>
          <Link to="/dashboard" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            Volver
          </Link>
        </div>
        <WorldMap originCity={profile.originCity} destinationCity={profile.destinationCity} />
      </div>
    </main>
  );
}
