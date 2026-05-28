import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { CalendarDays, CloudSun, Landmark, Map, MapPin, Trophy, Tv, X } from "lucide-react";
import NewspaperDropdown from "../components/NewspaperDropdown.jsx";
import ProfileDropdown from "../components/ProfileDropdown.jsx";
import MapLibreFlightsMap from "../components/MapLibreFlightsMap.jsx";
import FlightCard from "../components/FlightCard.jsx";
import MatchList from "../components/MatchList.jsx";
import OptionMenu from "../components/OptionMenu.jsx";
import TeamBadge from "../components/TeamBadge.jsx";
import Timeline from "../components/Timeline.jsx";
import TeamShowcase from "../components/TeamShowcase.jsx";
import { usePlannerStore } from "../store/planner.store.js";
import { apiAssetUrl, fetchCurrentTime } from "../services/api.client.js";
import { fanImage, fifa26Logo, heroImage, stadiumImage } from "../data/worldCupVisuals.js";
import { formatKickoffForTimezone, formatUtcLabel } from "../utils/matchTime.js";
import { teamFlagUrl } from "../utils/teamVisuals.js";

const matchTitles = {
  stay_origin: "Horarios para ver en tu ciudad",
  travel_city: "Partidos en la ciudad elegida",
  follow_team: "Partidos de tu seleccion"
};

const formatCurrency = (amount, currency = "USD") =>
  new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 0,
    style: "currency",
    currency,
    currencyDisplay: "code"
  }).format(amount);

