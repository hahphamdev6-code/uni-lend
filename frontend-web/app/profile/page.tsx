"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../auth-context";
import { UserHeaderActions } from "../user-header-actions";

type ManagementTab = "rentals" | "listings" | "history" | "favorites" | "reviews";

export default function ProfileDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ManagementTab>("rentals");
  const [filterTag, setFilterTag] = useState("all");

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col relative selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* Soft Ambient Background Glows matching Stitch Design */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[18%] -left-[10%] w-[58vw] h-[58vw] rounded-full blur-[120px] opacity-70 bg-gradient-to-br from-[#FEF2F6] via-[#F8EDF9] to-transparent" />
        <div className="absolute top-[28%] -right-[12%] w-[50vw] h-[50vw] rounded-full blur-[140px] opacity-60 bg-gradient-to-bl from-[#F2EDFF] via-[#EBF3FF] to-transparent" />
        <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] rounded-full blur-[130px] opacity-50 bg-gradient-to-t from-[#FEF0F4] to-transparent" />
      </div>

      {/* Top Navigation Bar */}
      <header className="bg-surface-container-lowest/90 backdrop-blur-md text-primary docked full-width top-0 sticky z-50 shadow-xs border-b border-outline-variant/30">
        <div className="w-full px-6 lg:px-12 max-w-[1360px] mx-auto flex items-center justify-between h-20">
          <div className="flex items-center gap-8">
            <Link
              className="text-title-lg font-bold tracking-wider text-primary flex items-center gap-1.5 focus:outline-none"
              href="/"
            >
              <span>UNILEND.™</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-body-md font-body-md">
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="/">
              Home
            </Link>
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="/rent">
              Categories
            </Link>
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="/rent">
              Borrow
            </Link>
            <Link className="text-primary font-semibold border-b-2 border-primary pb-1" href="/profile">
              Profile
            </Link>
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="/rent">
              Explore
            </Link>
          </nav>

          <UserHeaderActions />
        </div>
      </header>

      {/* Main Workspace */}
      <main className="relative z-10 flex-grow w-full max-w-[1360px] mx-auto px-6 lg:px-12 pt-8 pb-20 space-y-10">
        {/* 1. Profile Hero Identity Banner */}
        <section className="w-full bg-surface-container-lowest/85 backdrop-blur-xl rounded-3xl p-6 sm:p-8 lg:p-10 border border-outline-variant/30 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.03)]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative flex-shrink-0">
                <img
                  alt={user.fullName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-2 ring-outline-variant/30 shadow-xs"
                  src={user.avatar}
                />
                <div className="absolute -bottom-2 -right-2 bg-surface-container-lowest p-1 rounded-full shadow-xs">
                  <div
                    className="bg-emerald-600 text-white rounded-full p-1 flex items-center justify-center"
                    title="Campus Identity Verified"
                  >
                    <span className="material-symbols-outlined text-[16px] fill-icon">verified</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
                    {user.fullName}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                    <span className="material-symbols-outlined text-[14px]">shield</span>
                    Student Member
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-outline">
                  <span className="font-medium text-on-surface">{user.email}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-on-surface-variant font-medium">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    Active now
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/40 text-xs font-semibold text-on-surface">
                    <span className="material-symbols-outlined text-[14px] text-secondary">school</span>
                    VNU-HCM / University of Technology
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold">
                    <span className="material-symbols-outlined text-[14px] text-amber-600 fill-icon">star</span>
                    4.9 (18 peer reviews)
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/30 text-xs font-semibold text-outline">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    Member since 2025
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:self-center">
              <Link
                href="/rent"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-outline-variant/50 bg-surface-container-lowest/80 text-on-surface font-semibold text-sm hover:bg-surface-container-low transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>+ List an Item</span>
              </Link>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-semibold text-sm hover:bg-slate-800 transition-all shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </section>

        {/* 2. Overview Statistics Bar */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-6 border border-outline-variant/30 hover:border-outline-variant/60 transition-all shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider font-semibold text-outline">Active Rentals</span>
              <span className="p-2 rounded-lg bg-surface-container-low text-on-surface">
                <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold text-on-surface">{user.activeRentalsCount}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                  On Schedule
                </span>
              </div>
              <p className="text-xs text-outline">{user.activeRentalTitle} · {user.activeRentalDue}</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-6 border border-outline-variant/30 hover:border-outline-variant/60 transition-all shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider font-semibold text-outline">Shared Items</span>
              <span className="p-2 rounded-lg bg-surface-container-low text-on-surface">
                <span className="material-symbols-outlined text-[18px]">inventory_2</span>
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold text-on-surface">5</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed border border-secondary/20 text-xs font-semibold">
                  +1 Request pending
                </span>
              </div>
              <p className="text-xs text-outline">5 gear items listed for campus sharing</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-6 border border-outline-variant/30 hover:border-outline-variant/60 transition-all shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider font-semibold text-outline">Completed Exchanges</span>
              <span className="p-2 rounded-lg bg-surface-container-low text-on-surface">
                <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold text-on-surface">24</span>
                <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-700">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  100%
                </span>
              </div>
              <p className="text-xs text-outline">Smooth handover track record</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-6 border border-outline-variant/30 hover:border-outline-variant/60 transition-all shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider font-semibold text-outline">Community Trust</span>
              <span className="p-2 rounded-lg bg-surface-container-low text-on-surface">
                <span className="material-symbols-outlined text-[18px]">security</span>
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold text-on-surface">100%</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                  Verified ID
                </span>
              </div>
              <p className="text-xs text-outline">Zero dispute escrow record</p>
            </div>
          </div>
        </section>

        {/* 3. Tabbed Management Section */}
        <section className="bg-surface-container-lowest/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 lg:p-10 border border-outline-variant/30 shadow-[0_4px_30px_rgba(15,23,42,0.02)] space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-outline-variant/30 pb-5">
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("rentals")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                  activeTab === "rentals"
                    ? "bg-primary text-on-primary shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span>Active Rentals</span>
                <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-[11px]">1</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("listings")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                  activeTab === "listings"
                    ? "bg-primary text-on-primary shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span>My Listings</span>
                <span className="px-1.5 py-0.5 bg-surface-container-high rounded-full text-[11px]">5</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                  activeTab === "history"
                    ? "bg-primary text-on-primary shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span>Borrow History</span>
                <span className="px-1.5 py-0.5 bg-surface-container-high rounded-full text-[11px]">23</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("reviews")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                  activeTab === "reviews"
                    ? "bg-primary text-on-primary shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span>Reviews</span>
                <span className="px-1.5 py-0.5 bg-surface-container-high rounded-full text-[11px]">18</span>
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs font-semibold text-outline hidden sm:inline">Filter:</span>
              {["all", "urgent", "electronics"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setFilterTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-colors ${
                    filterTag === tag
                      ? "bg-on-surface text-surface-container-lowest"
                      : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  {tag === "all" ? "All Items" : tag === "urgent" ? "Due Soon" : tag}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300 group">
              <div>
                <div className="relative h-52 w-full overflow-hidden bg-surface-container-low">
                  <img
                    alt="Apple MacBook Pro 16 inch M3"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRRqG-9tBSbzdegYbjV6zPg5zacLIpy9S4sLDWfgjSb6UXl7k_c2VjoGwYFfeVZ1d6t8HEh1AJukOfrhISqhiqi9nYMvTCe8EtxF-_QU8Gtnsm6M3wLTfO26PsvA6r3kWK_qYw3iBIOGTFHkVjQsPre-YH3VyeCXGatfY2BpeZVvGA6EcxdA4Qtit1urS3EJJICHDNt4U3j77wpHveG8uOMsmGn3FArPRZ_1KyITDd_VNtfbfAJtsi5Tg-ChhSlnm4m5swGLYzWdxb"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/90 backdrop-blur-md text-white text-xs font-semibold shadow-xs">
                      <span className="material-symbols-outlined text-[14px]">alarm</span>
                      Due in 3 days (Nov 18)
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide uppercase">
                      Currently Borrowing
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-on-surface tracking-tight group-hover:text-secondary transition-colors">
                      Apple MacBook Pro 16&quot; M3 Max
                    </h3>
                    <p className="text-xs text-outline mt-0.5">36GB Unified Memory · 1TB SSD · Space Black</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-container-low/80 border border-outline-variant/30 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-outline font-semibold">Lender</span>
                      <span className="font-semibold text-on-surface">Elena R. (Engineering Bldg)</span>
                    </div>
                    <div className="flex items-start gap-2 pt-1 border-t border-outline-variant/20 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px] text-outline flex-shrink-0 mt-0.5">
                        meeting_room
                      </span>
                      <span>Picked up via Campus Smart Locker #14</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center gap-3">
                <button
                  type="button"
                  className="flex-1 py-2.5 px-3 rounded-lg bg-primary text-on-primary font-semibold text-xs hover:bg-slate-800 transition-all text-center"
                >
                  Manage Rental
                </button>
                <button
                  type="button"
                  className="py-2.5 px-4 rounded-lg border border-outline-variant/50 text-on-surface font-semibold text-xs hover:bg-surface-container-low transition-colors text-center whitespace-nowrap"
                >
                  Request Extension
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300 group">
              <div>
                <div className="relative h-52 w-full overflow-hidden bg-surface-container-low">
                  <img
                    alt="Sony Alpha 7 IV Camera Kit"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAydyzZ9Krursrc2gkjXA93duPkCR00vS0UMQITpvNsr4mWASGCo1nrpNkaEBVwCDsxZeyWZVIi57nqxAk1-A2mCLUfor3_9OKd9CZzuVFDH3cpy4YQVZytLjUn-e8ZyJsICb18QAn2USw2_lpljnxluogRvqYFaQfbfa9odYEvkMxf2LRidPHBtPywcXc886YRKUc6wR5kp5HsIVNewSfYozfm7A5Ls3qJNnBWvbMCxnXUCeO5fW6BoNoMDUdFE_KSl9AtQqNAPB1O"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-xs font-semibold shadow-xs">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Available to Borrow
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide uppercase">
                      Your Listing
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-on-surface tracking-tight group-hover:text-secondary transition-colors">
                        Sony Alpha 7 IV Camera Kit
                      </h3>
                      <p className="text-xs text-outline mt-0.5">Includes 24-70mm f/2.8 lens + 2 batteries</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-base font-bold text-on-surface">$45</span>
                      <span className="block text-[11px] text-outline">/ day</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-secondary-fixed/30 border border-secondary/20 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-secondary font-bold">Inquiry Alert</span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary-container text-white text-[10px] font-bold">
                        2 Pending
                      </span>
                    </div>
                    <p className="text-on-surface-variant leading-relaxed">
                      2 pending requests from verified student IDs in Fine Arts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center gap-3">
                <button
                  type="button"
                  className="flex-1 py-2.5 px-3 rounded-lg bg-primary text-on-primary font-semibold text-xs hover:bg-slate-800 transition-all text-center"
                >
                  Review Requests (2)
                </button>
                <button
                  type="button"
                  className="py-2.5 px-4 rounded-lg border border-outline-variant/50 text-on-surface font-semibold text-xs hover:bg-surface-container-low transition-colors text-center whitespace-nowrap"
                >
                  Edit Listing
                </button>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300 group">
              <div>
                <div className="relative h-52 w-full overflow-hidden bg-surface-container-low">
                  <img
                    alt="Rimowa Essential Cabin Luggage"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHoUZftnrdDNLmj17AWYXJXF_MABejUg2w3d0nOOoLrzhLFVDiK-tEL7NyTqsV2FmL1vLpePH3Rb5sleP1_OM7z-niC1b8PKa_AAmgwsOMU9gAcDMxrqHtyOUNtFRb7j4mVRRCFahMLyoblDJTiI9_jpwfnjCrkJKiAheohbqsPWPy9Vgdbg90AFC4NTJiX7JWAKMA4N0ikPvKuZixkWyVDgv-IPUvlNSzpMcQbOGaeRI-bZ7-8aKrGavRM0Vn4dv9mHW_q5WgrBCW"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-white text-xs font-semibold shadow-xs">
                      <span className="material-symbols-outlined text-[14px]">swap_calls</span>
                      Currently Lent Out
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide uppercase">
                      Your Listing
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-on-surface tracking-tight group-hover:text-secondary transition-colors">
                        Rimowa Essential Cabin Luggage
                      </h3>
                      <p className="text-xs text-outline mt-0.5">36L Gloss Black Suitcase · TSA Approved</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-base font-bold text-on-surface">$18</span>
                      <span className="block text-[11px] text-outline">/ day</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-container-low/80 border border-outline-variant/30 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-outline font-semibold">Current Borrower</span>
                      <span className="font-semibold text-on-surface">Marcus V.</span>
                    </div>
                    <div className="flex items-start gap-2 pt-1 border-t border-outline-variant/20 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px] text-blue-600 flex-shrink-0 mt-0.5">
                        event_repeat
                      </span>
                      <span>Returning in 2 days (Nov 17, 4:00 PM)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center gap-3">
                <button
                  type="button"
                  className="flex-1 py-2.5 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/40 font-semibold text-xs hover:bg-surface-container-high transition-all text-center"
                >
                  View Handover Escrow
                </button>
                <button
                  type="button"
                  className="py-2.5 px-4 rounded-lg bg-primary text-on-primary font-semibold text-xs hover:bg-slate-800 transition-colors text-center whitespace-nowrap"
                >
                  Message Borrower
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Community Reviews & Trust Endorsements */}
        <section className="bg-surface-container-lowest/85 backdrop-blur-xl rounded-3xl p-6 sm:p-8 lg:p-10 border border-outline-variant/30 shadow-[0_4px_30px_rgba(15,23,42,0.02)] space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-on-surface tracking-tight">
                  Community Reviews &amp; Peer Endorsements
                </h2>
                <span className="p-1 rounded-md bg-emerald-50 text-emerald-700">
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                </span>
              </div>
              <p className="text-xs text-outline mt-1">Verified reviews from authentic campus peer borrowing interactions</p>
            </div>

            <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant/30">
              <div className="flex items-center text-amber-500">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="material-symbols-outlined text-[18px] fill-icon">star</span>
                ))}
              </div>
              <span className="text-sm font-bold text-on-surface">4.9 / 5.0</span>
              <span className="text-outline text-xs">(18 reviews)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 flex flex-col justify-between space-y-4 hover:border-outline-variant/70 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      MV
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">Marcus V.</h4>
                      <p className="text-outline text-[11px]">Architecture · Class of &apos;26</p>
                    </div>
                  </div>
                  <div className="flex text-amber-500">
                    <span className="material-symbols-outlined text-[15px] fill-icon">star</span>
                    <span className="text-xs font-bold text-on-surface ml-1">5.0</span>
                  </div>
                </div>
                <p className="text-on-surface-variant text-xs leading-relaxed">
                  “Alex lent me the camera gear in mint condition. Super punctual at the student center locker. Highly recommended lender!”
                </p>
              </div>
              <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-outline text-[11px]">
                <span>Borrowed: Sony Alpha 7 IV</span>
                <span>2 weeks ago</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 flex flex-col justify-between space-y-4 hover:border-outline-variant/70 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      CT
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">Chloe T.</h4>
                      <p className="text-outline text-[11px]">Computer Science · Class of &apos;25</p>
                    </div>
                  </div>
                  <div className="flex text-amber-500">
                    <span className="material-symbols-outlined text-[15px] fill-icon">star</span>
                    <span className="text-xs font-bold text-on-surface ml-1">5.0</span>
                  </div>
                </div>
                <p className="text-on-surface-variant text-xs leading-relaxed">
                  “Smooth rental for finals week study kit. Returned clean and exactly on time. Trustworthy student!”
                </p>
              </div>
              <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-outline text-[11px]">
                <span>Borrowed: MacBook Pro M3</span>
                <span>1 month ago</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 flex flex-col justify-between space-y-4 hover:border-outline-variant/70 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      LC
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">Liam C.</h4>
                      <p className="text-outline text-[11px]">Industrial Design · Class of &apos;27</p>
                    </div>
                  </div>
                  <div className="flex text-amber-500">
                    <span className="material-symbols-outlined text-[15px] fill-icon">star</span>
                    <span className="text-xs font-bold text-on-surface ml-1">5.0</span>
                  </div>
                </div>
                <p className="text-on-surface-variant text-xs leading-relaxed">
                  “Great communication throughout the lending period. Item was packaged securely with extra cables.”
                </p>
              </div>
              <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-outline text-[11px]">
                <span>Borrowed: Rimowa Cabin</span>
                <span>2 months ago</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#f8f9ff] border-t border-[#c6c6cd]/30 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-6 lg:px-12 max-w-[1360px] mx-auto gap-4">
          <p className="text-xs text-on-surface-variant">© 2025 UniLend Technologies Inc. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6 text-xs text-on-surface-variant font-medium">
            <Link className="hover:text-primary transition-colors" href="/">
              Privacy Policy
            </Link>
            <Link className="hover:text-primary transition-colors" href="/">
              Terms of Service
            </Link>
            <Link className="hover:text-primary transition-colors" href="/">
              Security Architecture
            </Link>
            <Link className="hover:text-primary transition-colors" href="/">
              Status
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
