"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { worker, setTokens, clearTokens, loadTokens } from "../api/worker";
import { useAuthStore } from "@/store/authStore";
import type { AuthState, LoginCredentials, LoginData, UserData } from "./types";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const zustandTokens = useAuthStore((s) => s.tokens);
  const zustandUser = useAuthStore((s) => s.user);

  const accessToken = state.accessToken ?? zustandTokens?.access_token ?? null;
  const refreshToken = state.refreshToken ?? zustandTokens?.refresh_token ?? null;
  const user = state.user ?? zustandUser ?? null;

  const refreshUser = useCallback(async () => {
    const res = await worker.auth.get<{ user: UserData }>("/users/me");
    setState((prev) =>
      res.success && res.data?.user
        ? { ...prev, user: res.data!.user, isAuthenticated: true, isLoading: false }
        : { ...prev, isLoading: false },
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      loadTokens();
      const remember =
        typeof window !== "undefined" &&
        window.localStorage.getItem("worker_remember") === "true";
      const store = remember ? window.localStorage : window.sessionStorage;
      const access =
        typeof window !== "undefined" ? store.getItem("worker_access_token") : null;
      const refresh =
        typeof window !== "undefined" ? store.getItem("worker_refresh_token") : null;
      if (access && refresh) {
        setTokens(access, refresh, remember);
        await refreshUser();
      } else if (!cancelled) {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  useEffect(() => {
    if (zustandTokens?.access_token && !state.accessToken) {
      const remember =
        typeof window !== "undefined" &&
        window.localStorage.getItem("worker_remember") === "true";
      setTokens(zustandTokens.access_token, zustandTokens.refresh_token, remember);
      let cancelled = false;
      void Promise.resolve().then(() => {
        if (!cancelled) refreshUser();
      });
      return () => {
        cancelled = true;
      };
    }

    if (!zustandTokens?.access_token && state.accessToken) {
      let cancelled = false;
      void Promise.resolve().then(() => {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          }));
        }
      });
      return () => {
        cancelled = true;
      };
    }
  }, [zustandTokens, state.accessToken, refreshUser]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const res = await worker.post<LoginData>("/auth/login", credentials);
    if (res.success && res.data?.tokens) {
      const remember = credentials.rememberMe ?? true;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("worker_remember", remember ? "true" : "false");
      }
      setTokens(res.data.tokens.access_token, res.data.tokens.refresh_token, remember);
      setState({
        user: res.data.user,
        accessToken: res.data.tokens.access_token,
        refreshToken: res.data.tokens.refresh_token,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true };
    }
    return { success: false, message: res.message || "Login failed" };
  }, []);

  const logout = useCallback(async () => {
    await worker.auth.post("/auth/logout").catch(() => {});
    clearTokens();
    useAuthStore.getState().clear();
    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ ...state, user, accessToken, refreshToken, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
