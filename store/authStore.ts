import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import type { AuthTokens, User } from "@/types/api/auth";

const REMEMBER_FLAG = "worker_remember";

function rememberStorage(): StateStorage {
  return {
    getItem: (name) => {
      if (typeof window === "undefined") return null;
      const remember = window.localStorage.getItem(REMEMBER_FLAG);
      const store = remember === "true" ? window.localStorage : window.sessionStorage;
      return store.getItem(name);
    },
    setItem: (name, value) => {
      if (typeof window === "undefined") return;
      const remember = window.localStorage.getItem(REMEMBER_FLAG);
      const store = remember === "true" ? window.localStorage : window.sessionStorage;
      store.setItem(name, value);
    },
    removeItem: (name) => {
      if (typeof window === "undefined") return;
      window.localStorage.removeItem(name);
      window.sessionStorage.removeItem(name);
    },
  };
}

type AuthState = {
  user: User | null;
  setUser: (user: User | null) => void;

  tokens: AuthTokens | null;
  setTokens: (tokens: AuthTokens | null) => void;

  session: string | null;
  setSession: (session: string | null) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      session: null,
      setUser: (user) => set({ user }),
      setTokens: (tokens) => set({ tokens }),
      setSession: (session) => set({ session }),
      clear: () => set({ user: null, tokens: null, session: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(rememberStorage),
    }
  )
);

