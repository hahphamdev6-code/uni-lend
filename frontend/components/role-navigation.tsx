"use client";

import Link from "next/link";
import { useAuth } from "./auth-provider";

export function RoleNavigation({
  className,
  registerClassName,
}: {
  className?: string;
  registerClassName?: string;
}) {
  const auth = useAuth();
  if (auth.status === "loading" || auth.status === "error") return null;

  if (auth.status === "unauthenticated") {
    return (
      <>
        <Link className={className} href="/login">Đăng nhập</Link>
        <Link className={registerClassName} href="/register">Đăng ký</Link>
      </>
    );
  }

  return (
    <>
      <Link className={className} href="/profile">Hồ sơ</Link>
      <Link className={className} href="/my">Quản lý cá nhân</Link>
      {auth.hasRole("ADMIN") && (
        <>
          <Link className={className} href="/admin">Quản trị</Link>
          <Link className={className} href="/admin/items">Quản lý đồ</Link>
        </>
      )}
    </>
  );
}
