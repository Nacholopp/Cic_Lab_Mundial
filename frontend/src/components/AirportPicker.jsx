import { Plane, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fetchAirports } from "../services/api.client.js";

export default function AirportPicker({ city, label, value, onChange }) {
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!city || city.trim().length < 2) {
      setAirports([]);
      onChange(null);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    fetchAirports(city)
      .then((response) => {
        if (!active) return;
        setAirports(response.airports || []);
        if (!value) onChange({ mode: "all" });
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError.message);
        setAirports([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [city]);

  const selectedValue = useMemo(() => {
    if (!value || value.mode === "all") return "all";
    return value.iata || "all";
  }, [value]);

  const handleChange = (event) => {
    if (event.target.value === "all") {
      onChange({ mode: "all" });
      return;
    }

    const airport = airports.find((item) => item.iata === event.target.value);
    onChange({
      mode: "airport",
      iata: airport.iata,
      name: airport.name,
      city: airport.city,
      country: airport.country
    });
  };

  return (
    <label className="text-sm font-bold">
      {label}
      <div className="mt-1 flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 focus-within:border-brandBlue focus-within:ring-2 focus-within:ring-brandBlue/20">
        {loading ? <Search size={17} className="animate-pulse text-slate-400" /> : <Plane size={17} className="text-slate-400" />}
        <select
          className="w-full bg-transparent text-sm font-semibold text-slate-950 outline-none"
          value={selectedValue}
          onChange={handleChange}
          disabled={!airports.length || loading}
        >
          <option value="all">Todos los aeropuertos encontrados</option>
          {airports.map((airport) => (
            <option key={airport.iata} value={airport.iata}>
              {airport.iata} - {airport.name} ({airport.city})
            </option>
          ))}
        </select>
      </div>
      {error && <span className="mt-1 block text-xs font-semibold text-red-700">{error}</span>}
      {!error && city && airports.length > 1 && (
        <span className="mt-1 block text-xs font-semibold text-slate-500">
          Si eliges todos, buscaremos combinaciones y usaremos la mas barata.
        </span>
      )}
    </label>
  );
}
