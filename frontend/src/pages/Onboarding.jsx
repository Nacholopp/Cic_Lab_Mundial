import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildPlan } from "../services/api.client.js";
import { usePlannerStore } from "../store/planner.store.js";

const prefOptions = ["barato", "comodo", "rapido", "futbol", "turismo"];

export default function Onboarding() {
  const navigate = useNavigate();
  const { setProfile, setPlan, setError, setLoading, loading, error, setCountry } = usePlannerStore();

  const [form, setForm] = useState({
    favoriteTeam: "",
    originCity: "",
    destinationCity: "Dallas",
    budget: "",
    departureDate: "",
    adults: 1,
    country: "ES",
    preferences: ["barato", "futbol"]
  });

  const canSubmit = useMemo(
    () =>
      Boolean(
        form.favoriteTeam && form.originCity && form.destinationCity && form.departureDate && form.adults
      ),
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
    try {
      setLoading(true);
      setError(null);
      const payload = {
        favoriteTeam: form.favoriteTeam,
        originCity: form.originCity,
        destinationCity: form.destinationCity,
        departureDate: form.departureDate,
        adults: Number(form.adults),
        budget: form.budget ? Number(form.budget) : null,
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
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-3xl rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">WorldCup Fan Planner 2026</h1>
        <p className="mt-1 text-sm text-slate-600">
          Completa tus datos y generamos vuelos, partidos y una ruta recomendada.
        </p>

        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <label className="text-sm">
            Seleccion favorita
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              name="favoriteTeam"
              value={form.favoriteTeam}
              onChange={updateField}
              required
            />
          </label>
          <label className="text-sm">
            Ciudad origen
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              name="originCity"
              value={form.originCity}
              onChange={updateField}
              required
            />
          </label>
          <label className="text-sm">
            Ciudad destino
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              name="destinationCity"
              value={form.destinationCity}
              onChange={updateField}
              required
            />
          </label>
          <label className="text-sm">
            Fecha de salida
            <input
              type="date"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              name="departureDate"
              value={form.departureDate}
              onChange={updateField}
              required
            />
          </label>
          <label className="text-sm">
            Presupuesto (USD)
            <input
              type="number"
              min="0"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              name="budget"
              value={form.budget}
              onChange={updateField}
            />
          </label>
          <label className="text-sm">
            Personas
            <input
              type="number"
              min="1"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              name="adults"
              value={form.adults}
              onChange={updateField}
            />
          </label>
          <label className="text-sm md:col-span-2">
            Pais para periodico
            <select
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
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
          <fieldset className="md:col-span-2">
            <legend className="text-sm font-medium">Preferencias</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {prefOptions.map((pref) => {
                const selected = form.preferences.includes(pref);
                return (
                  <button
                    key={pref}
                    type="button"
                    className={`rounded-md border px-3 py-1 text-sm ${
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

          {error && <p className="md:col-span-2 text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="md:col-span-2 h-11 rounded-md bg-brandBlue px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? "Generando plan..." : "Generar plan"}
          </button>
        </form>
      </div>
    </main>
  );
}
