"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AuthUser = {
  id?: number;
  fullName: string;
  shortName: string;
  email: string;
  avatar: string;
  verified: boolean;
  activeRentalsCount: number;
  activeRentalTitle: string;
  activeRentalDue: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  user: AuthUser;
  favorites: string[];
  login: (payload?: { email?: string; fullName?: string; token?: string }) => void;
  loginAccount: (payload: { email: string; password: string }) => Promise<void>;
  registerAccount: (payload: {
    fullName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  toggleFavorite: (id: string) => void;
};

const DEFAULT_USER: AuthUser = {
  fullName: "Alex Morgan",
  shortName: "Alex",
  email: "alex.m@example.com",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD5fP1JIrMlUiIkk3Iqk2lHsXZ6ErjEMC42bRCzU2bVysxnDWtM66et8v08R-iir5htXEzbkQb2KTkCLyU-SIi6ssn8B5C4yLqdqCnRUIZCRRamoibNji-i9gd1ATzGsYWYWUa3ynPWsidws6kb7rqbCQjg4Xn2uctM02V5W9Rq1HDRpHOvhh3CYmel5FLjHqseggP2fHiHhuvFOD0GA1jFfXuwcEKRFuyGtzmyfRLkx_VdAzR4OjgeIA",
  verified: true,
  activeRentalsCount: 1,
  activeRentalTitle: "MacBook Pro M3",
  activeRentalDue: "due in 3 days",
};

const DEFAULT_FAVORITES = ["sony-a7-iv", "rimowa-original-cabin"];
const STORAGE_KEY = "unilend_web_auth_state_v1";
const AUTH_TOKEN_KEY = "unilend.accessToken";
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"
).replace(/\/$/, "");

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  errors?: { field?: string; message?: string }[];
};

type BackendAuthData = {
  id?: number;
  email?: string;
  fullName?: string;
  emailVerified?: boolean;
  avatarUrl?: string | null;
  token?: string;
};

async function requestAuthApi<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new Error(
      "Không thể kết nối đến Backend (http://localhost:8080). Hãy chắc chắn Backend và MySQL đang chạy."
    );
  }

  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await response.json()) as ApiEnvelope<T>;
  } catch {
    body = null;
  }

  if (!response.ok || body?.success === false || !body?.data) {
    const fieldMessage = body?.errors?.find((err) => err?.message)?.message;
    const message =
      fieldMessage ||
      body?.message ||
      `Yêu cầu thất bại (HTTP ${response.status}).`;
    throw new Error(message);
  }

  return body.data;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser>(DEFAULT_USER);
  const [favorites, setFavorites] = useState<string[]>(DEFAULT_FAVORITES);
  const [hydrated, setHydrated] = useState(false);

  const applyUserFromBackend = useCallback((data: BackendAuthData) => {
    const nextFullName = data.fullName?.trim() || DEFAULT_USER.fullName;
    const nextShortName = nextFullName.split(/\s+/)[0] || "User";
    setUser((prev) => ({
      ...prev,
      id: data.id ?? prev.id,
      fullName: nextFullName,
      shortName: nextShortName,
      email: data.email?.trim() || prev.email,
      avatar: data.avatarUrl || prev.avatar,
      verified: Boolean(data.emailVerified ?? prev.verified),
    }));
    setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    let active = true;

    async function hydrateAuth() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as {
            isAuthenticated?: boolean;
            user?: Partial<AuthUser>;
            favorites?: string[];
          };
          if (active && parsed.user) {
            setUser((prev) => ({ ...prev, ...parsed.user }));
          }
          if (active && Array.isArray(parsed.favorites)) {
            setFavorites(parsed.favorites);
          }
        }

        const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
          try {
            const profile = await requestAuthApi<BackendAuthData>("/users/me", {
              method: "GET",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (active) applyUserFromBackend(profile);
          } catch {
            window.localStorage.removeItem(AUTH_TOKEN_KEY);
            if (active) setIsAuthenticated(false);
          }
        }
      } catch {
        // Ignore storage errors
      } finally {
        if (active) setHydrated(true);
      }
    }

    void hydrateAuth();
    return () => {
      active = false;
    };
  }, [applyUserFromBackend]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ isAuthenticated, user, favorites })
      );
    } catch {
      // Ignore storage errors
    }
  }, [hydrated, isAuthenticated, user, favorites]);

  const login = useCallback(
    (payload?: { email?: string; fullName?: string; token?: string }) => {
      const trimmedName = payload?.fullName?.trim();
      const trimmedEmail = payload?.email?.trim();

      if (payload?.token) {
        try {
          window.localStorage.setItem(AUTH_TOKEN_KEY, payload.token);
        } catch {
          // Ignore storage errors
        }
      }

      setUser((prev) => {
        const nextFullName = trimmedName || prev.fullName || DEFAULT_USER.fullName;
        const nextShortName = nextFullName.split(/\s+/)[0] || "Alex";
        return {
          ...prev,
          fullName: nextFullName,
          shortName: nextShortName,
          email: trimmedEmail || prev.email || DEFAULT_USER.email,
        };
      });
      setIsAuthenticated(true);
    },
    []
  );

  const registerAccount = useCallback(
    async (payload: { fullName: string; email: string; password: string }) => {
      const data = await requestAuthApi<BackendAuthData>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName: payload.fullName.trim(),
          email: payload.email.trim(),
          password: payload.password,
        }),
      });
      if (data.token) {
        window.localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      }
      applyUserFromBackend(data);
    },
    [applyUserFromBackend]
  );

  const loginAccount = useCallback(
    async (payload: { email: string; password: string }) => {
      const data = await requestAuthApi<BackendAuthData>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: payload.email.trim(),
          password: payload.password,
        }),
      });
      if (data.token) {
        window.localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      }
      applyUserFromBackend(data);
    },
    [applyUserFromBackend]
  );

  const logout = useCallback(() => {
    try {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
    } catch {
      // Ignore storage errors
    }
    setIsAuthenticated(false);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      user,
      favorites,
      login,
      loginAccount,
      registerAccount,
      logout,
      toggleFavorite,
    }),
    [
      isAuthenticated,
      user,
      favorites,
      login,
      loginAccount,
      registerAccount,
      logout,
      toggleFavorite,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
