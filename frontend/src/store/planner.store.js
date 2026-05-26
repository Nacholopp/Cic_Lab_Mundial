import { create } from "zustand";

export const usePlannerStore = create((set) => ({
  profile: null,
  plan: null,
  loading: false,
  error: null,
  country: "ES",
  setProfile: (profile) => set({ profile }),
  setPlan: (plan) => set({ plan }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setCountry: (country) => set({ country })
}));
