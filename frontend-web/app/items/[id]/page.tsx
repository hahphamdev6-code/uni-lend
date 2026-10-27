"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useAuth } from "../../auth-context";
import { UserHeaderActions } from "../../user-header-actions";
import {
  FREQUENTLY_RENTED_TOGETHER,
  SONY_A7_IV_GALLERY,
  getRentalItemById,
} from "../../rental-catalog";

const EDITORIAL_REVIEWS = [
  {
    id: "elena-rostova",
    author: "Elena Rostova",
    date: "Oct 12, 2025",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAA2XGb2SoCDJpXvc7CBzaNDMK3dzYWY1rBJybeqy7nRlNi6M1Q8WaVeTeCXJCEnqEn8TtGu7A0kRFRSDXQinuY6JsXbPYPk_aFmCycG8ZStgcwPsLIob4ATkLN94AyRNCEyd3-4WwUm5-O0TPj0691sWWk9rT2adFMZk7i9KEvjMIYVk0_-mAnOKhtht42ugxi3o5nSzr0yTRoiV2pd7fJMGamP4h3kINIijhZeF2HR6fgpg1tfMLGyQ",
    alt: "Headshot of Elena Rostova, a creative director in a stylish minimal studio environment.",
    quote:
      '"The A7 IV was immaculate. Marcus included both batteries freshly topped up and the lens optics were completely pristine. Seamless handoff in the Mission."',
    meta: "Rented for 4 days • Commercial Shoot",
  },
  {
    id: "devon-chen",
    author: "Devon Chen",
    date: "Sep 28, 2025",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC1v_7qxZGAk-vaI8zPjDt15sySvlWhrY_ktu2JoSX5OuzhwHBxbnpI01K8zGJpdmy1U3OVqeAd5obHdwDrGIYqGtny6_uK9617U_dzjHnU131K8uSkfGWl11AaaYIBzxoa4caIWLqYHl0qFyLBbRtaYOpddZtZYd1utXTNSngZnVWghe_H3jXtUuTx_q2nzh-3QrZsfCX3XLKVhho2WsCeArMIQX4dwN-qMXFRrcudwEfbJJKW1I1y_w",
    alt: "Portrait of Devon Chen, an independent documentary filmmaker.",
    quote:
      '"Used this for a 3-day short film production. The 10-bit 4:2:2 video capture held up in grading remarkably well. Marcus responded in under 5 minutes to my questions."',
    meta: "Rented for 3 days • Narrative Film",
  },
  {
    id: "sarah-lindqvist",
    author: "Sarah Lindqvist",
    date: "Sep 15, 2025",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBcsvR3o_QSFCR8kJPBhIu3slZnWhyM9gwWt405gZhLfZ293TwdgZuc6pgZVmLij0qaPKS-KlaiAZM4HgVLug8Q4kH0eHj3QnBVf_T4jwh3PNTVt7z1621dtl4mSuZ8Xi0zvbMRzmwY17DlJ2iqXsNQrlen7TZzxJ9qe_xDFANGnYNaIU7WxJyXKSqATVYV8HEM28Gk-gHjk_Yak5pmR9sUC9CrkQmXEsa6gJJjp-U_JTm_BPjKsvc5bw",
    alt: "Portrait of Sarah Lindqvist, a female architectural photographer.",
    quote:
      '"The Pelican case made transportation effortless on the Muni. Everything was organized to perfection. Will definitely rent from Marcus again for future gigs."',
    meta: "Rented for 2 days • Architectural Project",
  },
];

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const item = getRentalItemById(resolvedParams.id);
  const { isAuthenticated, favorites, toggleFavorite, login } = useAuth();

  const gallery =
    item.gallery && item.gallery.length > 0
      ? item.gallery
      : [
          { src: item.image, alt: item.alt },
          ...SONY_A7_IV_GALLERY.slice(1),
        ];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [rentalDays, setRentalDays] = useState(3);
  const [deliveryMode, setDeliveryMode] = useState<"pickup" | "courier">("pickup");
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  const isFavorited = isAuthenticated && favorites.includes(item.id);

  // Date display calculation based on Oct 24, 2025 start date
  const startDateLabel = "Oct 24, 2025";
  const returnDateObj = new Date(2025, 9, 24 + rentalDays);
  const returnDateLabel = returnDateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Pricing ledger calculation
  const baseRentCost = item.pricePerDay * rentalDays;
  const weeklyDiscount = rentalDays >= 7 ? Math.round(baseRentCost * 0.15) : 0;
  const subtotalRent = baseRentCost - weeklyDiscount;
  const damageWaiverFee = 12.0;
  const platformServiceFee = 8.5;
  const courierFee = deliveryMode === "courier" ? 15.0 : 0;
  const estimatedTotal = subtotalRent + damageWaiverFee + platformServiceFee + courierFee;
  const weeklyRateDisplay = item.weeklyPrice ?? Math.round(item.pricePerDay * 7 * 0.85);
  const depositDisplay = item.securityDeposit ?? 150;
  const insuredDisplay = (item.insuredUpTo ?? 3000).toLocaleString("en-US");

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen flex flex-col relative isolate selection:bg-surface-container selection:text-primary">
      {/* Ambient Light Atmosphere (Unified with Home & Borrow screens) */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none -z-10 overflow-hidden"
      >
        <div
          className="absolute -top-[20%] right-[-5%] w-[800px] h-[600px] rounded-full blur-3xl opacity-70"
          style={{
            background:
              "radial-gradient(circle, rgba(254, 237, 243, 0.8) 0%, rgba(243, 238, 255, 0.5) 50%, transparent 80%)",
          }}
        />
        <div
          className="absolute top-[20%] -left-[10%] w-[650px] h-[650px] rounded-full blur-3xl opacity-60"
          style={{
            background:
              "radial-gradient(circle, rgba(254, 237, 243, 0.7) 0%, rgba(243, 238, 255, 0.4) 60%, transparent 80%)",
          }}
        />
        <div
          className="absolute -bottom-[10%] right-[15%] w-[600px] h-[600px] rounded-full blur-3xl opacity-50"
          style={{
            background:
              "radial-gradient(circle, rgba(254, 237, 243, 0.6) 0%, rgba(243, 238, 255, 0.35) 60%, transparent 80%)",
          }}
        />
      </div>

      {/* Shared TopNavBar Component */}
      <header className="docked full-width top-0 sticky z-50 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30 shadow-xs">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 w-full flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            className="text-title-lg font-bold tracking-tight text-primary flex items-center gap-2 transition-all duration-150 ease-out active:scale-[0.99]"
            href="/"
          >
            <span>UNILEND.™</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              className="text-label-lg text-on-surface-variant font-medium pb-1 hover:text-primary transition-colors duration-150"
              href="/"
            >
              Home
            </Link>
            <Link
              className="text-label-lg text-on-surface-variant font-medium pb-1 hover:text-primary transition-colors duration-150"
              href="/rent#categories"
            >
              Categories
            </Link>
            <Link
              className="text-label-lg text-primary font-semibold border-b-2 border-primary pb-1 transition-colors duration-150"
              href="/rent"
            >
              Borrow
            </Link>
            <Link
              className="text-label-lg text-on-surface-variant font-medium pb-1 hover:text-primary transition-colors duration-150"
              href="/rent#listings"
            >
              Explore
            </Link>
            <Link
              className="text-label-lg text-on-surface-variant font-medium pb-1 hover:text-primary transition-colors duration-150"
              href="/#footer"
            >
              Contact us
            </Link>
          </nav>

          {/* Trailing Action Buttons (Synced with AuthContext) */}
          <UserHeaderActions />
        </div>
      </header>

      {/* Main Canvas Container */}
      <main className="max-w-[1360px] mx-auto px-6 md:px-12 py-8 w-full flex-1">
        {/* 1. Editorial Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center flex-wrap gap-2 text-label-lg text-outline"
        >
          <Link
            className="text-on-surface-variant hover:text-primary transition-colors duration-150"
            href="/"
          >
            Home
          </Link>
          <span className="material-symbols-outlined text-[16px] text-outline-variant">
            chevron_right
          </span>
          <Link
            className="text-on-surface-variant hover:text-primary transition-colors duration-150"
            href="/rent"
          >
            Rent
          </Link>
          <span className="material-symbols-outlined text-[16px] text-outline-variant">
            chevron_right
          </span>
          <Link
            className="text-on-surface-variant hover:text-primary transition-colors duration-150"
            href="/rent#categories"
          >
            {item.category === "Electronics" ? "Electronics & Cameras" : item.category}
          </Link>
          <span className="material-symbols-outlined text-[16px] text-outline-variant">
            chevron_right
          </span>
          <span className="text-primary font-semibold truncate max-w-[280px] md:max-w-none">
            {item.title}
          </span>
        </nav>

        {/* 2. Main Product Section (Two-Column Editorial Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          {/* Left Column: Gallery & Trust Badges (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Main Card Surface */}
            <div className="relative bg-surface-container-lowest/95 backdrop-blur-md rounded-xl border border-outline-variant/30 overflow-hidden p-3 shadow-xs group">
              {/* Floating Status Badges */}
              <div className="absolute top-6 left-6 z-20 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-md uppercase tracking-wider bg-surface-container-lowest/95 backdrop-blur-md text-primary border border-outline-variant/40 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  Verified Equipment
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-label-md uppercase tracking-wider bg-surface-container-lowest/95 backdrop-blur-md text-on-surface-variant border border-outline-variant/40 shadow-xs">
                  <span className="material-symbols-outlined text-[14px] text-primary">
                    verified_user
                  </span>
                  Insured up to ${insuredDisplay}
                </span>
              </div>

              {/* Top Right Condition Pill */}
              <div className="absolute top-6 right-6 z-20">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-label-md bg-primary text-on-primary font-semibold shadow-xs">
                  {item.conditionScore ?? `${item.condition} (Condition 9.8/10)`}
                </span>
              </div>

              {/* Large Hero Preview Frame */}
              <div
                onClick={() => setIsLightboxOpen(true)}
                className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-surface-bright flex items-center justify-center cursor-zoom-in"
              >
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                  alt={gallery[activeImageIndex]?.alt ?? item.alt}
                  src={gallery[activeImageIndex]?.src ?? item.image}
                />

                {/* Gallery Controls */}
                <button
                  aria-label="Previous image"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-primary flex items-center justify-center border border-outline-variant/40 hover:bg-surface-container-lowest transition-all shadow-xs cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                <button
                  aria-label="Next image"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-primary flex items-center justify-center border border-outline-variant/40 hover:bg-surface-container-lowest transition-all shadow-xs cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>

                {/* Zoom & Fullscreen Hint */}
                <div className="absolute bottom-4 right-4 bg-surface-container-lowest/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-outline-variant/30 flex items-center gap-1.5 text-label-md text-on-surface-variant shadow-xs pointer-events-none">
                  <span className="material-symbols-outlined text-[15px]">zoom_in</span>
                  <span>Click to view hi-res</span>
                </div>
              </div>

              {/* Thumbnail Strip (5 items) */}
              <div className="grid grid-cols-5 gap-3 mt-3 px-1 pb-1">
                {gallery.map((thumb, idx) => {
                  const isActive = idx === activeImageIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={
                        isActive
                          ? "aspect-[4/3] rounded-lg overflow-hidden border-2 border-primary ring-1 ring-primary/20 relative focus:outline-none transition-all cursor-pointer"
                          : "aspect-[4/3] rounded-lg overflow-hidden border border-outline-variant/40 hover:border-outline focus:outline-none transition-all opacity-85 hover:opacity-100 cursor-pointer"
                      }
                    >
                      <img className="w-full h-full object-cover" alt={thumb.alt} src={thumb.src} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Feature Snapshot Strips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-surface-container-lowest/85 backdrop-blur-md rounded-xl p-4 border border-outline-variant/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px]">sanitizer</span>
                </div>
                <div>
                  <p className="text-label-md text-outline uppercase tracking-wider">Sanitization</p>
                  <p className="text-body-md font-semibold text-primary">Cleaned &amp; Tested</p>
                </div>
              </div>

              <div className="bg-surface-container-lowest/85 backdrop-blur-md rounded-xl p-4 border border-outline-variant/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                </div>
                <div>
                  <p className="text-label-md text-outline uppercase tracking-wider">Turnaround</p>
                  <p className="text-body-md font-semibold text-primary">Instant Confirmation</p>
                </div>
              </div>

              <div className="bg-surface-container-lowest/85 backdrop-blur-md rounded-xl p-4 border border-outline-variant/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px]">shield_with_heart</span>
                </div>
                <div>
                  <p className="text-label-md text-outline uppercase tracking-wider">Guarantee</p>
                  <p className="text-body-md font-semibold text-primary">UniLend Shield</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Product Detail & Rental Calculator (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Title & Base Info */}
            <div className="bg-surface-container-lowest/90 backdrop-blur-md rounded-xl p-6 border border-outline-variant/30 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-label-md text-secondary font-bold tracking-wider uppercase">
                  {item.categoryLabel ?? "ELECTRONICS & CAMERAS"}
                </span>
                <button
                  aria-label={isFavorited ? "Saved to wishlist" : "Add to wishlist"}
                  title={isFavorited ? "Saved to wishlist" : "Add to wishlist"}
                  onClick={() => {
                    if (!isAuthenticated) {
                      login();
                    }
                    toggleFavorite(item.id);
                  }}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                    isFavorited
                      ? "border-[#f83256]/30 bg-rose-50/80 text-[#f83256] scale-105"
                      : "border-outline-variant/40 text-on-surface-variant hover:text-primary hover:border-outline"
                  }`}
                  type="button"
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      isFavorited ? "fill-icon" : ""
                    }`}
                  >
                    {isFavorited ? "favorite" : "favorite_border"}
                  </span>
                </button>
              </div>

              <h1 className="text-headline-md text-primary tracking-tight mb-2">{item.title}</h1>

              {/* Trust & Location Bar */}
              <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-label-numeric text-on-surface-variant pb-4 border-b border-surface-container">
                <span className="inline-flex items-center text-primary font-semibold">
                  <span className="material-symbols-outlined text-[16px] text-amber-500 fill-icon mr-1">
                    star
                  </span>
                  {item.rating.toFixed(1)}
                </span>
                <span className="text-outline font-normal">({item.reviews} verified reviews)</span>
                <span className="text-outline">•</span>
                <span className="font-medium text-primary">Top Rated Lender</span>
                <span className="text-outline">•</span>
                <span className="inline-flex items-center text-outline">
                  <span className="material-symbols-outlined text-[15px] mr-0.5">location_on</span>
                  {item.location} ({item.distance ?? "2.4 mi"})
                </span>
              </div>

              {/* Pricing Cluster */}
              <div className="py-4 flex items-baseline justify-between">
                <div>
                  <span className="text-headline-md font-bold text-primary tracking-tight">
                    ${item.pricePerDay}
                  </span>
                  <span className="text-body-md text-outline"> / day</span>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-label-md bg-surface-container text-primary font-semibold">
                    ${weeklyRateDisplay} / week — save 15%
                  </span>
                </div>
              </div>

              {/* Editorial Summary */}
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                {item.summary}
              </p>
            </div>

            {/* Interactive Rental Calculator Card */}
            <div className="bg-surface-container-lowest/95 backdrop-blur-md rounded-xl p-6 border border-outline-variant/30 shadow-xs flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h2 className="text-title-md text-primary">Rental Configuration</h2>
                <span className="text-label-md text-outline uppercase tracking-wider">
                  Real-Time Quote
                </span>
              </div>

              {/* Date Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-label-md text-outline uppercase tracking-wider block">
                    Rental Schedule
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setRentalDays((d) => Math.max(1, d - 1));
                        setRequestSubmitted(false);
                      }}
                      className="w-6 h-6 rounded border border-outline-variant/50 bg-surface-container-lowest text-primary hover:bg-surface-container flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                      title="Decrease rental days"
                    >
                      −
                    </button>
                    <span className="text-label-md font-semibold text-primary min-w-[54px] text-center">
                      {rentalDays} {rentalDays === 1 ? "Day" : "Days"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setRentalDays((d) => Math.min(14, d + 1));
                        setRequestSubmitted(false);
                      }}
                      className="w-6 h-6 rounded border border-outline-variant/50 bg-surface-container-lowest text-primary hover:bg-surface-container flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                      title="Increase rental days"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-surface-bright border border-outline-variant/40">
                  <div className="flex items-center gap-2 px-2 py-1.5 bg-surface-container-lowest rounded border border-outline-variant/20 shadow-2xs">
                    <span className="material-symbols-outlined text-[18px] text-outline">
                      calendar_today
                    </span>
                    <div>
                      <p className="text-label-md text-outline">Start Date</p>
                      <p className="text-label-numeric font-semibold text-primary">
                        {startDateLabel}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 bg-surface-container-lowest rounded border border-outline-variant/20 shadow-2xs">
                    <span className="material-symbols-outlined text-[18px] text-outline">
                      event_available
                    </span>
                    <div>
                      <p className="text-label-md text-outline">
                        Return Date ({rentalDays} {rentalDays === 1 ? "Day" : "Days"})
                      </p>
                      <p className="text-label-numeric font-semibold text-primary">
                        {returnDateLabel}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Handover / Delivery Mode Selection */}
              <div className="space-y-2">
                <label className="text-label-md text-outline uppercase tracking-wider block">
                  Handover Preference
                </label>
                <div className="space-y-2">
                  <label
                    onClick={() => {
                      setDeliveryMode("pickup");
                      setRequestSubmitted(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      deliveryMode === "pickup"
                        ? "border-primary bg-surface-bright"
                        : "border-outline-variant/40 hover:border-outline bg-surface-container-lowest"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        checked={deliveryMode === "pickup"}
                        onChange={() => setDeliveryMode("pickup")}
                        className="w-4 h-4 text-primary focus:ring-primary border-outline accent-primary"
                        name="delivery"
                        type="radio"
                      />
                      <div>
                        <span className="text-body-md font-semibold text-primary block">
                          Local Pickup in {item.pickupArea ?? "Mission District, SF"}
                        </span>
                        <span className="text-body-sm text-outline">
                          Exact address shared after rental confirmation
                        </span>
                      </div>
                    </div>
                    <span className="text-label-md font-bold text-primary">Free</span>
                  </label>

                  <label
                    onClick={() => {
                      setDeliveryMode("courier");
                      setRequestSubmitted(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      deliveryMode === "courier"
                        ? "border-primary bg-surface-bright"
                        : "border-outline-variant/40 hover:border-outline bg-surface-container-lowest"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        checked={deliveryMode === "courier"}
                        onChange={() => setDeliveryMode("courier")}
                        className="w-4 h-4 text-primary focus:ring-primary border-outline accent-primary"
                        name="delivery"
                        type="radio"
                      />
                      <div>
                        <span className="text-body-md font-semibold text-primary block">
                          Direct Courier Delivery
                        </span>
                        <span className="text-body-sm text-outline">
                          Delivered safely to your door by 9:00 AM
                        </span>
                      </div>
                    </div>
                    <span className="text-label-md font-bold text-primary">+$15.00</span>
                  </label>
                </div>
              </div>

              {/* Refundable Deposit Line */}
              <div className="p-3 rounded-lg bg-surface-container-low/70 border border-outline-variant/30 flex items-center justify-between text-body-sm">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px] text-outline">info</span>
                  <span>Refundable Security Deposit</span>
                </div>
                <span className="font-semibold text-primary">
                  ${depositDisplay.toFixed(2)} (held, not charged)
                </span>
              </div>

              {/* Ledger Cost Breakdown */}
              <div className="space-y-2 pt-2 border-t border-surface-container text-body-md">
                <div className="flex justify-between text-on-surface-variant">
                  <span>
                    ${item.pricePerDay.toFixed(2)} × {rentalDays}{" "}
                    {rentalDays === 1 ? "day" : "days"}
                  </span>
                  <span className="text-label-numeric text-primary">
                    ${baseRentCost.toFixed(2)}
                  </span>
                </div>

                {weeklyDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Weekly Rental Discount (15% off)</span>
                    <span className="text-label-numeric">−${weeklyDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    Damage Protection Waiver (Basic)
                    <span
                      className="material-symbols-outlined text-[14px] text-outline"
                      title="Covers accidental minor wear & tear up to $3,000"
                    >
                      help_outline
                    </span>
                  </span>
                  <span className="text-label-numeric text-primary">
                    ${damageWaiverFee.toFixed(2)}
                  </span>
                </div>

                {deliveryMode === "courier" && (
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Direct Courier Delivery</span>
                    <span className="text-label-numeric text-primary">
                      ${courierFee.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-on-surface-variant">
                  <span>UniLend Platform Service Fee</span>
                  <span className="text-label-numeric text-primary">
                    ${platformServiceFee.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between pt-3 border-t border-surface-container text-title-md font-bold text-primary">
                  <span>Estimated Total</span>
                  <span className="text-title-lg font-bold">${estimatedTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      login();
                    }
                    setRequestSubmitted(true);
                  }}
                  className="w-full py-3.5 px-6 rounded-lg bg-primary text-on-primary text-body-lg font-semibold hover:bg-primary-container transition-all duration-150 ease-out shadow-xs flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                  type="button"
                >
                  <span>
                    {requestSubmitted
                      ? `Rental Request Sent — $${estimatedTotal.toFixed(2)}`
                      : `Request to Rent — $${estimatedTotal.toFixed(2)}`}
                  </span>
                  <span className="material-symbols-outlined text-[18px]">
                    {requestSubmitted ? "check_circle" : "arrow_forward"}
                  </span>
                </button>

                {requestSubmitted && (
                  <div className="p-3 rounded-lg bg-emerald-50/90 border border-emerald-500/30 text-emerald-900 text-body-sm flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-emerald-600 mt-0.5">
                      verified
                    </span>
                    <div>
                      <p className="font-semibold">
                        Request sent to Marcus Vance ({startDateLabel} – {returnDateLabel})
                      </p>
                      <p className="text-emerald-800/90 mt-0.5">
                        Your card will only be charged once Marcus confirms handover.
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setMessageSent(false);
                    setMessageModalOpen(true);
                  }}
                  className="w-full py-3 px-6 rounded-lg bg-surface-container-lowest border border-outline-variant text-primary text-body-md font-semibold hover:bg-surface-bright transition-all duration-150 ease-out flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
                  <span>Message Lender / Ask a Question</span>
                </button>
              </div>

              {/* Micro Trust Signposts */}
              <div className="pt-3 border-t border-surface-container space-y-1.5 text-body-sm text-outline">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px] text-primary">
                    flash_on
                  </span>
                  <span>Instant booking confirmation available upon identity review</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px] text-primary">
                    event_busy
                  </span>
                  <span>Free cancellation up to 24 hours prior to scheduled pickup</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px] text-primary">
                    verified
                  </span>
                  <span>Identity-verified lender &amp; serial-numbered inventory lock</span>
                </div>
              </div>
            </div>

            {/* 3. Owner / Lender Profile Card */}
            <div className="bg-surface-container-lowest/90 backdrop-blur-md rounded-xl p-5 border border-outline-variant/30 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="relative flex-shrink-0">
                  <img
                    className="w-[52px] h-[52px] rounded-full object-cover border-2 border-surface-container"
                    alt="Close-up professional portrait of Marcus Vance, a confident creative director."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuColqmD0BU0zcxh9H-0BTGrCWP0dwHhhzEy2bDmKlYnoqE4RMeX89Y6mj7f457ncuFPSSv8vgZKvZTuGIyjwDcY0wqWQVnAG7m4pk3h2oK6Vl0s9eSSfPLHeytYpLE_NnNWm_Dz_OJefyOjEV1e1YnDLGIMWMd5yvdcNzDgqzNebbuOOg-EHVN5QNwgym_6suYvPCPh-r6YEhdiTOM8omafSe3V4pS1sSQnPy0YhjVuXMZ09IgHbdfn-w"
                  />
                  <span
                    className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-surface-container-lowest"
                    title="Online now"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-title-md text-primary font-bold">Marcus Vance</h3>
                    <span
                      className="material-symbols-outlined text-[16px] text-secondary"
                      title="Verified Lender"
                    >
                      verified
                    </span>
                  </div>
                  <p className="text-body-sm text-outline">
                    Member since 2022 • Usually responds within 15 min
                  </p>
                </div>
              </div>
              <div className="text-right border-l border-surface-container pl-4">
                <div className="flex items-center gap-1 justify-end text-label-numeric font-bold text-primary">
                  <span className="material-symbols-outlined text-[15px] text-amber-500 fill-icon">
                    star
                  </span>
                  <span>5.0</span>
                </div>
                <p className="text-body-sm text-outline">84 rentals</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Detailed Specifications & Rental Guidelines */}
        <section className="mb-16">
          <div className="bg-surface-container-lowest/95 backdrop-blur-md rounded-xl border border-outline-variant/30 p-8 shadow-xs">
            <div className="mb-6 border-b border-surface-container pb-4">
              <h2 className="text-headline-sm text-primary">
                Equipment Details &amp; Rental Specifications
              </h2>
              <p className="text-body-md text-outline">
                Everything you need to plan your shoot with total confidence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Section 1: Included in Kit */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                  </div>
                  <h3 className="text-title-md font-semibold text-primary">Included in Kit</h3>
                </div>
                <ul className="space-y-2.5 text-body-md text-on-surface-variant">
                  {(item.includedInKit ?? []).map((kitItem) => (
                    <li key={kitItem} className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span>{kitItem}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 2: Technical Specifications */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[16px]">tune</span>
                  </div>
                  <h3 className="text-title-md font-semibold text-primary">Item Specifications</h3>
                </div>
                <div className="space-y-2.5 text-body-md">
                  {(item.specifications ?? []).map((spec, index, arr) => (
                    <div
                      key={spec.label}
                      className={`flex justify-between py-1 ${
                        index < arr.length - 1 ? "border-b border-surface-container" : ""
                      }`}
                    >
                      <span className="text-outline">{spec.label}</span>
                      <span className="font-medium text-primary text-right">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Rental Terms & Care Rules */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[16px]">policy</span>
                  </div>
                  <h3 className="text-title-md font-semibold text-primary">
                    Rental Terms &amp; Rules
                  </h3>
                </div>
                <ul className="space-y-2.5 text-body-md text-on-surface-variant">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">
                      check_circle
                    </span>
                    <span>
                      Renter must be at least 18 years old with a verified government ID on UniLend.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">
                      check_circle
                    </span>
                    <span>
                      Strictly no unauthorized subleasing or third-party transfer permitted.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">
                      check_circle
                    </span>
                    <span>
                      Equipment must remain inside the padded Pelican case during vehicle transit.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">
                      check_circle
                    </span>
                    <span>
                      Notify lender and report any technical anomaly immediately via platform chat.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Reviews & Ratings Section */}
        <section className="mb-16">
          <div className="bg-surface-container-lowest/95 backdrop-blur-md rounded-xl border border-outline-variant/30 p-8 shadow-xs">
            {/* Score Matrix Cluster */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-8 border-b border-surface-container mb-8">
              <div className="lg:col-span-4 flex items-center gap-5">
                <div className="text-center">
                  <span className="text-display-hero-mobile md:text-display-hero font-bold text-primary tracking-tight leading-none">
                    {item.rating.toFixed(1)}
                  </span>
                  <p className="text-label-md uppercase tracking-wider text-outline mt-1">
                    Out of 5.0
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className="material-symbols-outlined text-[20px] fill-icon"
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <p className="text-body-md font-medium text-primary">
                    {item.reviews} Verified Community Reviews
                  </p>
                  <p className="text-body-sm text-outline">
                    100% of renters recommended this kit
                  </p>
                </div>
              </div>

              {/* Sub-dimension meters */}
              <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-surface-bright border border-outline-variant/30">
                  <p className="text-label-md text-outline uppercase tracking-wider">Accuracy</p>
                  <p className="text-headline-sm font-bold text-primary">5.0</p>
                  <div className="w-full bg-surface-container h-1 rounded-full mt-2">
                    <div className="bg-primary h-1 rounded-full w-full" />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-surface-bright border border-outline-variant/30">
                  <p className="text-label-md text-outline uppercase tracking-wider">
                    Communication
                  </p>
                  <p className="text-headline-sm font-bold text-primary">5.0</p>
                  <div className="w-full bg-surface-container h-1 rounded-full mt-2">
                    <div className="bg-primary h-1 rounded-full w-full" />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-surface-bright border border-outline-variant/30">
                  <p className="text-label-md text-outline uppercase tracking-wider">Cleanliness</p>
                  <p className="text-headline-sm font-bold text-primary">4.9</p>
                  <div className="w-full bg-surface-container h-1 rounded-full mt-2">
                    <div className="bg-primary h-1 rounded-full w-[98%]" />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-surface-bright border border-outline-variant/30">
                  <p className="text-label-md text-outline uppercase tracking-wider">Condition</p>
                  <p className="text-headline-sm font-bold text-primary">5.0</p>
                  <div className="w-full bg-surface-container h-1 rounded-full mt-2">
                    <div className="bg-primary h-1 rounded-full w-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Editorial Reviews */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {EDITORIAL_REVIEWS.map((review) => (
                <div
                  key={review.id}
                  className="p-5 rounded-lg bg-surface-bright border border-outline-variant/30 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          className="w-9 h-9 rounded-full object-cover"
                          alt={review.alt}
                          src={review.avatar}
                        />
                        <div>
                          <h4 className="text-body-md font-semibold text-primary">
                            {review.author}
                          </h4>
                          <span className="text-body-sm text-outline">{review.date}</span>
                        </div>
                      </div>
                      <div className="flex text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span
                            key={s}
                            className="material-symbols-outlined text-[15px] fill-icon"
                          >
                            star
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-body-md text-on-surface-variant leading-relaxed">
                      {review.quote}
                    </p>
                  </div>
                  <p className="text-label-md text-outline mt-4">{review.meta}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Related / Frequently Rented Together Section (UniLend Cards) */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-headline-sm text-primary">
                Frequently Rented Together &amp; Similar Gear
              </h2>
              <p className="text-body-md text-outline">
                Complete your kit with curated professional accessories from verified owners in your
                area.
              </p>
            </div>
            <Link
              className="hidden md:inline-flex items-center gap-1 text-label-lg font-semibold text-primary hover:underline underline-offset-4"
              href="/rent"
            >
              <span>View all cameras &amp; lenses</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FREQUENTLY_RENTED_TOGETHER.map((related) => (
              <div
                key={related.id}
                className="bg-surface-container-lowest/90 backdrop-blur-md rounded-xl border border-outline-variant/30 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <Link
                    href={`/items/${related.linkedItemId}`}
                    className="relative block w-full aspect-[4/3] rounded-lg overflow-hidden bg-surface-bright mb-3"
                  >
                    <img
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      alt={related.alt}
                      src={related.image}
                    />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-label-md bg-surface-container-lowest/90 text-primary border border-outline-variant/30 font-medium">
                      {related.badge}
                    </span>
                  </Link>
                  <div className="flex items-center gap-1 text-label-numeric text-primary mb-1">
                    <span className="material-symbols-outlined text-[14px] text-amber-500 fill-icon">
                      star
                    </span>
                    <span className="font-bold">{related.rating}</span>
                    <span className="text-outline text-body-sm">({related.reviews})</span>
                  </div>
                  <Link href={`/items/${related.linkedItemId}`}>
                    <h3 className="text-title-md text-primary font-bold line-clamp-1 group-hover:text-secondary transition-colors">
                      {related.title}
                    </h3>
                  </Link>
                  <p className="text-body-sm text-outline">{related.location}</p>
                </div>

                <div className="pt-4 mt-3 border-t border-surface-container flex items-center justify-between">
                  <div>
                    <span className="text-title-md font-bold text-primary">
                      ${related.pricePerDay}
                    </span>
                    <span className="text-body-sm text-outline"> / day</span>
                  </div>
                  <Link
                    href={`/items/${related.linkedItemId}`}
                    className="px-3 py-1.5 rounded-lg bg-surface-bright hover:bg-primary hover:text-on-primary text-primary text-label-md font-semibold border border-outline-variant/40 transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Shared Footer Component */}
      <footer className="docked full-width bottom bg-surface-container-lowest border-t border-outline-variant/30">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 py-10 w-full flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-6">
            <span className="text-title-md font-bold text-primary">UNILEND.™</span>
            <span className="text-body-sm text-on-surface-variant">
              © 2025 UniLend Inc. All rights reserved.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Link
              className="text-label-md text-on-surface-variant hover:text-on-surface transition-colors duration-150"
              href="/#footer"
            >
              Privacy Policy
            </Link>
            <Link
              className="text-label-md text-on-surface-variant hover:text-on-surface transition-colors duration-150"
              href="/#footer"
            >
              Terms of Service
            </Link>
            <Link
              className="text-label-md text-on-surface-variant hover:text-on-surface transition-colors duration-150"
              href="/#footer"
            >
              Security
            </Link>
            <Link
              className="text-label-md text-on-surface-variant hover:text-on-surface transition-colors duration-150"
              href="/#footer"
            >
              Cookie Preferences
            </Link>
          </div>
        </div>
      </footer>

      {/* High-Res Image Lightbox Modal */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full bg-surface-container-lowest rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/30"
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-surface-container">
              <span className="text-title-md font-semibold text-primary">
                {item.title} — Image {activeImageIndex + 1} of {gallery.length}
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="relative aspect-[16/10] bg-black flex items-center justify-center">
              <img
                src={gallery[activeImageIndex]?.src ?? item.image}
                alt={gallery[activeImageIndex]?.alt ?? item.alt}
                className="max-h-[75vh] w-auto object-contain"
              />
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-primary flex items-center justify-center shadow-md hover:bg-white cursor-pointer"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-primary flex items-center justify-center shadow-md hover:bg-white cursor-pointer"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Lender Modal */}
      {messageModalOpen && (
        <div
          onClick={() => setMessageModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-xl"
          >
            <div className="flex items-center justify-between pb-4 border-b border-surface-container mb-4">
              <div className="flex items-center gap-3">
                <img
                  className="w-10 h-10 rounded-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuColqmD0BU0zcxh9H-0BTGrCWP0dwHhhzEy2bDmKlYnoqE4RMeX89Y6mj7f457ncuFPSSv8vgZKvZTuGIyjwDcY0wqWQVnAG7m4pk3h2oK6Vl0s9eSSfPLHeytYpLE_NnNWm_Dz_OJefyOjEV1e1YnDLGIMWMd5yvdcNzDgqzNebbuOOg-EHVN5QNwgym_6suYvPCPh-r6YEhdiTOM8omafSe3V4pS1sSQnPy0YhjVuXMZ09IgHbdfn-w"
                  alt="Marcus Vance"
                />
                <div>
                  <h3 className="text-title-md font-bold text-primary">Message Marcus Vance</h3>
                  <p className="text-body-sm text-outline">Typically replies within 15 minutes</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMessageModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline hover:text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {messageSent ? (
              <div className="py-6 text-center space-y-3">
                <span className="material-symbols-outlined text-4xl text-emerald-600">
                  mark_chat_read
                </span>
                <p className="text-title-md font-semibold text-primary">
                  Message Sent to Marcus!
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  You&apos;ll receive a notification in your header inbox as soon as Marcus replies.
                </p>
                <button
                  type="button"
                  onClick={() => setMessageModalOpen(false)}
                  className="mt-2 px-5 py-2 rounded-lg bg-primary text-on-primary text-label-lg font-semibold cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setMessageSent(true);
                  setMessageText("");
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-label-md text-outline uppercase tracking-wider mb-1.5">
                    Regarding: {item.title}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Hi Marcus, is this kit available for pickup on Oct 24 around 10:00 AM?"
                    className="w-full rounded-lg border border-outline-variant/60 bg-surface-bright p-3 text-body-md text-primary placeholder:text-outline focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setMessageModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-outline-variant/50 text-label-lg text-on-surface-variant hover:text-primary cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-primary text-on-primary text-label-lg font-semibold hover:bg-primary-container cursor-pointer"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
