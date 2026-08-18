"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { apiFetch, type ApiUser } from "@/lib/api";
import { loginUrl } from "@/lib/auth-client";
import {
  ACCESS_TOKEN_REFRESH_INTERVAL_MS,
  refreshAccessToken,
} from "@/lib/auth-session";

type AuthContextValue = {
  user: ApiUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
  requireAuth: (returnPath?: string) => boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await apiFetch<{ user: ApiUser }>("/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!user) return;

    const interval = window.setInterval(() => {
      void refreshAccessToken().then((ok) => {
        if (ok) void refresh();
      });
    }, ACCESS_TOKEN_REFRESH_INTERVAL_MS);

    const onFocus = () => {
      void refreshAccessToken().then((ok) => {
        if (ok) void refresh();
      });
    };

    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [user, refresh]);

  const requireAuth = useCallback(
    (returnPath?: string) => {
      if (loading) return false;
      if (user) return true;

      const path =
        returnPath ??
        (typeof window !== "undefined" ? window.location.pathname : "/");
      router.push(loginUrl(path));
      return false;
    },
    [loading, user, router],
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // clear client state even if request fails
    }
    setUser(null);
    router.push("/");
    router.refresh();
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      refresh,
      requireAuth,
      logout,
    }),
    [user, loading, refresh, requireAuth, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
