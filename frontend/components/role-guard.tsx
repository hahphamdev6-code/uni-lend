"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type UserRole } from "./auth-provider";

type RoleGuardProps = {
  children: ReactNode;
  allowedRoles: UserRole[];
};

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();
  const auth = useAuth();

  const authorized =
    auth.status === "authenticated" &&
    allowedRoles.some((role) => auth.user.roles.includes(role));

  useEffect(() => {
    if (auth.status === "unauthenticated") router.replace("/login");
    else if (auth.status === "authenticated" && !authorized) router.replace("/forbidden");
  }, [auth.status, authorized, router]);

  if (auth.status === "loading" || (auth.status === "authenticated" && !authorized)) {
    return (
      <main className="profile-loading" role="status">
        {auth.status === "loading" ? "Đang kiểm tra quyền truy cập..." : "Đang chuyển hướng..."}
      </main>
    );
  }

  if (auth.status === "unauthenticated") {
    return <main className="profile-loading" role="status">Đang chuyển đến đăng nhập...</main>;
  }

  if (auth.status === "error") {
    return (
      <main className="profile-loading" role="alert">
        Không thể xác thực: {auth.error}
      </main>
    );
  }

  return <>{children}</>;
}
