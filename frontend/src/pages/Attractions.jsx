import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ExternalLink, MapPin, Navigation, Star, Utensils } from "lucide-react";
import { usePlannerStore } from "../store/planner.store.js";
import { fetchDestinationGuide } from "../services/api.client.js";
import { fifa26Logo, stadiumImage } from "../data/worldCupVisuals.js";

export default function Attractions() {
  const { profile, plan } = usePlannerStore();
  const [guide, setGuide] = useState(plan?.destinationGuide || null);
  const [guides, setGuides] = useState(plan?.destinationGuides || []);
  const [error, setError] = useState(null);
  const isFollowTeam = profile?.mode === "follow_team";

  const destinationCity = profile?.destinationCity || plan?.profile?.destinationCity;
  const routeCities = [...new Set((plan?.matches || []).map((match) => match.city).filter(Boolean))];

  useEffect(() => {
    let active = true;
    if (isFollowTeam) {
      if (!routeCities.length) return undefined;
      Promise.all(routeCities.map((city) => fetchDestinationGuide(city, profile?.originCity || "")))
        .then((responses) => {
          if (active) setGuides(responses.map((item) => item.guide).filter(Boolean));
        })
        .catch((guideError) => {
          if (active) setError(guideError.message);
        });
    } else {
      if (!destinationCity) return undefined;
      fetchDestinationGuide(destinationCity, profile?.originCity || "")
        .then((response) => {
          if (active) setGuide(response.guide);
        })
        .catch((guideError) => {
          if (active) setError(guideError.message);
        });
    }

    return () => {
      active = false;
    };
  }, [destinationCity, profile?.originCity, isFollowTeam]);

  if (!profile || !plan) return <Navigate to="/" replace />;

  return (
    <main className="min-h-screen bg-[#f5f7fb] pb-8 text-slate-950">
      <section className="relative overflow-hidden px-4 py-6 text-white">
        <img src={stadiumImage} alt="Estadio del Mundial" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-slate-950/65" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
        <div className="relative mx-auto flex min-h-[420px] max-w-7xl flex-col gap-10 sm:min-h-[460px] sm:gap-14">
          <header className="flex items-center justify-between">
            <Link to="/dashboard" className="rounded-md border border-white/50 bg-white/10 px-3 py-2 text-sm font-black backdrop-blur">
              Volver
            </Link>
            <img src={fifa26Logo} alt="FIFA World Cup 26" className="h-16 w-12 rounded-md bg-black object-contain p-1" />
          </header>
          <div className="max-w-3xl pb-12">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] backdrop-blur">
              <MapPin size={15} />
              Zonas que ver
            </div>
            <h1 className="text-4xl font-black leading-tight sm:text-6xl">{guide?.city || destinationCity}</h1>
            <p className="mt-4 max-w-2xl text-base font-medium text-white/85 sm:text-lg">
              {isFollowTeam
                ? "Guia completa para todas las ciudades de tu ruta como fan: turismo, restaurantes y rutas de partido."
                : "Turismo, restaurantes y rutas de Google Maps pensadas alrededor del estadio y los horarios del Mundial."}
            </p>
            {guide?.maps && (
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={guide.maps.directionsFromOrigin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-3 text-sm font-black text-slate-950"
                >
                  <Navigation size={18} />
                  Ruta desde origen
                </a>
                <a
                  href={guide.maps.restaurants}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-white/50 bg-white/10 px-4 py-3 text-sm font-black text-white backdrop-blur"
                >
                  <Utensils size={18} />
                  Restaurantes en Maps
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{error}</p>}

        {isFollowTeam ? (
          <section className="space-y-6">
            {guides.map((cityGuide) => (
              <article key={cityGuide.city} className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-black">{cityGuide.city}: puntos de interes</h2>
                      <p className="mt-1 text-sm font-medium text-slate-500">
                        Fuente: {cityGuide?.dataSources?.attractions || "cargando"}
                      </p>
                    </div>
                    {cityGuide?.maps?.city && (
                      <a
                        href={cityGuide.maps.city}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-black text-white"
                      >
                        <ExternalLink size={16} />
                        Maps
                      </a>
                    )}
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {(cityGuide?.attractions || []).map((item) => (
                      <article key={`${cityGuide.city}-${item.name}-${item.address}`} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                        <p className="text-sm font-black">{item.name}</p>
                        <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{item.description}</p>
                        <p className="mt-2 text-xs font-bold uppercase text-brandRed">{item.address}</p>
                        <a
                          href={item.mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-2 text-sm font-black text-brandBlue"
                        >
                          Abrir en Google Maps
                          <ExternalLink size={15} />
                        </a>
                      </article>
                    ))}
                  </div>
                </div>

                <aside className="space-y-4">
                  <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <img src={cityGuide.cityImageUrl || stadiumImage} alt={`Vista de ${cityGuide.city}`} className="h-36 w-full object-cover" />
                    <div className="p-4">
                      <h2 className="text-lg font-black">Restaurantes y direcciones</h2>
                      <p className="mt-1 text-sm font-medium text-slate-500">
                        Fuente: {cityGuide?.dataSources?.restaurants || "cargando"}
                      </p>
                      <div className="mt-3 space-y-3">
                        {(cityGuide?.restaurants || []).map((restaurant) => (
                          <article key={`${cityGuide.city}-${restaurant.name}-${restaurant.address}`} className="rounded-md border border-slate-200 p-3">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-black">{restaurant.name}</p>
                              {restaurant.rating && (
                                <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-1 text-xs font-black text-amber-900">
                                  <Star size={13} />
                                  {restaurant.rating}
                                </span>
                              )}
                            </div>
                            <p className="mt-2 text-sm font-medium text-slate-600">{restaurant.address}</p>
                            <a
                              href={restaurant.mapsUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 inline-flex items-center gap-2 text-sm font-black text-brandBlue"
                            >
                              Direcciones
                              <Navigation size={15} />
                            </a>
                          </article>
                        ))}
                      </div>
                    </div>
                  </div>
                </aside>
              </article>
            ))}
          </section>
        ) : (
        <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black">Puntos de interes turistico</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Fuente: {guide?.dataSources?.attractions || "cargando"}
                </p>
              </div>
              {guide?.maps?.city && (
                <a
                  href={guide.maps.city}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-black text-white"
                >
                  <ExternalLink size={16} />
                  Maps
                </a>
              )}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {(guide?.attractions || []).map((item) => (
                <article key={`${item.name}-${item.address}`} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-black">{item.name}</p>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{item.description}</p>
                  <p className="mt-2 text-xs font-bold uppercase text-brandRed">{item.address}</p>
                  <a
                    href={item.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-black text-brandBlue"
                  >
                    Abrir en Google Maps
                    <ExternalLink size={15} />
                  </a>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <img src={guide?.cityImageUrl || stadiumImage} alt={`Vista de ${guide?.city || destinationCity || "la ciudad"}`} className="h-36 w-full object-cover" />
              <div className="p-4">
                <h2 className="text-lg font-black">Restaurantes y direcciones</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Fuente: {guide?.dataSources?.restaurants || "cargando"}
                </p>
                <div className="mt-3 space-y-3">
                  {(guide?.restaurants || []).map((restaurant) => (
                    <article key={`${restaurant.name}-${restaurant.address}`} className="rounded-md border border-slate-200 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-black">{restaurant.name}</p>
                        {restaurant.rating && (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-1 text-xs font-black text-amber-900">
                            <Star size={13} />
                            {restaurant.rating}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-600">{restaurant.address}</p>
                      <a
                        href={restaurant.mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-2 text-sm font-black text-brandBlue"
                      >
                        Direcciones
                        <Navigation size={15} />
                      </a>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </section>
        )}
      </div>
    </main>
  );
}
