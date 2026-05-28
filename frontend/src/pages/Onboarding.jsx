import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronDown, Flag, Home, MapPinned, Plane, Shield, Trophy, Users } from "lucide-react";
import AirportPicker from "../components/AirportPicker.jsx";
import HostVenueSelect from "../components/HostVenueSelect.jsx";
import NewsMagazine from "../components/NewsMagazine.jsx";
import NewspaperDropdown from "../components/NewspaperDropdown.jsx";
import TeamCountrySelect from "../components/TeamCountrySelect.jsx";
import LoadingOverlay from "../components/LoadingOverlay.jsx";
import { buildPlan } from "../services/api.client.js";
import { usePlannerStore } from "../store/planner.store.js";
import { newsCountryOptions } from "../data/newsSources.js";
import { fifa26Logo, heroImage } from "../data/worldCupVisuals.js";

const budgetRanges = [
  { label: "Sin limite", value: "" },
  { label: "Hasta 500 USD/persona", value: "500" },
  { label: "500 - 1.000 USD/persona", value: "1000" },
  { label: "1.000 - 1.500 USD/persona", value: "1500" },
  { label: "1.500 - 2.500 USD/persona", value: "2500" },
  { label: "Mas de 2.500 USD/persona", value: "5000" }
];
const cabinOptions = [
  { label: "Economy", value: "economy" },
  { label: "Premium economy", value: "premium_economy" },
  { label: "Business", value: "business" },
  { label: "First", value: "first" }
];
const flowOptions = [
  {
    value: "stay_origin",
    label: "Me quedo en mi ciudad",
    icon: Home,
    description: "Muestra todos los partidos de tu ciudad o la sede mas cercana."
  },
  {
    value: "travel_city",
    label: "Quiero viajar a una sede",
    icon: MapPinned,
    description: "Elige una ciudad concreta y consulta sus partidos, horarios y estadios."
  },
  {
    value: "follow_team",
    label: "Seguir a mi seleccion",
    icon: Shield,
    description: "Busca todos los partidos disponibles de esa seleccion."
  }
];

const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