export default function Dashboard() {
  const { plan, profile, country } = usePlannerStore();
  const [localTime, setLocalTime] = useState(null);
  const [showAlternatives, setShowAlternatives] = useState(Boolean(plan?.matchPlan?.notice));
  const isLocalPlan = profile.mode === "stay_origin";
  const isFollowTeamPlan = profile.mode === "follow_team";
  const isTravelCityPlan = profile.mode === "travel_city";
  const effectiveDestinationCity =
    plan?.profile?.destinationCity || plan?.matchPlan?.selectedCity || profile?.destinationCity || profile?.originCity;
  const followTeamLegs = plan?.followTeamRoute?.legs || [];
  const travelerTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

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

  const selectedBudget = profile?.budget ?? plan?.profile?.budget ?? null;
  const selectedBudgetLabel =
    selectedBudget == null ? "Sin limite" : formatCurrency(Number(selectedBudget), plan.costs.currency);
  const isOverBudget = plan.costs.budgetStatus === "over_budget";
  const budgetStatusLabel = isOverBudget ? "Viaje por encima del presupuesto" : "Viaje encontrado exitosamente";
  const overBudgetAmount = Math.max(
    0,
    Number(plan.costs.estimatedTotalCost || 0) - Number(selectedBudget || 0)
  );
  const overBudgetLabel = formatCurrency(overBudgetAmount, plan.costs.currency);

  return (
    <main className="min-h-screen bg-[#f5f7fb] pb-8 text-slate-950">
      <section className="relative min-h-[470px] overflow-hidden px-4 py-6 text-white">
        <img src={heroImage} alt="Estadio de futbol lleno" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-slate-950/55" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/65 to-transparent" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-16">
          <header className="relative z-20 flex items-center justify-between gap-3 rounded-lg border border-cyan-100/20 bg-gradient-to-r from-[#06111f]/92 via-[#08304b]/88 to-[#0f3d2e]/88 p-3 shadow-[0_18px_45px_rgba(2,6,23,0.38)] backdrop-blur-2xl">
            <NewspaperDropdown country={country} variant="glass" />
            <div className="flex shrink-0 items-center gap-3">
              <ProfileDropdown profile={profile} />
              <a
                href="https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026"
                target="_blank"
                rel="noreferrer"
                className="flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-black shadow-xl shadow-black/35 ring-1 ring-cyan-100/25 sm:h-20 sm:w-16"
                title="FIFA World Cup 26"
              >
                <img src={fifa26Logo} alt="FIFA World Cup 26" className="h-full w-full object-contain p-1" />
              </a>
            </div>
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
              {isLocalPlan
                ? `Partidos, horarios y sitios para ver el Mundial en ${profile.originCity}.`
                : isTravelCityPlan
                  ? `Plan de viaje a ${effectiveDestinationCity}: vuelos, horarios de partidos, clima y zonas clave alrededor de la sede.`
                  : `${profile.favoriteTeam || "Mundial 2026"} desde ${profile.originCity} hacia ${effectiveDestinationCity}, con vuelos, ruta y seguimiento completo de partidos.`}
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
              <Link
                className="inline-flex items-center gap-2 rounded-md border border-white/50 bg-white/10 px-4 py-3 text-sm font-black text-white backdrop-blur"
                to="/attractions"
              >
                <Landmark size={18} />
                Zonas que ver
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-md border border-white/50 bg-white/10 px-4 py-3 text-sm font-black text-white backdrop-blur"
                to="/tournament"
              >
                <Trophy size={18} />
                Torneo
              </Link>
            </div>
            <div className="mt-4">
              <OptionMenu currentMode={profile.mode} />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-3 max-w-7xl px-4">
        <section className={`grid gap-4 ${isTravelCityPlan ? "md:grid-cols-3" : "md:grid-cols-4"}`}>
          {!isTravelCityPlan && (
            <div className="rounded-lg border border-white/80 bg-white p-4 shadow-lg">
              <p className="text-xs font-bold uppercase text-slate-500">Seleccion</p>
              <p className="mt-1 text-2xl font-black">{profile.favoriteTeam || "Mundial 2026"}</p>
            </div>
          )}
          <div className="rounded-lg border border-white/80 bg-white p-4 shadow-lg">
            <p className="text-xs font-bold uppercase text-slate-500">{isLocalPlan ? "Ciudad" : "Destino"}</p>
            <p className="mt-1 text-2xl font-black">{isLocalPlan ? profile.originCity : effectiveDestinationCity}</p>
          </div>
          <div className="rounded-lg border border-white/80 bg-white p-4 shadow-lg">
            <p className="text-xs font-bold uppercase text-slate-500">Presupuesto</p>
            <p className="mt-1 text-2xl font-black">
              {selectedBudgetLabel}
            </p>
          </div>
          <div className="rounded-lg border border-white/80 bg-white p-4 shadow-lg">
            <p className="text-xs font-bold uppercase text-slate-500">Estado</p>
            <p className={`mt-1 text-2xl font-black ${isOverBudget ? "text-red-600" : "text-emerald-600"}`}>
              {budgetStatusLabel}
            </p>
            {isOverBudget && overBudgetAmount > 0 && (
              <div className="budget-overrun-badge mt-4 flex h-28 w-28 flex-col items-center justify-center rounded-full bg-lime-300 text-center text-slate-950 shadow-[0_0_34px_rgba(190,242,100,0.95)] ring-4 ring-lime-100/80">
                <span className="text-[10px] font-black uppercase leading-none text-slate-700">Se pasa</span>
                <span className="mt-1 text-xl font-black leading-none">{overBudgetLabel}</span>
              </div>
            )}
          </div>
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1.9fr_1fr]">
          <MapLibreFlightsMap
            originCity={profile.originCity}
            destinationCity={effectiveDestinationCity}
            segments={plan?.followTeamRoute?.segments?.length ? plan.followTeamRoute.segments : plan?.routeSegments || []}
          />
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
            {!isLocalPlan && plan.destinationGuide && (
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Landmark size={19} className="text-brandRed" />
                  <h2 className="text-lg font-black">Zonas que ver</h2>
                </div>
                <p className="mt-2 text-sm font-medium text-slate-600">
                  {plan.destinationGuide.city}: turismo, restaurantes y rutas alrededor de {plan.destinationGuide.stadium || "la sede"}.
                </p>
                <Link
                  to="/attractions"
                  className="mt-3 inline-flex items-center gap-2 rounded-md bg-brandBlue px-3 py-2 text-sm font-black text-white"
                >
                  Abrir guia
                </Link>
              </div>
            )}
          </div>
        </section>

        {plan.matchPlan?.notice && (
          <section className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-black">{plan.matchPlan.notice.title}</h2>
                <p className="mt-1 text-sm font-medium">{plan.matchPlan.notice.message}</p>
                {plan.matchPlan.notice.nearestCity?.distanceKm != null && (
                  <p className="mt-1 text-sm font-bold">
                    Distancia aproximada: {plan.matchPlan.notice.nearestCity.distanceKm} km.
                  </p>
                )}
              </div>
              <button
                type="button"
                className="rounded-md bg-amber-900 px-3 py-2 text-sm font-black text-white"
                onClick={() => setShowAlternatives(true)}
              >
                Ver opciones similares
              </button>
            </div>
          </section>
        )}

        <section className="mt-4">
          <MatchList
            matches={plan.matches}
            title={plan.matchPlan?.hasExactMatches ? matchTitles[profile.mode] || "Partidos seleccionados" : "Opciones similares"}
            emptyText="No hay partidos que encajen con esta busqueda."
          />
          {plan.dataSources?.matches && (
            <p className="mt-2 text-xs font-semibold text-slate-500">Fuente de calendario: {plan.dataSources.matches}</p>
          )}
        </section>

        {isLocalPlan && (
          <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Tv size={19} className="text-brandRed" />
              <h2 className="text-lg font-black">Sitios para verlo en tu ciudad</h2>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {(plan.watchSpots || []).map((spot) => (
                <article key={spot.name} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-black text-slate-950">{spot.name}</p>
                  <p className="mt-1 text-xs font-bold uppercase text-brandRed">{spot.type}</p>
                  <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-slate-600">
                    <MapPin size={15} />
                    {spot.area}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-600">{spot.note}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {!isLocalPlan && !isFollowTeamPlan && (
          <section className="mt-4 grid gap-4 md:grid-cols-3">
            <FlightCard label="Mas barato" flight={plan.flights.cheapest} />
            <FlightCard label="Mas rapido" flight={plan.flights.fastest} />
            <FlightCard label="Recomendado" flight={plan.flights.recommended} />
          </section>
        )}

        {profile.mode === "follow_team" && (plan?.followTeamRoute?.legs || []).length > 0 && (
          <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-black">Ruta para seguir a tu seleccion</h2>
            <p className="mt-1 text-sm font-medium text-slate-600">
              Tramos sugeridos para llegar a todos los partidos dentro de tus fechas.
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {plan.followTeamRoute.legs.map((leg, index) => (
                <article key={`${leg.fromCity}-${leg.toCity}-${index + 1}`} className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs font-bold uppercase text-slate-500">Tramo {index + 1}</p>
                  <p className="mt-1 text-sm font-black text-slate-950">
                    {leg.fromCity} a {leg.toCity}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-600">Salida sugerida: {leg.departureDate}</p>
                  {leg.recommended ? (
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {leg.recommended.price} {leg.recommended.currency}, {leg.recommended.duration}, {leg.recommended.stops} escalas
                    </p>
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-amber-700">No se encontro vuelo automatico para este tramo.</p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {isFollowTeamPlan && plan.matches?.length > 0 && (
          <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-black">Calendario para seguir a tu seleccion</h2>
            <p className="mt-1 text-sm font-medium text-slate-600">
              Donde, cuando y como ver cada partido dentro del rango elegido.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {plan.matches.map((match, index) => {
                const leg = followTeamLegs[index] || null;
                return (
                  <article key={match.id} className="overflow-hidden rounded-md border border-slate-200">
                    {match.imageUrl ? (
                      <div className="relative h-40 w-full overflow-hidden bg-slate-900">
                        <img
                          src={apiAssetUrl(match.imageUrl)}
                          alt={`${match.homeTeam} vs ${match.awayTeam}`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-3">
                          <div className="flex min-w-0 items-center justify-between gap-3">
                            <span className="flex min-w-0 items-center gap-2">
                              <TeamBadge team={match.homeTeam} width={80} className="h-7 w-10 shrink-0" />
                              <span className="truncate text-sm font-black text-white">{match.homeTeam}</span>
                            </span>
                            <span className="shrink-0 text-[11px] font-black uppercase text-white/75">vs</span>
                            <span className="flex min-w-0 items-center justify-end gap-2 text-right">
                              <span className="truncate text-sm font-black text-white">{match.awayTeam}</span>
                              <TeamBadge team={match.awayTeam} width={80} className="h-7 w-10 shrink-0" />
                            </span>
                          </div>
                        </div>
                        {match.imageSource && (
                          <span className="absolute right-2 top-2 rounded bg-black/70 px-2 py-1 text-[10px] font-bold uppercase text-white">
                            {match.imageSource}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex h-40 w-full items-center justify-center gap-4 bg-slate-950 px-4">
                        <TeamBadge team={match.homeTeam} width={80} className="h-10 w-14" />
                        <span className="text-sm font-black uppercase text-white/70">vs</span>
                        <TeamBadge team={match.awayTeam} width={80} className="h-10 w-14" />
                      </div>
                    )}
                    <div className="space-y-2 p-3">
                      <p className="text-sm font-black text-slate-950">
                        <span className="inline-flex items-center gap-1.5">
                          <img
                            src={teamFlagUrl(match.homeTeam, 40) || ""}
                            alt={`Bandera de ${match.homeTeam}`}
                            className="h-4 w-6 rounded-sm object-cover ring-1 ring-slate-200"
                            loading="lazy"
                          />
                          {match.homeTeam}
                        </span>{" "}
                        vs{" "}
                        <span className="inline-flex items-center gap-1.5">
                          <img
                            src={teamFlagUrl(match.awayTeam, 40) || ""}
                            alt={`Bandera de ${match.awayTeam}`}
                            className="h-4 w-6 rounded-sm object-cover ring-1 ring-slate-200"
                            loading="lazy"
                          />
                          {match.awayTeam}
                        </span>
                      </p>
                      <p className="text-sm font-medium text-slate-700">
                        Hora sede: {match.localKickoff || `${match.date} ${formatUtcLabel(match.timeUtc)}`}
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        Tu hora ({travelerTimezone}):{" "}
                        {formatKickoffForTimezone({
                          date: match.date,
                          timeUtc: match.timeUtc,
                          timezone: travelerTimezone
                        }) || formatUtcLabel(match.timeUtc)}
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {match.city} - {match.venue || "Estadio por confirmar"}
                      </p>
                      {leg?.recommended ? (
                        <p className="text-sm font-medium text-slate-600">
                          Como llegar: vuelo sugerido {leg.fromCity} a {leg.toCity}, {leg.recommended.price} {leg.recommended.currency}, {leg.recommended.stops} escalas.
                        </p>
                      ) : (
                        <p className="text-sm font-medium text-slate-600">
                          Como verlo: llega con antelacion al estadio y confirma transporte local 24h antes.
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <Timeline items={plan.itinerary} />
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <img
              src={plan.cityImageUrl || fanImage}
              alt={`Imagen real de ${effectiveDestinationCity}`}
              className="h-40 w-full object-cover"
              loading="lazy"
            />
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
                  {plan.weatherError || "Sin datos de clima disponibles en este momento."}
                </p>
              )}
            </div>
          </div>
        </section>

        {!isTravelCityPlan && (
          <section className="mt-8">
            <TeamShowcase />
          </section>
        )}

      </div>

      {showAlternatives && plan.matchPlan?.notice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
          <div className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-4 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">{plan.matchPlan.notice.title}</h2>
                <p className="mt-1 text-sm font-medium text-slate-600">{plan.matchPlan.notice.message}</p>
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600"
                onClick={() => setShowAlternatives(false)}
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-4">
              <MatchList matches={plan.matchPlan.alternatives} title="Opciones similares" />
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Link to="/" className="rounded-md border border-slate-300 px-3 py-2 text-sm font-black text-slate-700">
                Cambiar busqueda
              </Link>
              <button
                type="button"
                className="rounded-md bg-brandBlue px-3 py-2 text-sm font-black text-white"
                onClick={() => setShowAlternatives(false)}
              >
                Seguir con estas opciones
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
