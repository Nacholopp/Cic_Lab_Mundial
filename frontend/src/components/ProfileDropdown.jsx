import { useState } from "react";
import { ChevronDown, UserCircle2 } from "lucide-react";

export default function ProfileDropdown({ profile }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className="flex h-11 min-w-36 items-center justify-center gap-2 rounded-md border border-cyan-100/25 bg-[#0b2238]/85 px-3 text-sm font-black text-white shadow-lg shadow-cyan-950/30 ring-1 ring-white/10 backdrop-blur-xl hover:bg-[#10304c]"
        onClick={() => setOpen((prev) => !prev)}
      >
        <UserCircle2 size={18} />
        <span className="max-w-28 truncate">{profile?.favoriteTeam || "Perfil"}</span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-56 rounded-md border border-cyan-100/25 bg-[#071827]/95 p-1 text-white shadow-2xl shadow-black/40 ring-1 ring-white/10 backdrop-blur-2xl">
          <button className="w-full rounded px-3 py-2 text-left text-sm font-bold text-white hover:bg-white/10">
            Editar perfil
          </button>
          <button className="w-full rounded px-3 py-2 text-left text-sm font-bold text-white hover:bg-white/10">
            Preferencias
          </button>
          <button className="w-full rounded px-3 py-2 text-left text-sm font-bold text-white hover:bg-white/10">
            Datos de viaje
          </button>
          <button className="w-full rounded px-3 py-2 text-left text-sm font-bold text-white hover:bg-white/10">
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
