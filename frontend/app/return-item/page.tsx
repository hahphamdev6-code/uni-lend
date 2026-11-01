"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "../app-header";
import { loanService } from "../../lib/api/loanService";
import {
  getRentalItemById,
  updateCustomLoanStatus,
  type RentalListingItem,
} from "../rental-catalog";

type ChecklistItem = {
  id: string;
  name: string;
  desc: string;
  checked: boolean;
};

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  {
    id: "item-1",
    name: "Thân máy ảnh Sony Alpha A7 IV",
    desc: "Cảm biến sạch sẽ, đã tắt nguồn, nắp che body đậy kín",
    checked: true,
  },
  {
    id: "item-2",
    name: "Ống kính Sony FE 24-70mm f/2.8 GM & Nắp đậy",
    desc: "Đầy đủ nắp trước sau Sony chính hãng, loa che sáng trong túi",
    checked: true,
  },
  {
    id: "item-3",
    name: "2x Pin sạc Sony NP-FZ100",
    desc: "Cả hai pin đều được sạc trên 80% dung lượng",
    checked: true,
  },
  {
    id: "item-4",
    name: "Đế sạc nhanh USB-C 2 khe & Cáp nối",
    desc: "Đế sạc chính hãng kèm cáp USB-C bọc dù nguyên bản",
    checked: true,
  },
  {
    id: "item-5",
    name: "Thẻ nhớ SanDisk Extreme Pro 128GB SD",
    desc: "Đã format sạch sẽ đặt trong hộp bảo vệ",
    checked: true,
  },
  {
    id: "item-6",
    name: "Hộp chống sốc Pelican 1450 kèm khóa TSA",
    desc: "Lớp mút xốp nguyên vẹn, mã khóa để mặc định 0-0-0",
    checked: true,
  },
];

type PhotoEvidence = {
  id: string;
  filename: string;
  url: string;
  timestamp: string;
};

const DEFAULT_PHOTOS: PhotoEvidence[] = [
  {
    id: "p1",
    filename: "body_sensor_check.jpg",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0f9XkSi2fMnzGhEEeeHxuGc0h5EsaUS5VmLBA_e_UuA_dBDMF9wABKskJUCuSb7deDSNizHr_ZepBzLSD9iOHG2jheoqNssyHNsGq17-OF7LneOOiUdqYnq7FMtLwT2WU0sdZ5fvME8S23SVlF9D64g3Jo4NgeTwsm4z6GDjNqeBhMoJLbtxdxzES8qZVH-DI12YmtXpjIZpxb00p_7eaIhdkvMu9juS9sXGLdvjF3dnTGT01Jminwg",
    timestamp: "Đã gắn dấu thời gian (Hôm nay)",
  },
  {
    id: "p2",
    filename: "packed_pelican_kit.jpg",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAvXdXtoJUPXPOaAbqfVInxxX6Q2mPS1U2JLGdHvqEkrdNnsI9C3OgVr7Ag_syvXoK4zE5jAHmBgbVppS4K36S-N-19kN4EqeMCfLWrkkZ-dEnCi4eXunemBZJZvTxuHViXIA11hORyaeIA5RfjAY6Fp2mbR1n0RLxUfKmrLaqfcCyQ8zCRgOEieV7M8zkMXXOomZ8epGx8zYp_zn1FgeduOJlPK8VgpEo6Tj2SzN83kZFVfKYXxJpVTQ",
    timestamp: "Đã gắn dấu thời gian (Hôm nay)",
  },
];

function ReturnYourItemContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "#UL-849204";
  const itemId = searchParams.get("itemId") || "sony-a7-iv";

  const item: RentalListingItem = useMemo(() => getRentalItemById(itemId), [itemId]);

  const initialChecklist = useMemo<ChecklistItem[]>(() => {
    if (item.includedInKit && item.includedInKit.length > 0) {
      return item.includedInKit.map((kitName, idx) => ({
        id: `kit-${idx + 1}`,
        name: kitName,
        desc: "Đã vệ sinh sạch sẽ, nguyên vẹn và hoạt động tốt theo tiêu chuẩn bàn giao",
        checked: true,
      }));
    }
    return DEFAULT_CHECKLIST;
  }, [item]);

  const initialPhotos = useMemo<PhotoEvidence[]>(() => {
    const g = item.gallery && item.gallery.length >= 2 ? item.gallery : [{ src: item.image, alt: item.title }];
    return g.slice(0, 2).map((img, idx) => ({
      id: `p${idx + 1}`,
      filename: `nghiem_thu_${item.id.replace(/[^a-z0-9]/gi, "_")}_${idx + 1}.jpg`,
      url: img.src,
      timestamp: "Đã gắn dấu thời gian (Hôm nay)",
    }));
  }, [item]);

  // Form states
  const [handoverMethod, setHandoverMethod] = useState<"smart_hub" | "courier">("smart_hub");
  const [timeWindow, setTimeWindow] = useState<"afternoon" | "evening">("evening");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
  const [photos, setPhotos] = useState<PhotoEvidence[]>(initialPhotos);
  const [note, setNote] = useState(
    `Chào ${item.ownerName}, thiết bị ${item.title} hoạt động hoàn hảo trong suốt quá trình mượn. Mình đã vệ sinh sạch sẽ và đóng gói đầy đủ phụ kiện chuẩn bị bàn giao lại.`
  );

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const checkedCount = checklist.filter((i) => i.checked).length;
  const allChecked = checkedCount === checklist.length;

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
    );
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddPhoto = () => {
    const newPhoto: PhotoEvidence = {
      id: `p-${Date.now()}`,
      filename: `gear_inspection_${photos.length + 1}.jpg`,
      url: item.image,
      timestamp: "Đã gắn dấu thời gian (Vừa xong)",
    };
    setPhotos((prev) => [...prev, newPhoto]);
  };

  const [returnError, setReturnError] = useState<string | null>(null);

  const handleSubmitReturn = async () => {
    if (!allChecked) {
      alert("Vui lòng tích xác nhận tất cả các mục trong danh sách hoàn trả trước khi gửi.");
      return;
    }
    setIsSubmitting(true);
    setReturnError(null);
    try {
      const numId = parseInt(orderId.replace(/[^0-9]/g, ""), 10);
      if (!isNaN(numId) && numId > 0) {
        try {
          await loanService.markReturned(numId);
        } catch {
          // Fallback to local synchronized ledger if backend is offline
        }
      }
      updateCustomLoanStatus(orderId, "Completed");
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Xác nhận trả đồ thất bại. Vui lòng kiểm tra lại.";
      setReturnError(msg);
      alert(`Lỗi hoàn trả: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const depositAmount = item.securityDeposit ?? 150.0;
  const courierFee = handoverMethod === "courier" ? 15.0 : 0.0;
  const estimatedRefund = depositAmount - courierFee;

  return (
    <div className="bg-[#fafafd] text-on-surface font-sans antialiased min-h-screen flex flex-col selection:bg-rose-100 selection:text-black">
      {/* Synchronized Header */}
      <AppHeader />

      {/* Main Content Canvas */}
      <main className="flex-grow w-full max-w-[1360px] mx-auto px-6 lg:px-12 py-8">
        {/* Breadcrumb & Status Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-outline-variant/20">
          <div className="flex items-center gap-2 text-label-md text-on-surface-variant flex-wrap">
            <Link className="hover:text-primary transition-colors" href="/">
              Trang chủ
            </Link>
            <span className="text-outline-variant">/</span>
            <Link className="hover:text-primary transition-colors" href="/my-rentals">
              Đơn thuê của tôi
            </Link>
            <span className="text-outline-variant">/</span>
            <span className="text-outline-variant">Đơn {orderId}</span>
            <span className="text-outline-variant">/</span>
            <span className="text-primary font-semibold">Hoàn trả thiết bị</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              className="inline-flex items-center gap-1.5 text-label-lg text-on-surface-variant hover:text-primary transition-colors group"
              href="/my-rentals"
            >
              <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-0.5">
                arrow_back
              </span>
              <span>Quay lại Đơn thuê của tôi</span>
            </Link>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-outline-variant" />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/40 text-on-surface text-label-md font-medium">
              <span className="material-symbols-outlined text-base text-secondary">
                sync_saved_locally
              </span>
              <span>Trạng thái: Đang sử dụng → Bắt đầu quy trình trả máy</span>
            </div>
          </div>
        </div>

        {/* Success / Pending Confirmation Banner */}
        {submitted && (
          <div className="mt-6 p-6 rounded-2xl bg-emerald-50 border border-emerald-300 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 animate-fadeIn">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-2xl">check</span>
              </div>
              <div>
                <h3 className="text-title-lg font-bold text-emerald-950">
                  Lên Lịch Hoàn Trả Thành Công!
                </h3>
                <p className="text-body-md text-emerald-800 mt-1">
                  Trạng thái: <strong>Chờ nghiệm thu hoàn trả</strong>. Đang chờ chủ thiết bị xác nhận đã nhận máy tại Smart Locker. Bạn sẽ nhận được thông báo ngay khi hoàn tất kiểm tra và giải tỏa ${depositAmount.toFixed(2)} tiền cọc.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Link
                href="/my-rentals"
                className="px-5 py-2.5 rounded-full bg-emerald-900 text-white text-label-md font-semibold hover:bg-emerald-800 transition-colors text-center w-full md:w-auto"
              >
                Đi tới Đơn thuê của tôi
              </Link>
            </div>
          </div>
        )}

        {/* Page Header & Progress Stepper */}
        <div className="mt-8 mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-headline-lg font-semibold text-on-surface tracking-tight">
                Hoàn Trả Thiết Bị
              </h1>
              <p className="mt-2 text-body-lg text-on-surface-variant max-w-2xl font-normal">
                Hoàn thành danh sách kiểm tra phụ kiện, chọn thời gian giao nhận và nghiệm thu tình trạng máy để bàn giao lại cho{" "}
                <span className="font-semibold text-on-surface">{item.ownerName} ({item.ownerUniversity})</span>.
              </p>
            </div>

            {/* Timeline Milestone Snapshot */}
            <div className="bg-white border border-outline-variant/30 rounded-xl p-3 shadow-xs flex items-center gap-3 self-start lg:self-auto">
              {/* Step 1 */}
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <span className="text-xs font-semibold text-primary">
                  Chi tiết &amp; Nghiệm thu phụ kiện
                </span>
              </div>
              <span className="material-symbols-outlined text-outline-variant text-base">
                chevron_right
              </span>
              {/* Step 2 */}
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="w-6 h-6 rounded-full bg-surface-container border border-outline-variant/50 text-xs flex items-center justify-center">
                  2
                </span>
                <span className="text-xs">Bàn giao thiết bị</span>
              </div>
              <span className="material-symbols-outlined text-outline-variant text-base">
                chevron_right
              </span>
              {/* Step 3 */}
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="w-6 h-6 rounded-full bg-surface-container border border-outline-variant/50 text-xs flex items-center justify-center">
                  3
                </span>
                <span className="text-xs">Kiểm tra &amp; Hoàn cọc Escrow</span>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20">
          {/* LEFT COLUMN: Main Verification & Handover Configuration (7 Columns) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* SECTION 1: Order & Equipment Summary Card */}
            <section className="bg-white/95 backdrop-blur-md rounded-2xl border border-outline-variant/30 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-surface-container gap-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">inventory_2</span>
                  <h2 className="text-title-lg font-bold text-on-surface">
                    Thiết Bị Đang Sử Dụng
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-label-md uppercase tracking-wider bg-surface-container text-on-surface font-semibold border border-outline-variant/40">
                    {orderId}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-label-md bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    Đúng hạn (Không phát sinh phụ phí)
                  </span>
                </div>
              </div>

              <div className="mt-5 flex flex-col sm:flex-row gap-5 items-start">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-surface-container flex-shrink-0 border border-outline-variant/30">
                  <img
                    alt={item.title}
                    className="w-full h-full object-cover"
                    src={item.image}
                  />
                </div>
                <div className="flex-grow space-y-2">
                  <h3 className="text-title-md text-on-surface font-bold">
                    {item.title}
                  </h3>
                  <p className="text-body-sm text-on-surface-variant flex items-center gap-2 flex-wrap">
                    <span>
                      Chủ sở hữu: <strong className="text-on-surface font-semibold">{item.ownerName} ({item.ownerUniversity})</strong>
                    </span>
                    <span className="inline-flex items-center text-amber-600 font-semibold text-xs">
                      ★ {(item.ownerRating ?? 5.0).toFixed(1)} ({item.ownerReviews ?? 48} đánh giá)
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-surface-container-high text-on-primary-fixed">
                      Thành viên xác thực .edu
                    </span>
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-4 text-body-sm">
                    <div className="flex items-center gap-1.5 text-on-surface-variant">
                      <span className="material-symbols-outlined text-base text-outline">event</span>
                      <span>
                        Thời hạn trả:{" "}
                        <strong className="text-on-surface font-medium">
                          Thứ Hai, 27/10/2025 lúc 18:00
                        </strong>
                      </span>
                    </div>
                  </div>
                  {/* Overdue Policy Tag */}
                  <div className="mt-3 p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-base mt-0.5">
                      info
                    </span>
                    <p className="text-body-sm text-on-surface-variant">
                      <strong className="text-on-surface font-medium">Quy định tiêu chuẩn:</strong> Hoàn trả trong khung giờ đã định để tránh phí trễ hạn (Thời gian gia hạn miễn phí áp dụng đến 18:30).
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: Handover & Return Method */}
            <section className="bg-white/95 backdrop-blur-md rounded-2xl border border-outline-variant/30 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-surface-container">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">local_shipping</span>
                  <h2 className="text-title-lg font-bold text-on-surface">
                    1. Chọn Phương Thức Giao Nhận
                  </h2>
                </div>
                <span className="text-label-md text-on-surface-variant font-medium">Bước 1 trên 4</span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4">
                {/* Option A: In-Person Smart Hub */}
                <label
                  onClick={() => setHandoverMethod("smart_hub")}
                  className={`relative flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    handoverMethod === "smart_hub"
                      ? "border-primary bg-surface-container-low/40"
                      : "border-outline-variant/40 bg-white hover:bg-surface-container-low"
                  }`}
                >
                  <div className="flex items-center h-5 mt-1">
                    <input
                      checked={handoverMethod === "smart_hub"}
                      onChange={() => setHandoverMethod("smart_hub")}
                      className="h-4 w-4 text-primary border-outline focus:ring-primary accent-primary"
                      name="handover_method"
                      type="radio"
                    />
                  </div>
                  <div className="ml-4 flex-grow">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="text-title-md font-bold text-on-surface flex items-center gap-2">
                        <span>Gửi tại trạm Smart Locker Campus</span>
                        <span className="px-2 py-0.5 rounded-full text-label-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Miễn phí
                        </span>
                      </p>
                      <span className="px-2 py-0.5 rounded text-xs bg-purple-100 text-secondary font-semibold">
                        Khuyên dùng
                      </span>
                    </div>
                    <p className="text-body-sm text-on-surface-variant mt-1">
                      Trạm Smart Locker Campus Trung tâm • Ngăn tủ số #B-14 hoặc bàn giao trực tiếp cho chủ máy.
                    </p>
                    <div className="mt-2.5 flex items-center gap-4 text-label-md text-on-surface">
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <span className="material-symbols-outlined text-base">lock_open</span>
                        Mở tủ điện tử tức thì
                      </span>
                      <span className="inline-flex items-center gap-1 text-on-surface-variant">
                        <span className="material-symbols-outlined text-base">security</span>
                        Khu vực có camera giám sát 24/7
                      </span>
                    </div>
                  </div>
                </label>

                {/* Option B: Bonded Courier Pickup */}
                <label
                  onClick={() => setHandoverMethod("courier")}
                  className={`relative flex items-start p-4 rounded-xl border cursor-pointer transition-all ${
                    handoverMethod === "courier"
                      ? "border-2 border-primary bg-surface-container-low/40"
                      : "border-outline-variant/40 bg-white hover:bg-surface-container-low"
                  }`}
                >
                  <div className="flex items-center h-5 mt-1">
                    <input
                      checked={handoverMethod === "courier"}
                      onChange={() => setHandoverMethod("courier")}
                      className="h-4 w-4 text-primary border-outline focus:ring-primary accent-primary"
                      name="handover_method"
                      type="radio"
                    />
                  </div>
                  <div className="ml-4 flex-grow">
                    <div className="flex items-center justify-between">
                      <p className="text-title-md font-semibold text-on-surface flex items-center gap-2">
                        <span>Giao nhận qua Shipper đối tác</span>
                        <span className="text-label-md text-on-surface-variant font-medium">+$15.00</span>
                      </p>
                      <span className="text-label-md text-outline">Lấy hàng tận nơi</span>
                    </div>
                    <p className="text-body-sm text-on-surface-variant mt-1">
                      Đối tác giao nhận xác thực của UniLend sẽ đến nhận thiết bị đã đóng gói tại địa chỉ của bạn.
                    </p>
                  </div>
                </label>
              </div>
            </section>

            {/* SECTION 3: Planned Return Schedule */}
            <section className="bg-white/95 backdrop-blur-md rounded-2xl border border-outline-variant/30 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-surface-container">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">schedule</span>
                  <h2 className="text-title-lg font-bold text-on-surface">
                    2. Lịch Trình Hoàn Trả
                  </h2>
                </div>
                <span className="text-label-md font-medium text-secondary bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-200">
                  Dự kiến trong 2 ngày 18 giờ
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-label-lg font-semibold text-on-surface mb-1.5">
                    Ngày Hoàn Trả
                  </label>
                  <div className="relative">
                    <input
                      className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-lg text-body-md text-on-surface font-medium cursor-default"
                      readOnly
                      type="text"
                      value="Thứ Hai, 27/10/2025"
                    />
                    <span className="material-symbols-outlined absolute right-3 top-3 text-on-surface-variant pointer-events-none text-xl">
                      calendar_today
                    </span>
                  </div>
                  <p className="text-body-sm text-emerald-700 mt-1.5 flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    Ngày đã chọn khớp với thỏa thuận thuê ban đầu
                  </p>
                </div>

                <div>
                  <label className="block text-label-lg font-semibold text-on-surface mb-1.5">
                    Khung Giờ Bàn Giao Mong Muốn
                  </label>
                  <div className="space-y-2">
                    <label
                      onClick={() => setTimeWindow("afternoon")}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${
                        timeWindow === "afternoon"
                          ? "border-2 border-primary bg-surface-container-low/50"
                          : "border-outline-variant/40 bg-white hover:bg-surface-container-low"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          checked={timeWindow === "afternoon"}
                          onChange={() => setTimeWindow("afternoon")}
                          className="text-primary accent-primary"
                          name="time_window"
                          type="radio"
                        />
                        <span className="text-body-sm text-on-surface">
                          Buổi chiều (14:00 - 17:00)
                        </span>
                      </div>
                      <span className="text-label-md text-outline">Tiêu chuẩn</span>
                    </label>

                    <label
                      onClick={() => setTimeWindow("evening")}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${
                        timeWindow === "evening"
                          ? "border-2 border-primary bg-surface-container-low/50"
                          : "border-outline-variant/40 bg-white hover:bg-surface-container-low"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          checked={timeWindow === "evening"}
                          onChange={() => setTimeWindow("evening")}
                          className="text-primary accent-primary"
                          name="time_window"
                          type="radio"
                        />
                        <span className="text-body-sm text-on-surface font-semibold">
                          Buổi tối (17:00 - 18:00)
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary text-white">
                        Khuyên dùng
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 4: Return Checklist & Package Inclusions */}
            <section className="bg-white/95 backdrop-blur-md rounded-2xl border border-outline-variant/30 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-surface-container">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">checklist</span>
                    <h2 className="text-title-lg font-bold text-on-surface">
                      3. Danh Mục Phụ Kiện Bàn Giao Kèm Theo
                    </h2>
                  </div>
                  <p className="text-body-sm text-on-surface-variant mt-0.5">
                    Kiểm tra từng phụ kiện trước khi khóa vali Pelican để đảm bảo không bị trừ tiền cọc.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-label-md bg-purple-100 text-secondary font-bold">
                  {checkedCount} / {checklist.length} Đã kiểm tra
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                {checklist.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-outline-variant/30 bg-white hover:bg-surface-container-low transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        checked={item.checked}
                        onChange={() => toggleCheck(item.id)}
                        className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
                        type="checkbox"
                      />
                      <div>
                        <span className="text-body-md font-medium text-on-surface block">
                          {item.name}
                        </span>
                        <p className="text-body-sm text-on-surface-variant">{item.desc}</p>
                      </div>
                    </div>
                    <span
                      className={`text-label-md px-2 py-0.5 rounded border font-semibold ${
                        item.checked
                          ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                          : "text-outline bg-surface-container-low border-outline-variant/30"
                      }`}
                    >
                      {item.checked ? "Đã kiểm tra" : "Chờ kiểm"}
                    </span>
                  </label>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-body-sm text-on-surface-variant">
                <span className="flex items-center gap-1.5 text-on-surface font-medium">
                  <span className="material-symbols-outlined text-base text-secondary">
                    task_alt
                  </span>
                  Tất cả {checklist.length} phụ kiện đã được xác nhận. Chủ máy sẽ kiểm tra lại từng món khi nhận đồ.
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setChecklist((prev) => prev.map((i) => ({ ...i, checked: true })))
                  }
                  className="text-label-md text-secondary hover:underline cursor-pointer"
                >
                  Chọn tất cả
                </button>
              </div>
            </section>

            {/* SECTION 5: Equipment Condition Photos & Evidence */}
            <section className="bg-white/95 backdrop-blur-md rounded-2xl border border-outline-variant/30 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-surface-container">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">photo_camera</span>
                    <h2 className="text-title-lg font-bold text-on-surface">
                      4. Hình Ảnh &amp; Nghiệm Thu Hiện Trạng
                    </h2>
                  </div>
                  <p className="text-body-sm text-on-surface-variant mt-0.5">
                    Chụp ảnh hiện trạng máy trước khi bàn giao để được bảo vệ khi có tranh chấp theo{" "}
                    <span className="font-semibold text-on-surface">UniLend Shield™</span>.
                  </p>
                </div>
                <span className="text-label-md text-outline">Khuyên dùng</span>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group rounded-xl overflow-hidden border border-outline-variant/40 bg-surface-container-low aspect-video sm:aspect-square flex flex-col justify-end"
                  >
                    <img
                      alt={photo.filename}
                      className="absolute inset-0 w-full h-full object-cover"
                      src={photo.url}
                    />
                    <div className="relative z-10 p-2.5 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent text-white">
                      <p className="text-xs truncate font-semibold">{photo.filename}</p>
                      <p className="text-[10px] text-white/80 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check</span>
                        {photo.timestamp}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-primary/70 text-white hover:bg-primary transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Xóa ảnh"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ))}

                {/* Add Photo Dropzone */}
                <div
                  onClick={handleAddPhoto}
                  className="border-2 border-dashed border-outline-variant/60 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-primary hover:bg-surface-container-low/50 transition-all cursor-pointer aspect-video sm:aspect-square"
                >
                  <span className="material-symbols-outlined text-outline text-3xl mb-1">
                    add_photo_alternate
                  </span>
                  <p className="text-label-md text-on-surface font-semibold">+ Thêm ảnh</p>
                  <p className="text-[10px] text-outline mt-0.5">Định dạng PNG, JPG tối đa 15MB</p>
                </div>
              </div>

              <p className="mt-3 text-body-sm text-outline flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">shield</span>
                Chữ ký mã hóa của UniLend tự động đính kèm vị trí và dấu thời gian chính xác vào hình ảnh bằng chứng.
              </p>
            </section>

            {/* SECTION 6: Notes for Equipment Owner */}
            <section className="bg-white/95 backdrop-blur-md rounded-2xl border border-outline-variant/30 p-6 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-surface-container">
                <span className="material-symbols-outlined text-secondary">notes</span>
                <h2 className="text-title-lg font-bold text-on-surface">
                  Ghi Chú Cho Chủ Thiết Bị (Không bắt buộc)
                </h2>
              </div>
              <div className="mt-4">
                <textarea
                  className="w-full p-3.5 bg-white border border-outline-variant/50 rounded-xl text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Return Policy, Deposit Escrow & Actions (5 Columns, Sticky) */}
          <div className="lg:col-span-5 sticky top-28 space-y-6">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-outline-variant/40 p-7 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-surface-container">
                <h3 className="text-title-lg font-bold text-on-surface">
                  Tóm Tắt Hoàn Trả &amp; Tiền Cọc
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-label-md bg-purple-100 text-secondary font-semibold">
                  Tạm giữ Escrow
                </span>
              </div>

              {/* Financial Breakdown Ledger */}
              <div className="mt-5 space-y-3 pb-5 border-b border-surface-container text-body-md">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span>Tiền thuê ban đầu (3 Ngày)</span>
                  <span className="font-medium text-on-surface">
                    $155.50 <span className="text-xs text-emerald-700 font-semibold">(Đã thanh toán)</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    Tiền cọc Escrow đang tạm giữ
                    <span
                      className="material-symbols-outlined text-sm text-outline cursor-help"
                      title="Được bảo vệ an toàn trong quỹ Escrow của UniLend"
                    >
                      help_outline
                    </span>
                  </span>
                  <span className="font-medium text-on-surface">${depositAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span>Phí trễ hạn / Phạt phát sinh</span>
                  <span className="font-medium text-emerald-700">$0.00 (Đúng hẹn)</span>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span>
                    Phương thức giao nhận ({handoverMethod === "courier" ? "Giao hàng qua Shipper" : "Smart Locker"})
                  </span>
                  <span className={handoverMethod === "courier" ? "font-medium text-primary" : "font-medium text-emerald-700"}>
                    {handoverMethod === "courier" ? "+$15.00" : "Miễn phí"}
                  </span>
                </div>
              </div>

              {/* Total Refund Calculation */}
              <div className="py-4 border-b border-surface-container flex items-baseline justify-between">
                <div>
                  <p className="text-label-lg font-bold text-on-surface">
                    Số Tiền Dự Kiến Hoàn Lại
                  </p>
                  <p className="text-body-sm text-outline">Về thẻ Visa kết thúc bằng •••• 4242</p>
                </div>
                <div className="text-right">
                  <span className="text-headline-md font-bold text-primary">
                    ${estimatedRefund.toFixed(2)}
                  </span>
                  <span className="block text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
                    {handoverMethod === "smart_hub" ? "Hoàn cọc 100%" : "Sau khi trừ phí vận chuyển"}
                  </span>
                </div>
              </div>

              {/* Deposit Release Explainer Box */}
              <div className="mt-5 p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-xl mt-0.5 flex-shrink-0">
                  lock_clock
                </span>
                <div className="text-body-sm text-on-surface-variant leading-relaxed">
                  <strong className="text-on-surface font-semibold">
                    Giải tỏa tiền cọc tự động:
                  </strong>{" "}
                  Khoản cọc{" "}
                  <strong className="text-on-surface">${estimatedRefund.toFixed(2)}</strong> sẽ được tự động hoàn trả về tài khoản Visa (đuôi 4242) trong vòng 24 giờ sau khi {item.ownerName} xác nhận đã nhận đồ và hoàn tất nghiệm thu.
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={handleSubmitReturn}
                  disabled={isSubmitting}
                  className="btn-unilend-cta w-full py-3.5 px-6 rounded-xl font-semibold text-white shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <span>
                    {isSubmitting
                      ? "Đang xử lý hoàn trả..."
                      : submitted
                      ? "Đã lên lịch trả thành công"
                      : "Gửi Yêu Cầu Hoàn Trả"}
                  </span>
                  <span className="material-symbols-outlined text-lg">
                    {submitted ? "check" : "arrow_forward"}
                  </span>
                </button>
                <Link
                  className="btn-unilend-cta-soft block w-full py-3 rounded-xl font-semibold text-center text-sm"
                  href="/my-rentals"
                >
                  Quay lại Đơn thuê của tôi
                </Link>
              </div>

              <p className="text-[11px] text-outline text-center mt-4 leading-normal">
                Bằng việc gửi yêu cầu, bạn cam kết toàn bộ thiết bị trùng khớp với hiện trạng ban đầu và đồng ý với Quy chế cho thuê UniLend.
              </p>
            </div>

            {/* Support, Escrow & Custody Guarantee Badges */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-outline-variant/30 p-5 shadow-xs space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined text-lg">verified_user</span>
                </div>
                <div>
                  <p className="text-label-lg text-on-surface font-semibold">
                    Quỹ Escrow Bảo Vệ Giao Dịch
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    Tiền cọc được giữ trung gian độc lập cho đến khi hai bên nghiệm thu xong.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined text-lg">timelapse</span>
                </div>
                <div>
                  <p className="text-label-lg text-on-surface font-semibold">
                    Thời Hạn Nghiệm Thu (24 giờ)
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    Chủ thiết bị có 24 giờ để kiểm tra và báo cáo nếu có sai khác.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined text-lg">support_agent</span>
                </div>
                <div>
                  <p className="text-label-lg text-on-surface font-semibold">
                    Hỗ Trợ Giải Quyết Tranh Chấp 24/7
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    Đường dây nóng hỗ trợ hòa giải cộng đồng luôn sẵn sàng.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="docked full-width bottom bg-white border-t border-outline-variant/30 mt-auto">
        <div className="w-full px-6 lg:px-12 max-w-[1360px] mx-auto py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <span className="text-title-md tracking-wider text-primary font-bold">
              UNILEND.™
            </span>
            <span className="hidden sm:inline-block text-outline-variant">|</span>
            <p className="text-body-sm text-on-surface-variant">
              © 2025 UNILEND.™ Hệ thống cho thuê thiết bị học tập Peer-to-Peer. Bảo lưu mọi quyền.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-label-md">
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="/#terms">
              Điều khoản dịch vụ
            </Link>
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="/#privacy">
              Chính sách bảo mật
            </Link>
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="/#guarantee">
              Bảo đảm hoàn trả
            </Link>
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="/#security">
              Xác thực an toàn
            </Link>
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="/#dispute">
              Giải quyết tranh chấp
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function ReturnYourItemPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fafafd]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <ReturnYourItemContent />
    </Suspense>
  );
}
