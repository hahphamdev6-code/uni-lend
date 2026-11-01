"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../auth-context";
import { AppHeader } from "../app-header";
import { loanService } from "../../lib/api/loanService";
import {
  getRentalItemById,
  saveCustomLoanRecord,
  type RentalListingItem,
} from "../rental-catalog";

function RentalRequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemId = searchParams.get("itemId") || "sony-a7-iv";
  const initialDays = parseInt(searchParams.get("days") || "3", 10) || 3;
  const initialMode = searchParams.get("mode") === "courier" ? "courier" : "pickup";

  const item: RentalListingItem = useMemo(() => getRentalItemById(itemId), [itemId]);
  const { isAuthenticated, user, login } = useAuth();

  // Schedule & Duration
  const [rentalDays, setRentalDays] = useState(initialDays);
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);
  const [pickupDate, setPickupDate] = useState(todayStr);
  const [handoverWindow, setHandoverWindow] = useState("Morning (09:00 AM - 12:00 PM) - Recommended");
  const [isEditingPickupDate, setIsEditingPickupDate] = useState(false);

  // Quantity & Add-ons
  const [quantity, setQuantity] = useState(1);
  const [includeBackupSd, setIncludeBackupSd] = useState(true);
  const [includePadlock, setIncludePadlock] = useState(true);

  // Logistics
  const [logisticsOption, setLogisticsOption] = useState<"pickup" | "courier">(initialMode);

  // Contact details & Note
  const [phone, setPhone] = useState(user.phone || "0902345678");
  const [note, setNote] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [contactSent, setContactSent] = useState(false);

  // Date formatting helpers
  const pickupDateObj = useMemo(() => new Date(`${pickupDate}T00:00:00`), [pickupDate]);
  const returnDateObj = useMemo(() => {
    const d = new Date(pickupDateObj);
    d.setDate(d.getDate() + rentalDays);
    return d;
  }, [pickupDateObj, rentalDays]);

  const pickupDateLabel = useMemo(() => {
    return pickupDateObj.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, [pickupDateObj]);

  const returnDateLabel = useMemo(() => {
    return returnDateObj.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, [returnDateObj]);

  // Price calculations
  const pricePerDay = item.pricePerDay;
  const baseRentalCost = pricePerDay * rentalDays * quantity;
  const sdCardCost = includeBackupSd ? 5 * rentalDays * quantity : 0;
  const courierCost = logisticsOption === "courier" ? 15.0 : 0.0;
  const damageProtectionFee = 12.0;
  const platformFee = 8.5;
  const securityDeposit = item.securityDeposit ?? 150.0;
  const totalPayable = baseRentalCost + sdCardCost + courierCost + damageProtectionFee + platformFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert("Vui lòng đồng ý với Điều khoản và Hợp đồng thuê UniLend trước khi tiếp tục.");
      return;
    }
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để gửi yêu cầu thuê thiết bị.");
      router.push("/login");
      return;
    }
    setIsSubmitting(true);
    try {
      const numericItemId = item.dbId ?? (parseInt(item.id, 10) || 1);
      const dueDateStr = returnDateObj.toISOString().split("T")[0];
      const fullNote = note ? `${note} (Bàn giao: ${handoverWindow})` : `Bàn giao: ${handoverWindow}`;

      let loanRef = `#UL-${Date.now().toString().slice(-6)}`;
      try {
        const loan = await loanService.createRequest({
          itemId: numericItemId,
          borrowFrom: pickupDate,
          dueDate: dueDateStr,
          note: fullNote,
        });
        if (loan?.id) {
          loanRef = `#UL-${loan.id}`;
        }
      } catch {
        // Fallback to local synchronized ledger if backend is offline or item is custom
      }

      saveCustomLoanRecord({
        id: loanRef,
        itemId: item.id,
        dbItemId: item.dbId,
        itemTitle: item.title,
        category: item.categoryLabel ?? item.category,
        itemImage: item.image,
        borrowerId: user.id ?? 2,
        borrowerName: user.fullName,
        borrowerEmail: user.email,
        borrowerAvatar: user.avatar,
        borrowerUniversity: user.university,
        borrowerRating: user.rating,
        ownerId: item.ownerId,
        ownerName: item.ownerName,
        ownerEmail: item.ownerEmail,
        ownerAvatar: item.ownerAvatar,
        ownerUniversity: item.ownerUniversity,
        ownerRating: item.ownerRating ?? 4.9,
        borrowFrom: pickupDate,
        dueDate: dueDateStr,
        datesLabel: `${pickupDate} – ${dueDateStr}`,
        rentalDays,
        totalCost: Math.round(totalPayable * 100) / 100,
        depositAmount: securityDeposit,
        status: "Pending",
        note: fullNote,
        pickupLocation: item.pickupArea ?? item.location,
        createdAt: new Date().toISOString(),
      });

      setSubmitted(true);
      router.push(
        `/rental-request/confirmation?itemId=${encodeURIComponent(item.id)}&days=${rentalDays}&mode=${logisticsOption}&ref=${encodeURIComponent(loanRef)}`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gửi yêu cầu thuê thất bại. Vui lòng kiểm tra lại.";
      alert(`Lỗi đặt thuê: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="text-on-surface antialiased min-h-screen flex flex-col font-sans text-body-md selection:bg-rose-100 selection:text-black bg-[#fafafd]">
      {/* Synchronized Header */}
      <AppHeader />

      {/* MAIN CANVAS */}
      <main className="flex-grow max-w-[1280px] w-full mx-auto px-6 py-8">
        {/* 1. Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center text-body-sm text-outline mb-6 overflow-x-auto whitespace-nowrap"
        >
          <Link className="hover:text-primary transition-colors" href="/">
            Trang chủ
          </Link>
          <span className="mx-2 text-outline-variant">/</span>
          <Link className="hover:text-primary transition-colors" href="/rent">
            Chợ thiết bị
          </Link>
          <span className="mx-2 text-outline-variant">/</span>
          <span className="text-outline-variant">
            {item.categoryLabel ?? item.category}
          </span>
          <span className="mx-2 text-outline-variant">/</span>
          <Link
            className="hover:text-primary transition-colors"
            href={`/items/${item.id}`}
          >
            {item.title}
          </Link>
          <span className="mx-2 text-outline-variant">/</span>
          <span aria-current="page" className="text-on-surface font-semibold">
            Đặt thuê thiết bị
          </span>
        </nav>

        {/* 2. Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-outline-variant/30">
            <div>
              <h1 className="text-3xl sm:text-headline-lg font-semibold text-primary tracking-tight">
                Hoàn Tất Yêu Cầu Thuê Thiết Bị
              </h1>
              <p className="text-body-lg text-on-surface-variant mt-2 max-w-2xl font-normal">
                Kiểm tra lại lịch trình, phương thức nhận đồ qua Smart Locker và gửi yêu cầu trực tiếp tới chủ sở hữu (Đồng bộ cơ sở dữ liệu MySQL).
              </p>
            </div>
          </div>

          {/* Trust Badges Row */}
          <div className="flex flex-wrap items-center gap-3 pt-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant/40 shadow-xs text-body-sm font-medium text-on-surface">
              <span className="text-amber-500 font-bold">⚡</span>
              <span>Hỗ trợ xác nhận tức thì (Instant Booking)</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant/40 shadow-xs text-body-sm font-medium text-on-surface">
              <span className="text-emerald-600">🛡️</span>
              <span>Đã bao gồm bảo hiểm SafeGuarantee™</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant/40 shadow-xs text-body-sm font-medium text-on-surface">
              <span className="text-secondary">🔒</span>
              <span>Chủ sở hữu đã xác thực danh tính (.edu)</span>
            </div>
          </div>
        </div>

        {/* Success Modal / State */}
        {submitted && (
          <div className="mb-8 p-6 rounded-2xl bg-emerald-50 border border-emerald-300 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 animate-fadeIn">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-2xl">check</span>
              </div>
              <div>
                <h3 className="text-title-lg font-bold text-emerald-950">
                  Đã Gửi Yêu Cầu Thuê Thành Công!
                </h3>
                <p className="text-body-md text-emerald-800 mt-1">
                  Chủ thiết bị đã nhận được yêu cầu mượn <strong>{item.title}</strong> của bạn. Bạn sẽ nhận được thông báo ngay khi yêu cầu được duyệt.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Link
                href="/rent"
                className="px-5 py-2.5 rounded-full bg-emerald-900 text-white text-label-md font-semibold hover:bg-emerald-800 transition-colors text-center w-full md:w-auto"
              >
                Khám phá thêm thiết bị
              </Link>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="px-4 py-2.5 rounded-full border border-emerald-300 text-emerald-900 text-label-md font-medium hover:bg-emerald-100 transition-colors"
              >
                Xem tóm tắt
              </button>
            </div>
          </div>
        )}

        {/* 3. Two-Column Desktop Layout */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Rental Information & Logistics Form (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Selected Item Preview Card */}
            <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-xs transition-all hover:border-outline-variant/60">
              <div className="flex flex-col sm:flex-row gap-5 items-center">
                <div className="w-full sm:w-32 h-28 rounded-xl overflow-hidden bg-surface-container-low shrink-0 relative border border-outline-variant/20">
                  <img
                    alt={item.title}
                    className="w-full h-full object-cover object-center"
                    src={item.image}
                  />
                </div>
                <div className="flex-grow w-full space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
                      {item.categoryLabel ?? item.category}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-label-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                      {item.condition} ({item.conditionScore ?? "9.8/10"})
                    </span>
                  </div>
                  <h2 className="text-title-lg text-primary font-bold">{item.title}</h2>
                  <div className="flex items-center gap-2 text-body-sm text-on-surface-variant pt-1">
                    <span className="flex items-center font-medium text-on-surface">
                      <span className="material-symbols-outlined text-amber-500 text-[18px] mr-1">
                        star
                      </span>
                      {item.rating.toFixed(1)}
                    </span>
                    <span className="text-outline-variant">•</span>
                    <span>
                      Chủ thiết bị: <strong className="text-on-surface font-medium">{item.ownerName}</strong> ({item.ownerUniversity})
                    </span>
                    <span className="text-outline-variant">•</span>
                    <span>{item.ownerReviews ?? 48} lượt đánh giá uy tín</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 1: Rental Schedule & Duration */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-primary font-bold text-label-lg">
                    1
                  </span>
                  <h3 className="text-title-md text-primary font-bold">
                    Lịch Trình &amp; Thời Gian Thuê
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRentalDays((d) => Math.max(1, d - 1))}
                    className="w-7 h-7 rounded border border-outline-variant/50 flex items-center justify-center text-primary hover:bg-surface-container text-xs font-bold"
                    title="Giảm số ngày"
                  >
                    −
                  </button>
                  <span className="px-3 py-1 rounded-full bg-purple-50 text-secondary font-semibold text-body-sm border border-purple-200">
                    {rentalDays} Ngày Thuê
                  </span>
                  <button
                    type="button"
                    onClick={() => setRentalDays((d) => d + 1)}
                    className="w-7 h-7 rounded border border-outline-variant/50 flex items-center justify-center text-primary hover:bg-surface-container text-xs font-bold"
                    title="Tăng số ngày"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date Display */}
                <div className="p-4 rounded-xl border border-outline-variant/40 bg-surface/50 hover:bg-surface-container-low/40 transition-colors">
                  <label className="block text-label-md text-outline uppercase tracking-wider mb-1 font-semibold">
                    Ngày Bắt Đầu Nhận
                  </label>
                  {isEditingPickupDate ? (
                    <input
                      type="date"
                      min={todayStr}
                      value={pickupDate}
                      onChange={(e) => {
                        setPickupDate(e.target.value);
                        setIsEditingPickupDate(false);
                      }}
                      className="w-full px-2 py-1 border rounded text-body-md"
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-outline">
                          calendar_today
                        </span>
                        <span className="text-body-lg font-semibold text-on-surface">
                          {pickupDateLabel}
                        </span>
                      </div>
                      <button
                        className="text-body-sm font-medium text-secondary hover:underline cursor-pointer"
                        type="button"
                        onClick={() => setIsEditingPickupDate(true)}
                      >
                        Thay đổi
                      </button>
                    </div>
                  )}
                </div>

                {/* Return Date Display */}
                <div className="p-4 rounded-xl border border-outline-variant/40 bg-surface/50 hover:bg-surface-container-low/40 transition-colors">
                  <label className="block text-label-md text-outline uppercase tracking-wider mb-1 font-semibold">
                    Ngày Hoàn Trả
                  </label>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-outline">
                        event_repeat
                      </span>
                      <span className="text-body-lg font-semibold text-on-surface">
                        {returnDateLabel}
                      </span>
                    </div>
                    <span className="text-body-sm font-medium text-outline">
                      Tự động tính
                    </span>
                  </div>
                </div>
              </div>

              {/* Pickup Time Slot Selection */}
              <div className="mt-4 pt-4 border-t border-outline-variant/20">
                <label className="block text-label-lg text-on-surface font-semibold mb-2">
                  Khung giờ nhận thiết bị mong muốn
                </label>
                <div className="relative">
                  <select
                    value={handoverWindow}
                    onChange={(e) => setHandoverWindow(e.target.value)}
                    className="w-full h-11 px-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface text-body-md focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="Buổi sáng (09:00 - 12:00) - Khuyên dùng">
                      Buổi sáng (09:00 - 12:00) - Khuyên dùng
                    </option>
                    <option value="Đầu giờ chiều (12:00 - 15:00)">
                      Đầu giờ chiều (12:00 - 15:00)
                    </option>
                    <option value="Chiều muộn / Buổi tối (15:00 - 19:00)">
                      Chiều muộn / Buổi tối (15:00 - 19:00)
                    </option>
                  </select>
                </div>
                <p className="text-body-sm text-outline mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  Chủ thiết bị sẽ xác nhận khung giờ bàn giao chính xác 15 phút khi phê duyệt.
                </p>
              </div>
            </div>

            {/* Section 2: Quantity & Gear Options */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-xs">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-primary font-bold text-label-lg">
                  2
                </span>
                <div>
                  <h3 className="text-title-md text-primary font-bold">
                    Số Lượng &amp; Gói Phụ Kiện Kèm Theo
                  </h3>
                  <p className="text-body-sm text-outline">
                    Tùy chỉnh số lượng máy và phụ kiện dự phòng
                  </p>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-outline-variant/30 bg-surface/30 mb-5">
                <div>
                  <span className="font-semibold text-on-surface">Số lượng thiết bị</span>
                  <p className="text-body-sm text-outline">1 trong số 2 bộ có sẵn từ chủ đồ</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                      quantity <= 1
                        ? "border-outline-variant/50 text-outline cursor-not-allowed opacity-50"
                        : "border-outline-variant/60 text-on-surface hover:bg-surface-container-low cursor-pointer"
                    }`}
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <span className="text-title-md font-bold px-2">{quantity} bộ</span>
                  <button
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                      quantity >= 2
                        ? "border-outline-variant/50 text-outline cursor-not-allowed opacity-50"
                        : "border-outline-variant/60 text-on-surface hover:bg-surface-container-low cursor-pointer"
                    }`}
                    disabled={quantity >= 2}
                    onClick={() => setQuantity((q) => q + 1)}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </div>

              {/* Add-ons Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-start gap-3.5 p-3.5 rounded-xl border border-outline-variant/30 hover:border-outline-variant transition-all cursor-pointer bg-surface-container-lowest">
                  <input
                    checked={includeBackupSd}
                    onChange={(e) => setIncludeBackupSd(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant accent-black"
                    type="checkbox"
                  />
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-on-surface">
                        Kèm thẻ nhớ dự phòng SanDisk Extreme Pro 128GB
                      </span>
                      <span className="text-label-lg font-semibold text-primary">
                        +$5.00 / ngày
                      </span>
                    </div>
                    <p className="text-body-sm text-outline mt-0.5">
                      Thẻ nhớ tốc độ cao 300MB/s V90 SDXC, đã định dạng sẵn sàng trước khi bàn giao.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3.5 p-3.5 rounded-xl border border-outline-variant/30 hover:border-outline-variant transition-all cursor-pointer bg-surface-container-lowest">
                  <input
                    checked={includePadlock}
                    onChange={(e) => setIncludePadlock(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant accent-black"
                    type="checkbox"
                  />
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-on-surface">
                        Kèm khóa bảo vệ hộp chống sốc Pelican
                      </span>
                      <span className="text-label-lg font-semibold text-emerald-700">
                        Miễn phí
                      </span>
                    </div>
                    <p className="text-body-sm text-outline mt-0.5">
                      Khóa đồng số an toàn tiêu chuẩn cho bảo quản thiết bị trong quá trình vận chuyển.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Section 3: Handover & Logistics Preference */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-xs">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-primary font-bold text-label-lg">
                  3
                </span>
                <div>
                  <h3 className="text-title-md text-primary font-bold">
                    Phương Thức Giao Nhận &amp; Hậu Cần
                  </h3>
                  <p className="text-body-sm text-outline">
                    Lựa chọn cách bạn muốn nhận và hoàn trả thiết bị
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Option 1: Local Pickup */}
                <label
                  onClick={() => setLogisticsOption("pickup")}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    logisticsOption === "pickup"
                      ? "border-primary bg-surface/50"
                      : "border-outline-variant/40 bg-surface-container-lowest hover:border-outline-variant"
                  }`}
                >
                  <input
                    checked={logisticsOption === "pickup"}
                    onChange={() => setLogisticsOption("pickup")}
                    className="mt-1 text-primary focus:ring-primary border-outline-variant accent-black"
                    name="logistics_option"
                    type="radio"
                  />
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-on-surface">
                          Tự nhận tại trạm Smart Locker {item.pickupArea ?? "Campus Trung tâm"}
                        </span>
                        <span className="text-label-md px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                          Miễn phí
                        </span>
                      </div>
                      <span className="text-label-lg font-bold text-primary">$0.00</span>
                    </div>
                    <p className="text-body-sm text-on-surface-variant mt-1.5 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-outline">
                        location_on
                      </span>
                      Địa chỉ ngăn tủ Smart Locker sẽ gửi khi chủ máy duyệt • cách bạn {item.distance ?? "2.4 km"}
                    </p>
                  </div>
                </label>

                {/* Option 2: Direct Courier Delivery */}
                <label
                  onClick={() => setLogisticsOption("courier")}
                  className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    logisticsOption === "courier"
                      ? "border-2 border-primary bg-surface/50"
                      : "border-outline-variant/40 bg-surface-container-lowest hover:border-outline-variant"
                  }`}
                >
                  <input
                    checked={logisticsOption === "courier"}
                    onChange={() => setLogisticsOption("courier")}
                    className="mt-1 text-primary focus:ring-primary border-outline-variant accent-black"
                    name="logistics_option"
                    type="radio"
                  />
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-on-surface">
                          Giao nhận trực tiếp qua Shipper
                        </span>
                        <span className="text-label-md px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-semibold">
                          Trong ngày
                        </span>
                      </div>
                      <span className="text-label-lg font-bold text-primary">+$15.00</span>
                    </div>
                    <p className="text-body-sm text-outline mt-1.5 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-outline">
                        local_shipping
                      </span>
                      Giao nhận tận nơi trong khu vực nội thành bởi đối tác giao vận tin cậy
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Section 4: Renter Contact Details */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-primary font-bold text-label-lg">
                    4
                  </span>
                  <h3 className="text-title-md text-primary font-bold">
                    Thông Tin Người Thuê
                  </h3>
                </div>
                <span className="text-label-md font-semibold px-2.5 py-1 bg-surface-container text-on-surface rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified_user</span>
                  Tự động điền từ Hồ sơ
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-lg font-semibold text-on-surface mb-1.5">
                    Họ và tên pháp lý
                  </label>
                  <input
                    className="w-full h-11 px-3.5 rounded-lg border border-outline-variant text-on-surface bg-surface/20 cursor-default"
                    readOnly
                    type="text"
                    value={isAuthenticated ? user.fullName : "Alex Morgan"}
                  />
                </div>
                <div>
                  <label className="block text-label-lg font-semibold text-on-surface mb-1.5">
                    Địa chỉ Email
                  </label>
                  <input
                    className="w-full h-11 px-3.5 rounded-lg border border-outline-variant text-on-surface bg-surface/20 cursor-default"
                    readOnly
                    type="email"
                    value={isAuthenticated ? user.email : "alex.morgan@unilend.edu"}
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-label-lg font-semibold text-on-surface">
                      Số điện thoại liên hệ
                    </label>
                    <span className="text-label-md font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Đã kích hoạt thông báo SMS tiến độ đơn thuê
                    </span>
                  </div>
                  <input
                    className="w-full h-11 px-3.5 rounded-lg border border-outline-variant text-on-surface focus:border-primary focus:ring-1 focus:ring-primary"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Note to Item Owner */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-xs">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-primary font-bold text-label-lg">
                  5
                </span>
                <div className="flex items-center gap-2">
                  <h3 className="text-title-md text-primary font-bold">
                    Lời Nhắn Gửi Tới Chủ Thiết Bị
                  </h3>
                  <span className="text-body-sm text-outline font-normal">
                    (Không bắt buộc)
                  </span>
                </div>
              </div>
              <p className="text-body-sm text-on-surface-variant mb-3">
                Chia sẻ mục đích hoặc môn học/dự án giúp chủ thiết bị duyệt yêu cầu nhanh hơn.
              </p>
              <textarea
                className="w-full p-3.5 rounded-xl border border-outline-variant text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-outline"
                placeholder="Mô tả ngắn gọn về bài tập, dự án phim hoặc thắc mắc về thiết bị (ví dụ: quay bài tập môn Truyền thông tại Studio)..."
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {/* Section 6: Terms & Verifications */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-xs">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant accent-black"
                  required
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <span className="text-body-md text-on-surface">
                  Tôi đồng ý với{" "}
                  <a className="font-semibold underline hover:text-secondary" href="#terms">
                    Hợp đồng thuê UniLend
                  </a>
                  , Quy định của chủ máy (không cho thuê lại, bảo quản cẩn thận), và{" "}
                  <a className="font-semibold underline hover:text-secondary" href="#protection">
                    Chính sách bồi hoàn bảo vệ thiết bị
                  </a>
                  .
                </span>
              </label>
              <div className="mt-4 p-3.5 rounded-xl bg-surface-container-low/70 border border-outline-variant/20 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-outline mt-0.5">info</span>
                <p className="text-body-sm text-on-surface-variant">
                  <strong className="font-semibold text-on-surface">Lưu ý:</strong> Thẻ hoặc tài khoản của bạn chỉ được ủy quyền tạm giữ cọc khi chủ thiết bị chính thức phê duyệt yêu cầu. Hiện tại chưa có khoản phí nào bị trừ.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Rental Summary & Quote Breakdown (4 cols, Sticky) */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs relative overflow-hidden">
              {/* Accent top border bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
              <h3 className="text-title-lg font-bold text-primary mb-5">Tóm Tắt Đơn Thuê</h3>

              {/* Line item breakdowns */}
              <div className="space-y-3.5 text-body-md text-on-surface pb-5 border-b border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">
                    Giá thuê (${pricePerDay.toFixed(2)} / ngày × {rentalDays} ngày)
                  </span>
                  <span className="font-semibold text-primary">
                    ${baseRentalCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Số lượng</span>
                  <span className="font-medium text-on-surface">{quantity} bộ</span>
                </div>
                {includeBackupSd && (
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Thẻ nhớ dự phòng SanDisk 128GB ($5/ngày)</span>
                    <span className="font-semibold text-primary">${sdCardCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">
                    Giao nhận ({logisticsOption === "courier" ? "Giao hàng tận nơi" : "Nhận tại Smart Locker"})
                  </span>
                  <span className={`font-semibold ${logisticsOption === "pickup" ? "text-emerald-700" : "text-primary"}`}>
                    {logisticsOption === "pickup" ? "Miễn phí" : `$${courierCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant flex items-center gap-1">
                    Bảo hiểm hao mòn thiết bị (Cơ bản)
                    <span className="material-symbols-outlined text-[16px] text-outline" title="Bảo hiểm hao mòn sự cố lên tới $3,000">
                      help_outline
                    </span>
                  </span>
                  <span className="font-semibold text-primary">
                    ${damageProtectionFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant flex items-center gap-1">
                    Phí dịch vụ &amp; Vận hành UniLend
                    <span className="material-symbols-outlined text-[16px] text-outline">
                      help_outline
                    </span>
                  </span>
                  <span className="font-semibold text-primary">
                    ${platformFee.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Refundable Deposit Section */}
              <div className="py-4 border-b border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-body-md font-semibold text-on-surface block">
                      Tiền cọc an toàn (Escrow)
                    </span>
                    <span className="text-body-sm text-outline">(Chỉ ủy quyền tạm giữ)</span>
                  </div>
                  <span className="text-title-md font-bold text-on-surface">
                    ${securityDeposit.toFixed(2)}
                  </span>
                </div>
                <p className="text-body-sm text-outline mt-2 leading-relaxed">
                  Tạm giữ trong suốt thời gian thuê và giải tỏa 100% sau khi hoàn tất kiểm tra nghiệm thu máy.
                </p>
              </div>

              {/* Total Calculation */}
              <div className="pt-5 pb-6">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-title-md font-bold text-primary">
                    Tổng Chi Phí Dự Kiến
                  </span>
                  <span className="text-headline-md font-bold text-primary tracking-tight">
                    ${totalPayable.toFixed(2)}
                  </span>
                </div>
                <span className="text-body-sm text-outline block text-right">
                  Đã bao gồm thuế và các khoản phí theo quy định
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-unilend-cta w-full h-12 text-white font-title-md font-semibold rounded-full flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu thuê ngay"}</span>
                  <span className="material-symbols-outlined text-[20px]">
                    arrow_forward
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setContactModalOpen(true)}
                  className="btn-unilend-cta-soft w-full h-11 font-title-md font-semibold rounded-full cursor-pointer"
                >
                  Lưu nháp &amp; Nhắn tin cho chủ đồ
                </button>
              </div>

              {/* Reassurance Checklist */}
              <div className="mt-6 pt-5 border-t border-outline-variant/20 space-y-2.5">
                <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                    check_circle
                  </span>
                  <span>Hủy miễn phí trước giờ nhận 24 tiếng</span>
                </div>
                <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                    check_circle
                  </span>
                  <span>Mở kênh chat trực tiếp với chủ máy sau khi gửi yêu cầu</span>
                </div>
                <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                    check_circle
                  </span>
                  <span>Thiết bị đã kiểm định &amp; bảo hiểm giá trị lên tới ${(item.insuredUpTo ?? 3000).toLocaleString("vi-VN")}$</span>
                </div>
              </div>
            </div>

            {/* Lender Mini Profile Widget */}
            <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 flex items-center gap-3.5 shadow-xs">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container shrink-0 border border-outline-variant/30">
                <img
                  alt={item.ownerName}
                  className="w-full h-full object-cover"
                  src={item.ownerAvatar}
                />
              </div>
              <div className="text-body-sm flex-grow">
                <div className="font-bold text-on-surface">{item.ownerName}</div>
                <div className="text-outline">{item.ownerUniversity} • Phản hồi ~{item.ownerResponseTime ?? "12 phút"}</div>
              </div>
              <button
                className="px-3 py-1.5 rounded-lg border border-outline-variant/50 text-body-sm font-semibold hover:bg-surface-container-low transition-colors text-primary cursor-pointer"
                type="button"
                onClick={() => setContactModalOpen(true)}
              >
                Liên hệ
              </button>
            </div>
          </div>
        </form>
      </main>

      {/* Message Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-black/10 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container">
                  <img
                    alt={item.ownerName}
                    className="w-full h-full object-cover"
                    src={item.ownerAvatar}
                  />
                </div>
                <div>
                  <h4 className="font-bold text-primary">Nhắn tin cho {item.ownerName}</h4>
                  <p className="text-xs text-outline">{item.ownerUniversity} • Phản hồi: ~{item.ownerResponseTime ?? "12 phút"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setContactModalOpen(false);
                  setContactSent(false);
                }}
                className="text-outline hover:text-black"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="py-4">
              {contactSent ? (
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-900 text-sm">
                  ✓ Tin nhắn đã được gửi! {item.ownerName} đã nhận được thông báo và sẽ phản hồi sớm.
                </div>
              ) : (
                <>
                  <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-2">
                    Nội dung tin nhắn
                  </label>
                  <textarea
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Chào Marcus, mình quan tâm đến bộ máy Sony A7 IV cho dự án quay 3 ngày..."
                    className="w-full p-3 rounded-xl border border-outline-variant text-sm focus:border-black focus:ring-1 focus:ring-black"
                  />
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setContactModalOpen(false);
                  setContactSent(false);
                }}
                className="px-4 py-2 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-neutral-50"
              >
                Đóng
              </button>
              {!contactSent && (
                <button
                  type="button"
                  onClick={() => {
                    if (contactMessage.trim()) {
                      setContactSent(true);
                    }
                  }}
                  className="px-5 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-neutral-800"
                >
                  Gửi tin nhắn
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-white border-t border-outline-variant/30 mt-16">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 py-10 w-full flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-title-md font-bold text-primary">UNILEND.™</span>
            <span className="text-body-sm text-on-surface-variant">
              © 2025 UniLend Inc. Bảo lưu mọi quyền.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-label-md text-on-surface-variant">
            <Link className="hover:text-primary transition-colors" href="/#privacy">
              Chính sách bảo mật
            </Link>
            <Link className="hover:text-primary transition-colors" href="/#terms">
              Điều khoản dịch vụ
            </Link>
            <Link className="hover:text-primary transition-colors" href="/#security">
              Bảo mật hệ thống
            </Link>
            <Link className="hover:text-primary transition-colors" href="/#cookies">
              Tùy chọn Cookie
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function RentalRequestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fafafd]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <RentalRequestContent />
    </Suspense>
  );
}
