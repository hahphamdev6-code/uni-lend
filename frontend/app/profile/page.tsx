"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  getCurrentUser,
  getSessionSnapshot,
  logoutUser,
  subscribeToAuth,
  type UserProfile,
} from "../../lib/mock-auth";

export default function ProfilePage() {
  const router = useRouter();
  const [logoutError, setLogoutError] = useState("");
  const sessionSnapshot = useSyncExternalStore(subscribeToAuth, getSessionSnapshot, () => "__loading__");
  const profileState = useMemo(() => {
    if (sessionSnapshot === "__loading__") return { status: "loading" as const };
    if (sessionSnapshot === null) return { status: "unauthenticated" as const };

    try {
      const user = getCurrentUser();
      return user
        ? { status: "authenticated" as const, user }
        : { status: "unauthenticated" as const };
    } catch (loadError) {
      return {
        status: "error" as const,
        message: loadError instanceof Error ? loadError.message : "Không thể tải hồ sơ.",
      };
    }
  }, [sessionSnapshot]);

  useEffect(() => {
    if (profileState.status === "unauthenticated") router.replace("/login");
  }, [profileState, router]);

  const user: UserProfile | null =
    profileState.status === "authenticated" ? profileState.user : null;
  const error = profileState.status === "error" ? profileState.message : logoutError;

  function handleLogout() {
    try {
      logoutUser();
      router.replace("/");
    } catch {
      setLogoutError("Không thể đăng xuất trên trình duyệt này. Vui lòng thử lại.");
    }
  }

  if (profileState.status === "loading" || profileState.status === "unauthenticated") {
    return <main className="profile-loading" role="status">Đang tải hồ sơ...</main>;
  }

  return (
    <main className="auth-page profile-page">
      <header className="auth-header">
        <Link className="brand" href="/" aria-label="UniLend - về trang chủ">
          <span className="brand-mark" aria-hidden="true">u</span>
          <span>uni<span className="brand-accent">lend</span></span>
        </Link>
        <button className="auth-home-link logout-button" onClick={handleLogout} type="button">Đăng xuất</button>
      </header>
      <section className="profile-card">
        <span className="section-kicker">Tài khoản UniLend</span>
        <div className="profile-identity">
          <span className="profile-avatar" aria-hidden="true">
            {user?.fullName.trim().charAt(0).toLocaleUpperCase("vi") || "U"}
          </span>
          <div>
            <h1>{user?.fullName}</h1>
            <p>Thành viên cộng đồng UniLend</p>
          </div>
        </div>
        {error && <p className="form-alert" role="alert">{error}</p>}
        <dl className="profile-details">
          <div><dt>Họ và tên</dt><dd>{user?.fullName}</dd></div>
          <div><dt>Email</dt><dd>{user?.email}</dd></div>
          <div>
            <dt>Tham gia từ</dt>
            <dd>{user ? new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(user.createdAt)) : ""}</dd>
          </div>
        </dl>
        <Link className="profile-home-link" href="/">Khám phá món đồ</Link>
      </section>
      <p className="auth-disclaimer">Hồ sơ thử nghiệm — dữ liệu chỉ lưu trên trình duyệt này. Không sử dụng mật khẩu thật.</p>
    </main>
  );
}
