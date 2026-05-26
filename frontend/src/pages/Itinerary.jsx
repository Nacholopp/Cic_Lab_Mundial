import { Link, Navigate } from "react-router-dom";
import Timeline from "../components/Timeline.jsx";
import { usePlannerStore } from "../store/planner.store.js";

export default function Itinerary() {
  const { plan } = usePlannerStore();
  if (!plan) return <Navigate to="/" replace />;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Itinerario Completo</h1>
          <Link to="/dashboard" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            Volver
          </Link>
        </div>
        <Timeline items={plan.itinerary} />
      </div>
    </main>
  );
}
