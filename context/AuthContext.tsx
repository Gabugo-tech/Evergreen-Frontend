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

  // Keep fetchUser in a ref so the mount effect can call it without being a dep
  const fetchUserRef = useRef<(() => Promise<void>) | undefined>(undefined);

  const fetchUser = useCallback(async () => {
    try {
      const res = await usersApi.me();
      setUser(res.data as User);
    } catch (err) {
      // Only clear the session for explicit 401 auth failures.
      // Network errors / 5xx should NOT log the user out — that caused
      // the admin panel redirect-to-login bug on slow connections.
      const msg = err instanceof Error ? err.message : "";
      const is401 = msg.includes("401") || msg.toLowerCase().includes("unauthorized");
      if (is401) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      }
      // Otherwise: leave the token/user intact and let the UI show stale state.
    }
  }, []);

  fetchUserRef.current = fetchUser;

  // On mount: restore session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      setToken(stored);
      fetchUserRef.current?.().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []); // intentionally empty — run once on mount only

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    // Backend wraps response as { success, message, data: { token, user } }
    const payload = (res as { data?: { token: string; user: User } }).data
                 ?? (res as unknown as { token: string; user: User });
    const t = payload.token;
    const u = payload.user;
    if (!t) throw new Error("Authentication failed — no token received");
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  /** Called after registration to hydrate the session without a round-trip. */
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
