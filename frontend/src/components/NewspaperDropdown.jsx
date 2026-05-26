import { useMemo, useState } from "react";
import { Newspaper } from "lucide-react";

const newspaperByCountry = {
  MX: { name: "Record", url: "https://www.record.com.mx" },
  US: { name: "ESPN Soccer", url: "https://www.espn.com/soccer/" },
  CA: { name: "The Athletic Canada", url: "https://theathletic.com" },
  PA: { name: "RPC Deportes", url: "https://www.rpctv.com/deportes" },
  HT: { name: "Haiti Tempo", url: "https://haititempo.com" },
  CW: { name: "Curacao Chronicle Sports", url: "https://www.curacaochronicle.com" },
  ES: { name: "Marca", url: "https://www.marca.com" },
  FR: { name: "L'Equipe", url: "https://www.lequipe.fr" },
  GB: { name: "BBC Sport", url: "https://www.bbc.com/sport/football" },
  DE: { name: "Kicker", url: "https://www.kicker.de" },
  PT: { name: "A Bola", url: "https://www.abola.pt" },
  NL: { name: "Voetbal International", url: "https://www.vi.nl" },
  IT: { name: "La Gazzetta", url: "https://www.gazzetta.it" },
  BE: { name: "Sporza", url: "https://sporza.be" },
  AR: { name: "Ole", url: "https://www.ole.com.ar" },
  BR: { name: "Globo Esporte", url: "https://ge.globo.com" },
  UY: { name: "Ovacion", url: "https://www.ovaciondigital.com.uy" },
  CO: { name: "Win Sports", url: "https://www.winsports.co" },
  JP: { name: "Nikkan Sports", url: "https://www.nikkansports.com" },
  KR: { name: "Sports Chosun", url: "https://sports.chosun.com" },
  AU: { name: "The Roar", url: "https://www.theroar.com.au" },
  NZ: { name: "Stuff Sport", url: "https://www.stuff.co.nz/sport" }
};

const defaultNews = { name: "UEFA Official", url: "https://www.uefa.com" };

export default function NewspaperDropdown({ country }) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => newspaperByCountry[country] || defaultNews, [country]);

  return (
    <div className="relative">
      <button
        type="button"
        className="flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm"
        onClick={() => setOpen((prev) => !prev)}
        title="Diario deportivo"
      >
        <Newspaper size={18} />
        <span>{selected.name}</span>
      </button>
      {open && (
        <div className="absolute left-0 z-20 mt-2 w-72 rounded-md border border-slate-200 bg-white p-2 shadow-lg">
          <a
            className="block rounded px-3 py-2 text-sm font-medium text-brandBlue hover:bg-slate-100"
            href={selected.url}
            target="_blank"
            rel="noreferrer"
          >
            Abrir portada: {selected.name}
          </a>
          <p className="px-3 py-2 text-xs text-slate-500">
            Fuente recomendada segun pais seleccionado.
          </p>
        </div>
      )}
    </div>
  );
}