export default function Onboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile, setProfile, setPlan, setError, setLoading, loading, error, setCountry } = usePlannerStore();
  const initialMode = searchParams.get("mode") || profile?.mode || "travel_city";

  const [form, setForm] = useState({
    mode: initialMode,
    favoriteTeam: profile?.favoriteTeam || "",
    originCity: profile?.originCity || "",
    destinationCity: profile?.requestedDestinationCity || profile?.destinationCity || "Dallas",
    budget: profile?.budget ? String(profile.budget / (profile.adults || 1)) : "",
    originAirport: profile?.originAirport || null,
    destinationAirport: profile?.destinationAirport || null,
    cabinClass: profile?.cabinClass || "economy",
    maxStops: profile?.maxStops ?? 1,
    departureDate: profile?.departureDate || "",
    endDate: profile?.endDate || "",
    adults: profile?.adults || 1,
    country: "ES"
  });
  const [planMenuOpen, setPlanMenuOpen] = useState(false);
  const selectedPlan = useMemo(
    () => flowOptions.find((option) => option.value === form.mode) || flowOptions[1],
    [form.mode]
  );
  const SelectedPlanIcon = selectedPlan.icon;

  const canSubmit = useMemo(
    () => {
      const baseReady = Boolean(form.originCity && form.adults);
      if (form.mode === "stay_origin") return baseReady;
      if (form.mode === "travel_city") return baseReady && Boolean(form.destinationCity && form.departureDate);
      if (form.mode === "follow_team") {
        if (!form.favoriteTeam || !form.departureDate) return false;
        if (form.endDate && form.endDate < form.departureDate) return false;
        return true;
      }
      return false;
    },
    [form]
  );

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const adults = Number(form.adults);
    const budgetPerPerson = form.budget ? Number(form.budget) : null;
    try {
      setLoading(true);
      setError(null);
      const payload = {
        mode: form.mode,
        favoriteTeam: form.favoriteTeam,
        originCity: form.originCity,
        destinationCity: form.mode === "travel_city" ? form.destinationCity : null,
        departureDate: form.mode === "stay_origin" ? null : form.departureDate,
        endDate: form.mode === "follow_team" ? (form.endDate || form.departureDate) : null,
        adults,
        originCoordinates: null,
        budgetPerPerson,
        budget: budgetPerPerson == null ? null : budgetPerPerson * adults,
        originAirport: form.mode === "stay_origin" ? null : form.originAirport,
        destinationAirport: form.mode === "travel_city" ? form.destinationAirport : null,
        cabinClass: form.cabinClass,
        maxStops: Number(form.maxStops),
        preferences: []
      };
      const [result] = await Promise.all([
        buildPlan(payload)
          .then((response) => ({ response }))
          .catch((requestError) => ({ requestError })),
        wait(2000)
      ]);
      if (result.requestError) throw result.requestError;
      const response = result.response;
      setCountry(form.country);
      setProfile(response.profile || payload);
      setPlan(response);
      navigate("/dashboard");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      {loading && <LoadingOverlay message="Generando plan" />}
      <header className="sticky top-0 z-50 border-b border-cyan-100/20 bg-gradient-to-r from-[#06111f]/95 via-[#08304b]/92 to-[#0f3d2e]/92 px-4 py-3 text-white shadow-[0_18px_45px_rgba(2,6,23,0.42)] backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3">
          <NewspaperDropdown country={form.country} variant="glass" />
          <a
            href="https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026"
            target="_blank"
            rel="noreferrer"
            className="ml-auto flex h-14 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-black shadow-xl shadow-black/35 ring-1 ring-cyan-100/25 sm:h-16 sm:w-12"
            title="FIFA World Cup 26"
          >
            <img src={fifa26Logo} alt="FIFA World Cup 26" className="h-full w-full object-contain p-1" />
          </a>
        </div>
      </header>

      <section className="relative overflow-visible px-4 py-8 text-white">
        <img src={heroImage} alt="Estadio mundialista" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-slate-950/20" />
        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(560px,660px)] lg:items-center">
          <div className="py-10 lg:py-20">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] backdrop-blur">
              <Trophy size={15} />
              WorldCup Fan Planner
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
              Planifica tu viaje al Mundial 2026 como si ya estuvieras en la grada.
            </h1>
            <p className="mt-4 max-w-2xl text-base font-medium text-white/85 sm:text-lg">
              Vuelos, ruta, clima, periodicos y selecciones clasificadas en una experiencia visual inspirada en el futbol internacional.
            </p>
            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur">
                <Flag className="mb-3" size={22} />
                <p className="text-2xl font-black">48</p>
                <p className="text-xs font-bold uppercase text-white/70">selecciones</p>
              </div>
              <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur">
                <Plane className="mb-3" size={22} />
                <p className="text-2xl font-black">16</p>
                <p className="text-xs font-bold uppercase text-white/70">sedes</p>
              </div>
              <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur">
                <Users className="mb-3" size={22} />
                <p className="text-2xl font-black">3</p>
                <p className="text-xs font-bold uppercase text-white/70">paises</p>
              </div>
            </div>
          </div>

          <form
            className="rounded-lg border border-cyan-100/35 bg-gradient-to-br from-white/20 via-cyan-200/10 to-slate-950/45 p-5 text-white shadow-[0_28px_90px_rgba(8,145,178,0.28)] ring-1 ring-cyan-100/25 backdrop-blur-2xl"
            onSubmit={submit}
          >
            <h2 className="text-2xl font-black">Crea tu plan</h2>
            <p className="mt-1 text-sm font-semibold text-white/70">Elige como quieres vivir el Mundial y cambia de opcion cuando quieras.</p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="relative md:col-span-2">
                <label className="text-sm font-bold">Tipo de plan</label>
                <button
                  type="button"
                  className="mt-1 flex min-h-16 w-full items-center gap-3 rounded-md border border-white/20 bg-white/85 p-3 text-left text-slate-950 shadow-sm outline-none transition hover:bg-white focus:border-cyan-200 focus:ring-2 focus:ring-cyan-200/30"
                  onClick={() => setPlanMenuOpen((current) => !current)}
                >
                  <SelectedPlanIcon className="shrink-0 text-brandBlue" size={22} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black">{selectedPlan.label}</span>
                    <span className="mt-1 block text-xs font-semibold text-slate-500">{selectedPlan.description}</span>
                  </span>
                  <ChevronDown className={`shrink-0 text-slate-500 transition ${planMenuOpen ? "rotate-180" : ""}`} size={19} />
                </button>
                {planMenuOpen && (
                  <div className="absolute left-0 right-0 z-30 mt-2 grid gap-2 rounded-lg border border-white/25 bg-slate-950/80 p-2 shadow-2xl shadow-slate-950/40 backdrop-blur-xl md:grid-cols-3">
                  {flowOptions.map((option) => {
                    const Icon = option.icon;
                    const selected = form.mode === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={`flex min-h-24 items-start gap-3 rounded-md border p-3 text-left transition ${
                          selected
                            ? "border-cyan-200 bg-white text-slate-950 ring-2 ring-cyan-200/20"
                            : "border-white/10 bg-white/10 text-white hover:border-cyan-200/50 hover:bg-white/15"
                        }`}
                        onClick={() => {
                          setForm((prev) => ({ ...prev, mode: option.value }));
                          setPlanMenuOpen(false);
                        }}
                      >
                        <Icon className={selected ? "text-brandBlue" : "text-cyan-100"} size={20} />
                        <span>
                          <span className="block text-sm font-black">{option.label}</span>
                          <span className={`mt-1 block text-xs font-medium ${selected ? "text-slate-500" : "text-white/65"}`}>
                            {option.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                  </div>
                )}
              </div>
              {form.mode === "follow_team" && (
                <TeamCountrySelect
                  value={form.favoriteTeam}
                  onChange={(favoriteTeam) => setForm((prev) => ({ ...prev, favoriteTeam }))}
                />
              )}
          <label className="text-sm font-bold">
            Ciudad origen
            <input
              className="mt-1 w-full rounded-md border border-white/20 bg-white/85 px-3 py-2 font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-200 focus:ring-2 focus:ring-cyan-200/30"
              name="originCity"
              value={form.originCity}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  originCity: event.target.value,
                  originAirport: null
                }))
              }
              required
            />
          </label>
          {form.mode !== "stay_origin" && (
            <AirportPicker
              city={form.originCity}
              label="Aeropuerto de origen"
              value={form.originAirport}
              onChange={(originAirport) => setForm((prev) => ({ ...prev, originAirport }))}
            />
          )}
          {form.mode === "travel_city" && (
            <HostVenueSelect
              value={form.destinationCity}
              onChange={(destinationCity) =>
                setForm((prev) => ({
                  ...prev,
                  destinationCity,
                  destinationAirport: null
                }))
              }
            />
          )}
          {form.mode === "travel_city" && (
            <AirportPicker
              city={form.destinationCity}
              label="Aeropuerto de destino"
              value={form.destinationAirport}
              onChange={(destinationAirport) => setForm((prev) => ({ ...prev, destinationAirport }))}
            />
          )}
          {form.mode === "stay_origin" && (
            <p className="rounded-md border border-white/15 bg-white/15 px-3 py-2 text-sm font-semibold text-white/75 md:col-span-2">
              Usaremos tu ciudad de origen para proponerte horarios de partidos y sitios donde verlos. No necesitas fecha de salida.
            </p>
          )}
          {form.mode !== "stay_origin" && (
            <label className="text-sm font-bold">
              Fecha inicio del plan
              <input
                type="date"
                className="mt-1 w-full rounded-md border border-white/20 bg-white/85 px-3 py-2 font-medium text-slate-950 outline-none transition focus:border-cyan-200 focus:ring-2 focus:ring-cyan-200/30"
                name="departureDate"
                value={form.departureDate}
                onChange={updateField}
                required
              />
            </label>
          )}
          {form.mode === "follow_team" && (
            <label className="text-sm font-bold">
              Fecha fin para seguir a tu seleccion
              <input
                type="date"
                className="mt-1 w-full rounded-md border border-white/20 bg-white/85 px-3 py-2 font-medium text-slate-950 outline-none transition focus:border-cyan-200 focus:ring-2 focus:ring-cyan-200/30"
                name="endDate"
                value={form.endDate}
                min={form.departureDate || undefined}
                onChange={updateField}
                required
              />
            </label>
          )}
          {form.mode === "follow_team" && form.endDate && form.departureDate && form.endDate < form.departureDate && (
            <p className="text-sm font-semibold text-amber-200 md:col-span-2">
              La fecha fin debe ser igual o posterior a la fecha inicio.
            </p>
          )}
          <label className="text-sm font-bold">
            Presupuesto por persona
            <select
              className="mt-1 w-full rounded-md border border-white/20 bg-white/85 px-3 py-2 font-medium text-slate-950 outline-none transition focus:border-cyan-200 focus:ring-2 focus:ring-cyan-200/30"
              name="budget"
              value={form.budget}
              onChange={updateField}
            >
              {budgetRanges.map((range) => (
                <option key={range.label} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-bold">
            Personas
            <input
              type="number"
              min="1"
              className="mt-1 w-full rounded-md border border-white/20 bg-white/85 px-3 py-2 font-medium text-slate-950 outline-none transition focus:border-cyan-200 focus:ring-2 focus:ring-cyan-200/30"
              name="adults"
              value={form.adults}
              onChange={updateField}
            />
          </label>
          {form.mode !== "stay_origin" && (
            <>
              <label className="text-sm font-bold">
                Clase de cabina
                <select
                  className="mt-1 w-full rounded-md border border-white/20 bg-white/85 px-3 py-2 font-medium text-slate-950 outline-none transition focus:border-cyan-200 focus:ring-2 focus:ring-cyan-200/30"
                  name="cabinClass"
                  value={form.cabinClass}
                  onChange={updateField}
                >
                  {cabinOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-bold">
                Escalas maximas
                <select
                  className="mt-1 w-full rounded-md border border-white/20 bg-white/85 px-3 py-2 font-medium text-slate-950 outline-none transition focus:border-cyan-200 focus:ring-2 focus:ring-cyan-200/30"
                  name="maxStops"
                  value={form.maxStops}
                  onChange={updateField}
                >
                  <option value="0">Directo</option>
                  <option value="1">Hasta 1 escala</option>
                  <option value="2">Hasta 2 escalas</option>
                </select>
              </label>
            </>
          )}
          <label className="text-sm font-bold md:col-span-2">
            Pais para periodico
            <select
              className="mt-1 w-full rounded-md border border-white/20 bg-white/85 px-3 py-2 font-medium text-slate-950 outline-none transition focus:border-cyan-200 focus:ring-2 focus:ring-cyan-200/30"
              name="country"
              value={form.country}
              onChange={updateField}
            >
              {newsCountryOptions.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label} - {item.region}
                </option>
              ))}
            </select>
          </label>

          {error && <p className="text-sm font-semibold text-red-200 md:col-span-2">{error}</p>}
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-cyan-200 px-4 text-sm font-black text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/60 md:col-span-2"
          >
            {profile && <ArrowLeft size={18} />}
            {loading ? "Generando plan..." : "Generar plan"}
            {!loading && <ArrowRight size={18} />}
          </button>
          </div>
        </form>
      </div>
      </section>

      <NewsMagazine country={form.country} />
    </main>
  );
}
