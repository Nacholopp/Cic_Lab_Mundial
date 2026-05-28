import { create } from "zustand";

const AUTH_STORAGE_KEY = "wc_auth_session";

function loadAuthSession() {
  if (typeof window === "undefined") return { user: null, token: null };
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { user: null, token: null };
    const parsed = JSON.parse(raw);
    return {
      user: parsed?.user || null,
      token: parsed?.token || null
    };
  } catch {
    return { user: null, token: null };
  }
}

function persistAuthSession(session) {
  if (typeof window === "undefined") return;
  if (!session?.token || !session?.user) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

const initialSession = loadAuthSession();

export const usePlannerStore = create((set) => ({
  profile: null,
  plan: null,
  loading: false,
  error: null,
  country: "ES",
  authUser: initialSession.user,
  authToken: initialSession.token,
  setProfile: (profile) => set({ profile }),
  setPlan: (plan) => set({ plan }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setCountry: (country) => set({ country }),
  setAuthSession: ({ user, token }) => {
    persistAuthSession({ user, token });
    set({ authUser: user, authToken: token });
  },
  clearAuthSession: () => {
    persistAuthSession(null);
    set({ authUser: null, authToken: null });
  }
}));
