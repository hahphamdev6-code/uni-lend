"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { itemService } from "@/lib/api/itemService";
import { useAuth } from "./auth-context";
import {
  CATEGORY_LABELS_VI,
  CATEGORY_TABS,
  CONDITION_LABELS_VI,
  mergeBackendItemsWithCatalog,
  POPULAR_TAGS,
  RENTAL_ITEMS,
  SORT_LABELS_VI,
  type CategoryTab,
  type RentalItem,
  type SortOption,
} from "./rental-catalog";
import { AppHeader } from "./app-header";

const SORT_OPTIONS: SortOption[] = [
  "Recommended",
  "Recently Added",
  "Price: Low to High",
  "Price: High to Low",
  "Highest Rated",
];

const CATEGORY_ICONS: Record<CategoryTab, string> = {
  "All Items": "apps",
  Electronics: "devices",
  "Home Appliances": "kitchen",
  Furniture: "chair",
  "Tools & Equipment": "build",
  "Travel & Outdoor": "luggage",
  "Sports & Fitness": "fitness_center",
  "Events & Party": "celebration",
  "Other Items": "category",
};

export default function HomePage() {
  const { isAuthenticated, favorites, toggleFavorite, login } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryTab>("All Items");
  const [sortBy, setSortBy] = useState<SortOption>("Recommended");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [itemsSource, setItemsSource] = useState<RentalItem[]>(RENTAL_ITEMS);
  const [isSyncedWithDb, setIsSyncedWithDb] = useState(false);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { "All Items": itemsSource.length };
    for (const item of itemsSource) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [itemsSource]);

  useEffect(() => {
    let isMounted = true;
    setItemsSource(mergeBackendItemsWithCatalog([]));

    itemService
      .list({ page: 0, size: 50 })
      .then((page) => {
        if (!isMounted) return;
        const merged = mergeBackendItemsWithCatalog(page?.content ?? []);
        setItemsSource(merged);
        if (page?.content && page.content.length > 0) {
          setIsSyncedWithDb(true);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setItemsSource(mergeBackendItemsWithCatalog([]));
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Items");
    setSortBy("Recommended");
    setShowFavoritesOnly(false);
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = itemsSource.filter((item) => {
      if (showFavoritesOnly && !favorites.includes(item.id)) {
        return false;
      }
      const matchesCategory =
        selectedCategory === "All Items" || item.category === selectedCategory;
      const searchableText = [
        item.title,
        item.brand,
        item.category,
        CATEGORY_LABELS_VI[item.category],
        item.location,
        ...(item.keywords ?? []),
      ]
        .join(" ")
        .toLowerCase();
      const matchesQuery = q.length === 0 || searchableText.includes(q);
      return matchesCategory && matchesQuery;
    });

    if (sortBy === "Price: Low to High") {
      return [...list].sort((a, b) => a.pricePerDay - b.pricePerDay);
    }
    if (sortBy === "Price: High to Low") {
      return [...list].sort((a, b) => b.pricePerDay - a.pricePerDay);
    }
    if (sortBy === "Highest Rated") {
      return [...list].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    }
    return list;
  }, [itemsSource, searchQuery, selectedCategory, sortBy, showFavoritesOnly, favorites]);

  return (
    <>
      {/* Synchronized Navigation Header */}
      <AppHeader
        showFavoritesOnly={showFavoritesOnly}
        onSelectFavorites={() => {
          setShowFavoritesOnly((prev) => !prev);
          document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* Main Content */}
      <main
        id="top"
        className="w-full max-w-[1440px] mx-auto px-8 md:px-14 pt-6 md:pt-12 pb-20 flex-1"
      >
        {/* Hero Two-Column Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Content & Copy */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center pt-2 lg:pt-0">
            <div className="bg-white/80 border border-black/5 text-[#555A68] rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2 mb-5 shadow-xs backdrop-blur-sm w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Cộng đồng Chia sẻ Thiết bị Sinh viên • Campus Commons
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] xl:text-[48px] font-semibold tracking-[-0.025em] text-[#0A0B0E] leading-[1.18] mb-6">
              Thuê Dễ Dàng.
              <br />
              Chia Sẻ Thông Minh.
            </h1>

            {/* Subtitle Description */}
            <p className="text-sm sm:text-base text-[#555A68] leading-relaxed max-w-lg mb-7 font-normal">
              Khám phá hơn {itemsSource.length} thiết bị công nghệ, máy ảnh, âm thanh và dụng cụ
              chuyên nghiệp từ cộng đồng sinh viên đã xác thực (.edu). Nhận đồ nhanh qua Smart
              Locker 24/7 cùng bảo hiểm SafeGuarantee™ $5,000.
            </p>

            {/* Pill Search Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSelectedCategory("All Items");
                setShowFavoritesOnly(false);
                document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full max-w-lg bg-white/90 backdrop-blur-md rounded-full border border-black/10 p-1.5 pl-4 flex items-center gap-2 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.04)] mb-3"
            >
              <span className="material-symbols-outlined text-neutral-400 text-[20px]">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-sm font-normal text-[#0D0E12] placeholder:text-neutral-400 p-0"
                placeholder="Tìm máy ảnh Sony, MacBook M3, Flycam DJI, loa Bose..."
                type="text"
              />
              <button
                type="submit"
                aria-label="Tìm kiếm thiết bị"
                className="btn-unilend-cta rounded-full p-2.5 flex items-center justify-center flex-shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>

            {/* Popular Quick Tags (Unified with Borrow Page) */}
            <div className="flex items-center flex-wrap gap-2 mb-6">
              <span className="text-body-sm text-outline">Phổ biến:</span>
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSearchQuery(searchQuery === tag ? "" : tag);
                    setSelectedCategory("All Items");
                    setShowFavoritesOnly(false);
                    document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`px-2.5 py-1 text-label-md rounded-full transition-colors ${
                    searchQuery === tag
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-low hover:bg-surface-container text-on-surface"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <Link
                className="btn-unilend-cta px-7 py-3.5 text-[15px] font-semibold rounded-full cursor-pointer"
                href="/rent"
              >
                Khám phá thiết bị
              </Link>
              <Link
                className="btn-unilend-cta-soft group gap-2 px-6 py-3.5 text-[15px] font-semibold rounded-full cursor-pointer"
                href="/create-listing"
              >
                <span>Đăng đồ cho thuê</span>
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Showcase */}
          <div className="lg:col-span-6 xl:col-span-7 flex justify-center lg:justify-end items-center relative select-none">
            {/* Soft decorative radial backing */}
            <div
              aria-hidden="true"
              className="absolute w-[460px] h-[460px] rounded-full bg-gradient-to-br from-rose-100/40 via-purple-100/30 to-transparent blur-3xl pointer-events-none -z-10"
            />

            {/* Showcase Card Container */}
            <div className="relative max-w-[620px] w-full">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-black/[0.05] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-transform duration-300 hover:-translate-y-1">
                <div className="relative rounded-xl overflow-hidden h-72 sm:h-80 bg-neutral-100 mb-4">
                  <img
                    className="w-full h-full object-cover"
                    alt={RENTAL_ITEMS[0].title}
                    src={RENTAL_ITEMS[0].image}
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#0D0E12] border border-black/5 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Sẵn sàng cho thuê • Smart Locker Khu A
                  </div>
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-[#0D0E12] border border-black/5 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                    Bảo vệ SafeGuarantee™ • Nhận máy 24/7
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={RENTAL_ITEMS[0].ownerAvatar}
                      alt={RENTAL_ITEMS[0].ownerName}
                      className="w-9 h-9 rounded-full object-cover border border-black/10"
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-[#0D0E12]">{RENTAL_ITEMS[0].ownerName}</span>
                        <span className="material-symbols-outlined text-purple-600 text-[15px] fill-icon">
                          verified
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400">{RENTAL_ITEMS[0].ownerUniversity} • Khu Công Nghệ (0.4 km)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-white/90 px-2.5 py-1 rounded-full border border-black/5 text-xs font-semibold text-[#0D0E12] shadow-xs">
                    <span className="material-symbols-outlined text-amber-500 text-[14px] fill-icon">
                      star
                    </span>
                    <span>4.9</span>
                    <span className="text-neutral-400 font-normal">(128 lượt thuê)</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-black/[0.05] flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#0D0E12]">
                      Bộ Máy Ảnh Mirrorless Sony Alpha A7 IV &amp; Lens 24-70mm GM
                    </h4>
                    <p className="text-xs text-[#555A68]">
                      Full-frame 33MP + Lens 24-70mm f/2.8 GM + 2 Thẻ nhớ CFexpress
                    </p>
                  </div>
                  <Link
                    href="/items/sony-a7-iv"
                    className="btn-unilend-cta text-xs font-semibold px-4 py-2 rounded-full flex-shrink-0 cursor-pointer"
                  >
                    Thuê ngay • $45/ngày
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mt-24 pt-12 border-t border-black/[0.06]" id="how-it-works">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-gray-500 mb-2">
              GIẢI PHÁP CHIA SẺ THÔNG MINH
            </h2>
            <h2 className="text-2xl sm:text-[32px] font-semibold text-[#0D0E12] tracking-tight">
              An Tâm Mượn &amp; Cho Thuê Thiết Bị Trong Khuôn Viên Trường
            </h2>
          </div>

          {/* 4-Column Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="feature-card bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-black/[0.04] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.03)]">
              <div className="w-11 h-11 rounded-xl bg-gray-50 border border-black/[0.05] flex items-center justify-center text-[#0D0E12] mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-[#0D0E12] mb-1.5">
                Thiết Bị Kiểm Định Kỹ
              </h3>
              <p className="text-sm text-[#666D80] leading-relaxed">
                Tất cả máy ảnh, laptop đồ họa, âm thanh và dụng cụ đều được kiểm tra tình trạng và
                phụ kiện đi kèm trước mỗi lần bàn giao.
              </p>
            </div>

            <div className="feature-card bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-black/[0.04] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.03)]">
              <div className="w-11 h-11 rounded-xl bg-gray-50 border border-black/[0.05] flex items-center justify-center text-[#0D0E12] mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-[#0D0E12] mb-1.5">
                Nhận Đồ Smart Locker 24/7
              </h3>
              <p className="text-sm text-[#666D80] leading-relaxed">
                Chọn ngày thuê linh hoạt, nhận mã PIN một lần (OTP) hoặc quét QR tại hệ thống tủ
                khóa thông minh đặt khắp khuôn viên.
              </p>
            </div>

            <div className="feature-card bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-black/[0.04] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.03)]">
              <div className="w-11 h-11 rounded-xl bg-gray-50 border border-black/[0.05] flex items-center justify-center text-[#0D0E12] mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-[#0D0E12] mb-1.5">
                Bảo Vệ SafeGuarantee™
              </h3>
              <p className="text-sm text-[#666D80] leading-relaxed">
                Mọi thành viên đều xác thực email học thuật (.edu) kèm điểm uy tín minh bạch và quỹ
                bảo hiểm thiết bị lên tới $5,000.
              </p>
            </div>

            <div className="feature-card bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-black/[0.04] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.03)]">
              <div className="w-11 h-11 rounded-xl bg-gray-50 border border-black/[0.05] flex items-center justify-center text-[#0D0E12] mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-[#0D0E12] mb-1.5">
                Tạo Thu Nhập Thụ Động
              </h3>
              <p className="text-sm text-[#666D80] leading-relaxed">
                Biến những thiết bị ít dùng thành nguồn thu nhập ổn định hàng tháng với cơ chế giữ
                cọc Escrow tự động, an toàn tuyệt đối.
              </p>
            </div>
          </div>
        </section>

        {/* Curated Collections Section (Unified with Borrow Listing Functionality & UI) */}
        <section className="mt-24 pt-12 border-t border-black/[0.06]" id="featured">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-gray-500 mb-2">
              DANH MỤC THIẾT BỊ NỔI BẬT
            </h2>
            <h2 className="text-2xl sm:text-[32px] font-semibold text-[#0D0E12] tracking-tight mb-2">
              Chọn Thiết Bị Cho Dự Án Tiếp Theo Của Bạn
            </h2>
            <p className="text-sm text-[#666D80] font-normal">
              Đồng bộ trực tiếp {itemsSource.length} sản phẩm chất lượng cao tại các trạm Campus Hub
              {isSyncedWithDb ? " (Đã kết nối MySQL Backend)" : ""}.
            </p>
          </div>

          {/* Horizontal Category Selector (Wrap Layout - Shows All Tabs Cleanly) */}
          <div className="mb-8 pb-4 border-b border-outline-variant/20">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
              {CATEGORY_TABS.map((tab) => {
                const isSelected = selectedCategory === tab && !showFavoritesOnly;
                const count = categoryCounts[tab] ?? 0;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(tab);
                      setShowFavoritesOnly(false);
                      if (searchQuery) {
                        setSearchQuery("");
                      }
                    }}
                    className={
                      isSelected
                        ? "inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-sm font-medium bg-primary text-on-primary shadow-xs transition-all flex-shrink-0 cursor-pointer"
                        : "inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-sm font-medium bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface-variant border border-outline-variant/30 hover:border-primary hover:text-primary transition-all flex-shrink-0 cursor-pointer"
                    }
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {CATEGORY_ICONS[tab]}
                    </span>
                    <span>{CATEGORY_LABELS_VI[tab]}</span>
                    <span
                      className={`ml-0.5 px-2 py-0.5 text-xs rounded-full font-medium ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-surface-container text-on-surface-variant"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls Header (Item Count, Active Filter Pills, Inline Quick Search, Sort By, Grid/List View Toggle) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-6 border-b border-outline-variant/20 gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="text-title-lg font-semibold text-primary">
                  {showFavoritesOnly
                    ? `Đang hiển thị ${filteredItems.length} thiết bị đã lưu`
                    : `Hiển thị ${filteredItems.length} / ${itemsSource.length} thiết bị cho thuê`}
                </h3>

                {/* Active Filter: Favorites */}
                {showFavoritesOnly && (
                  <button
                    type="button"
                    onClick={() => setShowFavoritesOnly(false)}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f83256]/10 text-[#f83256] hover:bg-[#f83256]/20 transition-colors cursor-pointer"
                  >
                    <span>Mục đã lưu</span>
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                )}

                {/* Active Filter: Selected Category */}
                {selectedCategory !== "All Items" && !showFavoritesOnly && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("All Items")}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                    title="Bỏ lọc danh mục"
                  >
                    <span>{CATEGORY_LABELS_VI[selectedCategory]}</span>
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                )}

                {/* Active Filter: Search Query */}
                {searchQuery.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-800 hover:bg-amber-500/20 transition-colors cursor-pointer"
                    title="Xóa từ khóa tìm kiếm"
                  >
                    <span>Từ khóa: &ldquo;{searchQuery}&rdquo;</span>
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                )}

                {/* Clear All Filters Button */}
                {(selectedCategory !== "All Items" || searchQuery.trim().length > 0 || showFavoritesOnly) && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-medium transition-colors ml-1 cursor-pointer"
                  >
                    Đặt lại tất cả
                  </button>
                )}
              </div>
              <p className="text-body-sm text-on-surface-variant font-normal">
                Thiết bị chính hãng từ các chủ sở hữu đã xác thực danh tính và bảo hiểm
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-3">
              {/* Inline Quick Search */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Lọc nhanh thiết bị..."
                  className="pl-8 pr-7 py-1.5 text-xs sm:text-sm rounded-lg border border-outline-variant/40 bg-surface-container-lowest/90 text-primary placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary w-40 sm:w-48 transition-all font-normal"
                />
                <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-sm text-outline pointer-events-none">
                  search
                </span>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-outline hover:text-primary cursor-pointer"
                    aria-label="Xóa tìm kiếm"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                )}
              </div>

              {/* Sort By Select */}
              <div className="flex items-center border border-outline-variant/40 rounded-lg bg-surface-container-lowest/90 backdrop-blur-sm px-3 py-1.5">
                <span className="text-xs sm:text-label-md text-outline mr-2 whitespace-nowrap font-medium">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent text-xs sm:text-label-lg text-primary border-0 p-0 focus:ring-0 focus:outline-none cursor-pointer font-medium"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {SORT_LABELS_VI[opt]}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Modes */}
              <div className="hidden sm:flex items-center border border-outline-variant/40 rounded-lg p-1 bg-surface-container-lowest/90 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={
                    viewMode === "grid"
                      ? "p-1 rounded bg-surface-container-high text-primary cursor-pointer"
                      : "p-1 rounded text-outline hover:text-primary transition-colors cursor-pointer"
                  }
                  title="Dạng lưới"
                >
                  <span className="material-symbols-outlined text-base">grid_view</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={
                    viewMode === "list"
                      ? "p-1 rounded bg-surface-container-high text-primary cursor-pointer"
                      : "p-1 rounded text-outline hover:text-primary transition-colors cursor-pointer"
                  }
                  title="Dạng danh sách"
                >
                  <span className="material-symbols-outlined text-base">view_list</span>
                </button>
              </div>
            </div>
          </div>

          {/* Unified Product Cards Grid / List */}
          {filteredItems.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                  : "flex flex-col gap-4"
              }
            >
              {filteredItems.map((item) => {
                const isFavorited = isAuthenticated && favorites.includes(item.id);
                return (
                  <article
                    key={item.id}
                    className={`group bg-surface-container-lowest/95 backdrop-blur-sm rounded-2xl border border-outline-variant/30 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex ${
                      viewMode === "list" ? "flex-col sm:flex-row" : "flex-col"
                    }`}
                  >
                    <div
                      className={`relative bg-surface-container-low overflow-hidden ${
                        viewMode === "list"
                          ? "w-full sm:w-64 aspect-[4/3] flex-shrink-0"
                          : "w-full aspect-[4/3]"
                      }`}
                    >
                      <Link href={`/items/${item.id}`} className="block w-full h-full">
                        <img
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          alt={item.alt}
                          src={item.image}
                        />
                      </Link>
                      <span
                        className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm text-label-md border border-outline-variant/30 pointer-events-none ${
                          item.condition === "Like New"
                            ? "text-primary"
                            : "text-on-surface-variant"
                        }`}
                      >
                        {CONDITION_LABELS_VI[item.condition] ?? item.condition}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (!isAuthenticated) {
                            login();
                          }
                          toggleFavorite(item.id);
                        }}
                        aria-label={isFavorited ? "Bỏ lưu yêu thích" : "Lưu vào yêu thích"}
                        title={isFavorited ? "Đã lưu" : "Lưu vào yêu thích"}
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all shadow-xs cursor-pointer ${
                          isFavorited
                            ? "bg-surface-container-lowest/95 text-[#f83256] hover:scale-105"
                            : "bg-surface-container-lowest/90 text-on-surface hover:text-error"
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-base ${
                            isFavorited ? "fill-icon" : ""
                          }`}
                        >
                          favorite
                        </span>
                      </button>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-label-md text-outline uppercase tracking-wider mb-1">
                          <span>{item.brand}</span>
                          <div className="flex items-center text-primary font-semibold">
                            <span className="material-symbols-outlined text-xs text-amber-500 mr-0.5 fill-icon">
                              star
                            </span>
                            <span>{item.rating.toFixed(1)}</span>
                            <span className="text-outline font-normal ml-0.5">
                              ({item.reviews})
                            </span>
                          </div>
                        </div>
                        <Link href={`/items/${item.id}`}>
                          <h4 className="text-title-md text-primary group-hover:text-secondary transition-colors line-clamp-1">
                            {item.title}
                          </h4>
                        </Link>
                        <div className="flex items-center text-body-sm text-outline mt-1.5">
                          <span className="material-symbols-outlined text-sm mr-1">
                            location_on
                          </span>
                          <span className="line-clamp-1">{item.location}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-outline-variant/15 text-xs text-on-surface-variant">
                          <img
                            src={item.ownerAvatar}
                            alt={item.ownerName}
                            className="w-5 h-5 rounded-full object-cover border border-outline-variant/40 flex-shrink-0"
                          />
                          <span className="truncate">
                            Chủ máy: <strong className="text-primary font-semibold">{item.ownerName}</strong>
                          </span>
                          <span className="text-outline">•</span>
                          <span className="truncate text-outline">{item.ownerUniversity}</span>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-outline-variant/20 flex items-center justify-between">
                        <div>
                          <span className="text-title-lg font-bold text-primary">
                            ${item.pricePerDay}
                          </span>
                          <span className="text-body-sm text-outline">/ngày</span>
                        </div>
                        <Link
                          className="inline-flex items-center text-label-lg text-primary hover:text-secondary group-hover:translate-x-0.5 transition-transform"
                          href={`/items/${item.id}`}
                        >
                          <span>Xem chi tiết</span>
                          <span className="material-symbols-outlined text-sm ml-1">
                            arrow_forward
                          </span>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="bg-surface-container-lowest/90 backdrop-blur-sm rounded-2xl p-12 border border-outline-variant/30 text-center">
              <span className="material-symbols-outlined text-4xl text-neutral-400 mb-3 block">
                search_off
              </span>
              <p className="text-title-md font-semibold text-primary mb-1">
                Không tìm thấy thiết bị phù hợp với bộ lọc
              </p>
              <p className="text-body-sm text-on-surface-variant max-w-md mx-auto mb-4 font-normal">
                {selectedCategory !== "All Items" && searchQuery
                  ? `Không có thiết bị nào trong danh mục "${CATEGORY_LABELS_VI[selectedCategory]}" khớp với từ khóa "${searchQuery}".`
                  : searchQuery
                  ? `Không tìm thấy thiết bị nào khớp với từ khóa "${searchQuery}".`
                  : `Hiện tại chưa có thiết bị nào trong danh mục "${CATEGORY_LABELS_VI[selectedCategory]}".`}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="px-4 py-2 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/5 transition-all cursor-pointer"
                  >
                    Xóa từ khóa &ldquo;{searchQuery}&rdquo;
                  </button>
                )}
                {selectedCategory !== "All Items" && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("All Items")}
                    className="px-4 py-2 rounded-lg border border-outline-variant/40 text-on-surface-variant text-sm font-medium hover:bg-surface-container transition-all cursor-pointer"
                  >
                    Xem tất cả danh mục
                  </button>
                )}
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-5 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-neutral-800 transition-all cursor-pointer"
                >
                  Hiển thị toàn bộ {itemsSource.length} thiết bị
                </button>
              </div>
            </div>
          )}

          {/* Browse Full Catalog CTA */}
          <div className="mt-10 flex justify-center">
            <Link
              href="/rent"
              className="btn-unilend-cta-soft gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold cursor-pointer"
            >
              <span>Xem toàn bộ {itemsSource.length} thiết bị trên Chợ cho thuê</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </section>

        {/* Community Impact Banner */}
        <section className="mt-24 pt-12 border-t border-black/[0.06]" id="impact">
          <div className="bg-white/75 backdrop-blur-md rounded-3xl border border-black/[0.05] p-8 lg:p-12 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.03)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 flex flex-col items-start pr-0 lg:pr-6">
                <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-100 text-xs font-semibold mb-4">
                  Cộng đồng UniLend Campus
                </span>
                <h2 className="text-2xl sm:text-[32px] font-semibold tracking-tight text-[#0A0B0E] mb-4">
                  Biến Thiết Bị Nhàn Rỗi Thành Giá Trị Cho Cộng Đồng
                </h2>
                <p className="text-[#555A68] text-sm sm:text-base leading-relaxed mb-7 font-normal">
                  Cho thuê máy ảnh, laptop, thiết bị âm thanh và dụng cụ kỹ thuật tới các bạn sinh
                  viên trong trường một cách an toàn tuyệt đối nhờ quỹ bảo chứng Escrow và Smart
                  Locker.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/create-listing"
                    className="btn-unilend-cta rounded-full px-7 py-3.5 text-sm font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <span>Đăng thiết bị cho thuê ngay</span>
                    <span className="material-symbols-outlined text-[18px]">add_task</span>
                  </Link>
                  <Link
                    href="/owner-management"
                    className="btn-unilend-cta-soft rounded-full px-6 py-3.5 text-sm font-semibold cursor-pointer"
                  >
                    Bảng điều khiển Chủ thiết bị
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-white/90 border border-black/[0.04] shadow-xs flex flex-col">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                    Thành viên xác thực
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#0D0E12] tracking-tight">
                    14,200+
                  </span>
                  <span className="text-xs text-neutral-500 mt-1">Trên 18 cơ sở đại học</span>
                </div>
                <div className="p-6 rounded-2xl bg-white/90 border border-black/[0.04] shadow-xs flex flex-col">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                    Thiết bị sẵn sàng
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#0D0E12] tracking-tight">
                    {itemsSource.length} mẫu chuẩn
                  </span>
                  <span className="text-xs text-neutral-500 mt-1">Đồng bộ trực tiếp với SQL</span>
                </div>
                <div className="p-6 rounded-2xl bg-white/90 border border-black/[0.04] shadow-xs flex flex-col">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                    Tỷ lệ trả đúng hạn
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#0D0E12] tracking-tight">
                    99.8%
                  </span>
                  <span className="text-xs text-neutral-500 mt-1">Kiểm tra qua Smart Locker</span>
                </div>
                <div className="p-6 rounded-2xl bg-white/90 border border-black/[0.04] shadow-xs flex flex-col">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                    Bảo hiểm UniLend
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#0D0E12] tracking-tight">
                    $5,000
                  </span>
                  <span className="text-xs text-neutral-500 mt-1">
                    Bảo vệ toàn diện mỗi đơn thuê
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Site Footer */}
      <footer
        id="contact"
        className="w-full max-w-[1440px] mx-auto px-8 md:px-14 py-8 border-t border-black/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500"
      >
        <p>© 2026 UNILEND.™ Technologies Inc. Bảo lưu mọi quyền.</p>
        <div className="flex items-center gap-6">
          <a className="hover:text-black transition-colors" href="#top">
            Chính sách bảo mật
          </a>
          <a className="hover:text-black transition-colors" href="#top">
            Điều khoản dịch vụ
          </a>
          <a className="hover:text-black transition-colors" href="#top">
            An toàn &amp; Bảo hiểm
          </a>
        </div>
      </footer>
    </>
  );
}
