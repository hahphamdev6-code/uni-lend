"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../components/auth-provider";
import { UserReviewSection } from "../../components/user-review-section";

export default function ProfilePage() {
  const router = useRouter();
  const auth = useAuth();
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    if (auth.status === "unauthenticated") router.replace("/login");
  }, [auth.status, router]);

  const user = auth.status === "authenticated" ? auth.user : null;
  const error = auth.status === "error" ? auth.error : logoutError;

  function handleLogout() {
    try {
      auth.logout();
      router.replace("/");
    } catch {
      setLogoutError("Không thể đăng xuất trên trình duyệt này. Vui lòng thử lại.");
    }
  }

  if (auth.status === "loading" || auth.status === "unauthenticated") {
    return <main className="profile-loading" role="status">Đang tải hồ sơ...</main>;
  }

  const parsedUserId = user ? Number(user.id) : NaN;

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
          {user?.phone && <div><dt>Số điện thoại</dt><dd>{user.phone}</dd></div>}
          {user?.university && <div><dt>Trường</dt><dd>{user.university}</dd></div>}
          <div>
            <dt>Tham gia từ</dt>
            <dd>{user?.createdAt ? new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(user.createdAt)) : ""}</dd>
          </div>
        </dl>
        <div className="profile-actions">
          <Link className="profile-home-link" href="/profile/edit">Sửa thông tin hồ sơ</Link>
          <Link className="profile-home-link profile-secondary-link" href="/">Khám phá món đồ</Link>
        </div>
        <UserReviewSection
          title="Đánh giá của bạn"
          userId={Number.isSafeInteger(parsedUserId) ? parsedUserId : undefined}
        />
      </section>
      <p className="auth-disclaimer">UniLend — nền tảng chia sẻ đồ dùng dành cho cộng đồng sinh viên.</p>
    </main>
  );
}
