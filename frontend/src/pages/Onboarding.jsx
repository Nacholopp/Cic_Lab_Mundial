import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Flag, Home, MapPinned, Plane, Shield, Trophy, Users } from "lucide-react";
import HostVenueSelect from "../components/HostVenueSelect.jsx";
import TeamCountrySelect from "../components/TeamCountrySelect.jsx";
import { buildPlan } from "../services/api.client.js";
import { usePlannerStore } from "../store/planner.store.js";
import { featuredTeams, heroImage } from "../data/worldCupVisuals.js";

const prefOptions = ["barato", "comodo", "rapido", "futbol", "turismo"];
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
    departureDate: profile?.departureDate || "",
    adults: profile?.adults || 1,
    country: "ES",
    preferences: profile?.preferences || ["barato", "futbol"]
  });

  const canSubmit = useMemo(
    () => {
      const baseReady = Boolean(form.originCity && form.adults);
      if (form.mode === "stay_origin") return baseReady;
      if (form.mode === "travel_city") return baseReady && Boolean(form.destinationCity && form.departureDate);
      if (form.mode === "follow_team") return baseReady && Boolean(form.favoriteTeam && form.departureDate);
      return false;
    },
    [form]
  );

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const togglePreference = (pref) => {
    setForm((prev) => ({
      ...prev,
      preferences: prev.preferences.includes(pref)
        ? prev.preferences.filter((x) => x !== pref)
        : [...prev.preferences, pref]
    }));
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
        adults,
        originCoordinates: null,
        budgetPerPerson,
        budget: budgetPerPerson == null ? null : budgetPerPerson * adults,
        preferences: form.preferences
      };
      const response = await buildPlan(payload);
      setCountry(form.country);
      setProfile(payload);
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
      <section className="relative overflow-hidden px-4 py-8 text-white">
        <img src={heroImage} alt="Estadio mundialista" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-slate-950/20" />
        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_440px] lg:items-center">
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

          <form className="rounded-lg border border-white/30 bg-white p-5 text-slate-950 shadow-2xl" onSubmit={submit}>
            <h2 className="text-xl font-black">Crea tu plan</h2>
            <p className="mt-1 text-sm text-slate-600">Elige como quieres vivir el Mundial y cambia de opcion cuando quieras.</p>
            <div className="mt-5 grid gap-4">
              <fieldset>
                <legend className="text-sm font-bold">Tipo de plan</legend>
                <div className="mt-2 grid gap-2">
                  {flowOptions.map((option) => {
                    const Icon = option.icon;
                    const selected = form.mode === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={`flex min-h-16 items-start gap-3 rounded-md border p-3 text-left transition ${
                          selected
                            ? "border-brandBlue bg-blue-50 text-slate-950 ring-2 ring-brandBlue/15"
                            : "border-slate-200 bg-white text-slate-700 hover:border-brandBlue/60"
                        }`}
                        onClick={() => setForm((prev) => ({ ...prev, mode: option.value }))}
                      >
                        <Icon className={selected ? "text-brandBlue" : "text-slate-500"} size={20} />
                        <span>
                          <span className="block text-sm font-black">{option.label}</span>
                          <span className="mt-1 block text-xs font-medium text-slate-500">{option.description}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              {form.mode === "follow_team" && (
                <TeamCountrySelect
                  value={form.favoriteTeam}
                  onChange={(favoriteTeam) => setForm((prev) => ({ ...prev, favoriteTeam }))}
                />
              )}
          <label className="text-sm font-bold">
            Ciudad origen
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-medium outline-none transition focus:border-brandBlue focus:ring-2 focus:ring-brandBlue/20"
              name="originCity"
              value={form.originCity}
              onChange={updateField}
              required
            />
          </label>
          {form.mode === "travel_city" && (
            <HostVenueSelect
              value={form.destinationCity}
              onChange={(destinationCity) => setForm((prev) => ({ ...prev, destinationCity }))}
            />
          )}
          {form.mode === "stay_origin" && (
            <p className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">
              Usaremos tu ciudad de origen para proponerte horarios de partidos y sitios donde verlos. No necesitas fecha de salida.
            </p>
          )}
          {form.mode !== "stay_origin" && (
            <label className="text-sm font-bold">
              Fecha de salida
              <input
                type="date"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-medium outline-none transition focus:border-brandBlue focus:ring-2 focus:ring-brandBlue/20"
                name="departureDate"
                value={form.departureDate}
                onChange={updateField}
                required
              />
            </label>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold">
            Presupuesto por persona (USD)
            <input
              type="number"
              min="0"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-medium outline-none transition focus:border-brandBlue focus:ring-2 focus:ring-brandBlue/20"
              name="budget"
              value={form.budget}
              onChange={updateField}
            />
          </label>
          <label className="text-sm font-bold">
            Personas
            <input
              type="number"
              min="1"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-medium outline-none transition focus:border-brandBlue focus:ring-2 focus:ring-brandBlue/20"
              name="adults"
              value={form.adults}
              onChange={updateField}
            />
          </label>
          </div>
          <label className="text-sm font-bold">
            Pais para periodico
            <select
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-medium outline-none transition focus:border-brandBlue focus:ring-2 focus:ring-brandBlue/20"
              name="country"
              value={form.country}
              onChange={updateField}
            >
              <option value="ES">Espana</option>
              <option value="US">USA</option>
              <option value="MX">Mexico</option>
              <option value="CA">Canada</option>
              <option value="AR">Argentina</option>
              <option value="BR">Brasil</option>
            </select>
          </label>
          <fieldset>
            <legend className="text-sm font-bold">Preferencias</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {prefOptions.map((pref) => {
                const selected = form.preferences.includes(pref);
                return (
                  <button
                    key={pref}
                    type="button"
                    className={`rounded-full border px-3 py-1 text-sm font-bold ${
                      selected
                        ? "border-brandBlue bg-brandBlue text-white"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                    onClick={() => togglePreference(pref)}
                  >
                    {pref}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {error && <p className="text-sm font-semibold text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-brandBlue px-4 text-sm font-black text-white transition hover:bg-slate-950 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {profile && <ArrowLeft size={18} />}
            {loading ? "Generando plan..." : "Generar plan"}
            {!loading && <ArrowRight size={18} />}
          </button>
          </div>
        </form>
      </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-3 px-4 py-8 md:grid-cols-3">
        {featuredTeams.slice(0, 3).map((team) => (
          <article key={team.name} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <img src={team.image} alt={`Ambiente de futbol para ${team.name}`} className="h-36 w-full object-cover" />
            <div className="flex items-center gap-3 p-4">
              <img
                src={`https://flagcdn.com/w80/${team.badge}.png`}
                alt={`Bandera de ${team.name}`}
                className="h-9 w-12 rounded object-cover"
              />
              <div>
                <h3 className="font-black">{team.name}</h3>
                <p className="text-sm font-medium text-slate-600">{team.note}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
