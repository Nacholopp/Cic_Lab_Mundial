const cityCoords = {
  madrid: { x: 45, y: 32 },
  barcelona: { x: 47, y: 31 },
  london: { x: 43, y: 26 },
  paris: { x: 44, y: 29 },
  mexico: { x: 24, y: 50 },
  dallas: { x: 20, y: 44 },
  miami: { x: 24, y: 49 },
  toronto: { x: 21, y: 38 },
  vancouver: { x: 11, y: 36 },
  "new york": { x: 26, y: 40 }
};

function guessCoords(city, fallback) {
  const key = (city || "").toLowerCase().trim();
  return cityCoords[key] || fallback;
}

export default function WorldMap({ originCity, destinationCity }) {
  const origin = guessCoords(originCity, { x: 44, y: 30 });
  const destination = guessCoords(destinationCity, { x: 20, y: 43 });
  const path = `M ${origin.x} ${origin.y} C 40 10, 30 10, ${destination.x} ${destination.y}`;

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-base font-semibold">Mapa de Rutas</h3>
      <div className="relative h-[360px] w-full overflow-hidden rounded-md bg-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#1e3a8a_0%,#0f172a_45%,#020617_100%)]" />
        <svg viewBox="0 0 100 60" className="absolute inset-0 h-full w-full">
          <path d={path} fill="none" stroke="#facc15" strokeWidth="0.7" strokeDasharray="1 1" />
          <circle cx={origin.x} cy={origin.y} r="1.2" fill="#38bdf8" />
          <circle cx={destination.x} cy={destination.y} r="1.2" fill="#22c55e" />
        </svg>
        <div className="absolute left-3 top-3 rounded bg-black/45 px-2 py-1 text-xs text-white">
          Origen: {originCity || "N/A"}
        </div>
        <div className="absolute bottom-3 right-3 rounded bg-black/45 px-2 py-1 text-xs text-white">
          Destino: {destinationCity || "N/A"}
        </div>
      </div>
    </section>
  );
}
