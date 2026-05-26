import { Home, MapPinned, RotateCcw, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const optionLabels = {
  stay_origin: "Quedarse en origen",
  travel_city: "Viajar a una sede",
  follow_team: "Seguir seleccion"
};

const options = [
  { value: "stay_origin", label: optionLabels.stay_origin, icon: Home },
  { value: "travel_city", label: optionLabels.travel_city, icon: MapPinned },
  { value: "follow_team", label: optionLabels.follow_team, icon: Shield }
];

export default function OptionMenu({ currentMode }) {
  return (
    <nav className="flex flex-wrap gap-2">
      {options.map((option) => {
        const Icon = option.icon;
        const active = currentMode === option.value;
        return (
          <Link
            key={option.value}
            to={`/?mode=${option.value}`}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-black ${
              active
                ? "border-white bg-white text-slate-950"
                : "border-white/50 bg-white/10 text-white backdrop-blur hover:bg-white/20"
            }`}
          >
            <Icon size={16} />
            {option.label}
          </Link>
        );
      })}
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-md border border-white/50 bg-white/10 px-3 py-2 text-xs font-black text-white backdrop-blur hover:bg-white/20"
      >
        <RotateCcw size={16} />
        Cambiar opcion
      </Link>
    </nav>
  );
}
