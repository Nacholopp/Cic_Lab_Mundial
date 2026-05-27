import { useState } from "react";
import { teamFlagUrl } from "../utils/teamVisuals.js";

function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function TeamBadge({ team, width = 40, className = "h-4 w-6" }) {
  const [broken, setBroken] = useState(false);
  const src = !broken ? teamFlagUrl(team, width) : null;

  if (!src) {
    return (
      <span className={`inline-flex items-center justify-center rounded-sm bg-slate-200 text-[10px] font-black text-slate-700 ${className}`}>
        {initials(team)}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={`Bandera de ${team}`}
      className={`${className} rounded-sm object-cover ring-1 ring-slate-200`}
      loading="lazy"
      onError={() => setBroken(true)}
    />
  );
}

