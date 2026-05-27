import { Link, Navigate } from "react-router-dom";
import MapLibreFlightsMap from "../components/MapLibreFlightsMap.jsx";
import { usePlannerStore } from "../store/planner.store.js";

export default function MapView() {
  const { profile, plan } = usePlannerStore();
  if (!profile || !plan) return <Navigate to="/" replace />;
  const destinationCity =
    plan?.profile?.destinationCity || plan?.matchPlan?.selectedCity || profile?.destinationCity || profile?.originCity;
  const routeSegments = plan?.followTeamRoute?.segments || [];

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Mapa de Trayectos</h1>
          <Link to="/dashboard" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            Volver
          </Link>
        </div>
        <MapLibreFlightsMap originCity={profile.originCity} destinationCity={destinationCity} segments={routeSegments} />
      </div>
    </main>
  );
}
