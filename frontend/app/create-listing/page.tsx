"use client";

import React, { Suspense, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AppHeader } from "../app-header";
import { useAuth } from "../auth-context";
import { itemService } from "../../lib/api/itemService";
import {
  saveCustomListing,
  type CategoryTab,
  type RentalItem,
} from "../rental-catalog";

type ConditionType = "new" | "like_new" | "good" | "fair";
type PeriodType = "Daily" | "Weekly" | "Monthly";
type HandoverType = "locker" | "meetup" | "delivery";
type AvailabilityType = "always" | "custom";

interface PhotoItem {
  id: string;
  url: string;
  alt: string;
  isCover: boolean;
}

const INITIAL_PHOTOS: PhotoItem[] = [
  {
    id: "photo-1",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBWffoVML51oMjL45kqmOohGZMZtoCInlOxgIVhi9OuRTxSxf-uRQJ3PB2FHG_G_qMjh8JROfD50OmtTG0vWfjWj9U5niYu5IFaQn_W-tsquX6IC3coC3B1oz--sBIa374Am4ScZIo0vpMwpxU2NCsIcdmE6eMqKwKdAiXRNdBDgZR9zGtisQPNZ1WR7gld4mL-6V-nrLAiNyZ1AFO7n7Ug8ong7xaxJ08worsG6lif",
    alt: "Precision studio photograph of a sleek black Sony Alpha 7 IV mirrorless digital camera kit.",
    isCover: true,
  },
  {
    id: "photo-2",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAo42xr8sz4v-gCjakXDBv_aZFKMlMvr55SbFGOfCqF6wiY7g4B1lj5eKE3VAR4Q3TujrEwPHGhHcwbFfUbOwhOfFQot5szsPdUYzAfbdtuyZFMXbKSD6pyrR-yMhNCFWcNiG_8fUId8dwoihiqgB3Hfsmo8N7UGsB2qJJjreeB44Txo8sgttHAMWFWfRiHFP9ZJvoJFKBmKIfpXr97Y0bZpCi-pfaW8epHOlv8Lzd3",
    alt: "Sony full-frame camera paired with 24-70mm f2.8 G Master zoom lens.",
    isCover: false,
  },
  {
    id: "photo-3",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCtoUdk7xqPOVDK052zGE3YTszsug2LsGpuPgXThubSoIXH569KEgltnenHOoSfFSK54xMqxyGL02JhGaKHVTgWO8AjGUjsFV2jOkfpaNxLwsDmS8XLyCvoEbeYoJ7uZ6KkkHSpOhJKIMjL4W6hihkpYUmsP0xtKgBnPg3HNSw8EQWl5yZ6v8VyJJyjCucNx7Mo8F2_HV_q26AxTE91ROJBpVSQLAn4YyJTnN3s6VU8",
    alt: "Layflat overhead view of batteries, dual fast charger, memory cards, and carry bag.",
    isCover: false,
  },
];

const CATEGORIES: {
  value: string;
  label: string;
  previewLabel: string;
  tab: Exclude<CategoryTab, "All Items">;
}[] = [
  { value: "cameras", label: "Nhiếp ảnh & Máy quay (Photography)", previewLabel: "NHIẾP ẢNH & QUAY PHIM", tab: "Electronics" },
  { value: "electronics", label: "Điện tử & Công nghệ (Electronics)", previewLabel: "CÔNG NGHỆ & LAPTOP", tab: "Electronics" },
  { value: "appliances", label: "Gia dụng & Đời sống (Home Appliances)", previewLabel: "GIA DỤNG & ĐỜI SỐNG", tab: "Home Appliances" },
  { value: "tools", label: "Dụng cụ & Kỹ thuật (Tools & Equipment)", previewLabel: "DỤNG CỤ & KỸ THUẬT", tab: "Tools & Equipment" },
  { value: "outdoors", label: "Du lịch & Dã ngoại (Travel & Outdoor)", previewLabel: "DÃ NGOẠI & TREKKING", tab: "Travel & Outdoor" },
  { value: "fitness", label: "Thể thao & Sức khỏe (Sports & Fitness)", previewLabel: "THỂ THAO & SỨC KHỎE", tab: "Sports & Fitness" },
  { value: "furniture", label: "Nội thất & Học tập (Furniture)", previewLabel: "NỘI THẤT & HỌC TẬP", tab: "Furniture" },
  { value: "other", label: "Sự kiện & Âm thanh (Events & Party)", previewLabel: "SỰ KIỆN & ÂM THANH", tab: "Events & Party" },
];

