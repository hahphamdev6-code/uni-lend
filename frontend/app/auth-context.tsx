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
import { getSystemUser, isReliableImageUrl, SYSTEM_USERS } from "./rental-catalog";

export type AuthUser = {
  id: number;
  fullName: string;
  shortName: string;
  email: string;
  phone: string;
  university: string;
  department: string;
  avatar: string;
  verified: boolean;
  rating: number;
  reviews: number;
  activeRentalsCount: number;
  activeRentalTitle: string;
  activeRentalDue: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  user: AuthUser;
  favorites: string[];
  login: (payload?: {
    id?: number;
    email?: string;
    fullName?: string;
    token?: string;
  }) => void;
  loginAccount: (payload: { email: string; password: string }) => Promise<void>;
  registerAccount: (payload: {
    fullName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  toggleFavorite: (id: string) => void;
};

const ALEX_SYSTEM = SYSTEM_USERS[1]; // Alex Morgan (id=2)

const DEFAULT_USER: AuthUser = {
  id: ALEX_SYSTEM.id,
  fullName: ALEX_SYSTEM.fullName,
  shortName: ALEX_SYSTEM.shortName,
  email: ALEX_SYSTEM.email,
  phone: ALEX_SYSTEM.phone,
  university: ALEX_SYSTEM.university,
  department: ALEX_SYSTEM.department,
  avatar: ALEX_SYSTEM.avatar,
  verified: true,
  rating: ALEX_SYSTEM.rating,
  reviews: ALEX_SYSTEM.reviews,
  activeRentalsCount: 1,
  activeRentalTitle: 'Apple MacBook Pro 16" M3 Max',
  activeRentalDue: "còn 3 ngày",
};

const DEFAULT_FAVORITES = ["sony-a7-iv", "rimowa-original-cabin"];
const STORAGE_KEY = "unilend_web_auth_state_v2";
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
  phone?: string | null;
  university?: string | null;
  emailVerified?: boolean;
  avatarUrl?: string | null;
  averageRating?: number | null;
  reviewCount?: number | null;
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
    const matchedSys = getSystemUser({
      id: data.id,
      email: data.email,
      fullName: data.fullName,
    });
    const nextFullName = data.fullName?.trim() || matchedSys.fullName || DEFAULT_USER.fullName;
    const nextShortName = nextFullName.split(/\s+/)[0] || matchedSys.shortName;
    const validBackendAvatar = isReliableImageUrl(data.avatarUrl) ? data.avatarUrl : null;

    setUser((prev) => ({
      ...prev,
      id: data.id ?? matchedSys.id ?? prev.id,
      fullName: nextFullName,
      shortName: nextShortName,
      email: data.email?.trim() || matchedSys.email || prev.email,
      phone: data.phone?.trim() || matchedSys.phone || prev.phone,
      university: data.university?.trim() || matchedSys.university || prev.university,
      department: matchedSys.department || prev.department,
      avatar: validBackendAvatar || matchedSys.avatar || prev.avatar,
      verified: Boolean(data.emailVerified ?? true),
      rating: data.averageRating ?? matchedSys.rating ?? prev.rating,
      reviews: data.reviewCount ?? matchedSys.reviews ?? prev.reviews,
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
            const matchedSys = getSystemUser({
              id: parsed.user.id,
              email: parsed.user.email,
              fullName: parsed.user.fullName,
            });
            setUser((prev) => ({
              ...prev,
              ...parsed.user,
              id: parsed.user?.id ?? matchedSys.id,
              email:
                parsed.user?.email === "alex.m@example.com"
                  ? ALEX_SYSTEM.email
                  : parsed.user?.email || matchedSys.email,
              university: parsed.user?.university || matchedSys.university,
              avatar: isReliableImageUrl(parsed.user?.avatar)
                ? (parsed.user!.avatar as string)
                : matchedSys.avatar,
            }));
          }
          if (active && typeof parsed.isAuthenticated === "boolean") {
            setIsAuthenticated(parsed.isAuthenticated);
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
            // Keep local auth session if backend is offline
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
    (payload?: { id?: number; email?: string; fullName?: string; token?: string }) => {
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
        const matchedSys = getSystemUser({
          id: payload?.id ?? prev.id,
          email: trimmedEmail ?? prev.email,
          fullName: trimmedName ?? prev.fullName,
        });
        const nextFullName = trimmedName || matchedSys.fullName || prev.fullName || DEFAULT_USER.fullName;
        const nextShortName = nextFullName.split(/\s+/)[0] || matchedSys.shortName || "Alex";
        return {
          ...prev,
          id: payload?.id ?? matchedSys.id ?? prev.id,
          fullName: nextFullName,
          shortName: nextShortName,
          email: trimmedEmail || matchedSys.email || prev.email || DEFAULT_USER.email,
          phone: matchedSys.phone || prev.phone,
          university: matchedSys.university || prev.university,
          department: matchedSys.department || prev.department,
          avatar: matchedSys.avatar || prev.avatar,
          rating: matchedSys.rating || prev.rating,
          reviews: matchedSys.reviews || prev.reviews,
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
