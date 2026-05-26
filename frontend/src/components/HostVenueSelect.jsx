import { ChevronDown, MapPin, Search, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { hostVenues } from "../data/hostVenues.js";
import { stadiumImage } from "../data/worldCupVisuals.js";

const flagUrl = (countryCode) => `https://flagcdn.com/w160/${countryCode}.png`;
const wikiSummaryUrl = (page) => `https://en.wikipedia.org/api/rest_v1/page/summary/${page}`;

export default function HostVenueSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [photos, setPhotos] = useState({});
  const selected = hostVenues.find((venue) => venue.city === value);
  const previewVenue = selected || hostVenues.find((venue) => venue.city === "Dallas");

  useEffect(() => {
    let active = true;

    Promise.all(
      hostVenues.map((venue) =>
        fetch(wikiSummaryUrl(venue.page))
          .then((response) => (response.ok ? response.json() : null))
          .then((data) => [venue.city, data?.thumbnail?.source || data?.originalimage?.source || null])
          .catch(() => [venue.city, null])
      )
    ).then((entries) => {
      if (active) setPhotos(Object.fromEntries(entries));
    });

    return () => {
      active = false;
    };
  }, []);

  const filteredVenues = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return hostVenues;
    return hostVenues.filter((venue) =>
      `${venue.city} ${venue.stadium} ${venue.countryName}`.toLowerCase().includes(normalizedQuery)
    );
  }, [query]);

  const chooseVenue = (venue) => {
    onChange(venue.city);
    setOpen(false);
    setQuery("");
  };

  const previewPhoto = photos[previewVenue.city] || stadiumImage;

  return (
    <div className="relative">
      <label className="text-sm font-bold">Sede a la que quiero viajar</label>
      <button
        type="button"
        className="relative mt-1 flex min-h-28 w-full overflow-hidden rounded-lg border border-slate-300 text-left text-white shadow-sm outline-none transition hover:border-brandBlue focus:border-brandBlue focus:ring-2 focus:ring-brandBlue/20"
        onClick={() => setOpen((current) => !current)}
      >
        <img src={previewPhoto} alt={previewVenue.stadium} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/50 to-slate-950/10" />
        <div className="relative flex w-full items-center gap-3 p-3">
          <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-md bg-white/90 p-2 shadow">
            <img
              src={flagUrl(previewVenue.countryCode)}
              alt={previewVenue.countryName}
              className="h-full w-full rounded object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xl font-black">{selected ? previewVenue.city : "Elige una sede"}</p>
            <p className="mt-1 truncate text-sm font-bold text-white/85">{previewVenue.stadium}</p>
            <p className="mt-1 flex items-center gap-1 text-xs font-bold uppercase tracking-[0.18em] text-white/70">
              <MapPin size={13} />
              {previewVenue.countryName}
            </p>
          </div>
          <ChevronDown className={`shrink-0 drop-shadow transition ${open ? "rotate-180" : ""}`} size={20} />
        </div>
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-950 shadow-2xl">
          <div className="flex items-center gap-2 border-b border-slate-200 p-3">
            <Search size={18} className="text-slate-400" />
            <input
              className="w-full bg-transparent text-sm font-semibold outline-none"
              placeholder="Busca ciudad, estadio o pais"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoFocus
            />
          </div>
          <div className="grid max-h-[460px] gap-2 overflow-y-auto p-2 sm:grid-cols-2">
            {filteredVenues.map((venue) => {
              const photo = photos[venue.city] || stadiumImage;
              const isSelected = value === venue.city;
              return (
                <button
                  key={venue.city}
                  type="button"
                  className="relative min-h-28 overflow-hidden rounded-md text-left text-white shadow-sm ring-1 ring-black/5 transition hover:scale-[1.01] hover:shadow-md"
                  onClick={() => chooseVenue(venue)}
                >
                  <img src={photo} alt={venue.stadium} className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/50 to-transparent" />
                  <div className="absolute bottom-1 right-2 text-3xl font-black uppercase tracking-normal text-white/10">
                    {venue.city}
                  </div>
                  <div className="relative flex h-full items-center gap-3 p-3">
                    <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded bg-white/90 p-1.5">
                      <img
                        src={flagUrl(venue.countryCode)}
                        alt={venue.countryName}
                        className="h-full w-full rounded-sm object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black">{venue.city}</p>
                      <p className="truncate text-xs font-bold text-white/80">{venue.stadium}</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.15em] text-white/65">
                        {venue.countryName}
                      </p>
                    </div>
                    {isSelected && <Star size={17} fill="currentColor" className="shrink-0 drop-shadow" />}
                  </div>
                </button>
              );
            })}
            {!filteredVenues.length && (
              <p className="col-span-full px-3 py-6 text-center text-sm font-semibold text-slate-500">
                Sin resultados.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
