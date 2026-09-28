"use client";

import {
  createContext, useContext, useEffect, useState, useCallback,
  useRef, type ReactNode,
} from "react";
import { authApi, usersApi } from "@/lib/api";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  setSession: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = "eg_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]    = useState<User | null>(null);
  const [token,     setToken]   = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);

  const fetchUserRef = useRef<(() => Promise<void>) | undefined>(undefined);

  const fetchUser = useCallback(async () => {
    try {
      const res = await usersApi.me();
      setUser(res.data as User);
    } catch (err) {
      const msg    = err instanceof Error ? err.message : "";
      // Detect 401 via the [status] prefix we now embed, or legacy text
      const is401  = /\[401\]/.test(msg) || msg.toLowerCase().includes("unauthorized");
      if (is401) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      }
      // Network errors / 5xx leave the session intact
    }
  }, []);

  fetchUserRef.current = fetchUser;

  // On mount: restore session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }
    setToken(stored);
    // Guard: if ref somehow not set yet, still unblock the app
    const ref = fetchUserRef.current;
    if (!ref) { setLoading(false); return; }
    ref().finally(() => setLoading(false));
  }, []); // intentionally empty — run once on mount only

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const payload = (res as { data?: { token: string; user: User } }).data
                 ?? (res as unknown as { token: string; user: User });
    const t = payload.token;
    const u = payload.user;
    if (!t || !u) throw new Error("Authentication failed — incomplete response from server");
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const setSession = useCallback((t: string, u: User) => {
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
    setUser(u);
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{
      user, token, isLoading,
      isAuthenticated: !!token && !!user,
      login, setSession, logout, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
