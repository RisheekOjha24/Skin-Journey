"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { AuthUser } from "@/types";
import { API_CONFIG } from "@/config/api.config";
import { ROUTES } from "@/config/routes.config";
import { authService } from "@/services/auth.service";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

function persistSession(token: string, user: AuthUser) {
  window.localStorage.setItem(API_CONFIG.authTokenStorageKey, token);
  window.localStorage.setItem(API_CONFIG.authUserStorageKey, JSON.stringify(user));
}

function clearSession() {
  window.localStorage.removeItem(API_CONFIG.authTokenStorageKey);
  window.localStorage.removeItem(API_CONFIG.authUserStorageKey);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const stored = window.localStorage.getItem(API_CONFIG.authUserStorageKey);
    const token = window.localStorage.getItem(API_CONFIG.authTokenStorageKey);
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        clearSession();
      }
    }
    setIsLoading(false);
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    const result = await authService.login({ email, password });
    persistSession(result.token, result.user);
    setUser(result.user);
  }, []);

  const register = React.useCallback(async (email: string, password: string, displayName: string) => {
    const result = await authService.register({ email, password, displayName });
    persistSession(result.token, result.user);
    setUser(result.user);
  }, []);

  const logout = React.useCallback(() => {
    clearSession();
    setUser(null);
    router.push(ROUTES.home);
  }, [router]);

  const refreshUser = React.useCallback(async () => {
    const profile = await authService.me();
    setUser(profile);
    window.localStorage.setItem(API_CONFIG.authUserStorageKey, JSON.stringify(profile));
  }, []);

  const value = React.useMemo(
    () => ({ user, isLoading, login, register, logout, refreshUser }),
    [user, isLoading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
