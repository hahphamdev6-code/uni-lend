"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "../../app-header";
import {
  getRentalItemById,
  type RentalListingItem,
} from "../../rental-catalog";

function RentalConfirmationContent() {
  const searchParams = useSearchParams();
  const itemId = searchParams.get("itemId") || "sony-a7-iv";
  const rentalDays = parseInt(searchParams.get("days") || "3", 10) || 3;
  const deliveryMode = searchParams.get("mode") === "courier" ? "courier" : "pickup";
  const referenceId = searchParams.get("ref") || "#UL-849204";

  const item: RentalListingItem = useMemo(() => getRentalItemById(itemId), [itemId]);

  const [copied, setCopied] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Dates calculation based on Oct 24, 2025
  const pickupDateObj = new Date("2025-10-24T00:00:00");
  const returnDateObj = new Date(pickupDateObj);
  returnDateObj.setDate(returnDateObj.getDate() + rentalDays);

  const datesFormatted = `${pickupDateObj.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })} – ${returnDateObj.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })}`;

  // Price calculations
  const baseCost = item.pricePerDay * rentalDays;
  const courierCost = deliveryMode === "courier" ? 15.0 : 0.0;
  const damageProtection = 12.0;
  const communityFee = 8.5;
  const totalEstimated = baseCost + courierCost + damageProtection + communityFee;
  const depositDisplay = item.securityDeposit ?? 150.0;

  const handleCopyRef = () => {
    navigator.clipboard.writeText(referenceId.replace("#", ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#fafafd] text-on-surface font-sans antialiased min-h-screen flex flex-col relative selection:bg-rose-100 selection:text-black">
      {/* Synchronized Header */}
      <AppHeader />

      {/* Main Content Canvas */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 md:py-16">
        <div className="w-full max-w-[700px] mx-auto space-y-6">
          {/* Breadcrumb / Back Link */}
          <div className="flex items-center justify-between text-body-sm text-on-surface-variant px-1">
            <Link
              className="inline-flex items-center gap-1.5 hover:text-primary transition-colors duration-150"
              href="/rent"
            >
              <span className="material-symbols-outlined text-sm leading-none">arrow_back</span>
              <span>Quay lại danh mục thiết bị</span>
            </Link>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-label-md font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Yêu cầu đang hoạt động
            </span>
          </div>

          {/* Hero Confirmation Card */}
          <div className="bg-white/95 backdrop-blur-xl border border-outline-variant/40 rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.05)]">
            {/* Header & Status Pill */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 shadow-xs mx-auto">
                <span className="material-symbols-outlined text-3xl font-light">
                  check_circle
                </span>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-headline-md md:text-headline-lg font-semibold text-primary tracking-tight">
                  Yêu Cầu Thuê Của Bạn Đã Được Gửi
                </h1>
                <p className="text-body-md text-on-surface-variant max-w-xl mx-auto leading-relaxed font-normal">
                  {item.ownerName} ({item.ownerUniversity}) đã nhận được thông báo và thường phản hồi trong vòng{" "}
                  <span className="font-semibold text-primary">{item.ownerResponseTime ?? "12 phút"}</span>. Hiện tại bạn chưa bị
                  trừ tiền; đặt chỗ sẽ được kích hoạt khi chủ máy phê duyệt.
                </p>
              </div>

              {/* Reference Tag */}
              <div className="pt-1">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/30 text-label-md text-on-surface">
                  <span className="text-on-surface-variant font-normal">Mã đơn tham chiếu:</span>
                  <span className="font-bold tracking-wider text-primary">{referenceId}</span>
                  <button
                    onClick={handleCopyRef}
                    className="text-on-surface-variant hover:text-primary transition-colors ml-0.5 cursor-pointer"
                    title="Sao chép mã đơn"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {copied ? "check" : "content_copy"}
                    </span>
                  </button>
                </span>
                {copied && (
                  <span className="text-xs text-emerald-700 ml-2 font-medium">Đã sao chép!</span>
                )}
              </div>
            </div>

            {/* 3-Step Progress Architecture */}
            <div className="my-8 pt-4 border-t border-outline-variant/20">
              <div className="grid grid-cols-3 gap-2 relative">
                {/* Step 1: Request Sent (Completed) */}
                <div className="flex flex-col items-center text-center space-y-2 group">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-base">check</span>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-label-lg font-semibold text-primary">Đã gửi yêu cầu</p>
                    <p className="text-body-sm text-on-surface-variant">Hôm nay, 14:45</p>
                  </div>
                </div>

                {/* Step 2: Awaiting Owner Approval (Active Pulse) */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="relative w-8 h-8 rounded-full bg-white border-2 border-primary text-primary flex items-center justify-center shadow-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping absolute opacity-60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-label-lg font-semibold text-primary">Chủ máy duyệt</p>
                    <p className="text-body-sm text-secondary font-medium">Đang xử lý</p>
                  </div>
                </div>

                {/* Step 3: Confirmed (Upcoming) */}
                <div className="flex flex-col items-center text-center space-y-2 opacity-50">
                  <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant/50 text-on-surface-variant flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-outline-variant" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-label-lg font-semibold text-on-surface">Đã xác nhận</p>
                    <p className="text-body-sm text-on-surface-variant">Sẵn sàng nhận đồ</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rental Summary Specification Card */}
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-5 space-y-4">
              {/* Product Snippet */}
              <div className="flex items-center gap-4 pb-4 border-b border-outline-variant/20">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface-container flex-shrink-0 border border-outline-variant/30">
                  <img
                    alt={item.title}
                    className="w-full h-full object-cover"
                    src={item.image}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-label-md uppercase tracking-wider text-on-surface-variant bg-surface-container px-2 py-0.5 rounded font-semibold">
                      {item.categoryLabel ?? item.category}
                    </span>
                    <span className="text-body-sm text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-amber-500 text-sm leading-none">
                        star
                      </span>
                      {item.rating.toFixed(1)}
                    </span>
                  </div>
                  <h3 className="text-title-md font-bold text-primary truncate">
                    {item.title}
                  </h3>
                  <p className="text-body-sm text-on-surface-variant">
                    Chủ thiết bị: <span className="font-medium text-primary">{item.ownerName} ({item.ownerUniversity})</span>
                  </p>
                </div>
              </div>

              {/* Key Breakdown Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-body-sm pt-1">
                <div className="space-y-1">
                  <span className="text-label-md text-on-surface-variant flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                      calendar_month
                    </span>
                    Lịch Trình Thuê
                  </span>
                  <p className="text-body-md font-semibold text-primary">{datesFormatted}</p>
                  <p className="text-body-sm text-on-surface-variant">
                    Thời lượng: {rentalDays} ngày thuê trọn vẹn
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-label-md text-on-surface-variant flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                      location_on
                    </span>
                    Phương Thức Nhận Đồ
                  </span>
                  <p className="text-body-md font-semibold text-primary">
                    {deliveryMode === "courier" ? "Giao hàng qua Shipper" : "Nhận tại Smart Locker"}
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    {deliveryMode === "courier"
                      ? "Giao tận nơi khu vực nội thành"
                      : "Trạm Smart Locker Campus Trung tâm"}
                  </p>
                </div>

                <div className="space-y-1 pt-2 sm:pt-0 sm:border-t-0 border-t border-outline-variant/15">
                  <span className="text-label-md text-on-surface-variant flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                      payments
                    </span>
                    Tổng Tiền Dự Kiến
                  </span>
                  <div className="flex items-baseline gap-2">
                    <p className="text-title-lg font-bold text-primary">
                      ${totalEstimated.toFixed(2)}
                    </p>
                    <span className="text-label-md text-on-surface-variant font-normal">
                      (Giá thuê + Phí dịch vụ + Bảo hiểm)
                    </span>
                  </div>
                </div>

                <div className="space-y-1 pt-2 sm:pt-0 sm:border-t-0 border-t border-outline-variant/15">
                  <span className="text-label-md text-on-surface-variant flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                      shield
                    </span>
                    Tiền Cọc An Toàn (Escrow)
                  </span>
                  <p className="text-body-md font-medium text-primary">
                    ${depositDisplay.toFixed(2)}
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    Giải tỏa 100% khi nghiệm thu an toàn
                  </p>
                </div>
              </div>

              {/* Trust & Protection Notice */}
              <div className="mt-4 p-3.5 rounded-lg bg-surface-container-low/70 border border-outline-variant/30 flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-xl leading-none mt-0.5">
                  verified_user
                </span>
                <div className="text-body-sm leading-snug">
                  <span className="font-semibold text-primary">Được bảo vệ bởi UniLend Shield.</span>
                  <span className="text-on-surface-variant ml-1">
                    Bảo hiểm thiết bị lên đến $5,000. Hủy miễn phí trước 24 giờ so với lịch hẹn nhận đồ.
                  </span>
                </div>
              </div>
            </div>

            {/* Inline Messaging Teaser */}
            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface-container-lowest/70 border border-outline-variant/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-900 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  <img src={item.ownerAvatar} alt={item.ownerName} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-body-md font-semibold text-primary leading-tight">
                    Bạn có câu hỏi trước khi nhận máy?
                  </p>
                  <p className="text-body-sm text-on-surface-variant leading-tight">
                    Trao đổi về thời gian nhận đồ hoặc hỏi thêm phụ kiện kèm theo.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMessageModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-label-lg font-semibold text-primary hover:text-secondary hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">chat</span>
                <span>Nhắn tin cho {item.ownerName}</span>
              </button>
            </div>

            {/* Action Cluster */}
            <div className="mt-8 pt-6 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDetailsModal(true)}
                className="btn-unilend-cta w-full sm:flex-1 h-12 rounded-lg text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Xem chi tiết đơn thuê</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
              <Link
                className="btn-unilend-cta-soft w-full sm:w-auto h-12 px-6 rounded-lg font-semibold text-sm flex items-center justify-center cursor-pointer"
                href="/rent"
              >
                Tiếp tục khám phá
              </Link>
            </div>
          </div>

          {/* Quick Guidance & Help Footnote */}
          <div className="text-center text-body-sm text-on-surface-variant">
            <span>Cần hỗ trợ gấp? Truy cập </span>
            <Link className="text-primary font-medium hover:underline" href="/#help">
              Trung tâm trợ giúp &amp; An toàn
            </Link>
            <span> hoặc tra cứu mã đơn {referenceId}.</span>
          </div>
        </div>
      </main>

      {/* Message Modal */}
      {messageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-black/10 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                  <img src={item.ownerAvatar} alt={item.ownerName} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-primary">Nhắn tin cho {item.ownerName}</h4>
                  <p className="text-xs text-outline">{item.ownerUniversity} • Mã tham chiếu: {referenceId}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMessageModalOpen(false);
                  setMessageSent(false);
                }}
                className="text-outline hover:text-black cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="py-4">
              {messageSent ? (
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-900 text-sm">
                  ✓ Tin nhắn đã được gửi! {item.ownerName} đã nhận được thông báo tức thì.
                </div>
              ) : (
                <>
                  <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-2">
                    Nội dung tin nhắn / Trao đổi nhận đồ
                  </label>
                  <textarea
                    rows={4}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={`Chào ${item.ownerName}, mình muốn hỏi về giờ nhận máy tại Smart Locker...`}
                    className="w-full p-3 rounded-xl border border-outline-variant text-sm focus:border-black focus:ring-1 focus:ring-black"
                  />
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setMessageModalOpen(false);
                  setMessageSent(false);
                }}
                className="px-4 py-2 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-neutral-50 cursor-pointer"
              >
                Đóng
              </button>
              {!messageSent && (
                <button
                  type="button"
                  onClick={() => {
                    if (messageText.trim()) {
                      setMessageSent(true);
                    }
                  }}
                  className="px-5 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-neutral-800 cursor-pointer"
                >
                  Gửi tin nhắn
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-black/10 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <h4 className="font-bold text-primary text-title-md">Bảng Kê Chi Tiết Giao Dịch</h4>
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="text-outline hover:text-black cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="py-4 space-y-3 text-body-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Thiết bị:</span>
                <span className="font-semibold text-primary">{item.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Chủ máy:</span>
                <span className="font-semibold text-primary">{item.ownerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Đơn giá ngày:</span>
                <span>${item.pricePerDay.toFixed(2)} / ngày</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Thời lượng:</span>
                <span>{rentalDays} ngày (${baseCost.toFixed(2)})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Giao nhận:</span>
                <span>{deliveryMode === "courier" ? "$15.00 (Shipper)" : "Miễn phí (Smart Locker)"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Bảo hiểm hao mòn:</span>
                <span>${damageProtection.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Phí dịch vụ UniLend:</span>
                <span>${communityFee.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t flex justify-between font-bold text-primary text-body-lg">
                <span>Tổng chi phí:</span>
                <span>${totalEstimated.toFixed(2)}</span>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg text-xs text-on-surface-variant">
                Trạng thái thanh toán: <strong>Đang ủy quyền tạm giữ chờ duyệt</strong>. Tài khoản của bạn sẽ không bị trừ tiền cho đến khi hoàn tất giao nhận.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowDetailsModal(false)}
              className="w-full py-2.5 rounded-lg bg-black text-white text-sm font-semibold hover:bg-neutral-800 cursor-pointer"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="docked full-width bottom bg-white border-t border-outline-variant/30 mt-auto">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 py-10 w-full flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-title-md font-bold text-primary">UNILEND.™</span>
            <span className="text-body-sm text-on-surface-variant">
              © 2025 UniLend Inc. Bảo lưu mọi quyền.
            </span>
          </div>
          <nav className="flex flex-wrap items-center gap-6 text-label-md text-on-surface-variant">
            <Link className="hover:text-primary transition-colors duration-150" href="/#privacy">
              Chính sách bảo mật
            </Link>
            <Link className="hover:text-primary transition-colors duration-150" href="/#terms">
              Điều khoản dịch vụ
            </Link>
            <Link className="hover:text-primary transition-colors duration-150" href="/#security">
              Bảo mật hệ thống
            </Link>
            <Link className="hover:text-primary transition-colors duration-150" href="/#cookies">
              Tùy chọn Cookie
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export default function RentalConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fafafd]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <RentalConfirmationContent />
    </Suspense>
  );
}