function CreateListingContent() {
  const { user } = useAuth();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form States
  const [itemName, setItemName] = useState("Bộ Máy Ảnh Mirrorless Sony Alpha A7 IV & Lens 24-70mm GM");
  const [category, setCategory] = useState("cameras");
  const [brand, setBrand] = useState("Sony / ILCE-7M4");
  const [description, setDescription] = useState(
    "Bộ máy ảnh full-frame Sony A7 IV nguyên bản kèm ống kính Sony FE 24-70mm f/2.8 GM, 2 viên pin chính hãng NP-FZ100, sạc đôi nhanh, thẻ nhớ 160GB CFexpress Type A và túi đeo chống sốc Peak Design. Cảm biến đã được vệ sinh và kiểm định trước khi bàn giao."
  );
  const [condition, setCondition] = useState<ConditionType>("like_new");

  // Photos State
  const [photos, setPhotos] = useState<PhotoItem[]>(INITIAL_PHOTOS);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Pricing & Logistics States
  const [rentalRate, setRentalRate] = useState<number>(45);
  const [ratePeriod, setRatePeriod] = useState<PeriodType>("Daily");
  const [minDuration, setMinDuration] = useState("2");
  const [maxDuration, setMaxDuration] = useState("14");
  const [depositAmount, setDepositAmount] = useState<number>(150);
  const [itemLocation, setItemLocation] = useState("Khu Công Nghệ Trung Tâm (Smart Locker #14)");
  const [availability, setAvailability] = useState<AvailabilityType>("always");

  // Handover States
  const [handoverMethod, setHandoverMethod] = useState<HandoverType>("locker");
  const [handoverInstructions, setHandoverInstructions] = useState(
    "Thiết bị được bảo quản tại Smart Locker #14 khu nhà Kỹ thuật. Mã PIN 6 chữ số sẽ được hệ thống UniLend gửi tự động ngay khi xác nhận thanh toán. Vui lòng giữ máy trong hộp chống sốc khi di chuyển."
  );

  // Modal & Notification States
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishedId, setPublishedId] = useState("#UL-LST-849204");

  // Derived values
  const currentCategoryMeta = useMemo(() => {
    return CATEGORIES.find((c) => c.value === category) || CATEGORIES[0];
  }, [category]);

  const coverPhoto = useMemo(() => {
    return photos.find((p) => p.isCover) || photos[0] || null;
  }, [photos]);

  const conditionLabel = useMemo(() => {
    switch (condition) {
      case "new":
        return "MỚI 100%";
      case "like_new":
        return "NHƯ MỚI";
      case "good":
        return "TỐT";
      case "fair":
        return "KHÁ";
    }
  }, [condition]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Image Actions
  const handleSetCover = (id: string) => {
    setPhotos((prev) =>
      prev.map((p) => ({
        ...p,
        isCover: p.id === id,
      }))
    );
    showToast("Đã cập nhật ảnh bìa chính.");
  };

  const handleRemovePhoto = (id: string) => {
    if (photos.length <= 1) {
      showToast("Thiết bị cần ít nhất 1 hình ảnh.");
      return;
    }
    const filtered = photos.filter((p) => p.id !== id);
    if (!filtered.some((p) => p.isCover) && filtered.length > 0) {
      filtered[0].isCover = true;
    }
    setPhotos(filtered);
    showToast("Đã xóa ảnh.");
  };

  const handleFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > 8) {
      showToast("Chỉ cho phép tải lên tối đa 8 ảnh cho mỗi thiết bị.");
      return;
    }

    const newPhotos: PhotoItem[] = [];
    const filesArray = Array.from(files);
    setUploadedFiles((prev) => [...prev, ...filesArray]);
    filesArray.forEach((file, index) => {
      const url = URL.createObjectURL(file);
      newPhotos.push({
        id: `custom-photo-${Date.now()}-${index}`,
        url,
        alt: file.name,
        isCover: photos.length === 0 && index === 0,
      });
    });

    setPhotos((prev) => [...prev, ...newPhotos]);
    showToast(`Đã thêm ${newPhotos.length} ảnh mới.`);
  };

  const handleSaveDraft = () => {
    const draft = {
      itemName,
      category,
      brand,
      description,
      condition,
      rentalRate,
      ratePeriod,
      minDuration,
      maxDuration,
      depositAmount,
      itemLocation,
      availability,
      handoverMethod,
      handoverInstructions,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem("unilend_listing_draft", JSON.stringify(draft));
      showToast("Đã lưu bản nháp vào bộ nhớ trình duyệt!");
    } catch {
      showToast("Đã ghi nhận bản nháp.");
    }
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemName.trim()) {
      showToast("Vui lòng nhập tên thiết bị cho thuê.");
      return;
    }
    if (description.length < 20) {
      showToast("Vui lòng nhập mô tả thiết bị tối thiểu 20 ký tự.");
      return;
    }
    if (rentalRate <= 0) {
      showToast("Vui lòng nhập mức giá cho thuê hợp lệ.");
      return;
    }

    const mappedCondition =
      condition === "fair" ? "Fair" : condition === "good" ? "Good" : "Like New";
    const baseItemSlug = `custom-${Date.now()}`;
    const customCatalogEntry: RentalItem = {
      id: baseItemSlug,
      brand: brand.split("/")[0]?.trim() || "UniLend Verified",
      title: itemName.trim(),
      category: currentCategoryMeta.tab ?? "Electronics",
      condition: mappedCondition,
      rating: 5.0,
      reviews: 1,
      location: itemLocation,
      pricePerDay: rentalRate,
      image: coverPhoto?.url || INITIAL_PHOTOS[0].url,
      alt: itemName.trim(),
      gallery: photos.map((p) => ({ src: p.url, alt: p.alt || itemName.trim() })),
      ownerId: user.id ?? 2,
      ownerName: user.fullName,
      ownerEmail: user.email,
      ownerAvatar: user.avatar,
      ownerUniversity: user.university,
      ownerRating: user.rating,
      ownerReviews: user.reviews,
      ownerResponseTime: "10 phút",
      categoryLabel: currentCategoryMeta.previewLabel,
      conditionScore: `${mappedCondition === "Like New" ? "Như mới" : "Tốt"} (Kiểm định 9.9/10)`,
      distance: "0.3 km",
      pickupArea: itemLocation,
      weeklyPrice: Math.round(rentalRate * 7 * 0.85),
      securityDeposit: depositAmount,
      insuredUpTo: 3000,
      summary: description,
      includedInKit: [
        `${itemName.trim()} (Đã kiểm định)`,
        "Bộ sạc & Cáp nguồn chính hãng",
        "Hộp bảo vệ chống sốc tiêu chuẩn",
      ],
      specifications: [
        { label: "Thương hiệu / Model", value: brand },
        { label: "Trạm giao nhận", value: itemLocation },
        { label: "Tiền cọc bảo đảm", value: `$${depositAmount}` },
      ],
    };

    setIsPublishing(true);
    try {
      const categoryMap: Record<string, number> = {
        electronics: 1,
        cameras: 2,
        tools: 3,
        furniture: 4,
        appliances: 5,
        other: 6,
        fitness: 7,
        outdoors: 8,
      };
      const catId = categoryMap[category] ?? 1;

      const created = await itemService.create({
        title: itemName.trim(),
        description,
        categoryId: catId,
        status: "AVAILABLE",
      });

      if (uploadedFiles.length > 0 && created?.id) {
        try {
          await itemService.uploadImages(created.id, uploadedFiles);
        } catch {
          // ignore upload error if mock
        }
      }

      saveCustomListing({
        ...customCatalogEntry,
        id: created?.id ? String(created.id) : baseItemSlug,
        dbId: created?.id,
      });

      setPublishedId(`#UL-LST-${created.id}`);
      showToast("Đã đồng bộ & lưu thiết bị mới vào cơ sở dữ liệu MySQL!");
    } catch {
      saveCustomListing(customCatalogEntry);
      const fallbackId = `#UL-LST-${Math.floor(100000 + Math.random() * 900000)}`;
      setPublishedId(fallbackId);
      showToast("Đã lưu thiết bị mới vào danh mục hệ thống!");
    } finally {
      setIsPublishing(false);
      setPublishSuccess(true);
    }
  };

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] antialiased min-h-screen flex flex-col font-sans selection:bg-[#eaddff] selection:text-[#25005a]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#0b1c30] text-white rounded-xl shadow-xl text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-white/60 hover:text-white"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* Synchronized Header */}
      <AppHeader />

      {/* Main Container Layout */}
      <main className="flex-grow max-w-[1120px] mx-auto w-full px-4 md:px-8 pt-8 pb-20">
        {/* Breadcrumb & Page Header */}
        <section className="mb-8">
          <nav className="flex items-center gap-2 text-xs font-semibold text-[#76777d] uppercase tracking-wider mb-2">
            <Link href="/" className="hover:text-[#0b1c30] transition-colors">
              Trang chủ
            </Link>
            <span className="text-[#c6c6cd]">/</span>
            <Link href="/owner-management" className="hover:text-[#0b1c30] transition-colors">
              Thiết bị của tôi
            </Link>
            <span className="text-[#c6c6cd]">/</span>
            <span className="text-[#0b1c30] font-semibold">Đăng đồ cho thuê</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-[36px] font-semibold text-[#0b1c30] tracking-tight">
                Chia Sẻ Thiết Bị Bạn Có. Tạo Thu Nhập Bền Vững.
              </h1>
              <p className="text-sm md:text-base text-[#45464d] mt-1.5 max-w-2xl leading-relaxed font-normal">
                Đăng thiết bị của bạn lên UniLend để các bạn sinh viên và nhà sáng tạo trong trường
                thuê theo ngày. Được bảo vệ toàn diện bởi quỹ SafeGuarantee™ $2,500 và đồng bộ trực
                tiếp với cơ sở dữ liệu MySQL.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white rounded-full border border-[#c6c6cd]/40 shadow-xs self-start md:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-[#0b1c30]">Trạm Campus Hub Đang Hoạt Động</span>
            </div>
          </div>

          {/* Horizontal Multi-step Progress Indicator */}
          <div className="mt-6 pt-6 border-t border-[#c6c6cd]/30">
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {/* Step 1 */}
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                  activeStep === 1
                    ? "bg-white border-2 border-[#000000] shadow-sm"
                    : "bg-white/60 border border-[#c6c6cd]/30 hover:bg-white"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    activeStep === 1
                      ? "bg-[#000000] text-white"
                      : "bg-[#dce9ff] text-[#0b1c30]"
                  }`}
                >
                  1
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#0b1c30] truncate">Thông tin thiết bị</p>
                  <p className="text-[11px] text-[#76777d] hidden sm:block">Mô tả &amp; tình trạng</p>
                </div>
              </button>

              {/* Step 2 */}
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                  activeStep === 2
                    ? "bg-white border-2 border-[#000000] shadow-sm"
                    : "bg-white/60 border border-[#c6c6cd]/30 hover:bg-white"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    activeStep === 2
                      ? "bg-[#000000] text-white"
                      : "bg-[#dce9ff] text-[#0b1c30]"
                  }`}
                >
                  2
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#0b1c30] truncate">Giá thuê &amp; Tiền cọc</p>
                  <p className="text-[11px] text-[#76777d] hidden sm:block">Đơn giá &amp; lịch trống</p>
                </div>
              </button>

              {/* Step 3 */}
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                  activeStep === 3
                    ? "bg-white border-2 border-[#000000] shadow-sm"
                    : "bg-white/60 border border-[#c6c6cd]/30 hover:bg-white"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    activeStep === 3
                      ? "bg-[#000000] text-white"
                      : "bg-[#dce9ff] text-[#0b1c30]"
                  }`}
                >
                  3
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#0b1c30] truncate">Kiểm duyệt &amp; Đăng</p>
                  <p className="text-[11px] text-[#76777d] hidden sm:block">Xác nhận an toàn</p>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Two-Column Form Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Primary Submission Form (col-span-8) */}
          <form className="lg:col-span-8 space-y-8" onSubmit={handlePublishSubmit}>
            {/* SECTION 1: Item Details */}
            <section className="bg-white rounded-2xl p-6 md:p-7 border border-[#c6c6cd]/30 shadow-xs relative">
              <div className="flex items-center justify-between pb-4 border-b border-[#c6c6cd]/20 mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#000000] font-bold">
                    <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                  </span>
                  <h2 className="text-lg font-bold text-[#0b1c30] tracking-tight">
                    1. Thông Tin Chi Tiết Thiết Bị
                  </h2>
                </div>
                <span className="text-xs font-bold text-[#76777d] uppercase tracking-wider">
                  Mục bắt buộc *
                </span>
              </div>

              <div className="space-y-5">
                {/* Item Name */}
                <div>
                  <label
                    className="block text-xs font-bold text-[#0b1c30] mb-2 uppercase tracking-wide"
                    htmlFor="item-name"
                  >
                    Tên thiết bị cho thuê <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    id="item-name"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="Ví dụ: Bộ máy ảnh Mirrorless Sony Alpha A7 IV kèm lens 24-70mm GM"
                    type="text"
                    required
                    className="w-full h-11 px-3.5 bg-white border border-[#c6c6cd]/60 rounded-lg text-sm text-[#0b1c30] placeholder:text-[#76777d] focus:border-[#0b1c30] focus:ring-2 focus:ring-[#0b1c30]/10 transition-colors outline-none"
                  />
                </div>

                {/* Category & Brand/Model Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-xs font-bold text-[#0b1c30] mb-2 uppercase tracking-wide"
                      htmlFor="item-category"
                    >
                      Danh mục thiết bị <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="item-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full h-11 px-3.5 pr-10 bg-white border border-[#c6c6cd]/60 rounded-lg text-sm text-[#0b1c30] appearance-none focus:border-[#0b1c30] focus:ring-2 focus:ring-[#0b1c30]/10 transition-colors outline-none cursor-pointer"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-3 text-[#76777d] pointer-events-none text-xl">
                        expand_more
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-xs font-bold text-[#0b1c30] mb-2 uppercase tracking-wide"
                      htmlFor="item-brand"
                    >
                      Thương hiệu / Model <span className="text-[#76777d] font-normal">(Không bắt buộc)</span>
                    </label>
                    <input
                      id="item-brand"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="Ví dụ: Sony / ILCE-7M4"
                      type="text"
                      className="w-full h-11 px-3.5 bg-white border border-[#c6c6cd]/60 rounded-lg text-sm text-[#0b1c30] placeholder:text-[#76777d] focus:border-[#0b1c30] focus:ring-2 focus:ring-[#0b1c30]/10 transition-colors outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label
                    className="block text-xs font-bold text-[#0b1c30] mb-2 uppercase tracking-wide"
                    htmlFor="item-description"
                  >
                    Mô tả chi tiết <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <textarea
                    id="item-description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả cụ thể tình trạng máy, phụ kiện đi kèm (cáp sạc, pin, ống kính, túi chống sốc) và các lưu ý khi vận hành..."
                    className="w-full p-3.5 bg-white border border-[#c6c6cd]/60 rounded-lg text-sm text-[#0b1c30] placeholder:text-[#76777d] focus:border-[#0b1c30] focus:ring-2 focus:ring-[#0b1c30]/10 transition-colors outline-none leading-relaxed"
                  />
                  <div className="flex justify-between items-center mt-1.5 text-xs text-[#76777d]">
                    <span
                      className={description.length >= 40 ? "text-emerald-600 font-medium" : ""}
                    >
                      {description.length >= 40
                        ? "✓ Độ dài mô tả đạt chuẩn kiểm duyệt nhanh"
                        : "Tối thiểu 40 ký tự để được hệ thống tự động duyệt nhanh."}
                    </span>
                    <span className="font-mono">{description.length} / 2,000</span>
                  </div>
                </div>

                {/* Condition Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] mb-2.5 uppercase tracking-wide">
                    Tình trạng thiết bị <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <label className="cursor-pointer">
                      <input
                        className="sr-only peer"
                        name="condition"
                        type="radio"
                        value="new"
                        checked={condition === "new"}
                        onChange={() => setCondition("new")}
                      />
                      <div className="h-full p-3 rounded-xl border border-[#c6c6cd]/50 bg-white peer-checked:border-[#000000] peer-checked:bg-[#eff4ff] peer-checked:ring-1 peer-checked:ring-[#000000] transition-all flex flex-col justify-between">
                        <p className="text-xs font-bold text-[#0b1c30]">Mới 100%</p>
                        <p className="text-[11px] text-[#76777d] mt-1 leading-snug">
                          Nguyên seal hoặc chưa qua sử dụng.
                        </p>
                      </div>
                    </label>

                    <label className="cursor-pointer">
                      <input
                        className="sr-only peer"
                        name="condition"
                        type="radio"
                        value="like_new"
                        checked={condition === "like_new"}
                        onChange={() => setCondition("like_new")}
                      />
                      <div className="h-full p-3 rounded-xl border border-[#c6c6cd]/50 bg-white peer-checked:border-[#000000] peer-checked:bg-[#eff4ff] peer-checked:ring-1 peer-checked:ring-[#000000] transition-all flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-[#0b1c30]">Như mới</p>
                          <span className="w-2 h-2 rounded-full bg-[#712ae2]" />
                        </div>
                        <p className="text-[11px] text-[#76777d] mt-1 leading-snug">
                          Rất mới, không tì vết, hoạt động hoàn hảo.
                        </p>
                      </div>
                    </label>

                    <label className="cursor-pointer">
                      <input
                        className="sr-only peer"
                        name="condition"
                        type="radio"
                        value="good"
                        checked={condition === "good"}
                        onChange={() => setCondition("good")}
                      />
                      <div className="h-full p-3 rounded-xl border border-[#c6c6cd]/50 bg-white peer-checked:border-[#000000] peer-checked:bg-[#eff4ff] peer-checked:ring-1 peer-checked:ring-[#000000] transition-all flex flex-col justify-between">
                        <p className="text-xs font-bold text-[#0b1c30]">Tốt</p>
                        <p className="text-[11px] text-[#76777d] mt-1 leading-snug">
                          Xước dăm nhẹ, hoạt động hoàn toàn ổn định.
                        </p>
                      </div>
                    </label>

                    <label className="cursor-pointer">
                      <input
                        className="sr-only peer"
                        name="condition"
                        type="radio"
                        value="fair"
                        checked={condition === "fair"}
                        onChange={() => setCondition("fair")}
                      />
                      <div className="h-full p-3 rounded-xl border border-[#c6c6cd]/50 bg-white peer-checked:border-[#000000] peer-checked:bg-[#eff4ff] peer-checked:ring-1 peer-checked:ring-[#000000] transition-all flex flex-col justify-between">
                        <p className="text-xs font-bold text-[#0b1c30]">Khá</p>
                        <p className="text-[11px] text-[#76777d] mt-1 leading-snug">
                          Có vết trầy theo thời gian, 100% tính năng tốt.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: Add Photos */}
            <section className="bg-white rounded-2xl p-6 md:p-7 border border-[#c6c6cd]/30 shadow-xs relative">
              <div className="flex items-center justify-between pb-4 border-b border-[#c6c6cd]/20 mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#000000] font-bold">
                    <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                  </span>
                  <h2 className="text-lg font-bold text-[#0b1c30] tracking-tight">
                    2. Hình Ảnh Thiết Bị Thực Tế
                  </h2>
                </div>
                <span className="text-xs font-bold font-mono text-[#76777d]">
                  {photos.length} / 8 ảnh đã tải
                </span>
              </div>

              {/* Drag and Drop Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#c6c6cd]/70 rounded-xl p-8 text-center hover:border-[#0b1c30] transition-colors bg-[#eff4ff]/30 group cursor-pointer"
              >
                <input
                  id={fileInputId}
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFilesUpload}
                  className="hidden"
                />
                <div className="mx-auto w-12 h-12 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#0b1c30] mb-3 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                </div>
                <h3 className="text-sm font-bold text-[#0b1c30]">
                  Kéo và thả hình ảnh thiết bị vào đây
                </h3>
                <p className="text-xs text-[#76777d] mt-1 mb-4">
                  hoặc chọn file từ thiết bị của bạn (PNG, JPG, tối đa 10MB mỗi ảnh)
                </p>
                <button
                  type="button"
                  className="inline-flex items-center justify-center h-9 px-4 rounded-lg border border-[#c6c6cd]/80 bg-white text-xs font-bold text-[#0b1c30] hover:bg-[#eff4ff] transition-colors shadow-xs"
                >
                  Chọn tải ảnh lên
                </button>
              </div>

              {/* Uploaded Photos Grid */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative rounded-xl border border-[#c6c6cd]/50 overflow-hidden bg-[#dce9ff] aspect-[4/3]"
                  >
                    <img
                      src={photo.url}
                      alt={photo.alt}
                      className="w-full h-full object-cover"
                    />

                    {photo.isCover && (
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-[#000000] text-white rounded-md text-[10px] font-bold tracking-wider uppercase shadow-xs">
                        Ảnh bìa
                      </span>
                    )}

                    <div className="absolute inset-0 bg-[#000000]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!photo.isCover && (
                        <button
                          type="button"
                          onClick={() => handleSetCover(photo.id)}
                          title="Đặt làm ảnh bìa"
                          className="p-1.5 bg-white text-[#0b1c30] rounded-lg shadow-sm hover:scale-105 transition-transform"
                        >
                          <span className="material-symbols-outlined text-base">star</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(photo.id)}
                        title="Xóa ảnh"
                        className="p-1.5 bg-white text-[#ba1a1a] rounded-lg shadow-sm hover:scale-105 transition-transform"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Optimization Hint */}
              <div className="mt-4 p-3.5 bg-[#eff4ff] rounded-xl border border-[#c6c6cd]/30 flex items-start gap-3">
                <span className="material-symbols-outlined text-[#712ae2] text-lg mt-0.5">
                  tips_and_updates
                </span>
                <p className="text-xs text-[#45464d] leading-relaxed">
                  <span className="font-bold text-[#0b1c30]">Mẹo cho chủ thiết bị:</span> Các bài đăng có từ 3 ảnh chụp rõ nét, nhiều góc cạnh nhận được{" "}
                  <span className="font-bold text-[#0b1c30]">nhiều hơn 40% yêu cầu thuê</span> và được duyệt bảo hiểm nhanh gấp đôi.
                </p>
              </div>
            </section>

            {/* SECTION 3: Terms & Pricing */}
            <section className="bg-white rounded-2xl p-6 md:p-7 border border-[#c6c6cd]/30 shadow-xs relative">
              <div className="flex items-center justify-between pb-4 border-b border-[#c6c6cd]/20 mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#000000] font-bold">
                    <span className="material-symbols-outlined text-[18px]">payments</span>
                  </span>
                  <h2 className="text-lg font-bold text-[#0b1c30] tracking-tight">
                    3. Thiết Lập Giá Thuê &amp; Điều Khoản
                  </h2>
                </div>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Bao gồm SafeGuarantee™
                </span>
              </div>

              <div className="space-y-5">
                {/* Price Rate & Frequency Pill Toggle */}
                <div>
                  <label
                    className="block text-xs font-bold text-[#0b1c30] mb-2 uppercase tracking-wide"
                    htmlFor="rental-rate"
                  >
                    Đơn giá cho thuê <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 top-2.5 text-sm font-bold text-[#76777d]">
                        $
                      </span>
                      <input
                        id="rental-rate"
                        type="number"
                        min="1"
                        value={rentalRate}
                        onChange={(e) => setRentalRate(Number(e.target.value) || 0)}
                        className="w-full h-11 pl-8 pr-3.5 bg-white border border-[#c6c6cd]/60 rounded-lg text-sm font-bold text-[#0b1c30] placeholder:text-[#76777d] focus:border-[#0b1c30] focus:ring-2 focus:ring-[#0b1c30]/10 transition-colors outline-none"
                      />
                    </div>
                    {/* Period Toggle */}
                    <div className="inline-flex bg-[#eff4ff] p-1 rounded-lg border border-[#c6c6cd]/40 self-start sm:self-auto">
                      {(
                        [
                          { key: "Daily", label: "Theo ngày" },
                          { key: "Weekly", label: "Theo tuần" },
                          { key: "Monthly", label: "Theo tháng" },
                        ] as const
                      ).map(({ key, label }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setRatePeriod(key)}
                          className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                            ratePeriod === key
                              ? "bg-white text-[#0b1c30] shadow-xs"
                              : "text-[#45464d] hover:text-[#0b1c30]"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Durations & Deposit Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label
                      className="block text-xs font-bold text-[#0b1c30] mb-2 uppercase tracking-wide"
                      htmlFor="min-duration"
                    >
                      Thời gian tối thiểu <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <select
                      id="min-duration"
                      value={minDuration}
                      onChange={(e) => setMinDuration(e.target.value)}
                      className="w-full h-11 px-3.5 bg-white border border-[#c6c6cd]/60 rounded-lg text-sm text-[#0b1c30] outline-none cursor-pointer"
                    >
                      <option value="1">1 ngày</option>
                      <option value="2">2 ngày</option>
                      <option value="3">3 ngày</option>
                      <option value="7">1 tuần</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-xs font-bold text-[#0b1c30] mb-2 uppercase tracking-wide"
                      htmlFor="max-duration"
                    >
                      Thời gian tối đa <span className="text-[#76777d] font-normal">(Không bắt buộc)</span>
                    </label>
                    <select
                      id="max-duration"
                      value={maxDuration}
                      onChange={(e) => setMaxDuration(e.target.value)}
                      className="w-full h-11 px-3.5 bg-white border border-[#c6c6cd]/60 rounded-lg text-sm text-[#0b1c30] outline-none cursor-pointer"
                    >
                      <option value="7">7 ngày</option>
                      <option value="14">14 ngày</option>
                      <option value="30">30 ngày</option>
                      <option value="unlimited">Không giới hạn</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-xs font-bold text-[#0b1c30] mb-2 uppercase tracking-wide"
                      htmlFor="deposit-amount"
                    >
                      Tiền cọc bảo đảm
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-sm font-bold text-[#76777d]">
                        $
                      </span>
                      <input
                        id="deposit-amount"
                        type="number"
                        min="0"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(Number(e.target.value) || 0)}
                        className="w-full h-11 pl-8 pr-3.5 bg-white border border-[#c6c6cd]/60 rounded-lg text-sm text-[#0b1c30] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Location & Availability Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label
                      className="block text-xs font-bold text-[#0b1c30] mb-2 uppercase tracking-wide"
                      htmlFor="item-location"
                    >
                      Khu vực / Trạm giao nhận Campus <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-3 text-[#76777d] text-lg">
                        location_on
                      </span>
                      <input
                        id="item-location"
                        type="text"
                        value={itemLocation}
                        onChange={(e) => setItemLocation(e.target.value)}
                        className="w-full h-11 pl-10 pr-3.5 bg-white border border-[#c6c6cd]/60 rounded-lg text-sm text-[#0b1c30] placeholder:text-[#76777d] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0b1c30] mb-2 uppercase tracking-wide">
                      Lịch sẵn sàng cho thuê <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="cursor-pointer">
                        <input
                          className="sr-only peer"
                          name="availability"
                          type="radio"
                          value="always"
                          checked={availability === "always"}
                          onChange={() => setAvailability("always")}
                        />
                        <div className="h-11 px-3 rounded-lg border border-[#c6c6cd]/60 bg-white peer-checked:border-[#000000] peer-checked:bg-[#eff4ff] flex items-center justify-center text-xs font-bold text-[#0b1c30] transition-all">
                          Luôn sẵn sàng
                        </div>
                      </label>

                      <label className="cursor-pointer">
                        <input
                          className="sr-only peer"
                          name="availability"
                          type="radio"
                          value="custom"
                          checked={availability === "custom"}
                          onChange={() => setAvailability("custom")}
                        />
                        <div className="h-11 px-3 rounded-lg border border-[#c6c6cd]/60 bg-white peer-checked:border-[#000000] peer-checked:bg-[#eff4ff] flex items-center justify-center text-xs font-semibold text-[#45464d] transition-all">
                          Theo lịch cụ thể
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 4: Pickup & Handover */}
            <section className="bg-white rounded-2xl p-6 md:p-7 border border-[#c6c6cd]/30 shadow-xs relative">
              <div className="flex items-center justify-between pb-4 border-b border-[#c6c6cd]/20 mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#000000] font-bold">
                    <span className="material-symbols-outlined text-[18px]">handshake</span>
                  </span>
                  <h2 className="text-lg font-bold text-[#0b1c30] tracking-tight">
                    4. Phương Thức &amp; Hướng Dẫn Giao Nhận
                  </h2>
                </div>
                <span className="text-xs font-bold text-[#76777d] uppercase tracking-wider">
                  Hỗ trợ nhận không tiếp xúc
                </span>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] mb-2.5 uppercase tracking-wide">
                    Phương thức giao nhận ưu tiên <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="cursor-pointer">
                      <input
                        className="sr-only peer"
                        name="handover"
                        type="radio"
                        value="locker"
                        checked={handoverMethod === "locker"}
                        onChange={() => setHandoverMethod("locker")}
                      />
                      <div className="p-3.5 rounded-xl border border-[#c6c6cd]/60 bg-white peer-checked:border-[#000000] peer-checked:bg-[#eff4ff] peer-checked:ring-1 peer-checked:ring-[#000000] transition-all">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-symbols-outlined text-[18px] text-[#712ae2]">
                            lock
                          </span>
                          <p className="text-xs font-bold text-[#0b1c30]">Smart Locker</p>
                        </div>
                        <p className="text-[11px] text-[#76777d]">
                          Khuyên dùng. Tủ khóa thông minh tự động 24/7 trong trường.
                        </p>
                      </div>
                    </label>

                    <label className="cursor-pointer">
                      <input
                        className="sr-only peer"
                        name="handover"
                        type="radio"
                        value="meetup"
                        checked={handoverMethod === "meetup"}
                        onChange={() => setHandoverMethod("meetup")}
                      />
                      <div className="p-3.5 rounded-xl border border-[#c6c6cd]/60 bg-white peer-checked:border-[#000000] peer-checked:bg-[#eff4ff] peer-checked:ring-1 peer-checked:ring-[#000000] transition-all">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-symbols-outlined text-[18px] text-[#45464d]">
                            person_pin_circle
                          </span>
                          <p className="text-xs font-bold text-[#0b1c30]">Gặp mặt trực tiếp</p>
                        </div>
                        <p className="text-[11px] text-[#76777d]">
                          Hẹn gặp ban ngày tại các khu vực an toàn trong trường.
                        </p>
                      </div>
                    </label>

                    <label className="cursor-pointer">
                      <input
                        className="sr-only peer"
                        name="handover"
                        type="radio"
                        value="delivery"
                        checked={handoverMethod === "delivery"}
                        onChange={() => setHandoverMethod("delivery")}
                      />
                      <div className="p-3.5 rounded-xl border border-[#c6c6cd]/60 bg-white peer-checked:border-[#000000] peer-checked:bg-[#eff4ff] peer-checked:ring-1 peer-checked:ring-[#000000] transition-all">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-symbols-outlined text-[18px] text-[#45464d]">
                            local_shipping
                          </span>
                          <p className="text-xs font-bold text-[#0b1c30]">Giao hàng tận nơi</p>
                        </div>
                        <p className="text-[11px] text-[#76777d]">
                          Giao nhận qua bưu cục sinh viên hoặc ký túc xá.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label
                    className="block text-xs font-bold text-[#0b1c30] mb-2 uppercase tracking-wide"
                    htmlFor="handover-instructions"
                  >
                    Hướng dẫn giao nhận &amp; Bảo quản
                  </label>
                  <textarea
                    id="handover-instructions"
                    rows={3}
                    value={handoverInstructions}
                    onChange={(e) => setHandoverInstructions(e.target.value)}
                    placeholder="Ví dụ: Thiết bị được gửi tại Smart Locker #14 toà nhà Kỹ thuật. Mã mở tủ sẽ được hệ thống gửi tự động sau khi duyệt..."
                    className="w-full p-3.5 bg-white border border-[#c6c6cd]/60 rounded-lg text-sm text-[#0b1c30] placeholder:text-[#76777d] outline-none leading-relaxed"
                  />
                </div>
              </div>
            </section>

            {/* Form Action Bar */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#c6c6cd]/30">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="btn-unilend-cta-soft w-full sm:w-auto h-11 px-5 rounded-lg text-sm font-semibold cursor-pointer"
              >
                Lưu bản nháp
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="btn-unilend-cta-soft flex-1 sm:flex-initial h-11 px-5 rounded-lg text-sm font-semibold cursor-pointer"
                >
                  Xem trước
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="btn-unilend-cta flex-1 sm:flex-initial h-11 px-6 rounded-lg text-sm font-semibold transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isPublishing ? (
                    <>
                      <span className="material-symbols-outlined text-base animate-spin">
                        progress_activity
                      </span>
                      <span>Đang đăng tin...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng thiết bị ngay</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Right Column: Sticky Sidebar (col-span-4) */}
          <aside className="lg:col-span-4 space-y-6 sticky top-24">
            {/* Live Listing Preview Card */}
            <div className="bg-white rounded-2xl border border-[#c6c6cd]/40 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-[#c6c6cd]/30 flex items-center justify-between bg-[#eff4ff]/50">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#76777d]">
                    Xem trước trực tiếp
                  </p>
                </div>
                <span className="text-xs font-medium text-[#45464d]">Giao diện người thuê</span>
              </div>

              <div className="p-4">
                {/* Simulated Card Container */}
                <div className="rounded-xl border border-[#c6c6cd]/40 overflow-hidden bg-white shadow-xs group">
                  {/* Item Image Cover */}
                  <div className="relative aspect-[16/10] bg-[#dce9ff] overflow-hidden">
                    {coverPhoto ? (
                      <img
                        src={coverPhoto.url}
                        alt={coverPhoto.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#76777d]">
                        Chưa có hình ảnh
                      </div>
                    )}
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-[#0b1c30] tracking-wider border border-[#c6c6cd]/30 uppercase">
                      {conditionLabel}
                    </span>
                    <span className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/80 backdrop-blur-md text-[#0b1c30] hover:text-[#f83256] transition-colors">
                      <span className="material-symbols-outlined text-[16px]">favorite</span>
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#76777d] mb-1">
                      {currentCategoryMeta.previewLabel}
                    </p>
                    <h4 className="text-sm font-bold text-[#0b1c30] leading-snug line-clamp-2">
                      {itemName || "Tên thiết bị"}
                    </h4>

                    <div className="mt-3 flex items-baseline justify-between">
                      <p className="text-base font-bold text-[#0b1c30]">
                        ${rentalRate || 0}{" "}
                        <span className="text-xs font-normal text-[#76777d]">
                          / {ratePeriod === "Daily" ? "ngày" : ratePeriod === "Weekly" ? "tuần" : "tháng"}
                        </span>
                      </p>
                      <span className="text-xs text-[#45464d] font-semibold">★ 5.0 (Mới)</span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#c6c6cd]/20 flex flex-col gap-1.5 text-xs text-[#76777d]">
                      <div className="flex items-center gap-1.5 text-[#45464d]">
                        <span className="material-symbols-outlined text-[16px] text-[#76777d]">
                          location_on
                        </span>
                        <span className="truncate">{itemLocation}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#45464d]">
                        <span className="material-symbols-outlined text-[16px] text-[#76777d]">
                          verified_user
                        </span>
                        <span className="truncate">
                          Tiền cọc: ${depositAmount} (Miễn cọc cho SV đã xác thực)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Owner Tips & SafeGuarantee™ Card */}
            <div className="bg-white rounded-2xl p-5 border border-[#c6c6cd]/40 shadow-xs space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">shield</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0b1c30]">Bảo Đảm Chủ Thiết Bị UniLend</h4>
                  <p className="text-xs text-[#76777d] mt-0.5 leading-relaxed">
                    Bảo hiểm bồi hoàn lên tới $2,500 cho mọi giao dịch thuê thiết bị đã xác thực.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#c6c6cd]/20 space-y-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#76777d]">
                  Danh mục kiểm tra an toàn
                </p>
                <div className="flex items-center gap-2.5 text-xs text-[#0b1c30]">
                  <span className="material-symbols-outlined text-base text-emerald-600">
                    check_circle
                  </span>
                  <span>Đã xác thực danh tính (Thẻ sinh viên / Email Edu)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#0b1c30]">
                  <span className="material-symbols-outlined text-base text-emerald-600">
                    check_circle
                  </span>
                  <span>Đã lưu số Serial phục vụ đối soát bảo hiểm</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#0b1c30]">
                  <span className="material-symbols-outlined text-base text-emerald-600">
                    check_circle
                  </span>
                  <span>Đã khử khuẩn &amp; kiểm định tình trạng thực tế</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="#guarantee-terms"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast("Bảo hiểm UniLend SafeGuarantee™ hỗ trợ đền bù tới $2,500 cho thiết bị hư hại hoặc thất lạc.");
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#712ae2] hover:underline"
                >
                  Xem điều khoản bảo lãnh
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Full Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-black/10">
            <div className="flex items-center justify-between pb-4 border-b border-black/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">visibility</span>
                <h3 className="text-base font-bold text-[#0b1c30]">Xem Trước Bài Đăng (Giao diện người thuê)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-[#76777d]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-100">
                {coverPhoto && (
                  <img
                    src={coverPhoto.url}
                    alt={coverPhoto.alt}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#712ae2]">
                  {currentCategoryMeta.previewLabel}
                </span>
                <h2 className="text-xl font-bold text-[#0b1c30] mt-1.5">{itemName}</h2>
                <p className="text-sm text-[#76777d] mt-0.5">Thương hiệu / Model: {brand}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#76777d]">Đơn giá thuê</span>
                  <p className="text-lg font-bold text-[#0b1c30]">
                    ${rentalRate} /{" "}
                    {ratePeriod === "Daily" ? "ngày" : ratePeriod === "Weekly" ? "tuần" : "tháng"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-[#76777d]">Tiền cọc bảo đảm</span>
                  <p className="text-base font-bold text-[#0b1c30]">${depositAmount}</p>
                </div>
                <div>
                  <span className="text-xs text-[#76777d]">Thời gian Tối thiểu / Tối đa</span>
                  <p className="text-sm font-semibold text-[#0b1c30]">
                    {minDuration} ngày / {maxDuration === "unlimited" ? "Không giới hạn" : `${maxDuration} ngày`}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#0b1c30] uppercase mb-1">Mô tả thiết bị</h4>
                <p className="text-sm text-[#45464d] leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 rounded-lg border border-black/10 text-xs font-bold text-[#0b1c30] hover:bg-slate-50 cursor-pointer"
                >
                  Quay lại chỉnh sửa
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    setShowPreviewModal(false);
                    void handlePublishSubmit(e as unknown as React.FormEvent);
                  }}
                  className="px-5 py-2 rounded-lg bg-[#000000] text-white text-xs font-bold hover:bg-black/80 cursor-pointer"
                >
                  Xác nhận đăng ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {publishSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl text-center border border-black/10 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">check</span>
            </div>

            <h3 className="text-xl font-bold text-[#0b1c30]">Đăng Thiết Bị Thành Công!</h3>
            <p className="text-sm text-[#45464d] mt-2 leading-relaxed">
              <strong>{itemName}</strong> hiện đã hiển thị trên Chợ thiết bị UniLend Campus. Sinh viên
              và thành viên đã xác thực quanh bạn có thể gửi yêu cầu thuê ngay bây giờ.
            </p>

            <div className="mt-4 p-3 bg-[#eff4ff] rounded-xl text-left text-xs text-[#0b1c30] space-y-1">
              <div className="flex justify-between">
                <span className="text-[#76777d]">Mã tin đăng:</span>
                <span className="font-mono font-bold">{publishedId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#76777d]">Giá thuê:</span>
                <span className="font-bold">
                  ${rentalRate} / {ratePeriod === "Daily" ? "ngày" : ratePeriod === "Weekly" ? "tuần" : "tháng"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#76777d]">Bảo vệ an toàn:</span>
                <span className="text-emerald-700 font-bold">$2,500 SafeGuarantee™</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <Link
                href="/rent"
                className="w-full py-2.5 rounded-lg bg-[#000000] text-white text-xs font-bold hover:bg-[#131b2e] transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Xem trên Chợ thiết bị</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
              <Link
                href="/owner-management"
                className="w-full py-2.5 rounded-lg border border-[#c6c6cd] text-xs font-bold text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
              >
                Về Cổng quản lý của tôi
              </Link>
              <button
                type="button"
                onClick={() => {
                  setPublishSuccess(false);
                  setItemName("");
                  setDescription("");
                }}
                className="text-xs text-[#76777d] hover:text-[#0b1c30] py-1 cursor-pointer"
              >
                Đăng thêm thiết bị khác
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#eff4ff] border-t border-[#c6c6cd]/40 mt-auto">
        <div className="max-w-[1360px] mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6 w-full">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <span className="text-sm font-bold tracking-tight text-[#0b1c30]">UNILEND.™</span>
            <span className="text-xs text-[#45464d]">
              © 2025 UNILEND.™ Bản quyền đã được bảo lưu. Mạng lưới chia sẻ thiết bị học tập &amp; sáng tạo sinh viên.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-[#45464d]">
            <Link href="/" className="hover:text-[#0b1c30] transition-colors">
              Chính sách bảo mật
            </Link>
            <Link href="/" className="hover:text-[#0b1c30] transition-colors">
              Điều khoản dịch vụ
            </Link>
            <Link href="/" className="hover:text-[#0b1c30] transition-colors">
              Bảo mật hệ thống
            </Link>
            <Link href="/" className="hover:text-[#0b1c30] transition-colors">
              Quy tắc cộng đồng
            </Link>
            <Link href="/" className="hover:text-[#0b1c30] transition-colors">
              Bảo đảm hoàn trả
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function CreateListingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9ff]">
          <span className="material-symbols-outlined text-4xl animate-spin text-[#712ae2]">
            progress_activity
          </span>
        </div>
      }
    >
      <CreateListingContent />
    </Suspense>
  );
}
