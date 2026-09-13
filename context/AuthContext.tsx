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
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
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
    const { token: t, user: u } = res.data as { token: string; user: User };
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{
      user, token, isLoading,
      isAuthenticated: !!token && !!user,
      login, logout, refreshUser,
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
