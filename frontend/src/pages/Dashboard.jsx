import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import NewspaperDropdown from "../components/NewspaperDropdown.jsx";
import ProfileDropdown from "../components/ProfileDropdown.jsx";
import WorldMap from "../components/WorldMap.jsx";
import FlightCard from "../components/FlightCard.jsx";
import Timeline from "../components/Timeline.jsx";
import { usePlannerStore } from "../store/planner.store.js";
import { fetchCurrentTime } from "../services/api.client.js";

export default function Dashboard() {
  const { plan, profile, country } = usePlannerStore();
  const [localTime, setLocalTime] = useState(null);

  useEffect(() => {
    let active = true;
    fetchCurrentTime("America/Mexico_City")
      .then((response) => {
        if (active) setLocalTime(response.time);
      })
      .catch(() => {
        if (active) setLocalTime(null);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!plan || !profile) return <Navigate to="/" replace />;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-4 flex items-center justify-between">
          <NewspaperDropdown country={country} />
          <ProfileDropdown profile={profile} />
        </header>

        <section className="grid gap-4 xl:grid-cols-[1.9fr_1fr]">
          <WorldMap originCity={profile.originCity} destinationCity={profile.destinationCity} />
          <div className="space-y-4">
            <div className="rounded-md border border-slate-200 bg-white p-4">
              <h2 className="text-base font-semibold">Resumen</h2>
              <p className="mt-1 text-sm text-slate-700">{plan.recommendationText}</p>
              <p className="mt-2 text-sm text-slate-600">
                Coste estimado: {plan.costs.estimatedTotalCost} {plan.costs.currency}
              </p>
              <p className="text-sm text-slate-600">Estado presupuesto: {plan.costs.budgetStatus}</p>
              {localTime && (
                <p className="mt-2 text-xs text-slate-500">
                  Hora local destino: {localTime.datetime} ({localTime.timezone})
                </p>
              )}
            </div>
            <div className="rounded-md border border-slate-200 bg-white p-4">
              <h2 className="text-base font-semibold">Navegacion</h2>
              <div className="mt-2 flex gap-2">
                <Link className="rounded-md border border-slate-300 px-3 py-2 text-sm" to="/map">
                  Ver mapa
                </Link>
                <Link className="rounded-md border border-slate-300 px-3 py-2 text-sm" to="/itinerary">
                  Ver itinerario
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-3">
          <FlightCard label="Mas barato" flight={plan.flights.cheapest} />
          <FlightCard label="Mas rapido" flight={plan.flights.fastest} />
          <FlightCard label="Recomendado" flight={plan.flights.recommended} />
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <Timeline items={plan.itinerary} />
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <h3 className="mb-2 text-base font-semibold">Clima</h3>
            {plan.weather ? (
              <div className="space-y-1 text-sm text-slate-700">
                <p>
                  {plan.weather.city}: {plan.weather.temperatureC} C
                </p>
                <p>{plan.weather.description}</p>
                <p>Humedad: {plan.weather.humidity}%</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                {plan.weatherError || "Sin datos de clima. Configura OPENWEATHER_API_KEY."}
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
