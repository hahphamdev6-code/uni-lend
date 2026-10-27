"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuth } from "../auth-context";
import {
  CATEGORY_TABS,
  POPULAR_TAGS,
  RENTAL_ITEMS,
  type CategoryTab,
  type ItemCondition,
  type SortOption,
} from "../rental-catalog";
import { UserHeaderActions } from "../user-header-actions";

export default function RentalListingsPage() {
  const { isAuthenticated, user, favorites, toggleFavorite, login } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryTab>("All Items");
  const [locationFilter, setLocationFilter] = useState("San Francisco Bay Area");
  const [minPrice, setMinPrice] = useState(10);
  const [maxPrice, setMaxPrice] = useState(250);
  const [sliderValue, setSliderValue] = useState(120);
  const [selectedConditions, setSelectedConditions] = useState<ItemCondition[]>([
    "Like New",
    "Good",
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

  const toggleCondition = (cond: ItemCondition) => {
    setSelectedConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Items");
    setLocationFilter("San Francisco Bay Area");
    setMinPrice(10);
    setMaxPrice(250);
    setSliderValue(120);
    setSelectedConditions(["Like New", "Good"]);
    setRentalDuration("Daily");
    setLocalPickup(true);
    setCourierDelivery(true);
    setAvailability("now");
    setSortBy("Recommended");
    setShowFavoritesOnly(false);
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = RENTAL_ITEMS.filter((item) => {
      if (showFavoritesOnly && !favorites.includes(item.id)) {
        return false;
      }
      const matchesCategory =
        selectedCategory === "All Items" || item.category === selectedCategory;
      const searchableText = [
        item.title,
        item.brand,
        item.category,
        item.location,
        ...(item.keywords ?? []),
      ]
        .join(" ")
        .toLowerCase();
      const matchesQuery = q.length === 0 || searchableText.includes(q);
      const matchesPrice = item.pricePerDay >= minPrice && item.pricePerDay <= maxPrice;
      const matchesCondition =
        selectedConditions.length === 0 || selectedConditions.includes(item.condition);
      return matchesCategory && matchesQuery && matchesPrice && matchesCondition;
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
    searchQuery,
    selectedCategory,
    minPrice,
    maxPrice,
    selectedConditions,
    sortBy,
    showFavoritesOnly,
    favorites,
  ]);

  return (
    <div className="text-on-surface antialiased min-h-screen flex flex-col text-body-md relative isolate overflow-x-hidden bg-[#fafbfc]">
      {/* TOP APP BAR (Shared Component Anchor) */}
      <header className="bg-white/80 backdrop-blur-md w-full top-0 sticky z-50 border-b border-black/[0.05] shadow-sm transition-all duration-150 ease-out">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 w-full flex items-center justify-between h-16">
          {/* Brand Anchor */}
          <Link
            className="text-title-lg font-bold tracking-tight text-primary flex items-center gap-1.5 focus:outline-none"
            href="/"
          >
            <span>UNILEND.™</span>
          </Link>

          {/* Desktop Navigation Links (Intent: 'Borrow' is active) */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#45464d]">
            <Link className="hover:text-black transition-colors" href="/">
              Home
            </Link>
            <a
              className="hover:text-black transition-colors cursor-pointer"
              href="#categories"
              onClick={(e) => {
                e.preventDefault();
                setSelectedCategory("All Items");
                setShowFavoritesOnly(false);
                document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Categories
            </a>
            <Link
              className="text-black font-semibold border-b-2 border-primary pb-0.5"
              href="/rent"
            >
              Borrow
            </Link>
            <Link className="hover:text-black transition-colors" href="/#how-it-works">
              Explore
            </Link>
            <Link className="hover:text-black transition-colors" href="/#contact">
              Contact us
            </Link>
          </nav>

          {/* Trailing Actions: Unified Authenticated / Guest Controls */}
          <UserHeaderActions
            showFavoritesOnly={showFavoritesOnly}
            onSelectFavorites={() => {
              setShowFavoritesOnly((prev) => !prev);
              document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
            }}
            onSelectActiveRental={() => {
              setShowActiveRentalCard(true);
            }}
          />
        </div>
      </header>

      {/* MAIN VIEWPORT CANVAS */}
      <main className="flex-1 w-full max-w-[1360px] mx-auto px-6 md:px-12 pt-8 pb-16">
        {/* 1. COMPACT HERO SECTION */}
        <section className="mb-10 text-left">
          <div className="max-w-3xl">
            {isAuthenticated ? (
              <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-full text-label-md bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface border border-outline-variant/40 shadow-xs mb-3.5">
                <span className="text-base leading-none">👋</span>
                <span className="font-semibold text-primary">
                  Welcome back, {user.shortName}
                </span>
                <span className="w-1 h-1 rounded-full bg-outline" />
                <span className="text-on-surface-variant">
                  Active rental: <strong>{user.activeRentalTitle}</strong> {user.activeRentalDue}
                </span>
                <button
                  type="button"
                  onClick={() => setShowActiveRentalCard((prev) => !prev)}
                  className="inline-flex items-center gap-0.5 text-secondary hover:underline font-semibold ml-1 cursor-pointer"
                >
                  <span>View Details</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-md tracking-wider uppercase bg-surface-container-low text-on-surface-variant border border-outline-variant/40 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> Verified Inventory
              </span>
            )}

            {/* Active Rental Quick Summary Drawer (when clicking View Details or My Rentals) */}
            {isAuthenticated && showActiveRentalCard && (
              <div className="mb-5 p-4 rounded-2xl bg-surface-container-lowest/95 backdrop-blur-md border border-secondary/25 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    alt='Apple MacBook Pro 16" M3 Max'
                    src={RENTAL_ITEMS[1].image}
                    className="w-16 h-12 rounded-xl object-cover border border-outline-variant/30 flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-secondary/10 text-secondary">
                        Active Loan • #UL-8492
                      </span>
                      <span className="text-body-sm text-outline">Due in 3 days</span>
                    </div>
                    <p className="text-title-md text-primary font-bold mt-0.5">
                      Apple MacBook Pro 16&quot; M3 Max
                    </p>
                    <p className="text-body-sm text-on-surface-variant">
                      Lender: Elena R. • Pickup &amp; Return at San Jose Hub
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("MacBook Pro M3");
                      setShowActiveRentalCard(false);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-primary text-on-primary text-label-md hover:bg-neutral-800 transition-colors"
                  >
                    Locate Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowActiveRentalCard(false)}
                    className="px-3 py-2 rounded-lg border border-outline-variant/40 text-on-surface-variant hover:text-primary text-label-md transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <h1 className="text-3xl sm:text-headline-lg text-primary tracking-tight mb-2">
              Find What You Need. Rent What Makes Sense.
            </h1>
            <p className="text-body-lg text-on-surface-variant">
              From everyday essentials to specialized equipment, find what you need without the cost
              of owning it.
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
                  placeholder="Search item name, brand, or category (e.g., Sony A7IV, Dyson, DeWalt)..."
                  type="text"
                />
              </div>
              <button
                className="w-full sm:w-auto mt-2 sm:mt-0 px-7 py-2.5 bg-primary text-on-primary text-label-lg rounded-lg hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 flex-shrink-0"
                type="submit"
              >
                <span>Search</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </form>

            {/* Quick Search Tags */}
            <div className="flex items-center flex-wrap gap-2 mt-3 pt-1">
              <span className="text-body-sm text-outline">Popular:</span>
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
                {tab}
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
                <span className="text-title-md text-primary">Filters</span>
              </div>
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-label-md text-on-surface-variant hover:text-primary transition-colors underline underline-offset-4"
              >
                Clear all
              </button>
            </div>

            {/* Filter 1: Location */}
            <div className="mb-6">
              <label className="block text-label-lg text-primary mb-2" htmlFor="location-select">
                Location
              </label>
              <div className="relative">
                <select
                  id="location-select"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full h-11 bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-3 text-body-md text-on-surface focus:border-primary focus:ring-0 focus:outline-none"
                >
                  <option>San Francisco Bay Area</option>
                  <option>New York, NY</option>
                  <option>Austin, TX</option>
                  <option>Seattle, WA</option>
                  <option>Los Angeles, CA</option>
                </select>
              </div>
            </div>

            {/* Filter 2: Daily Price Range */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-label-lg text-primary">Price per Day</label>
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
                <span className="text-outline text-body-sm">to</span>
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
              <label className="block text-label-lg text-primary mb-2.5">Item Condition</label>
              <div className="space-y-2">
                {(
                  [
                    { label: "Like New", count: 48 },
                    { label: "Good", count: 82 },
                    { label: "Fair", count: 19 },
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
                      {label}
                    </span>
                    <span className="text-label-md text-outline">{count}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter 4: Rental Duration */}
            <div className="mb-6">
              <label className="block text-label-lg text-primary mb-2.5">Rental Duration</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-container rounded-lg">
                {(["Daily", "Weekly", "Monthly"] as const).map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setRentalDuration(dur)}
                    className={
                      rentalDuration === dur
                        ? "py-1.5 text-label-md rounded bg-surface-container-lowest text-primary shadow-xs"
                        : "py-1.5 text-label-md rounded text-on-surface-variant hover:text-primary"
                    }
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 5: Fulfillment Method */}
            <div className="mb-6">
              <label className="block text-label-lg text-primary mb-2.5">Delivery Method</label>
              <div className="space-y-2">
                <label className="flex items-center text-body-md text-on-surface-variant cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localPickup}
                    onChange={(e) => setLocalPickup(e.target.checked)}
                    className="rounded border-outline-variant/60 text-primary focus:ring-0 mr-2.5 accent-primary"
                  />
                  Local Pickup (Free)
                </label>
                <label className="flex items-center text-body-md text-on-surface-variant cursor-pointer">
                  <input
                    type="checkbox"
                    checked={courierDelivery}
                    onChange={(e) => setCourierDelivery(e.target.checked)}
                    className="rounded border-outline-variant/60 text-primary focus:ring-0 mr-2.5 accent-primary"
                  />
                  Direct Courier Delivery
                </label>
              </div>
            </div>

            {/* Filter 6: Availability */}
            <div>
              <label className="block text-label-lg text-primary mb-2.5">Availability</label>
              <div className="space-y-2">
                <label className="flex items-center text-body-md text-on-surface-variant cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    checked={availability === "now"}
                    onChange={() => setAvailability("now")}
                    className="border-outline-variant/60 text-primary focus:ring-0 mr-2.5 accent-primary"
                  />
                  Available Now
                </label>
                <label className="flex items-center text-body-md text-on-surface-variant cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    checked={availability === "upcoming"}
                    onChange={() => setAvailability("upcoming")}
                    className="border-outline-variant/60 text-primary focus:ring-0 mr-2.5 accent-primary"
                  />
                  Upcoming (Next 7 Days)
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
                      ? `Showing ${filteredItems.length} saved favorite${
                          filteredItems.length === 1 ? "" : "s"
                        }`
                      : `Showing ${
                          filteredItems.length === RENTAL_ITEMS.length
                            ? "148"
                            : filteredItems.length
                        } rental items`}
                  </h2>
                  {showFavoritesOnly && (
                    <button
                      type="button"
                      onClick={() => setShowFavoritesOnly(false)}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-md bg-[#f83256]/10 text-[#f83256] hover:bg-[#f83256]/20 transition-colors"
                    >
                      <span>Saved Favorites</span>
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  )}
                </div>
                <p className="text-body-sm text-on-surface-variant">
                  Verified equipment from insured local lenders
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-outline-variant/40 rounded-lg bg-surface-container-lowest/90 backdrop-blur-sm px-3 py-1.5">
                  <span className="text-label-md text-outline mr-2">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-transparent text-label-lg text-primary border-0 p-0 focus:ring-0 focus:outline-none cursor-pointer"
                  >
                    <option>Recommended</option>
                    <option>Recently Added</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Highest Rated</option>
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
                    title="Grid View"
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
                    title="List View"
                  >
                    <span className="material-symbols-outlined text-base">view_list</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 8 SPECIFIED PRODUCT CARDS GRID */}
            {filteredItems.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
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
                          {item.condition}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (!isAuthenticated) {
                              login();
                            }
                            toggleFavorite(item.id);
                          }}
                          aria-label={isFavorited ? "Saved to favorites" : "Add to favorites"}
                          title={isFavorited ? "Favorited" : "Add to favorites"}
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
                            <span>{item.location}</span>
                          </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-outline-variant/20 flex items-center justify-between">
                          <div>
                            <span className="text-title-lg font-bold text-primary">
                              ${item.pricePerDay}
                            </span>
                            <span className="text-body-sm text-outline">/day</span>
                          </div>
                          <Link
                            className="inline-flex items-center text-label-lg text-primary hover:text-secondary group-hover:translate-x-0.5 transition-transform"
                            href={`/items/${item.id}`}
                          >
                            <span>View Details</span>
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
                <p className="text-title-md text-primary mb-1">No matching rental items found</p>
                <p className="text-body-sm text-on-surface-variant mb-4">
                  Try adjusting your search query, price range, or category filters.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-5 py-2 rounded-lg bg-primary text-on-primary text-label-lg hover:bg-neutral-800 transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* LOAD MORE & PAGINATION BAR */}
            <div className="mt-12 pt-8 border-t border-outline-variant/20 flex flex-col items-center justify-center gap-4">
              <div className="text-body-sm text-outline">
                Showing <span className="font-semibold text-primary">{filteredItems.length}</span>{" "}
                of <span className="font-semibold text-primary">148</span> items
              </div>
              <div className="w-full max-w-xs bg-surface-container-high h-1.5 rounded-full overflow-hidden mb-2">
                <div className="bg-primary h-full w-[12%] rounded-full" />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={activePage === 1}
                  onClick={() => setActivePage((p) => Math.max(1, p - 1))}
                  className="px-3.5 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest/80 text-on-surface-variant text-label-lg hover:border-primary hover:text-primary transition-all disabled:opacity-40"
                >
                  Previous
                </button>
                {[1, 2, 3].map((page) => (
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
                <span className="px-2 text-outline">...</span>
                <button
                  type="button"
                  onClick={() => setActivePage(8)}
                  className={
                    activePage === 8
                      ? "w-10 h-10 rounded-lg bg-primary text-on-primary text-label-lg"
                      : "w-10 h-10 rounded-lg border border-outline-variant/30 bg-surface-container-lowest/80 hover:border-primary text-on-surface-variant text-label-lg"
                  }
                >
                  8
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage((p) => Math.min(8, p + 1))}
                  className="px-3.5 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest/80 text-on-surface-variant text-label-lg hover:border-primary hover:text-primary transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER (Shared Component Anchor) */}
      <footer className="bg-surface-container-lowest/90 backdrop-blur-md w-full border-t border-outline-variant/30 mt-auto">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 py-10 w-full flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Legal Notice */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <span className="text-title-md font-bold text-primary tracking-tight">UNILEND.™</span>
            <span className="text-body-sm text-on-surface-variant">
              © 2025 UniLend Inc. All rights reserved.
            </span>
          </div>
          {/* Footer Policy Links */}
          <div className="flex items-center flex-wrap justify-center gap-6 text-label-md">
            <Link
              className="text-on-surface-variant hover:text-on-surface hover:text-primary transition-colors duration-150"
              href="/"
            >
              Privacy Policy
            </Link>
            <Link
              className="text-on-surface-variant hover:text-on-surface hover:text-primary transition-colors duration-150"
              href="/"
            >
              Terms of Service
            </Link>
            <Link
              className="text-on-surface-variant hover:text-on-surface hover:text-primary transition-colors duration-150"
              href="/"
            >
              Security
            </Link>
            <Link
              className="text-on-surface-variant hover:text-on-surface hover:text-primary transition-colors duration-150"
              href="/"
            >
              Cookie Preferences
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
