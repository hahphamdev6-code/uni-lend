"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  ApiClientError,
  AUTH_TOKEN_CHANGE_EVENT,
  clearAuthToken,
  getAuthToken,
} from "../lib/api/apiClient";
import type { UserProfileResponse } from "../lib/api/types";
import { userService } from "../lib/api/userService";

export type UserRole = "USER" | "ADMIN";

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  university: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  roles: UserRole[];
};

type AuthState =
  | { status: "loading"; user: null; error: null }
  | { status: "unauthenticated"; user: null; error: null }
  | { status: "authenticated"; user: UserProfile; error: null }
  | { status: "error"; user: null; error: string };

type AuthContextValue = AuthState & {
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  refreshUser: () => void;
  logout: () => void;
};

type ResolvedProfile =
  | { key: string; status: "authenticated"; user: UserProfile }
  | { key: string; status: "error"; error: string };

const AuthContext = createContext<AuthContextValue | null>(null);

function subscribeToAuthToken(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(AUTH_TOKEN_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(AUTH_TOKEN_CHANGE_EVENT, callback);
  };
}

function getTokenSnapshot(): string {
  return getAuthToken() ?? "";
}

function normalizeRoles(roles: string[]): UserRole[] {
  const normalized = roles
    .map((role) => role.replace(/^ROLE_/, "").toUpperCase())
    .filter((role): role is UserRole => role === "USER" || role === "ADMIN");
  return normalized.length > 0 ? normalized : ["USER"];
}

function toUserProfile(profile: UserProfileResponse): UserProfile {
  return {
    id: String(profile.id),
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone ?? null,
    university: profile.university ?? null,
    avatarUrl: profile.avatarUrl ?? null,
    emailVerified: Boolean(profile.emailVerified),
    averageRating: profile.averageRating ?? 0,
    reviewCount: profile.reviewCount ?? 0,
    createdAt: profile.createdAt,
    roles: normalizeRoles(profile.roles ?? []),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const tokenSnapshot = useSyncExternalStore(
    subscribeToAuthToken,
    getTokenSnapshot,
    () => "__ssr__",
  );
  const [reloadCount, setReloadCount] = useState(0);
  const [resolved, setResolved] = useState<ResolvedProfile | null>(null);

  const requestKey =
    tokenSnapshot && tokenSnapshot !== "__ssr__"
      ? `${tokenSnapshot}:${reloadCount}`
      : "";

  useEffect(() => {
    if (!requestKey) return;

    const controller = new AbortController();

    userService
      .getMe({ signal: controller.signal })
      .then((profile) => {
        if (controller.signal.aborted) return;
        setResolved({
          key: requestKey,
          status: "authenticated",
          user: toUserProfile(profile),
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (
          error instanceof ApiClientError &&
          (error.statusCode === 401 || error.statusCode === 403)
        ) {
          clearAuthToken();
          return;
        }
        setResolved({
          key: requestKey,
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Không thể xác thực phiên đăng nhập.",
        });
      });

    return () => controller.abort();
  }, [requestKey]);

  const refreshUser = useCallback(() => {
    setReloadCount((current) => current + 1);
  }, []);

  const logout = useCallback(() => {
    userService.logout();
  }, []);

  const state = useMemo<AuthState>(() => {
    if (tokenSnapshot === "__ssr__") {
      return { status: "loading", user: null, error: null };
    }
    if (!tokenSnapshot) {
      return { status: "unauthenticated", user: null, error: null };
    }
    if (!resolved || resolved.key !== requestKey) {
      return { status: "loading", user: null, error: null };
    }
    if (resolved.status === "error") {
      return { status: "error", user: null, error: resolved.error };
    }
    return { status: "authenticated", user: resolved.user, error: null };
  }, [requestKey, resolved, tokenSnapshot]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isAuthenticated: state.status === "authenticated",
      hasRole: (role) =>
        state.status === "authenticated" && state.user.roles.includes(role),
      refreshUser,
      logout,
    }),
    [logout, refreshUser, state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}
