"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { UserHeaderActions } from "./user-header-actions";

export type AppHeaderProps = {
  onSelectFavorites?: () => void;
  onSelectActiveRental?: () => void;
  showFavoritesOnly?: boolean;
  className?: string;
};

export function AppHeader({
  onSelectFavorites,
  onSelectActiveRental,
  showFavoritesOnly = false,
  className = "",
}: AppHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const isHomeActive = pathname === "/";
  const isRentActive = pathname === "/rent" || pathname.startsWith("/items");
  const isCreateActive = pathname === "/create-listing" || pathname === "/create";

  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection(null);
      return;
    }
    const handleScroll = () => {
      const featured = document.getElementById("featured");
      const impact = document.getElementById("impact");
      const scrollPos = window.scrollY + 220;

      if (impact && scrollPos >= impact.offsetTop) {
        setActiveSection("community");
      } else if (featured && scrollPos >= featured.offsetTop) {
        setActiveSection("categories");
      } else {
        setActiveSection(null);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const handleCommunityClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      document.getElementById("impact")?.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-black/[0.05] shadow-xs transition-all duration-150 ${className}`}
    >
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 flex items-center justify-between h-16 relative">
        {/* Left: Brand Logo (Close to edge but with comfortable padding) */}
        <div className="flex items-center flex-shrink-0 z-10">
          <Link
            aria-label="UNILEND Trang chủ"
            className="flex items-center gap-1.5 group select-none focus:outline-none"
            href="/"
            onClick={() => {
              if (pathname === "/") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            <span className="font-bold tracking-tight text-2xl text-black flex items-center">
              UNILEND.
              <span className="text-xs font-semibold uppercase align-super ml-0.5 tracking-normal">
                TM
              </span>
            </span>
          </Link>
        </div>

        {/* Center: Toolbar Navigation (Trang chủ • Danh mục • Đăng cho thuê • Khám phá • Cộng đồng) - Exactly Centered */}
        <nav
          aria-label="Điều hướng chính"
          className="hidden md:flex items-center space-x-1 lg:space-x-2 text-[13.5px] font-medium text-[#4B505D] absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
        >
          <Link
            href="/"
            onClick={() => {
              if (pathname === "/") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className={`relative py-1.5 px-3 rounded-md transition-colors text-[13.5px] font-medium ${
              isHomeActive && !activeSection
                ? "text-black font-semibold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-black after:rounded-full"
                : "text-[#525763] hover:text-black hover:bg-black/[0.03]"
            }`}
          >
            Trang chủ
          </Link>

          <a
            href="/#featured"
            onClick={handleCategoryClick}
            className={`relative py-1.5 px-3 rounded-md transition-colors text-[13.5px] font-medium cursor-pointer ${
              activeSection === "categories"
                ? "text-black font-semibold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-black after:rounded-full"
                : "text-[#525763] hover:text-black hover:bg-black/[0.03]"
            }`}
          >
            Danh mục
          </a>

          <Link
            href="/create-listing"
            className={`relative py-1.5 px-3 rounded-md transition-colors text-[13.5px] font-medium ${
              isCreateActive
                ? "text-black font-semibold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-black after:rounded-full"
                : "text-[#525763] hover:text-black hover:bg-black/[0.03]"
            }`}
          >
            Đăng cho thuê
          </Link>

          <Link
            href="/rent"
            className={`relative py-1.5 px-3 rounded-md transition-colors text-[13.5px] font-medium ${
              isRentActive
                ? "text-black font-semibold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-black after:rounded-full"
                : "text-[#525763] hover:text-black hover:bg-black/[0.03]"
            }`}
          >
            Khám phá
          </Link>

          <a
            href="/#impact"
            onClick={handleCommunityClick}
            className={`relative py-1.5 px-3 rounded-md transition-colors text-[13.5px] font-medium cursor-pointer ${
              activeSection === "community"
                ? "text-black font-semibold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-black after:rounded-full"
                : "text-[#525763] hover:text-black hover:bg-black/[0.03]"
            }`}
          >
            Cộng đồng
          </a>
        </nav>

        {/* Right Action Cluster & Mobile Menu Toggle (Close to edge but with comfortable padding) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 z-10">
          <UserHeaderActions
            onSelectFavorites={onSelectFavorites}
            onSelectActiveRental={onSelectActiveRental}
            showFavoritesOnly={showFavoritesOnly}
          />

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            aria-label="Toggle Navigation Menu"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-black/[0.05] bg-white/95 backdrop-blur-md px-5 py-4 space-y-1 shadow-lg animate-fadeIn">
          <Link
            href="/"
            onClick={() => {
              if (pathname === "/") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
              setMobileMenuOpen(false);
            }}
            className={`block py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              isHomeActive && !activeSection
                ? "bg-black/[0.05] text-black font-semibold"
                : "text-[#525763] hover:text-black hover:bg-black/[0.03]"
            }`}
          >
            Trang chủ
          </Link>
          <a
            href="/#featured"
            onClick={handleCategoryClick}
            className={`block py-2 px-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeSection === "categories"
                ? "bg-black/[0.05] text-black font-semibold"
                : "text-[#525763] hover:text-black hover:bg-black/[0.03]"
            }`}
          >
            Danh mục
          </a>
          <Link
            href="/create-listing"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              isCreateActive
                ? "bg-black/[0.05] text-black font-semibold"
                : "text-[#525763] hover:text-black hover:bg-black/[0.03]"
            }`}
          >
            Đăng cho thuê
          </Link>
          <Link
            href="/rent"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              isRentActive
                ? "bg-black/[0.05] text-black font-semibold"
                : "text-[#525763] hover:text-black hover:bg-black/[0.03]"
            }`}
          >
            Khám phá
          </Link>
          <a
            href="/#impact"
            onClick={handleCommunityClick}
            className={`block py-2 px-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeSection === "community"
                ? "bg-black/[0.05] text-black font-semibold"
                : "text-[#525763] hover:text-black hover:bg-black/[0.03]"
            }`}
          >
            Cộng đồng
          </a>
        </div>
      )}
    </header>
  );
}

export default AppHeader;
