import { useState } from "react";
import { ChevronDown, UserCircle2 } from "lucide-react";

export default function ProfileDropdown({ profile }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className="flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm"
        onClick={() => setOpen((prev) => !prev)}
      >
        <UserCircle2 size={18} />
        <span>{profile?.favoriteTeam || "Perfil"}</span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-52 rounded-md border border-slate-200 bg-white p-1 shadow-lg">
          <button className="w-full rounded px-3 py-2 text-left text-sm hover:bg-slate-100">
            Editar perfil
          </button>
          <button className="w-full rounded px-3 py-2 text-left text-sm hover:bg-slate-100">
            Preferencias
          </button>
          <button className="w-full rounded px-3 py-2 text-left text-sm hover:bg-slate-100">
            Datos de viaje
          </button>
          <button className="w-full rounded px-3 py-2 text-left text-sm hover:bg-slate-100">
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
