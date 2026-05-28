import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, LogIn, LogOut, UserCircle2, UserPlus } from "lucide-react";
import { checkEmailExists, fetchMyItineraries, loginUser, registerUser } from "../services/api.client.js";

const emptyAuthForm = {
  username: "",
  email: "",
  password: ""
};

function normalizeError(message) {
  if (!message) return "No se pudo completar la operacion.";
  return message;
}

function renderPortal(node) {
  if (typeof document === "undefined") return null;
  return createPortal(node, document.body);
}

export default function ProfileDropdown({ profile, authUser, authToken, onLoginSuccess, onLogout }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("login");
  const [modalOpen, setModalOpen] = useState(false);
  const [authForm, setAuthForm] = useState(emptyAuthForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [itineraryModalOpen, setItineraryModalOpen] = useState(false);
  const [itineraryLoading, setItineraryLoading] = useState(false);
  const [itineraryError, setItineraryError] = useState("");
  const [itineraries, setItineraries] = useState([]);

  const displayLabel = useMemo(() => {
    if (authUser?.username) return authUser.username;
    if (profile?.favoriteTeam) return profile.favoriteTeam;
    return "Mi cuenta";
  }, [authUser, profile]);

  const isAuthFormInvalid = useMemo(() => {
    const email = authForm.email.trim();
    const password = authForm.password.trim();
    const username = authForm.username.trim();
    if (!email || !password) return true;
    if (mode === "register" && !username) return true;
    return false;
  }, [authForm, mode]);

  const openAuthModal = (nextMode) => {
    setMode(nextMode);
    setAuthForm(emptyAuthForm);
    setError("");
    setModalOpen(true);
    setOpen(false);
  };

  const closeAuthModal = () => {
    setModalOpen(false);
    setLoading(false);
    setError("");
  };

  const openItineraries = async () => {
    if (!authToken) return;
    setOpen(false);
    setItineraryModalOpen(true);
    setItineraryError("");
    setItineraryLoading(true);
    try {
      const response = await fetchMyItineraries(authToken);
      setItineraries(response.itineraries || []);
    } catch (requestError) {
      setItineraryError(normalizeError(requestError.message));
    } finally {
      setItineraryLoading(false);
    }
  };

  const onFormChange = (event) => {
    const { name, value } = event.target;
    setAuthForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitAuth = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const email = authForm.email.trim().toLowerCase();
      const password = authForm.password.trim();
      const username = authForm.username.trim();

      if (!email || !password || (mode === "register" && !username)) {
        throw new Error("Completa todos los campos requeridos.");
      }

      if (mode === "register" && username.length < 3) {
        throw new Error("El nombre de usuario debe tener al menos 3 caracteres.");
      }

      if (mode === "register") {
        const emailState = await checkEmailExists(email);
        if (emailState.exists) {
          setMode("login");
          throw new Error("Este email ya existe. Inicia sesion.");
        }

        const response = await registerUser({ username, email, password });
        onLoginSuccess({ user: response.user, token: response.token });
      } else {
        const response = await loginUser({ email, password });
        onLoginSuccess({ user: response.user, token: response.token });
      }

      closeAuthModal();
    } catch (requestError) {
      setError(normalizeError(requestError.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative">
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900"
          onClick={() => setOpen((prev) => !prev)}
        >
          <UserCircle2 size={18} />
          <span>{displayLabel}</span>
          <ChevronDown size={16} />
        </button>
        {open && (
          <div className="absolute top-full right-0 z-20 mt-2 w-56 -translate-x-3 rounded-md border border-slate-200 bg-white p-1 text-slate-900 shadow-lg">
            {authUser ? (
              <>
                <p className="px-3 py-2 text-xs font-semibold text-slate-500">{authUser.email}</p>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-slate-100"
                  onClick={openItineraries}
                >
                  Mis itinerarios
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-slate-100"
                  onClick={() => {
                    setOpen(false);
                    onLogout();
                  }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-slate-100"
                  onClick={() => openAuthModal("login")}
                >
                  <LogIn size={16} />
                  Login
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-slate-100"
                  onClick={() => openAuthModal("register")}
                >
                  <UserPlus size={16} />
                  Register
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {modalOpen &&
        renderPortal(
          <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-16 sm:pt-24">
            <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl">
              <h3 className="text-lg font-black">{mode === "register" ? "Crear cuenta" : "Iniciar sesion"}</h3>
              <p className="mt-1 text-sm text-slate-600">
                {mode === "register" ? "Registra tu usuario para guardar itinerarios." : "Accede con tu email y contraseña."}
              </p>

              <form className="mt-4 space-y-3" onSubmit={submitAuth}>
                {mode === "register" && (
                  <label className="block text-sm font-semibold">
                    Nombre de usuario
                    <input
                      name="username"
                      value={authForm.username}
                      onChange={onFormChange}
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                      minLength={3}
                      required
                    />
                  </label>
                )}

                <label className="block text-sm font-semibold">
                  Email
                  <input
                    type="email"
                    name="email"
                    value={authForm.email}
                    onChange={onFormChange}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                    required
                  />
                </label>

                <label className="block text-sm font-semibold">
                  Contraseña
                  <input
                    type="password"
                    name="password"
                    value={authForm.password}
                    onChange={onFormChange}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                    required
                    minLength={8}
                  />
                </label>

                {error && <p className="text-sm font-semibold text-red-700">{error}</p>}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    className="h-10 rounded-md border border-slate-300 px-4 text-sm font-bold text-slate-700"
                    onClick={closeAuthModal}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="h-10 rounded-md bg-brandBlue px-4 text-sm font-bold text-white"
                    disabled={loading || isAuthFormInvalid}
                  >
                    {loading ? "Enviando..." : mode === "register" ? "Crear cuenta" : "Entrar"}
                  </button>
                </div>
              </form>

              <button
                type="button"
                className="mt-4 text-sm font-semibold text-brandBlue"
                onClick={() => {
                  setMode((prev) => (prev === "register" ? "login" : "register"));
                  setError("");
                }}
              >
                {mode === "register" ? "Ya tienes cuenta? Ir a login" : "No tienes cuenta? Ir a register"}
              </button>
            </div>
          </div>
        )}

      {itineraryModalOpen &&
        renderPortal(
          <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-16 sm:pt-24">
            <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl">
              <h3 className="text-lg font-black">Mis itinerarios guardados</h3>
              <p className="mt-1 text-sm text-slate-600">Se muestran los ultimos 30 itinerarios de tu cuenta.</p>

              {itineraryLoading && <p className="mt-4 text-sm font-semibold text-slate-600">Cargando...</p>}
              {itineraryError && <p className="mt-4 text-sm font-semibold text-red-700">{itineraryError}</p>}

              {!itineraryLoading && !itineraryError && (
                <div className="mt-4 max-h-[50vh] space-y-2 overflow-y-auto pr-1">
                  {itineraries.length === 0 && (
                    <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      Aun no tienes itinerarios guardados.
                    </p>
                  )}
                  {itineraries.map((item) => (
                    <article key={item.id} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-sm font-bold text-slate-900">
                        {item.originCity} {"->"} {item.destination}
                      </p>
                      <p className="text-xs font-semibold text-slate-500">
                        Salida: {new Date(item.departureDate).toISOString().slice(0, 10)} | Guardado:{" "}
                        {new Date(item.createdAt).toISOString().slice(0, 10)}
                      </p>
                      <p className="text-xs font-semibold text-slate-600">
                        Coste estimado: {item.totalCost ?? "N/A"}
                      </p>
                    </article>
                  ))}
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  className="h-10 rounded-md border border-slate-300 px-4 text-sm font-bold text-slate-700"
                  onClick={() => setItineraryModalOpen(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
    </>
  );
}
