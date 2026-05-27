import { cityCoordinates } from "../data/cityCoordinates.js";

function normalizeText(value = "") {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getLatLon(city) {
  return cityCoordinates[normalizeText(city)] || null;
}

function project({ lat, lon }) {
  const x = ((lon + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 60;
  return { x: Number(x.toFixed(3)), y: Number(y.toFixed(3)) };
}

function curvedPath(from, to) {
  const curveY = Math.max(8, Math.min(from.y, to.y) - 8);
  const midX = (from.x + to.x) / 2;
  return `M ${from.x} ${from.y} C ${midX} ${curveY}, ${midX} ${curveY}, ${to.x} ${to.y}`;
}

export default function WorldMap({ originCity, destinationCity, segments = [] }) {
  const normalizedSegments = segments
    .map((segment, index) => {
      const fromLatLon = segment.fromCoordinates || getLatLon(segment.fromCity);
      const toLatLon = segment.toCoordinates || getLatLon(segment.toCity);
      if (!fromLatLon || !toLatLon) return null;
      const from = project(fromLatLon);
      const to = project(toLatLon);
      return {
        id: segment.id || `${segment.fromCity}-${segment.toCity}-${index + 1}`,
        fromCity: segment.fromCity,
        toCity: segment.toCity,
        from,
        to
      };
    })
    .filter(Boolean);

  const fallbackFrom = getLatLon(originCity);
  const fallbackTo = getLatLon(destinationCity);
  const fallbackSegment =
    fallbackFrom && fallbackTo
      ? [
          {
            id: "fallback",
            fromCity: originCity,
            toCity: destinationCity,
            from: project(fallbackFrom),
            to: project(fallbackTo)
          }
        ]
      : [];

  const displaySegments = normalizedSegments.length ? normalizedSegments : fallbackSegment;
  const displayOrigin = displaySegments[0]?.fromCity || originCity || "N/A";
  const displayDestination = displaySegments[displaySegments.length - 1]?.toCity || destinationCity || "N/A";

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-base font-semibold">Mapa de Rutas</h3>
      <div className="relative h-[360px] w-full overflow-hidden rounded-md bg-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#1e3a8a_0%,#0f172a_45%,#020617_100%)]" />
        <svg viewBox="0 0 100 60" className="absolute inset-0 h-full w-full">
          {displaySegments.map((segment, index) => (
            <g key={segment.id}>
              <path d={curvedPath(segment.from, segment.to)} fill="none" stroke="#facc15" strokeWidth="0.7" strokeDasharray="1.2 1.2" />
              <circle cx={segment.from.x} cy={segment.from.y} r="1.1" fill="#38bdf8" />
              <circle cx={segment.to.x} cy={segment.to.y} r="1.1" fill="#22c55e" />
              <text x={(segment.from.x + segment.to.x) / 2} y={(segment.from.y + segment.to.y) / 2 - 1.2} fill="#e2e8f0" fontSize="1.8" textAnchor="middle">
                {index + 1}
              </text>
            </g>
          ))}
        </svg>
        <div className="absolute left-3 top-3 rounded bg-black/45 px-2 py-1 text-xs text-white">
          Origen: {displayOrigin}
        </div>
        <div className="absolute bottom-3 right-3 rounded bg-black/45 px-2 py-1 text-xs text-white">
          Destino: {displayDestination}
        </div>
      </div>
    </section>
  );
}
