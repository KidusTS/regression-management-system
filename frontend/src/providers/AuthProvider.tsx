"use client";
/* eslint-disable react-hooks/set-state-in-effect -- intentional: hydrate from localStorage / reset form when dialog opens */

import { createContext, useContext, useEffect, useState } from "react";
import type { AuthResponse, CurrentUser } from "@/features/auth/types/auth.types";

interface AuthContextValue {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** True when the JWT's `exp` claim is in the past (or the token is unreadable). */
function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp !== "number" || payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored && isTokenExpired(localStorage.getItem("token"))) {
      // Stale session from a previous visit: drop it so the guard sends us to /login.
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } else if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("user");
      }
    }
    setIsReady(true);
  }, []);

  const login = (data: AuthResponse) => {
    const currentUser: CurrentUser = {
      userId: data.userId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      roles: data.roles,
    };
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(currentUser));
    setUser(currentUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
