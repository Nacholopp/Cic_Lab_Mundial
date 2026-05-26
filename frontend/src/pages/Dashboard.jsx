import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { CalendarDays, CloudSun, Map, Trophy } from "lucide-react";
import NewspaperDropdown from "../components/NewspaperDropdown.jsx";
import ProfileDropdown from "../components/ProfileDropdown.jsx";
import WorldMap from "../components/WorldMap.jsx";
import FlightCard from "../components/FlightCard.jsx";
import Timeline from "../components/Timeline.jsx";
import TeamShowcase from "../components/TeamShowcase.jsx";
import { usePlannerStore } from "../store/planner.store.js";
import { fetchCurrentTime } from "../services/api.client.js";
import { fanImage, heroImage, hostCities, stadiumImage } from "../data/worldCupVisuals.js";

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
    <main className="min-h-screen bg-[#f5f7fb] pb-8 text-slate-950">
      <section className="relative min-h-[470px] overflow-hidden px-4 py-6 text-white">
        <img src={heroImage} alt="Estadio de futbol lleno" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-slate-950/55" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/65 to-transparent" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-16">
          <header className="flex items-center justify-between">
            <NewspaperDropdown country={country} />
            <ProfileDropdown profile={profile} />
          </header>

          <div className="max-w-3xl pb-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] backdrop-blur">
              <Trophy size={15} />
              Fan Planner 2026
            </div>
            <h1 className="text-4xl font-black leading-tight sm:text-6xl">
              Tu viaje al Mundial con energia de final.
            </h1>
            <p className="mt-4 max-w-2xl text-base font-medium text-white/85 sm:text-lg">
              {profile.favoriteTeam} desde {profile.originCity} hacia {profile.destinationCity}, con vuelos,
              ruta, clima y contexto de selecciones en una sola vista.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-3 text-sm font-black text-slate-950"
                to="/itinerary"
              >
                <CalendarDays size={18} />
                Itinerario
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-md border border-white/50 bg-white/10 px-4 py-3 text-sm font-black text-white backdrop-blur"
                to="/map"
              >
                <Map size={18} />
                Mapa
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto -mt-10 max-w-7xl px-4">
        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-white/80 bg-white p-4 shadow-lg">
            <p className="text-xs font-bold uppercase text-slate-500">Seleccion</p>
            <p className="mt-1 text-2xl font-black">{profile.favoriteTeam}</p>
          </div>
          <div className="rounded-lg border border-white/80 bg-white p-4 shadow-lg">
            <p className="text-xs font-bold uppercase text-slate-500">Destino</p>
            <p className="mt-1 text-2xl font-black">{profile.destinationCity}</p>
          </div>
          <div className="rounded-lg border border-white/80 bg-white p-4 shadow-lg">
            <p className="text-xs font-bold uppercase text-slate-500">Presupuesto</p>
            <p className="mt-1 text-2xl font-black">
              {plan.costs.estimatedTotalCost} {plan.costs.currency}
            </p>
          </div>
          <div className="rounded-lg border border-white/80 bg-white p-4 shadow-lg">
            <p className="text-xs font-bold uppercase text-slate-500">Estado</p>
            <p className="mt-1 text-2xl font-black">{plan.costs.budgetStatus}</p>
          </div>
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1.9fr_1fr]">
          <WorldMap originCity={profile.originCity} destinationCity={profile.destinationCity} />
          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <img src={stadiumImage} alt="Estadio del Mundial" className="h-36 w-full object-cover" />
              <div className="p-4">
                <h2 className="text-lg font-black">Resumen de viaje</h2>
                <p className="mt-1 text-sm leading-6 text-slate-700">{plan.recommendationText}</p>
                {localTime && (
                  <p className="mt-3 rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                    Hora local destino: {localTime.datetime} ({localTime.timezone})
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-black">Ciudades anfitrionas</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {hostCities.map((city) => (
                  <span key={city} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    {city}
                  </span>
                ))}
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
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <img src={fanImage} alt="Aficion en un partido de futbol" className="h-40 w-full object-cover" />
            <div className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <CloudSun size={19} className="text-brandRed" />
                <h3 className="text-lg font-black">Clima</h3>
              </div>
              {plan.weather ? (
                <div className="space-y-1 text-sm text-slate-700">
                  <p className="text-2xl font-black text-slate-950">
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
          </div>
        </section>

        <section className="mt-8">
          <TeamShowcase />
        </section>
      </div>
    </main>
  );
}
