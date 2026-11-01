"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { itemService } from "../../../lib/api/itemService";
import { useAuth } from "../../auth-context";
import {
  CATEGORY_LABELS_VI,
  FREQUENTLY_RENTED_TOGETHER,
  getRentalItemById,
  getSystemUser,
  isReliableImageUrl,
  SYSTEM_USERS,
  type RentalItem,
} from "../../rental-catalog";
import { AppHeader } from "../../app-header";

const EDITORIAL_REVIEWS = [
  {
    id: "minh-quan",
    author: SYSTEM_USERS[2].fullName,
    university: SYSTEM_USERS[2].university,
    date: "18 Th10, 2026",
    avatar: SYSTEM_USERS[2].avatar,
    alt: `Chân dung ${SYSTEM_USERS[2].fullName}`,
    quote:
      '"Thiết bị cực kỳ mới và đầy đủ phụ kiện như mô tả. Chủ máy sạc đầy pin trước khi đặt vào Smart Locker Campus. Nhận máy bằng mã PIN mất chưa tới 30 giây!"',
    meta: "Đã thuê 4 ngày • Đồ án Kỹ thuật & Truyền thông",
  },
  {
    id: "lan-anh",
    author: SYSTEM_USERS[3].fullName,
    university: SYSTEM_USERS[3].university,
    date: "04 Th10, 2026",
    avatar: SYSTEM_USERS[3].avatar,
    alt: `Chân dung ${SYSTEM_USERS[3].fullName}`,
    quote:
      '"Sử dụng cho sự kiện triển lãm 3 ngày liên tục. Chất lượng hoạt động hoàn hảo, chủ thiết bị trên hệ thống phản hồi tin nhắn hướng dẫn trong vòng 5 phút."',
    meta: "Đã thuê 3 ngày • Triển lãm Đồ án Sinh viên",
  },
  {
    id: "hoang-nam",
    author: SYSTEM_USERS[4].fullName,
    university: SYSTEM_USERS[4].university,
    date: "21 Th09, 2026",
    avatar: SYSTEM_USERS[4].avatar,
    alt: `Chân dung ${SYSTEM_USERS[4].fullName}`,
    quote:
      '"Hộp chống sốc đi kèm giúp di chuyển trong khuôn viên trường cực kỳ an tâm. Hoàn trả qua Smart Locker tự động giải tỏa tiền cọc Escrow ngay lập tức."',
    meta: "Đã thuê 2 ngày • Dự án CLB Truyền thông",
  },
];

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const baseItem = getRentalItemById(resolvedParams.id);
  const [liveItemOverride, setLiveItemOverride] = useState<Partial<RentalItem> | null>(null);
  const item: RentalItem = liveItemOverride ? { ...baseItem, ...liveItemOverride } : baseItem;
  const { isAuthenticated, favorites, toggleFavorite, login } = useAuth();

  useEffect(() => {
    const initial = getRentalItemById(resolvedParams.id);
    const numericId = initial.dbId ?? Number(resolvedParams.id);
    if (Number.isFinite(numericId) && numericId > 0) {
      itemService
        .getById(numericId)
        .then((dbItem) => {
          if (dbItem && dbItem.title) {
            const resolvedOwner = getSystemUser({
              id: dbItem.owner?.id ?? initial.ownerId,
              fullName: dbItem.owner?.fullName ?? initial.ownerName,
              email: dbItem.owner?.email ?? initial.ownerEmail,
            });
            const dbImg = dbItem.images?.[0]?.imageUrl ?? dbItem.imageUrls?.[0];
            setLiveItemOverride({
              dbId: dbItem.id,
              title: dbItem.title || initial.title,
              summary: dbItem.description || initial.summary,
              ownerId: dbItem.owner?.id ?? initial.ownerId ?? resolvedOwner.id,
              ownerName: dbItem.owner?.fullName || initial.ownerName || resolvedOwner.fullName,
              ownerEmail: dbItem.owner?.email || initial.ownerEmail || resolvedOwner.email,
              ownerAvatar:
                (isReliableImageUrl(dbItem.owner?.avatarUrl) ? dbItem.owner?.avatarUrl : null) ||
                initial.ownerAvatar ||
                resolvedOwner.avatar,
              ownerUniversity:
                dbItem.owner?.university || initial.ownerUniversity || resolvedOwner.university,
              image: initial.image || (isReliableImageUrl(dbImg) ? dbImg! : initial.image),
            });
          }
        })
        .catch(() => {
          // Keep catalog item when backend is offline
        });
    }
  }, [resolvedParams.id]);

  const gallery =
    item.gallery && item.gallery.length > 0
      ? item.gallery
      : [{ src: item.image, alt: item.alt }];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [rentalDays, setRentalDays] = useState(3);
  const [deliveryMode, setDeliveryMode] = useState<"pickup" | "courier">("pickup");
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  const isFavorited = isAuthenticated && favorites.includes(item.id);

  // Date display calculation
  const startDateLabel = "24 Th10, 2026";
  const returnDateObj = new Date(2026, 9, 24 + rentalDays);
  const returnDateLabel = `${returnDateObj.getDate()} Th${
    returnDateObj.getMonth() + 1
  }, ${returnDateObj.getFullYear()}`;

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
      {/* Ambient Light Atmosphere */}
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

      {/* Synchronized Header */}
      <AppHeader />

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
            Trang chủ
          </Link>
          <span className="material-symbols-outlined text-[16px] text-outline-variant">
            chevron_right
          </span>
          <Link
            className="text-on-surface-variant hover:text-primary transition-colors duration-150"
            href="/rent"
          >
            Chợ thiết bị
          </Link>
          <span className="material-symbols-outlined text-[16px] text-outline-variant">
            chevron_right
          </span>
          <Link
            className="text-on-surface-variant hover:text-primary transition-colors duration-150"
            href="/rent#categories"
          >
            {CATEGORY_LABELS_VI[item.category] ?? item.category}
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
                  Đã Kiểm Định Chính Hãng
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-label-md uppercase tracking-wider bg-surface-container-lowest/95 backdrop-blur-md text-on-surface-variant border border-outline-variant/40 shadow-xs">
                  <span className="material-symbols-outlined text-[14px] text-primary">
                    verified_user
                  </span>
                  Bảo hiểm tới ${insuredDisplay}
                </span>
              </div>

              {/* Top Right Condition Pill */}
              <div className="absolute top-6 right-6 z-20">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-label-md bg-primary text-on-primary font-semibold shadow-xs">
                  {item.conditionScore ?? "Như mới (Đạt 9.8/10)"}
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
                  aria-label="Ảnh trước"
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
                  aria-label="Ảnh tiếp theo"
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
                  <span>Nhấn để phóng to ảnh gốc</span>
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
                  <p className="text-label-md text-outline uppercase tracking-wider">Khử khuẩn</p>
                  <p className="text-body-md font-semibold text-primary">Đã Vệ Sinh &amp; Test</p>
                </div>
              </div>

              <div className="bg-surface-container-lowest/85 backdrop-blur-md rounded-xl p-4 border border-outline-variant/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                </div>
                <div>
                  <p className="text-label-md text-outline uppercase tracking-wider">Bàn giao</p>
                  <p className="text-body-md font-semibold text-primary">Smart Locker 24/7</p>
                </div>
              </div>

              <div className="bg-surface-container-lowest/85 backdrop-blur-md rounded-xl p-4 border border-outline-variant/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px]">shield_with_heart</span>
                </div>
                <div>
                  <p className="text-label-md text-outline uppercase tracking-wider">Bảo chứng</p>
                  <p className="text-body-md font-semibold text-primary">SafeGuarantee™</p>
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
                  {item.categoryLabel ?? "THIẾT BỊ CÔNG NGHỆ & NHIẾP ẢNH"}
                </span>
                <button
                  aria-label={isFavorited ? "Đã lưu yêu thích" : "Lưu vào yêu thích"}
                  title={isFavorited ? "Đã lưu yêu thích" : "Lưu vào yêu thích"}
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
                <span className="text-outline font-normal">({item.reviews} đánh giá xác thực)</span>
                <span className="text-outline">•</span>
                <span className="font-medium text-primary">Chủ đồ Uy tín Cao</span>
                <span className="text-outline">•</span>
                <span className="inline-flex items-center text-outline">
                  <span className="material-symbols-outlined text-[15px] mr-0.5">location_on</span>
                  {item.location} ({item.distance ?? "0.5 km"})
                </span>
              </div>

              {/* Pricing Cluster */}
              <div className="py-4 flex items-baseline justify-between">
                <div>
                  <span className="text-headline-md font-bold text-primary tracking-tight">
                    ${item.pricePerDay}
                  </span>
                  <span className="text-body-md text-outline"> / ngày</span>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-label-md bg-surface-container text-primary font-semibold">
                    ${weeklyRateDisplay} / tuần — tiết kiệm 15%
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
                <h2 className="text-title-md text-primary">Cấu Hình Thuê Thiết Bị</h2>
                <span className="text-label-md text-outline uppercase tracking-wider">
                  Báo Giá Tức Thì
                </span>
              </div>

              {/* Date Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-label-md text-outline uppercase tracking-wider block">
                    Thời gian thuê
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setRentalDays((d) => Math.max(1, d - 1));
                        setRequestSubmitted(false);
                      }}
                      className="w-6 h-6 rounded border border-outline-variant/50 bg-surface-container-lowest text-primary hover:bg-surface-container flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                      title="Giảm số ngày thuê"
                    >
                      −
                    </button>
                    <span className="text-label-md font-semibold text-primary min-w-[64px] text-center">
                      {rentalDays} ngày
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setRentalDays((d) => Math.min(14, d + 1));
                        setRequestSubmitted(false);
                      }}
                      className="w-6 h-6 rounded border border-outline-variant/50 bg-surface-container-lowest text-primary hover:bg-surface-container flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                      title="Tăng số ngày thuê"
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
                      <p className="text-label-md text-outline">Ngày nhận</p>
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
                      <p className="text-label-md text-outline">Ngày trả ({rentalDays} ngày)</p>
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
                  Phương thức nhận thiết bị
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
                          Nhận tại {item.pickupArea ?? "Smart Locker Khu Công Nghệ"}
                        </span>
                        <span className="text-body-sm text-outline">
                          Cấp mã PIN mở tủ khóa 24/7 ngay khi xác nhận
                        </span>
                      </div>
                    </div>
                    <span className="text-label-md font-bold text-primary">Miễn phí</span>
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
                          Giao tận nơi trong khuôn viên (Campus Express)
                        </span>
                        <span className="text-body-sm text-outline">
                          Giao bảo đảm trong hộp chống sốc trước 09:00 sáng
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
                  <span>Tiền cọc hoàn trả (Escrow Hold)</span>
                </div>
                <span className="font-semibold text-primary">
                  ${depositDisplay.toFixed(2)} (Chỉ phong tỏa, hoàn 100%)
                </span>
              </div>

              {/* Ledger Cost Breakdown */}
              <div className="space-y-2 pt-2 border-t border-surface-container text-body-md">
                <div className="flex justify-between text-on-surface-variant">
                  <span>
                    ${item.pricePerDay.toFixed(2)} × {rentalDays} ngày
                  </span>
                  <span className="text-label-numeric text-primary">
                    ${baseRentCost.toFixed(2)}
                  </span>
                </div>

                {weeklyDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Ưu đãi thuê theo tuần (Giảm 15%)</span>
                    <span className="text-label-numeric">−${weeklyDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    Gói bảo vệ thiệt hại cơ bản (SafeGuarantee™)
                    <span
                      className="material-symbols-outlined text-[14px] text-outline"
                      title="Bảo hiểm hao mòn và sự cố ngoài ý muốn lên tới $3,000"
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
                    <span>Phí giao tận nơi Campus Express</span>
                    <span className="text-label-numeric text-primary">
                      ${courierFee.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-on-surface-variant">
                  <span>Phí vận hành nền tảng &amp; Smart Locker</span>
                  <span className="text-label-numeric text-primary">
                    ${platformServiceFee.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between pt-3 border-t border-surface-container text-title-md font-bold text-primary">
                  <span>Tổng chi phí dự kiến</span>
                  <span className="text-title-lg font-bold">${estimatedTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-2 pt-2">
                <Link
                  href={`/rental-request?itemId=${item.id}&days=${rentalDays}&mode=${deliveryMode}`}
                  className="btn-unilend-cta w-full py-3.5 px-6 rounded-lg text-body-lg font-semibold flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                >
                  <span>Tiếp tục Đặt Thuê Thiết Bị — ${estimatedTotal.toFixed(2)}</span>
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </Link>

                {requestSubmitted && (
                  <div className="p-3 rounded-lg bg-emerald-50/90 border border-emerald-500/30 text-emerald-900 text-body-sm flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-emerald-600 mt-0.5">
                      verified
                    </span>
                    <div>
                      <p className="font-semibold">
                        Đã gửi yêu cầu thuê ({startDateLabel} – {returnDateLabel})
                      </p>
                      <p className="text-emerald-800/90 mt-0.5">
                        Thẻ của bạn chỉ bị trừ phí sau khi chủ thiết bị xác nhận bàn giao.
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setMessageSent(false);
                    setMessageModalOpen(true);
                  }}
                  className="btn-unilend-cta-soft w-full py-3 px-6 rounded-lg text-body-md font-semibold flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
                  <span>Nhắn tin cho Chủ thiết bị / Hỏi thêm</span>
                </button>
              </div>

              {/* Micro Trust Signposts */}
              <div className="pt-3 border-t border-surface-container space-y-1.5 text-body-sm text-outline">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px] text-primary">
                    flash_on
                  </span>
                  <span>Xác nhận đặt thuê tức thì đối với tài khoản sinh viên (.edu)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px] text-primary">
                    event_busy
                  </span>
                  <span>Miễn phí hủy đơn trước giờ nhận thiết bị 24 tiếng</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px] text-primary">
                    verified
                  </span>
                  <span>Đối soát số Serial tự động tại trạm Smart Locker</span>
                </div>
              </div>
            </div>

            {/* 3. Owner / Lender Profile Card */}
            <div className="bg-surface-container-lowest/90 backdrop-blur-md rounded-xl p-5 border border-outline-variant/30 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="relative flex-shrink-0">
                  <img
                    className="w-[52px] h-[52px] rounded-full object-cover border-2 border-surface-container"
                    alt={`Chủ sở hữu thiết bị ${item.ownerName}`}
                    src={item.ownerAvatar}
                  />
                  <span
                    className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-surface-container-lowest"
                    title="Đang trực tuyến"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-title-md text-primary font-bold">{item.ownerName}</h3>
                    <span
                      className="material-symbols-outlined text-[16px] text-secondary"
                      title="Chủ đồ đã xác thực (.edu)"
                    >
                      verified
                    </span>
                  </div>
                  <p className="text-body-sm text-outline">
                    {item.ownerUniversity} • Phản hồi trong ~{item.ownerResponseTime ?? "10 phút"}
                  </p>
                </div>
              </div>
              <div className="text-right border-l border-surface-container pl-4">
                <div className="flex items-center gap-1 justify-end text-label-numeric font-bold text-primary">
                  <span className="material-symbols-outlined text-[15px] text-amber-500 fill-icon">
                    star
                  </span>
                  <span>{(item.ownerRating ?? item.rating).toFixed(2)}</span>
                </div>
                <p className="text-body-sm text-outline">
                  {item.ownerReviews ?? 48} lượt đánh giá
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Detailed Specifications & Rental Guidelines */}
        <section className="mb-16">
          <div className="bg-surface-container-lowest/95 backdrop-blur-md rounded-xl border border-outline-variant/30 p-8 shadow-xs">
            <div className="mb-6 border-b border-surface-container pb-4">
              <h2 className="text-headline-sm text-primary">
                Thông Số Kỹ Thuật &amp; Bộ Phụ Kiện Đi Kèm
              </h2>
              <p className="text-body-md text-outline">
                Mọi thông tin chi tiết giúp bạn chuẩn bị tốt nhất cho dự án của mình.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Section 1: Included in Kit */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                  </div>
                  <h3 className="text-title-md font-semibold text-primary">Phụ Kiện Trong Bộ</h3>
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
                  <h3 className="text-title-md font-semibold text-primary">Thông Số Kỹ Thuật</h3>
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
                    Quy Định Thuê &amp; Bảo Quản
                  </h3>
                </div>
                <ul className="space-y-2.5 text-body-md text-on-surface-variant">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">
                      check_circle
                    </span>
                    <span>
                      Người thuê cần có tài khoản sinh viên/giảng viên đã xác thực trên UniLend.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">
                      check_circle
                    </span>
                    <span>
                      Không tự ý cho bên thứ ba thuê lại hoặc chuyển nhượng thiết bị.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">
                      check_circle
                    </span>
                    <span>
                      Bảo quản thiết bị trong túi/hộp chống sốc chuyên dụng khi di chuyển.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">
                      check_circle
                    </span>
                    <span>
                      Chụp ảnh đối chiếu tình trạng thiết bị khi nhận và trả tại Smart Locker.
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
                    Trên 5.0
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
                    {item.reviews} Đánh Giá Từ Sinh Viên Đã Thuê
                  </p>
                  <p className="text-body-sm text-outline">
                    100% người thuê hài lòng với tình trạng thiết bị
                  </p>
                </div>
              </div>

              {/* Sub-dimension meters */}
              <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-surface-bright border border-outline-variant/30">
                  <p className="text-label-md text-outline uppercase tracking-wider">Đúng mô tả</p>
                  <p className="text-headline-sm font-bold text-primary">5.0</p>
                  <div className="w-full bg-surface-container h-1 rounded-full mt-2">
                    <div className="bg-primary h-1 rounded-full w-full" />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-surface-bright border border-outline-variant/30">
                  <p className="text-label-md text-outline uppercase tracking-wider">Phản hồi</p>
                  <p className="text-headline-sm font-bold text-primary">5.0</p>
                  <div className="w-full bg-surface-container h-1 rounded-full mt-2">
                    <div className="bg-primary h-1 rounded-full w-full" />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-surface-bright border border-outline-variant/30">
                  <p className="text-label-md text-outline uppercase tracking-wider">Độ sạch mới</p>
                  <p className="text-headline-sm font-bold text-primary">4.9</p>
                  <div className="w-full bg-surface-container h-1 rounded-full mt-2">
                    <div className="bg-primary h-1 rounded-full w-[98%]" />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-surface-bright border border-outline-variant/30">
                  <p className="text-label-md text-outline uppercase tracking-wider">Bàn giao</p>
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

        {/* 6. Related / Frequently Rented Together Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-headline-sm text-primary">
                Thiết Bị Thường Được Thuê Kèm
              </h2>
              <p className="text-body-md text-outline">
                Hoàn thiện bộ trang bị cho dự án của bạn với các thiết bị liên quan tại cùng trạm
                Smart Locker.
              </p>
            </div>
            <Link
              className="hidden md:inline-flex items-center gap-1 text-label-lg font-semibold text-primary hover:underline underline-offset-4"
              href="/rent"
            >
              <span>Xem tất cả 15+ thiết bị</span>
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
                    <span className="text-body-sm text-outline"> / ngày</span>
                  </div>
                  <Link
                    href={`/items/${related.linkedItemId}`}
                    className="px-3 py-1.5 rounded-lg bg-surface-bright hover:bg-primary hover:text-on-primary text-primary text-label-md font-semibold border border-outline-variant/40 transition-colors"
                  >
                    Xem ngay
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
              © 2026 UniLend Inc. Bảo lưu mọi quyền.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Link
              className="text-label-md text-on-surface-variant hover:text-on-surface transition-colors duration-150"
              href="/"
            >
              Chính sách bảo mật
            </Link>
            <Link
              className="text-label-md text-on-surface-variant hover:text-on-surface transition-colors duration-150"
              href="/"
            >
              Điều khoản dịch vụ
            </Link>
            <Link
              className="text-label-md text-on-surface-variant hover:text-on-surface transition-colors duration-150"
              href="/"
            >
              An toàn &amp; Bảo hiểm
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
                {item.title} — Ảnh {activeImageIndex + 1} / {gallery.length}
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
                  src={item.ownerAvatar}
                  alt={item.ownerName}
                />
                <div>
                  <h3 className="text-title-md font-bold text-primary">
                    Nhắn tin cho {item.ownerName}
                  </h3>
                  <p className="text-body-sm text-outline">
                    {item.ownerUniversity} • Phản hồi trong ~{item.ownerResponseTime ?? "10 phút"}
                  </p>
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
                  Đã gửi tin nhắn tới {item.ownerName}!
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  Bạn sẽ nhận được thông báo ngay trên thanh công cụ khi chủ thiết bị trả lời.
                </p>
                <button
                  type="button"
                  onClick={() => setMessageModalOpen(false)}
                  className="mt-2 px-5 py-2 rounded-lg bg-primary text-on-primary text-label-lg font-semibold cursor-pointer"
                >
                  Đóng
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
                    Thiết bị: {item.title}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={`Chào ${item.ownerName}, mình có thể nhận thiết bị này tại ${item.pickupArea ?? "Smart Locker"} vào 9h sáng mai được không?`}
                    className="w-full rounded-lg border border-outline-variant/60 bg-surface-bright p-3 text-body-md text-primary placeholder:text-outline focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setMessageModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-outline-variant/50 text-label-lg text-on-surface-variant hover:text-primary cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-primary text-on-primary text-label-lg font-semibold hover:bg-primary-container cursor-pointer"
                  >
                    Gửi tin nhắn
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
