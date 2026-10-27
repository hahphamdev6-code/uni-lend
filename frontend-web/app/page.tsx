"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuth } from "./auth-context";
import {
  CATEGORY_TABS,
  POPULAR_TAGS,
  RENTAL_ITEMS,
  type CategoryTab,
  type SortOption,
} from "./rental-catalog";
import { UserHeaderActions } from "./user-header-actions";

export default function HomePage() {
  const { isAuthenticated, favorites, toggleFavorite, login } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryTab>("All Items");
  const [sortBy, setSortBy] = useState<SortOption>("Recommended");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Items");
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
  }, [searchQuery, selectedCategory, sortBy, showFavoritesOnly, favorites]);

  return (
    <>
      {/* Navigation Header */}
      <header className="w-full max-w-[1440px] mx-auto px-8 md:px-14 py-7 flex items-center justify-between relative z-50">
        {/* Brand Logo */}
        <a
          aria-label="UNILEND Home"
          className="flex items-center gap-1 group"
          href="#top"
        >
          <span className="font-extrabold tracking-tight text-2xl text-black">
            UNILEND.
            <span className="text-xs font-semibold uppercase align-super ml-0.5 tracking-normal">
              TM
            </span>
          </span>
        </a>

        {/* Center Navigation Links */}
        <nav
          aria-label="Main Navigation"
          className="hidden lg:flex items-center gap-8 text-[14.5px] font-medium text-[#2E3138]"
        >
          <a className="py-1 text-black font-semibold" href="#top">
            Home
          </a>
          <a
            className="group cursor-pointer flex items-center gap-1.5 py-1 hover:text-black transition-colors"
            href="#featured"
            onClick={(e) => {
              e.preventDefault();
              setSelectedCategory("All Items");
              setShowFavoritesOnly(false);
              document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span>Categories</span>
            <svg
              className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-transform duration-200 group-hover:translate-y-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M19 9l-7 7-7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
              />
            </svg>
          </a>
          <Link
            className="group cursor-pointer flex items-center gap-1.5 py-1 hover:text-black transition-colors"
            href="/rent"
          >
            <span>Borrow</span>
            <svg
              className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-transform duration-200 group-hover:translate-y-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M19 9l-7 7-7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
              />
            </svg>
          </Link>
          <a className="py-1 hover:text-black transition-colors" href="#how-it-works">
            Explore
          </a>
          <a className="py-1 hover:text-black transition-colors" href="#contact">
            Contact us
          </a>
        </nav>

        {/* Right Side CTA / Authenticated User Group */}
        <UserHeaderActions
          showFavoritesOnly={showFavoritesOnly}
          onSelectFavorites={() => {
            setShowFavoritesOnly((prev) => !prev);
            document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" });
          }}
        />
      </header>

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
              Campus &amp; Community Commons
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl xl:text-[58px] font-bold tracking-[-0.035em] text-[#0A0B0E] leading-[1.12] mb-6">
              Borrow Freely.
              <br />
              Share More.
            </h1>

            {/* Subtitle Description */}
            <p className="text-base sm:text-lg text-[#555A68] leading-relaxed max-w-lg mb-7 font-normal">
              Discover quality items from your campus and community for every occasion. Borrow what
              you need, when you need it, without the cost of owning everything.
            </p>

            {/* Pill Search Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
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
                placeholder="Search cameras, tech, books, tools..."
                type="text"
              />
              <button
                type="submit"
                aria-label="Search items"
                className="bg-[#0D0E12] text-white rounded-full p-2.5 flex items-center justify-center hover:bg-black/85 transition-all flex-shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>

            {/* Popular Quick Tags (Unified with Borrow Page) */}
            <div className="flex items-center flex-wrap gap-2 mb-6">
              <span className="text-body-sm text-outline">Popular:</span>
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSearchQuery(searchQuery === tag ? "" : tag);
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
                className="btn-bounce inline-flex items-center justify-center px-7 py-3.5 bg-[#0D0E12] text-white text-[15px] font-medium rounded-full shadow-[0_4px_14px_0_rgba(13,14,18,0.15)] hover:bg-black"
                href="/rent"
              >
                Explore Items
              </Link>
              <a
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/90 hover:bg-white text-[#1C1F26] text-[15px] font-medium rounded-full border border-black/5 hover:border-black/15 shadow-sm transition-all"
                href="#impact"
              >
                <span>Share Your Item</span>
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </a>
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
                    alt="Sony Alpha A7 IV Mirrorless Kit"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3HjcSAMKduxqICKJQpRhqGRH5OipEeKxUCm4yzAmGdY-PDbyUA786ChogLPcETnXATXNL_iZMY7s9ylptdi67LcAi_t7hlgxZmhJdFG167Cznr-LFWdgbIwUmVOGLoSjQAqXVxnXpThzCpKLkzsG30wpKcGI8YDsm8mw22vZtuU9JTyMGzjGSofTW6XyWBhw2NuZH4VL4M1i3XuLx4xhfkAXjpu6dUIOeloEhbyo_P2fyS8W6qJqLSmvZmcJBsOPlX4vrwrtzS8KV"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#0D0E12] border border-black/5 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Available to Borrow • Campus Hub
                  </div>
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-[#0D0E12] border border-black/5 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                    Free Community Loan • Up to 5 Days
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-[#0D0E12] border border-black/5">
                      MV
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-[#0D0E12]">Marcus V.</span>
                        <span className="material-symbols-outlined text-purple-600 text-[15px] fill-icon">
                          verified
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400">UC Berkeley (0.4 mi away)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-white/90 px-2.5 py-1 rounded-full border border-black/5 text-xs font-semibold text-[#0D0E12] shadow-xs">
                    <span className="material-symbols-outlined text-amber-500 text-[14px] fill-icon">
                      star
                    </span>
                    <span>5.0</span>
                    <span className="text-neutral-400 font-normal">(42 loans)</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-black/[0.05] flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#0D0E12]">Sony Alpha A7 IV Kit</h4>
                    <p className="text-xs text-[#555A68]">
                      28-70mm f/3.5-5.6 OSS + 2x Pro SD Cards
                    </p>
                  </div>
                  <Link
                    href="/items/sony-a7-iv"
                    className="btn-bounce bg-[#0D0E12] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-black transition-all shadow-[0_4px_14px_0_rgba(13,14,18,0.15)]"
                  >
                    Borrow
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mt-24 pt-12 border-t border-black/[0.06]" id="how-it-works">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500 mb-2">
              THE SMARTER WAY TO SHARE
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-[#0D0E12] tracking-tight">
              Everything You Need to Borrow with Confidence
            </p>
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
              <h3 className="text-base font-semibold text-[#0D0E12] mb-1.5">Quality Items</h3>
              <p className="text-sm text-[#666D80] leading-relaxed">
                Discover carefully shared items for your study projects, everyday needs, and special
                occasions.
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
              <h3 className="text-base font-semibold text-[#0D0E12] mb-1.5">Easy Loan Requests</h3>
              <p className="text-sm text-[#666D80] leading-relaxed">
                Find what you need, choose your borrow dates, and send a loan request in just a few
                clicks.
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
              <h3 className="text-base font-semibold text-[#0D0E12] mb-1.5">Trusted Community</h3>
              <p className="text-sm text-[#666D80] leading-relaxed">
                Connect with verified campus members through transparent listings, reviews, and
                ratings.
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
              <h3 className="text-base font-semibold text-[#0D0E12] mb-1.5">Share &amp; Connect</h3>
              <p className="text-sm text-[#666D80] leading-relaxed">
                Borrow useful items or list your own idle belongings to support fellow students on
                campus.
              </p>
            </div>
          </div>
        </section>

        {/* Curated Collections Section (Unified with Borrow Listing Functionality & UI) */}
        <section className="mt-24 pt-12 border-t border-black/[0.06]" id="featured">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500 mb-2">
              CURATED COLLECTIONS
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-[#0D0E12] tracking-tight mb-2">
              Find Your Next Borrow
            </p>
            <p className="text-sm text-[#666D80]">
              Explore verified items available to borrow across local hubs.
            </p>
          </div>

          {/* Horizontal Category Selector (Unified with Borrow Page) */}
          <div className="mb-8 pb-2 border-b border-outline-variant/20">
            <div className="flex items-center justify-start lg:justify-center space-x-2.5 overflow-x-auto pb-2 scrollbar-none">
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
          </div>

          {/* Controls Header (Item Count, Saved Favorites Chip, Sort By, Grid/List View Toggle) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-outline-variant/20 gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-title-lg text-primary">
                  {showFavoritesOnly
                    ? `Showing ${filteredItems.length} saved favorite${
                        filteredItems.length === 1 ? "" : "s"
                      }`
                    : `Showing ${
                        filteredItems.length === RENTAL_ITEMS.length
                          ? "148"
                          : filteredItems.length
                      } rental items`}
                </h3>
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
                          <h4 className="text-title-md text-primary group-hover:text-secondary transition-colors line-clamp-1">
                            {item.title}
                          </h4>
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
            <div className="bg-surface-container-lowest/90 backdrop-blur-sm rounded-2xl p-12 border border-outline-variant/30 text-center">
              <p className="text-title-md text-primary mb-1">No matching rental items found</p>
              <p className="text-body-sm text-on-surface-variant mb-4">
                Try another keyword or reset the category filter.
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

          {/* Browse Full Catalog CTA */}
          <div className="mt-10 flex justify-center">
            <Link
              href="/rent"
              className="btn-bounce inline-flex items-center gap-2 px-6 py-3 rounded-full bg-surface-container-lowest/90 hover:bg-white text-primary text-label-lg border border-outline-variant/40 shadow-xs transition-all"
            >
              <span>Browse All 148 Rental Items</span>
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
                  Community Commons
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0B0E] mb-4">
                  Turn Your Idle Gear into Community Value
                </h2>
                <p className="text-[#555A68] text-sm sm:text-base leading-relaxed mb-7">
                  Lend textbooks, cameras, audio equipment, and specialty tools to fellow students
                  and neighbors safely without worrying about damage or hassle.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/rent"
                    className="btn-bounce bg-[#0D0E12] text-white rounded-full px-7 py-3.5 text-sm font-medium hover:bg-black transition-all shadow-[0_4px_14px_0_rgba(13,14,18,0.15)] flex items-center gap-2"
                  >
                    <span>List an Item for Free</span>
                    <span className="material-symbols-outlined text-[18px]">add_task</span>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-white/90 border border-black/[0.04] shadow-xs flex flex-col">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                    Verified Members
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#0D0E12] tracking-tight">
                    14,200+
                  </span>
                  <span className="text-xs text-neutral-500 mt-1">Across 18 regional campuses</span>
                </div>
                <div className="p-6 rounded-2xl bg-white/90 border border-black/[0.04] shadow-xs flex flex-col">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                    Community Items
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#0D0E12] tracking-tight">
                    4,800+
                  </span>
                  <span className="text-xs text-neutral-500 mt-1">Shared freely in circulation</span>
                </div>
                <div className="p-6 rounded-2xl bg-white/90 border border-black/[0.04] shadow-xs flex flex-col">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                    Return Integrity
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#0D0E12] tracking-tight">
                    99.8%
                  </span>
                  <span className="text-xs text-neutral-500 mt-1">Safe on-time return rate</span>
                </div>
                <div className="p-6 rounded-2xl bg-white/90 border border-black/[0.04] shadow-xs flex flex-col">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                    UniLend Shield
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#0D0E12] tracking-tight">
                    $5,000
                  </span>
                  <span className="text-xs text-neutral-500 mt-1">
                    Protection guarantee per loan
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
        <p>© 2025 UNILEND.™ Technologies Inc. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a className="hover:text-black transition-colors" href="#top">
            Privacy Policy
          </a>
          <a className="hover:text-black transition-colors" href="#top">
            Terms of Service
          </a>
          <a className="hover:text-black transition-colors" href="#top">
            Security
          </a>
        </div>
      </footer>
    </>
  );
}
