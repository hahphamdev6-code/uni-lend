"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  getCurrentUser,
  getSessionSnapshot,
  subscribeToAuth,
  type UserProfile,
} from "../lib/mock-auth";

type AuthState =
  | { status: "loading"; user: null; error: null }
  | { status: "unauthenticated"; user: null; error: null }
  | { status: "authenticated"; user: UserProfile; error: null }
  | { status: "error"; user: null; error: string };

type AuthContextValue = AuthState & {
  isAuthenticated: boolean;
  hasRole: (role: UserProfile["roles"][number]) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const sessionSnapshot = useSyncExternalStore(
    subscribeToAuth,
    getSessionSnapshot,
    () => "__loading__",
  );

  const state = useMemo<AuthState>(() => {
    if (sessionSnapshot === "__loading__") {
      return { status: "loading", user: null, error: null };
    }
    if (!sessionSnapshot) {
      return { status: "unauthenticated", user: null, error: null };
    }

    try {
      const user = getCurrentUser();
      return user
        ? { status: "authenticated", user, error: null }
        : { status: "unauthenticated", user: null, error: null };
    } catch (error) {
      return {
        status: "error",
        user: null,
        error: error instanceof Error ? error.message : "Không thể xác thực phiên đăng nhập.",
      };
    }
  }, [sessionSnapshot]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isAuthenticated: state.status === "authenticated",
      hasRole: (role) => state.status === "authenticated" && state.user.roles.includes(role),
    }),
    [state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}
