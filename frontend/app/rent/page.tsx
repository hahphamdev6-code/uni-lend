"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { itemService } from "../../lib/api/itemService";
import { useAuth } from "../auth-context";
import {
  CATEGORY_LABELS_VI,
  CATEGORY_TABS,
  CONDITION_LABELS_VI,
  mergeBackendItemsWithCatalog,
  POPULAR_TAGS,
  RENTAL_ITEMS,
  SORT_LABELS_VI,
  type CategoryTab,
  type ItemCondition,
  type RentalListingItem,
  type SortOption,
} from "../rental-catalog";
import { AppHeader } from "../app-header";

const SORT_OPTIONS: SortOption[] = [
  "Recommended",
  "Recently Added",
  "Price: Low to High",
  "Price: High to Low",
  "Highest Rated",
];

export default function RentalListingsPage() {
  const { isAuthenticated, user, favorites, toggleFavorite, login } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryTab>("All Items");
  const [locationFilter, setLocationFilter] = useState("Tất cả cơ sở Campus");
  const [minPrice, setMinPrice] = useState(10);
  const [maxPrice, setMaxPrice] = useState(250);
  const [sliderValue, setSliderValue] = useState(250);
  const [selectedConditions, setSelectedConditions] = useState<ItemCondition[]>([
    "Like New",
    "Good",
    "Fair",
  ]);
  const [rentalDuration, setRentalDuration] = useState<"Daily" | "Weekly" | "Monthly">("Daily");
  const [localPickup, setLocalPickup] = useState(true);
  const [courierDelivery, setCourierDelivery] = useState(true);
  const [availability, setAvailability] = useState<"now" | "upcoming">("now");
  const [sortBy, setSortBy] = useState<SortOption>("Recommended");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activePage, setActivePage] = useState(1);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showActiveRentalCard, setShowActiveRentalCard] = useState(false);
  const [itemsSource, setItemsSource] = useState<RentalListingItem[]>(RENTAL_ITEMS);
  const [isSyncedWithDb, setIsSyncedWithDb] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setItemsSource(mergeBackendItemsWithCatalog([]));

    async function fetchLiveItems() {
      try {
        const page = await itemService.list({ page: 0, size: 50 });
        if (!isMounted) return;
        const merged = mergeBackendItemsWithCatalog(page?.content ?? []);
        setItemsSource(merged);
        if (page?.content && page.content.length > 0) {
          setIsSyncedWithDb(true);
        }
      } catch {
        if (!isMounted) return;
        setItemsSource(mergeBackendItemsWithCatalog([]));
      }
    }
    fetchLiveItems();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleCondition = (cond: ItemCondition) => {
    setSelectedConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Items");
    setLocationFilter("Tất cả cơ sở Campus");
    setMinPrice(10);
    setMaxPrice(250);
    setSliderValue(250);
    setSelectedConditions(["Like New", "Good", "Fair"]);
    setRentalDuration("Daily");
    setLocalPickup(true);
    setCourierDelivery(true);
    setAvailability("now");
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
      const matchesLocation =
        locationFilter === "Tất cả cơ sở Campus" ||
        item.location.toLowerCase().includes(locationFilter.toLowerCase());
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
      const matchesPrice = item.pricePerDay >= minPrice && item.pricePerDay <= maxPrice;
      const matchesCondition =
        selectedConditions.length === 0 || selectedConditions.includes(item.condition);
      return (
        matchesCategory &&
        matchesLocation &&
        matchesQuery &&
        matchesPrice &&
        matchesCondition
      );
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
  }, [
    itemsSource,
    searchQuery,
    selectedCategory,
    locationFilter,
    minPrice,
    maxPrice,
    selectedConditions,
    sortBy,
    showFavoritesOnly,
    favorites,
  ]);

  return (
    <div className="text-on-surface antialiased min-h-screen flex flex-col text-body-md relative isolate overflow-x-hidden bg-[#fafbfc]">
      {/* Synchronized Header */}
      <AppHeader
        showFavoritesOnly={showFavoritesOnly}
        onSelectFavorites={() => {
          setShowFavoritesOnly((prev) => !prev);
          document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
        }}
        onSelectActiveRental={() => {
          setShowActiveRentalCard(true);
        }}
      />

      {/* MAIN VIEWPORT CANVAS */}
      <main className="flex-1 w-full max-w-[1360px] mx-auto px-6 md:px-12 pt-8 pb-16">
        {/* 1. COMPACT HERO SECTION */}
        <section className="mb-10 text-left">
          <div className="max-w-3xl">
            {isAuthenticated ? (
              <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-full text-label-md bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface border border-outline-variant/40 shadow-xs mb-3.5">
                <span className="text-base leading-none">👋</span>
                <span className="font-semibold text-primary">
                  Chào mừng trở lại, {user.shortName}
                </span>
                <span className="w-1 h-1 rounded-full bg-outline" />
                <span className="text-on-surface-variant">
                  Đang thuê: <strong>{user.activeRentalTitle}</strong> ({user.activeRentalDue})
                </span>
                <button
                  type="button"
                  onClick={() => setShowActiveRentalCard((prev) => !prev)}
                  className="inline-flex items-center gap-0.5 text-secondary hover:underline font-semibold ml-1 cursor-pointer"
                >
                  <span>Xem nhanh</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-md tracking-wider uppercase bg-surface-container-low text-on-surface-variant border border-outline-variant/40 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> Kho Thiết Bị Đã Xác Thực
              </span>
            )}

            {/* Active Rental Quick Summary Drawer */}
            {isAuthenticated && showActiveRentalCard && (
              <div className="mb-5 p-4 rounded-2xl bg-surface-container-lowest/95 backdrop-blur-md border border-secondary/25 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    alt={RENTAL_ITEMS[1].title}
                    src={RENTAL_ITEMS[1].image}
                    className="w-16 h-12 rounded-xl object-cover border border-outline-variant/30 flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-secondary/10 text-secondary">
                        Đơn đang thuê • #UL-782190
                      </span>
                      <span className="text-body-sm text-outline">Còn 3 ngày</span>
                    </div>
                    <p className="text-title-md text-primary font-bold mt-0.5">
                      {RENTAL_ITEMS[1].title}
                    </p>
                    <p className="text-body-sm text-on-surface-variant">
                      Chủ thiết bị: {RENTAL_ITEMS[1].ownerName} ({RENTAL_ITEMS[1].ownerUniversity}) • Nhận &amp; trả tại Smart Locker Khu B
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Link
                    href="/my-rentals"
                    className="px-3.5 py-2 rounded-lg bg-primary text-on-primary text-label-md hover:bg-neutral-800 transition-colors"
                  >
                    Quản lý đơn thuê
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowActiveRentalCard(false)}
                    className="px-3 py-2 rounded-lg border border-outline-variant/40 text-on-surface-variant hover:text-primary text-label-md transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}

            <h1 className="text-3xl sm:text-headline-lg font-semibold text-primary tracking-tight mb-2">
              Tìm Đúng Thiết Bị Bạn Cần. Thuê Linh Hoạt Theo Ngày.
            </h1>
            <p className="text-body-lg text-on-surface-variant font-normal">
              Khám phá {itemsSource.length} sản phẩm chuyên dụng từ máy ảnh G-Master, MacBook M3
              Max, Flycam DJI đến âm thanh biểu diễn mà không tốn chi phí mua mới
              {isSyncedWithDb ? " • Đã đồng bộ trực tiếp với cơ sở dữ liệu MySQL." : "."}
            </p>
          </div>

          {/* Integrated Search Bar & Trending Tags */}
          <div className="mt-6 max-w-4xl">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col sm:flex-row items-center p-1.5 bg-surface-container-lowest/95 backdrop-blur-sm border border-outline-variant/40 rounded-xl shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/5 transition-all"
            >
              <div className="flex items-center w-full px-3 py-2">
                <span className="material-symbols-outlined text-outline mr-3">search</span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-0 text-title-md font-normal text-on-surface placeholder:text-outline focus:ring-0 p-0 focus:outline-none"
                  placeholder="Tìm tên thiết bị, thương hiệu hoặc danh mục (VD: Sony A7IV, MacBook, DJI, Bose)..."
                  type="text"
                />
              </div>
              <button
                className="btn-unilend-cta w-full sm:w-auto mt-2 sm:mt-0 px-7 py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
                type="submit"
              >
                <span>Tìm kiếm</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </form>

            {/* Quick Search Tags */}
            <div className="flex items-center flex-wrap gap-2 mt-3 pt-1">
              <span className="text-body-sm text-outline">Gợi ý nhanh:</span>
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSearchQuery(searchQuery === tag ? "" : tag)}
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
          </div>
        </section>

        {/* 2. HORIZONTAL CATEGORY SELECTOR */}
        <section id="categories" className="mb-10 pb-2 border-b border-outline-variant/20">
          <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setSelectedCategory(tab);
                  setShowFavoritesOnly(false);
                }}
                className={
                  selectedCategory === tab && !showFavoritesOnly
                    ? "px-4 py-2 rounded-full text-label-lg bg-primary text-on-primary whitespace-nowrap shadow-sm transition-all flex-shrink-0"
                    : "px-4 py-2 rounded-full text-label-lg bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface-variant border border-outline-variant/30 hover:border-primary hover:text-primary whitespace-nowrap transition-all flex-shrink-0"
                }
              >
                {CATEGORY_LABELS_VI[tab]}
              </button>
            ))}
          </div>
        </section>

        {/* 3. MAIN CONTENT: TWO-COLUMN LISTING LAYOUT */}
        <div id="listings" className="flex flex-col lg:flex-row gap-8 items-start">
          {/* A. LEFT FILTER SIDEBAR */}
          <aside className="w-full lg:w-72 flex-shrink-0 bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl border border-outline-variant/30 p-6 lg:sticky lg:top-24">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">tune</span>
                <span className="text-title-md text-primary">Bộ lọc tìm kiếm</span>
              </div>
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-label-md text-on-surface-variant hover:text-primary transition-colors underline underline-offset-4"
              >
                Đặt lại
              </button>
            </div>

            {/* Filter 1: Location */}
            <div className="mb-6">
              <label className="block text-label-lg text-primary mb-2" htmlFor="location-select">
                Khu vực nhận đồ
              </label>
              <div className="relative">
                <select
                  id="location-select"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full h-11 bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-3 text-body-md text-on-surface focus:border-primary focus:ring-0 focus:outline-none"
                >
                  <option value="Tất cả cơ sở Campus">Tất cả cơ sở Campus</option>
                  <option value="Khu Công Nghệ">Khu Công Nghệ Trung Tâm</option>
                  <option value="Cơ Sở Bắc">Cơ Sở Bắc (North Campus)</option>
                  <option value="Khoa Kiến Trúc">Khoa Kiến Trúc &amp; Xây Dựng</option>
                  <option value="Khu Ký Túc Xá">Khu Ký Túc Xá &amp; Studio</option>
                  <option value="Trung Tâm Sinh Viên">Trung Tâm Sinh Viên</option>
                </select>
              </div>
            </div>

            {/* Filter 2: Daily Price Range */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-label-lg text-primary">Mức giá / ngày</label>
                <span className="text-label-numeric text-outline">
                  ${minPrice} - ${maxPrice}+
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="relative w-1/2">
                  <span className="absolute left-2.5 top-2.5 text-body-sm text-outline">$</span>
                  <input
                    type="number"
                    min={0}
                    max={maxPrice}
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
                    className="w-full h-9 pl-6 pr-2 bg-surface text-body-sm border border-outline-variant/40 rounded-lg text-on-surface focus:border-primary focus:ring-0 focus:outline-none"
                  />
                </div>
                <span className="text-outline text-body-sm">đến</span>
                <div className="relative w-1/2">
                  <span className="absolute left-2.5 top-2.5 text-body-sm text-outline">$</span>
                  <input
                    type="number"
                    min={minPrice}
                    max={500}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value) || 250)}
                    className="w-full h-9 pl-6 pr-2 bg-surface text-body-sm border border-outline-variant/40 rounded-lg text-on-surface focus:border-primary focus:ring-0 focus:outline-none"
                  />
                </div>
              </div>
              <input
                type="range"
                min={10}
                max={250}
                value={sliderValue}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setSliderValue(next);
                  setMaxPrice(next);
                }}
                className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Filter 3: Item Condition */}
            <div className="mb-6">
              <label className="block text-label-lg text-primary mb-2.5">Tình trạng thiết bị</label>
              <div className="space-y-2">
                {(
                  [
                    { label: "Like New", count: 11 },
                    { label: "Good", count: 4 },
                    { label: "Fair", count: 1 },
                  ] as const
                ).map(({ label, count }) => (
                  <label
                    key={label}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <span className="flex items-center text-body-md text-on-surface-variant group-hover:text-primary">
                      <input
                        type="checkbox"
                        checked={selectedConditions.includes(label)}
                        onChange={() => toggleCondition(label)}
                        className="rounded border-outline-variant/60 text-primary focus:ring-0 mr-2.5 accent-primary"
                      />
                      {CONDITION_LABELS_VI[label]}
                    </span>
                    <span className="text-label-md text-outline">{count}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter 4: Rental Duration */}
            <div className="mb-6">
              <label className="block text-label-lg text-primary mb-2.5">Chu kỳ thuê</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-container rounded-lg">
                {(
                  [
                    { key: "Daily", label: "Theo ngày" },
                    { key: "Weekly", label: "Theo tuần" },
                    { key: "Monthly", label: "Theo tháng" },
                  ] as const
                ).map((dur) => (
                  <button
                    key={dur.key}
                    type="button"
                    onClick={() => setRentalDuration(dur.key)}
                    className={
                      rentalDuration === dur.key
                        ? "py-1.5 text-label-md rounded bg-surface-container-lowest text-primary shadow-xs"
                        : "py-1.5 text-label-md rounded text-on-surface-variant hover:text-primary"
                    }
                  >
                    {dur.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 5: Fulfillment Method */}
            <div className="mb-6">
              <label className="block text-label-lg text-primary mb-2.5">
                Phương thức giao nhận
              </label>
              <div className="space-y-2">
                <label className="flex items-center text-body-md text-on-surface-variant cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localPickup}
                    onChange={(e) => setLocalPickup(e.target.checked)}
                    className="rounded border-outline-variant/60 text-primary focus:ring-0 mr-2.5 accent-primary"
                  />
                  Nhận tại Smart Locker (Miễn phí)
                </label>
                <label className="flex items-center text-body-md text-on-surface-variant cursor-pointer">
                  <input
                    type="checkbox"
                    checked={courierDelivery}
                    onChange={(e) => setCourierDelivery(e.target.checked)}
                    className="rounded border-outline-variant/60 text-primary focus:ring-0 mr-2.5 accent-primary"
                  />
                  Giao tận nơi trong khuôn viên
                </label>
              </div>
            </div>

            {/* Filter 6: Availability */}
            <div>
              <label className="block text-label-lg text-primary mb-2.5">Trạng thái sẵn sàng</label>
              <div className="space-y-2">
                <label className="flex items-center text-body-md text-on-surface-variant cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    checked={availability === "now"}
                    onChange={() => setAvailability("now")}
                    className="border-outline-variant/60 text-primary focus:ring-0 mr-2.5 accent-primary"
                  />
                  Có sẵn ngay hôm nay
                </label>
                <label className="flex items-center text-body-md text-on-surface-variant cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    checked={availability === "upcoming"}
                    onChange={() => setAvailability("upcoming")}
                    className="border-outline-variant/60 text-primary focus:ring-0 mr-2.5 accent-primary"
                  />
                  Sắp trống lịch (7 ngày tới)
                </label>
              </div>
            </div>
          </aside>

          {/* B. RIGHT PRODUCT LISTING AREA */}
          <section className="flex-1 w-full">
            {/* Controls Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-outline-variant/20 gap-4">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-title-lg text-primary">
                    {showFavoritesOnly
                      ? `Đang hiển thị ${filteredItems.length} thiết bị yêu thích`
                      : `Hiển thị ${filteredItems.length} / ${itemsSource.length} thiết bị cho thuê`}
                  </h2>
                  {showFavoritesOnly && (
                    <button
                      type="button"
                      onClick={() => setShowFavoritesOnly(false)}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-md bg-[#f83256]/10 text-[#f83256] hover:bg-[#f83256]/20 transition-colors"
                    >
                      <span>Mục đã lưu</span>
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  )}
                </div>
                <p className="text-body-sm text-on-surface-variant">
                  Tất cả thiết bị đều được bảo vệ bởi SafeGuarantee™ $5,000
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-outline-variant/40 rounded-lg bg-surface-container-lowest/90 backdrop-blur-sm px-3 py-1.5">
                  <span className="text-label-md text-outline mr-2">Sắp xếp:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-transparent text-label-lg text-primary border-0 p-0 focus:ring-0 focus:outline-none cursor-pointer"
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
                        ? "p-1 rounded bg-surface-container-high text-primary"
                        : "p-1 rounded text-outline hover:text-primary transition-colors"
                    }
                    title="Chế độ lưới"
                  >
                    <span className="material-symbols-outlined text-base">grid_view</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={
                      viewMode === "list"
                        ? "p-1 rounded bg-surface-container-high text-primary"
                        : "p-1 rounded text-outline hover:text-primary transition-colors"
                    }
                    title="Chế độ danh sách"
                  >
                    <span className="material-symbols-outlined text-base">view_list</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 15+ CURATED PRODUCT CARDS GRID */}
            {filteredItems.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
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
                            <h3 className="text-title-md text-primary group-hover:text-secondary transition-colors line-clamp-1">
                              {item.title}
                            </h3>
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
              <div className="bg-surface-container-lowest/90 backdrop-blur-sm rounded-2xl border border-outline-variant/30 p-12 text-center">
                <p className="text-title-md text-primary mb-1">
                  Không tìm thấy thiết bị phù hợp
                </p>
                <p className="text-body-sm text-on-surface-variant mb-4">
                  Hãy thử thay đổi từ khóa tìm kiếm, khoảng giá hoặc bộ lọc danh mục.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-5 py-2 rounded-lg bg-primary text-on-primary text-label-lg hover:bg-neutral-800 transition-all"
                >
                  Đặt lại tất cả bộ lọc
                </button>
              </div>
            )}

            {/* LOAD MORE & PAGINATION BAR */}
            <div className="mt-12 pt-8 border-t border-outline-variant/20 flex flex-col items-center justify-center gap-4">
              <div className="text-body-sm text-outline">
                Đang hiển thị{" "}
                <span className="font-semibold text-primary">{filteredItems.length}</span> trên tổng
                số <span className="font-semibold text-primary">{itemsSource.length}</span> thiết bị
              </div>
              <div className="w-full max-w-xs bg-surface-container-high h-1.5 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-primary h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((filteredItems.length / Math.max(1, itemsSource.length)) * 100)
                    )}%`,
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={activePage === 1}
                  onClick={() => setActivePage((p) => Math.max(1, p - 1))}
                  className="px-3.5 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest/80 text-on-surface-variant text-label-lg hover:border-primary hover:text-primary transition-all disabled:opacity-40"
                >
                  Trang trước
                </button>
                {[1, 2].map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setActivePage(page)}
                    className={
                      activePage === page
                        ? "w-10 h-10 rounded-lg bg-primary text-on-primary text-label-lg"
                        : "w-10 h-10 rounded-lg border border-outline-variant/30 bg-surface-container-lowest/80 hover:border-primary text-on-surface-variant text-label-lg"
                    }
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setActivePage((p) => Math.min(2, p + 1))}
                  className="px-3.5 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest/80 text-on-surface-variant text-label-lg hover:border-primary hover:text-primary transition-all"
                >
                  Trang tiếp
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-surface-container-lowest/80 backdrop-blur-md border-t border-outline-variant/20 py-10 mt-auto">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-body-sm text-outline">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">UNILEND.™</span>
            <span>© 2026 UniLend Technologies Inc. Bảo lưu mọi quyền.</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link className="hover:text-primary transition-colors" href="/">
              Chính sách bảo mật
            </Link>
            <Link className="hover:text-primary transition-colors" href="/">
              Điều khoản dịch vụ
            </Link>
            <Link className="hover:text-primary transition-colors" href="/">
              Bảo hiểm người thuê
            </Link>
            <Link className="hover:text-primary transition-colors" href="/create-listing">
              Đăng đồ cho thuê
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
