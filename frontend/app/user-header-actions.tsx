"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./auth-context";

type UserHeaderActionsProps = {
  onSelectFavorites?: () => void;
  onSelectActiveRental?: () => void;
  showFavoritesOnly?: boolean;
};

export function UserHeaderActions({
  onSelectFavorites,
  onSelectActiveRental,
  showFavoritesOnly = false,
}: UserHeaderActionsProps) {
  const router = useRouter();
  const { isAuthenticated, user, favorites, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState<"profile" | "notifications" | "messages" | null>(
    null
  );
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <Link
          className="px-5 py-2 rounded-full border border-black/10 bg-white/70 text-sm font-medium text-[#0D0E12] hover:bg-white transition-all shadow-sm"
          href="/login"
        >
          Đăng nhập
        </Link>
        <Link
          className="btn-unilend-cta px-5 py-2 rounded-full text-sm font-semibold shadow-sm"
          href="/register"
        >
          Đăng ký
        </Link>
      </div>
    );
  }

  const handleActiveRentalClick = () => {
    setOpenMenu(null);
    if (onSelectActiveRental) {
      onSelectActiveRental();
    } else {
      router.push("/my-rentals");
    }
  };

  const handleFavoritesClick = () => {
    setOpenMenu(null);
    if (onSelectFavorites) {
      onSelectFavorites();
    } else {
      router.push("/rent?filter=favorites");
    }
  };

  return (
    <div ref={containerRef} className="flex items-center space-x-3 relative">
      {/* My Rentals Quick Access Pill */}
      <button
        type="button"
        onClick={handleActiveRentalClick}
        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant/30 transition-colors duration-150 cursor-pointer"
      >
        <span className="material-symbols-outlined text-sm text-secondary">inventory_2</span>
        <span>Đơn thuê của tôi</span>
        <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
        <span className="text-secondary font-bold">{user.activeRentalsCount}</span>
      </button>

      {/* Messages Button */}
      <div className="relative">
        <button
          type="button"
          aria-label="Tin nhắn"
          onClick={() => setOpenMenu((prev) => (prev === "messages" ? null : "messages"))}
          className="relative w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors duration-150 cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">chat_bubble_outline</span>
        </button>

        {openMenu === "messages" && (
          <div className="absolute right-0 mt-2.5 w-76 bg-surface-container-lowest/95 rounded-2xl border border-outline-variant/30 shadow-lg p-3 z-50 text-left backdrop-blur-md">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-outline-variant/20">
              <span className="text-title-md text-primary font-semibold">Tin nhắn</span>
              <span className="text-label-md text-secondary">1 hội thoại đang mở</span>
            </div>
            <button
              type="button"
              onClick={handleActiveRentalClick}
              className="w-full flex items-start gap-3 p-2 rounded-xl hover:bg-surface-container-low transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-label-md font-bold text-primary flex-shrink-0">
                ER
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-body-sm font-semibold text-primary truncate">
                    Elena R. (Chủ thiết bị)
                  </p>
                  <span className="text-[11px] text-outline">2 giờ trước</span>
                </div>
                <p className="text-body-sm text-on-surface-variant line-clamp-1">
                  Nhắn mình nếu bạn cần thêm bộ sạc nhanh USB-C cho Sony A7 IV nhé!
                </p>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Notifications Button with Coral Dot */}
      <div className="relative">
        <button
          type="button"
          aria-label="Thông báo"
          onClick={() => {
            setOpenMenu((prev) => (prev === "notifications" ? null : "notifications"));
            setHasUnreadNotifications(false);
          }}
          className="relative w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors duration-150 cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
          {hasUnreadNotifications && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#f83256] ring-2 ring-surface-container-lowest" />
          )}
        </button>

        {openMenu === "notifications" && (
          <div className="absolute right-0 mt-2.5 w-80 bg-surface-container-lowest/95 rounded-2xl border border-outline-variant/30 shadow-lg p-3 z-50 text-left backdrop-blur-md">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-outline-variant/20">
              <span className="text-title-md text-primary font-semibold">Thông báo</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-secondary/10 text-secondary">
                Mới
              </span>
            </div>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={handleActiveRentalClick}
                className="w-full flex items-start gap-2.5 p-2 rounded-xl bg-surface-container-low/70 hover:bg-surface-container-low transition-colors text-left"
              >
                <span className="material-symbols-outlined text-secondary text-lg mt-0.5">
                  schedule
                </span>
                <div>
                  <p className="text-body-sm font-semibold text-primary">
                    Nhắc lịch trả thiết bị
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    <strong>{user.activeRentalTitle}</strong> ({user.activeRentalDue}).
                  </p>
                </div>
              </button>
              <div className="flex items-start gap-2.5 p-2 rounded-xl text-left">
                <span className="material-symbols-outlined text-emerald-600 text-lg mt-0.5 fill-icon">
                  verified
                </span>
                <div>
                  <p className="text-body-sm font-semibold text-primary">
                    Đã xác thực sinh viên (.edu)
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    Tài khoản của bạn được bảo vệ bởi gói SafeGuarantee™ $5,000.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Profile Trigger & Dropdown Wrapper */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenMenu((prev) => (prev === "profile" ? null : "profile"))}
          className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-outline-variant/40 bg-surface-container-lowest hover:border-primary transition-all duration-150 focus:outline-none cursor-pointer"
        >
          <div className="relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
            <img
              alt={user.fullName}
              className="w-full h-full object-cover"
              src={user.avatar}
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-surface-container-lowest" />
          </div>
          <span className="text-sm text-primary font-medium">{user.shortName}</span>
          <span className="material-symbols-outlined text-sm text-outline">expand_more</span>
        </button>

        {/* Open User Profile Dropdown Menu */}
        {openMenu === "profile" && (
          <div className="absolute right-0 mt-2.5 w-64 bg-surface-container-lowest/95 rounded-2xl border border-outline-variant/30 shadow-lg p-2 z-50 text-left backdrop-blur-md">
            {/* Header: User info */}
            <div className="px-3 py-2.5 mb-1">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-title-md text-primary font-bold line-clamp-1">
                  {user.fullName}
                </p>
                {user.verified && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-surface-container text-secondary flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[12px] fill-icon">
                      verified
                    </span>
                    Đã xác thực
                  </span>
                )}
              </div>
              <p className="text-body-sm text-outline truncate">{user.email}</p>
            </div>

            <div className="h-px bg-outline-variant/20 my-1" />

            {/* Menu Items */}
            <div className="space-y-0.5 text-body-sm">
              <button
                type="button"
                onClick={() => {
                  setOpenMenu(null);
                  router.push("/profile");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-on-surface hover:bg-surface-container-low transition-colors duration-150"
              >
                <span className="material-symbols-outlined text-lg text-outline">person</span>
                <span>Hồ sơ cá nhân</span>
              </button>

              <button
                type="button"
                onClick={handleActiveRentalClick}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-on-surface hover:bg-surface-container-low transition-colors duration-150"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-lg text-outline">
                    inventory_2
                  </span>
                  <span>Đơn thuê của tôi</span>
                </div>
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-secondary/10 text-secondary">
                  {user.activeRentalsCount} đang thuê
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpenMenu(null);
                  router.push("/rent");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-on-surface hover:bg-surface-container-low transition-colors duration-150"
              >
                <span className="material-symbols-outlined text-lg text-outline">
                  storefront
                </span>
                <span>Khám phá thiết bị</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpenMenu(null);
                  router.push("/owner-management");
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-on-surface hover:bg-surface-container-low transition-colors duration-150"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-lg text-secondary">
                    real_estate_agent
                  </span>
                  <span>Quản lý cho thuê</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-secondary/10 text-secondary">
                  Chủ thiết bị
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpenMenu(null);
                  router.push("/create-listing");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-on-surface hover:bg-surface-container-low transition-colors duration-150"
              >
                <span className="material-symbols-outlined text-lg text-outline">
                  add_circle
                </span>
                <span>Đăng đồ cho thuê</span>
              </button>

              <button
                type="button"
                onClick={handleFavoritesClick}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors duration-150 ${
                  showFavoritesOnly
                    ? "bg-surface-container-low text-primary font-semibold"
                    : "text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`material-symbols-outlined text-lg ${
                      showFavoritesOnly ? "text-[#f83256] fill-icon" : "text-outline"
                    }`}
                  >
                    favorite
                  </span>
                  <span>Mục đã lưu</span>
                </div>
                <span className="text-label-md text-outline">{favorites.length}</span>
              </button>
            </div>

            <div className="h-px bg-outline-variant/20 my-1.5" />

            {/* Logout Action */}
            <button
              type="button"
              onClick={() => {
                setOpenMenu(null);
                logout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors duration-150"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              <span className="font-medium">Đăng xuất</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
