"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppHeader } from "../app-header";
import { loanService } from "../../lib/api/loanService";
import {
  getCustomLoanRecords,
  getRentalItemById,
  getSystemUser,
  RENTAL_ITEMS,
  updateCustomLoanStatus,
} from "../rental-catalog";

type RentalStatus =
  | "All"
  | "Pending"
  | "Confirmed"
  | "Active"
  | "Return Pending"
  | "Completed"
  | "Cancelled";

type RentalOrder = {
  id: string;
  itemId?: string;
  itemTitle: string;
  category: string;
  itemImage: string;
  lenderName: string;
  lenderAvatar: string;
  lenderUniversity?: string;
  lenderRating: number;
  status: "Pending" | "Confirmed" | "Active" | "Return Pending" | "Completed" | "Cancelled";
  statusText: string;
  statusSubtext?: string;
  dates: string;
  durationText: string;
  totalCost: number;
  depositStatus: string;
  depositAmount: number;
  pickupLocation?: string;
  trackingNote?: string;
};

const INITIAL_RENTAL_ORDERS: RentalOrder[] = [
  {
    id: "#UL-849204",
    itemId: RENTAL_ITEMS[0].id,
    itemTitle: RENTAL_ITEMS[0].title,
    category: "Nhiếp ảnh & Máy quay • Bộ máy chuyên nghiệp",
    itemImage: RENTAL_ITEMS[0].image,
    lenderName: RENTAL_ITEMS[0].ownerName,
    lenderAvatar: RENTAL_ITEMS[0].ownerAvatar,
    lenderUniversity: RENTAL_ITEMS[0].ownerUniversity,
    lenderRating: RENTAL_ITEMS[0].ownerRating ?? 4.95,
    status: "Pending",
    statusText: "Đang chờ duyệt (Chủ máy đang xem xét)",
    dates: "24/10 – 27/10/2025",
    durationText: "Thời gian thuê: 3 ngày",
    totalCost: 155.5,
    depositStatus: "Đang tạm giữ cọc 150.00$",
    depositAmount: 150.0,
    pickupLocation: RENTAL_ITEMS[0].pickupArea ?? RENTAL_ITEMS[0].location,
    trackingNote: `${RENTAL_ITEMS[0].ownerName} (${RENTAL_ITEMS[0].ownerUniversity}) phản hồi ~10 phút`,
  },
  {
    id: "#UL-782190",
    itemId: RENTAL_ITEMS[1].id,
    itemTitle: RENTAL_ITEMS[1].title,
    category: "Máy tính & Đồ họa • Cấu hình cao cấp",
    itemImage: RENTAL_ITEMS[1].image,
    lenderName: RENTAL_ITEMS[1].ownerName,
    lenderAvatar: RENTAL_ITEMS[1].ownerAvatar,
    lenderUniversity: RENTAL_ITEMS[1].ownerUniversity,
    lenderRating: RENTAL_ITEMS[1].ownerRating ?? 4.95,
    status: "Active",
    statusText: "Đang thuê • Còn 3 ngày (Hạn trả: 22/10/2025)",
    dates: "15/10 – 22/10/2025",
    durationText: "Đang sử dụng (Ngày 4 / 7)",
    totalCost: 320.0,
    depositStatus: "Đã phong tỏa cọc Escrow 500.00$",
    depositAmount: 500.0,
    pickupLocation: RENTAL_ITEMS[1].pickupArea ?? RENTAL_ITEMS[1].location,
    trackingNote: "Hạn trả trước 18:00 ngày 22/10",
  },
  {
    id: "#UL-651029",
    itemId: RENTAL_ITEMS[2].id,
    itemTitle: RENTAL_ITEMS[2].title,
    category: "Công cụ & Kỹ thuật • Bộ máy chính hãng",
    itemImage: RENTAL_ITEMS[2].image,
    lenderName: RENTAL_ITEMS[2].ownerName,
    lenderAvatar: RENTAL_ITEMS[2].ownerAvatar,
    lenderUniversity: RENTAL_ITEMS[2].ownerUniversity,
    lenderRating: RENTAL_ITEMS[2].ownerRating ?? 4.88,
    status: "Confirmed",
    statusText: "Đã xác nhận • Đã lên lịch nhận đồ",
    dates: "21/10/2025 • 10:00 AM",
    durationText: "Smart Locker Hub #14",
    totalCost: 48.0,
    depositStatus: "Đã cọc an toàn 60.00$",
    depositAmount: 60.0,
    pickupLocation: RENTAL_ITEMS[2].pickupArea ?? RENTAL_ITEMS[2].location,
    trackingNote: `Chủ thiết bị: ${RENTAL_ITEMS[2].ownerName} (${RENTAL_ITEMS[2].ownerUniversity})`,
  },
  {
    id: "#UL-491024",
    itemId: RENTAL_ITEMS[3].id,
    itemTitle: RENTAL_ITEMS[3].title,
    category: "Flycam & Drone • Bộ phụ kiện đầy đủ",
    itemImage: RENTAL_ITEMS[3].image,
    lenderName: RENTAL_ITEMS[3].ownerName,
    lenderAvatar: RENTAL_ITEMS[3].ownerAvatar,
    lenderUniversity: RENTAL_ITEMS[3].ownerUniversity,
    lenderRating: RENTAL_ITEMS[3].ownerRating ?? 4.95,
    status: "Completed",
    statusText: "Đã hoàn tất (Đã trả 10/10)",
    dates: "07/10 – 10/10/2025",
    durationText: "Đã hoàn trả 100% tiền cọc",
    totalCost: 210.0,
    depositStatus: "Biên lai #REC-9821",
    depositAmount: 200.0,
    pickupLocation: RENTAL_ITEMS[3].pickupArea ?? RENTAL_ITEMS[3].location,
    trackingNote: "Thiết bị được hoàn trả nguyên vẹn",
  },
  {
    id: "#UL-320918",
    itemId: RENTAL_ITEMS[4].id,
    itemTitle: RENTAL_ITEMS[4].title,
    category: "Máy chiếu & Nghe nhìn • 4K HDR",
    itemImage: RENTAL_ITEMS[4].image,
    lenderName: RENTAL_ITEMS[4].ownerName,
    lenderAvatar: RENTAL_ITEMS[4].ownerAvatar,
    lenderUniversity: RENTAL_ITEMS[4].ownerUniversity,
    lenderRating: RENTAL_ITEMS[4].ownerRating ?? 4.89,
    status: "Cancelled",
    statusText: "Người thuê đã hủy vào ngày 02/10",
    dates: "05/10 – 07/10/2025",
    durationText: "0 ngày thuê",
    totalCost: 95.0,
    depositStatus: "Đã hoàn tiền về tài khoản gốc",
    depositAmount: 100.0,
    pickupLocation: RENTAL_ITEMS[4].pickupArea ?? RENTAL_ITEMS[4].location,
    trackingNote: "Hủy đơn hợp lệ trong khung thời gian miễn phí",
  },
  {
    id: "#UL-192834",
    itemId: RENTAL_ITEMS[7].id,
    itemTitle: RENTAL_ITEMS[7].title,
    category: "Âm thanh & Sự kiện • Pin tích hợp",
    itemImage: RENTAL_ITEMS[7].image,
    lenderName: RENTAL_ITEMS[7].ownerName,
    lenderAvatar: RENTAL_ITEMS[7].ownerAvatar,
    lenderUniversity: RENTAL_ITEMS[7].ownerUniversity,
    lenderRating: RENTAL_ITEMS[7].ownerRating ?? 4.91,
    status: "Completed",
    statusText: "Đã hoàn tất (Đã trả 22/09)",
    dates: "20/09 – 22/09/2025",
    durationText: "Đã giải tỏa toàn bộ tiền cọc",
    totalCost: 85.0,
    depositStatus: "Biên lai #REC-8192",
    depositAmount: 100.0,
    pickupLocation: RENTAL_ITEMS[7].pickupArea ?? RENTAL_ITEMS[7].location,
    trackingNote: "Loa và micro được bàn giao an toàn",
  },
  {
    id: "#UL-102948",
    itemId: RENTAL_ITEMS[5].id,
    itemTitle: RENTAL_ITEMS[5].title,
    category: "Gia dụng & Đời sống • Làm sạch bằng tia Laser",
    itemImage: RENTAL_ITEMS[5].image,
    lenderName: RENTAL_ITEMS[5].ownerName,
    lenderAvatar: RENTAL_ITEMS[5].ownerAvatar,
    lenderUniversity: RENTAL_ITEMS[5].ownerUniversity,
    lenderRating: RENTAL_ITEMS[5].ownerRating ?? 4.92,
    status: "Completed",
    statusText: "Đã hoàn tất (Đã trả 18/08)",
    dates: "14/08 – 18/08/2025",
    durationText: "Đã hoàn cọc thành công",
    totalCost: 110.0,
    depositStatus: "Biên lai #REC-7014",
    depositAmount: 90.0,
    pickupLocation: RENTAL_ITEMS[5].pickupArea ?? RENTAL_ITEMS[5].location,
    trackingNote: "Máy hút bụi đã vệ sinh sạch sẽ khi bàn giao",
  },
];

function MyRentalsContent() {
  const [orders, setOrders] = useState<RentalOrder[]>(INITIAL_RENTAL_ORDERS);
  const [selectedStatus, setSelectedStatus] = useState<RentalStatus>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<RentalOrder | null>(null);
  const [selectedOrderForMessage, setSelectedOrderForMessage] = useState<RentalOrder | null>(null);
  const [messageText, setMessageText] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadMyLoans() {
      const localLoans: RentalOrder[] = getCustomLoanRecords().map((rec) => ({
        id: rec.id,
        itemId: rec.itemId,
        itemTitle: rec.itemTitle,
        category: rec.category,
        itemImage: rec.itemImage,
        lenderName: rec.ownerName,
        lenderAvatar: rec.ownerAvatar,
        lenderUniversity: rec.ownerUniversity,
        lenderRating: rec.ownerRating ?? getSystemUser({ id: rec.ownerId }).rating,
        status: rec.status,
        statusText:
          rec.status === "Pending"
            ? "Đang chờ duyệt (Chủ máy đang xem xét)"
            : rec.status === "Confirmed"
            ? "Đã xác nhận • Chờ nhận thiết bị"
            : rec.status === "Completed"
            ? "Đã hoàn tất hoàn trả"
            : rec.status === "Cancelled"
            ? "Đã hủy bởi người thuê"
            : "Đang thuê thiết bị",
        dates: rec.datesLabel || `${rec.borrowFrom} – ${rec.dueDate}`,
        durationText: `Thời gian thuê: ${rec.rentalDays} ngày`,
        totalCost: rec.totalCost,
        depositAmount: rec.depositAmount,
        depositStatus: `Tạm giữ cọc Escrow $${rec.depositAmount.toFixed(2)}`,
        pickupLocation: rec.pickupLocation,
        trackingNote: `${rec.ownerName} (${rec.ownerUniversity})`,
      }));

      try {
        const res = await loanService.listMine();
        if (res?.content && res.content.length > 0) {
          const mapped: RentalOrder[] = res.content.map((loan) => {
            const matchedCatalog = getRentalItemById(String(loan.item?.id ?? 1));
            const ownerAccount = loan.owner
              ? getSystemUser(loan.owner)
              : getSystemUser({ id: matchedCatalog.ownerId });
            const ownerName = loan.owner?.fullName || ownerAccount?.fullName || matchedCatalog.ownerName;
            const ownerAvatar = loan.owner?.avatarUrl || ownerAccount?.avatar || matchedCatalog.ownerAvatar;
            const ownerUniversity =
              loan.owner?.university || ownerAccount?.university || matchedCatalog.ownerUniversity;
            return {
              id: `#UL-${loan.id}`,
              itemId: matchedCatalog.id,
              itemTitle: loan.item?.title || matchedCatalog.title,
              category: matchedCatalog.categoryLabel ?? matchedCatalog.category,
              itemImage: matchedCatalog.image,
              lenderName: ownerName,
              lenderAvatar: ownerAvatar,
              lenderUniversity: ownerUniversity,
              lenderRating: ownerAccount?.rating ?? matchedCatalog.ownerRating ?? 4.95,
              status:
                loan.status === "PENDING"
                  ? "Pending"
                  : loan.status === "APPROVED"
                  ? "Confirmed"
                  : loan.status === "RETURNED"
                  ? "Completed"
                  : loan.status === "CANCELLED"
                  ? "Cancelled"
                  : "Active",
              statusText: `Trạng thái DB: ${loan.status}`,
              dates: `${loan.borrowFrom} – ${loan.dueDate}`,
              durationText: "Đơn thuê đồng bộ SQL",
              totalCost: matchedCatalog.pricePerDay * 3,
              depositAmount: matchedCatalog.securityDeposit ?? 150.0,
              depositStatus: "Đang giữ trong quỹ Escrow",
              pickupLocation: matchedCatalog.location,
              trackingNote: `${ownerName} (${ownerUniversity})`,
            };
          });
          const seen = new Set(mapped.map((m) => m.id));
          const uniqueLocal = localLoans.filter((l) => !seen.has(l.id));
          setOrders([...uniqueLocal, ...mapped, ...INITIAL_RENTAL_ORDERS]);
          return;
        }
      } catch {
        // Fallback to local + default synchronized orders
      }
      if (localLoans.length > 0) {
        const seen = new Set(localLoans.map((l) => l.id));
        setOrders([...localLoans, ...INITIAL_RENTAL_ORDERS.filter((o) => !seen.has(o.id))]);
      }
    }
    loadMyLoans();
  }, []);

  // Status counts
  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === "Pending").length,
      confirmed: orders.filter((o) => o.status === "Confirmed").length,
      active: orders.filter((o) => o.status === "Active").length,
      returnPending: orders.filter((o) => o.status === "Return Pending").length,
      completed: orders.filter((o) => o.status === "Completed").length,
      cancelled: orders.filter((o) => o.status === "Cancelled").length,
    };
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus =
        selectedStatus === "All" || order.status === selectedStatus;
      const searchable = `${order.itemTitle} ${order.id} ${order.lenderName} ${order.category}`.toLowerCase();
      const matchesQuery = q.length === 0 || searchable.includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [orders, selectedStatus, searchQuery]);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id.replace("#", ""));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCancelOrder = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn hủy yêu cầu thuê này không?")) {
      const numId = parseInt(id.replace(/[^0-9]/g, ""), 10);
      if (!isNaN(numId) && numId > 0) {
        try {
          await loanService.cancel(numId);
        } catch {
          // Offline fallback
        }
      }
      updateCustomLoanStatus(id, "Cancelled");
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? {
                ...o,
                status: "Cancelled",
                statusText: "Đã hủy bởi người thuê",
                depositStatus: "Đang xử lý hoàn tiền",
              }
            : o
        )
      );
    }
  };

  return (
    <div className="bg-[#fafafd] text-on-surface font-sans antialiased flex flex-col min-h-screen selection:bg-rose-100 selection:text-black">
      {/* Synchronized Header */}
      <AppHeader />

      {/* Main Canvas */}
      <main className="flex-grow max-w-[1360px] mx-auto px-6 md:px-12 w-full py-8 space-y-8">
        {/* Breadcrumb & Header Section */}
        <section className="space-y-4">
          <nav className="flex items-center space-x-2 text-body-sm text-on-surface-variant">
            <Link className="hover:text-primary transition-colors" href="/">
              Trang chủ
            </Link>
            <span className="text-outline-variant">/</span>
            <Link className="hover:text-primary transition-colors" href="/rent">
              Thuê thiết bị
            </Link>
            <span className="text-outline-variant">/</span>
            <span className="text-primary font-medium">Đơn thuê của tôi</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
            <div>
              <h1 className="text-3xl sm:text-headline-lg font-semibold text-primary tracking-tight">
                Đơn Thuê Của Tôi
              </h1>
              <p className="text-body-md text-on-surface-variant mt-1.5 font-normal">
                Quản lý yêu cầu thuê, lịch nhận/trả thiết bị qua Smart Locker và lịch sử giao dịch đồng bộ MySQL.
              </p>
            </div>

            {/* Quick Summary Metrics */}
            <div className="flex items-center flex-wrap gap-2.5">
              <div className="bg-white/90 backdrop-blur-md border border-outline-variant/40 rounded-xl px-4 py-2 flex items-center gap-2.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
                  Đang thuê
                </span>
                <span className="text-primary font-bold">{counts.active}</span>
              </div>
              <div className="bg-white/90 backdrop-blur-md border border-outline-variant/40 rounded-xl px-4 py-2 flex items-center gap-2.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
                  Chờ duyệt
                </span>
                <span className="text-primary font-bold">{counts.pending}</span>
              </div>
              <div className="bg-white/90 backdrop-blur-md border border-outline-variant/40 rounded-xl px-4 py-2 flex items-center gap-2.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
                  Đã xác nhận
                </span>
                <span className="text-primary font-bold">{counts.confirmed}</span>
              </div>
              <div className="bg-white/90 backdrop-blur-md border border-outline-variant/40 rounded-xl px-4 py-2 flex items-center gap-2.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
                  Hoàn tất
                </span>
                <span className="text-primary font-bold">{counts.completed}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Status Tabs & Toolbar */}
        <section className="space-y-4">
          {/* Status Tabs */}
          <div className="border-b border-outline-variant/30 overflow-x-auto scrollbar-none flex items-center gap-2 sm:gap-6 text-label-lg whitespace-nowrap">
            {(
              [
                { key: "All", label: "Tất cả", count: counts.all },
                { key: "Pending", label: "Chờ duyệt", count: counts.pending },
                { key: "Confirmed", label: "Đã xác nhận", count: counts.confirmed },
                { key: "Active", label: "Đang thuê", count: counts.active },
                { key: "Return Pending", label: "Chờ trả", count: counts.returnPending },
                { key: "Completed", label: "Hoàn tất", count: counts.completed },
                { key: "Cancelled", label: "Đã hủy", count: counts.cancelled },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedStatus(tab.key as RentalStatus)}
                className={`pb-3 px-1.5 transition-all cursor-pointer flex items-center gap-1.5 font-medium ${
                  selectedStatus === tab.key
                    ? "text-primary font-semibold border-b-2 border-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
                type="button"
              >
                <span>{tab.label}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedStatus === tab.key
                      ? "bg-primary text-white"
                      : "bg-surface-container text-on-surface-variant"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search, Filter & View Controls */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 text-body-md bg-white rounded-lg border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-outline text-primary transition-all shadow-xs"
                placeholder="Tìm theo tên thiết bị, mã đơn (#UL-849204)..."
                type="text"
              />
            </div>

            {/* View Mode & Filter Controls */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Toggle Table / Card View */}
              <div className="inline-flex rounded-lg border border-outline-variant/50 bg-white p-0.5 shadow-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("card")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    viewMode === "card"
                      ? "bg-primary text-white"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                  title="Dạng thẻ"
                >
                  <span className="material-symbols-outlined text-[16px]">view_agenda</span>
                  <span>Dạng thẻ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    viewMode === "table"
                      ? "bg-primary text-white"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                  title="Dạng bảng"
                >
                  <span className="material-symbols-outlined text-[16px]">table_rows</span>
                  <span>Dạng bảng</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("All");
                }}
                className="h-11 px-3.5 bg-white border border-outline-variant/50 rounded-lg text-body-md text-on-surface hover:border-outline transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-outline">
                  refresh
                </span>
                <span>Đặt lại</span>
              </button>
            </div>
          </div>
        </section>

        {/* Orders Content Section */}
        {filteredOrders.length === 0 ? (
          /* Empty State */
          <section className="border border-dashed border-outline-variant/60 rounded-xl p-12 bg-white/50 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-surface-container mx-auto flex items-center justify-center text-outline">
              <span className="material-symbols-outlined text-[24px]">assignment_return</span>
            </div>
            <div>
              <h4 className="text-title-md font-semibold text-primary">Không tìm thấy đơn thuê nào</h4>
              <p className="text-body-sm text-on-surface-variant max-w-md mx-auto mt-1">
                Không có đơn thuê nào khớp với bộ lọc hiện tại. Hãy thử chọn tab trạng thái khác hoặc nhập từ khóa tìm kiếm.
              </p>
            </div>
            <div className="pt-2">
              <Link
                className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-primary text-white text-body-sm font-semibold hover:bg-neutral-800 transition-colors"
                href="/rent"
              >
                <span className="material-symbols-outlined text-[18px]">explore</span>
                <span>Khám phá danh mục thiết bị</span>
              </Link>
            </div>
          </section>
        ) : viewMode === "card" ? (
          /* CARDS VIEW */
          <section className="space-y-4">
            {filteredOrders.map((order) => {
              const isPending = order.status === "Pending";
              const isActive = order.status === "Active";
              const isConfirmed = order.status === "Confirmed";
              const isCompleted = order.status === "Completed";
              const isCancelled = order.status === "Cancelled";

              return (
                <article
                  key={order.id}
                  className={`bg-white/95 backdrop-blur-md border rounded-xl p-5 md:p-6 transition-all duration-200 shadow-xs hover:shadow-md ${
                    isActive
                      ? "border-primary/40 ring-1 ring-primary/10"
                      : "border-outline-variant/40 hover:border-outline-variant"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Item & Lender Info */}
                    <div className="flex items-start gap-4 sm:gap-6 flex-1">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-high border border-outline-variant/30">
                        <img
                          alt={order.itemTitle}
                          className="w-full h-full object-cover"
                          src={order.itemImage}
                        />
                      </div>
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {isPending && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Chờ chủ máy duyệt
                            </span>
                          )}
                          {isActive && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {order.statusText}
                            </span>
                          )}
                          {isConfirmed && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-indigo-50 text-indigo-800 border border-indigo-300 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                              Đã xác nhận • Chờ nhận thiết bị
                            </span>
                          )}
                          {isCompleted && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[13px] text-slate-600">
                                check
                              </span>
                              {order.statusText}
                            </span>
                          )}
                          {isCancelled && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-rose-50 text-rose-800 border border-rose-300 flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[13px] text-rose-600">
                                close
                              </span>
                              Đã hủy
                            </span>
                          )}

                          <span className="text-label-md text-outline bg-surface-container-low px-2 py-0.5 rounded-md flex items-center gap-1">
                            {order.id}
                            <button
                              onClick={() => handleCopyId(order.id)}
                              className="hover:text-primary transition-colors cursor-pointer"
                              title="Sao chép mã đơn"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {copiedId === order.id ? "check" : "content_copy"}
                              </span>
                            </button>
                          </span>
                        </div>

                        <div>
                          <h3 className="text-title-lg font-bold text-primary truncate">
                            {order.itemTitle}
                          </h3>
                          <p className="text-body-sm text-on-surface-variant">{order.category}</p>
                        </div>

                        <div className="flex items-center gap-3 text-body-sm pt-0.5">
                          <div className="flex items-center gap-1.5">
                            <img
                              alt={order.lenderName}
                              className="w-5 h-5 rounded-full object-cover"
                              src={order.lenderAvatar}
                            />
                            <span className="text-on-surface-variant">
                              Chủ thiết bị:{" "}
                              <strong className="text-primary font-medium">{order.lenderName}</strong>
                            </span>
                            <span className="text-amber-500 text-xs">★ {order.lenderRating.toFixed(1)}</span>
                          </div>
                          <span className="text-outline-variant">•</span>
                          <button
                            onClick={() => {
                              setSelectedOrderForMessage(order);
                              setMessageSent(false);
                            }}
                            className="text-secondary font-medium hover:underline flex items-center gap-1 cursor-pointer"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[14px]">mail</span>
                            <span>Nhắn tin</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Timeline & Financials */}
                    <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-8 border-t lg:border-t-0 border-outline-variant/30 pt-4 lg:pt-0">
                      <div>
                        <span className="text-label-md text-outline uppercase tracking-wider block font-medium">
                          Lịch thuê
                        </span>
                        <p className="text-body-md text-primary font-medium mt-0.5">{order.dates}</p>
                        <span className="text-body-sm text-on-surface-variant">
                          {order.durationText}
                        </span>
                      </div>
                      <div>
                        <span className="text-label-md text-outline uppercase tracking-wider block font-medium">
                          Chi phí thanh toán
                        </span>
                        <p className="text-title-md font-bold text-primary mt-0.5">
                          ${order.totalCost.toFixed(2)}
                        </p>
                        <span className="text-body-sm text-on-surface-variant">
                          {order.depositStatus}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-center gap-2 border-t lg:border-t-0 border-outline-variant/30 pt-4 lg:pt-0 lg:min-w-[170px]">
                      <button
                        onClick={() => setSelectedOrderForDetails(order)}
                        className="btn-unilend-cta h-10 px-5 rounded-lg text-body-md font-semibold transition-all shadow-xs cursor-pointer"
                        type="button"
                      >
                        Xem chi tiết
                      </button>

                      {isPending && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="h-9 px-3 rounded-lg text-rose-700 hover:bg-rose-50 text-body-sm font-medium transition-colors text-center cursor-pointer"
                          type="button"
                        >
                          Hủy yêu cầu
                        </button>
                      )}

                      {isActive && (
                        <div className="flex items-center gap-2 w-full lg:w-auto">
                          <Link
                            href={`/return-item?orderId=${encodeURIComponent(order.id)}&itemId=${encodeURIComponent(order.itemId ?? "sony-a7-iv")}`}
                            className="flex-1 lg:flex-initial h-9 px-3 rounded-lg border border-outline-variant/60 text-primary hover:bg-surface-container-low text-body-sm font-semibold transition-colors flex items-center justify-center cursor-pointer"
                          >
                            Yêu cầu trả đồ
                          </Link>
                          <button
                            onClick={() => alert(`Đã gửi yêu cầu gia hạn cho đơn ${order.id}. Chủ máy sẽ nhận được thông báo.`)}
                            className="flex-1 lg:flex-initial h-9 px-3 rounded-lg text-secondary hover:bg-purple-50 text-body-sm font-medium transition-colors cursor-pointer"
                            type="button"
                          >
                            Gia hạn
                          </button>
                        </div>
                      )}

                      {isConfirmed && (
                        <button
                          onClick={() => {
                            setOrders((prev) =>
                              prev.map((o) =>
                                o.id === order.id
                                  ? {
                                      ...o,
                                      status: "Active",
                                      statusText: "Đang thuê • Đã nhận máy",
                                    }
                                  : o
                              )
                            );
                          }}
                          className="h-9 px-4 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 text-body-sm font-semibold transition-colors shadow-xs cursor-pointer"
                          type="button"
                        >
                          Xác nhận đã nhận máy
                        </button>
                      )}

                      {isCompleted && (
                        <button
                          onClick={() => alert(`Mở hộp thoại đánh giá cho thiết bị: ${order.itemTitle}`)}
                          className="h-9 px-3 rounded-lg border border-outline-variant/60 text-primary hover:bg-surface-container text-body-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-1"
                          type="button"
                        >
                          <span>★ Đánh giá</span>
                        </button>
                      )}

                      {order.trackingNote && (
                        <p className="text-[11px] text-outline text-center lg:text-right mt-0.5">
                          {order.trackingNote}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          /* TABLE VIEW (BẢNG MY RENTALS) */
          <section className="bg-white rounded-2xl border border-outline-variant/30 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-body-sm">
                <thead>
                  <tr className="bg-surface-container-low/60 border-b border-outline-variant/30 text-outline text-label-md uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-4">Mã đơn &amp; Thiết bị</th>
                    <th className="py-3.5 px-4">Chủ thiết bị</th>
                    <th className="py-3.5 px-4">Lịch thuê</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-4 text-right">Tổng thanh toán</th>
                    <th className="py-3.5 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {filteredOrders.map((order) => {
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-surface/60 transition-colors"
                      >
                        {/* Item column */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              alt={order.itemTitle}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-outline-variant/20"
                              src={order.itemImage}
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-primary block truncate max-w-xs sm:max-w-md">
                                {order.itemTitle}
                              </span>
                              <div className="flex items-center gap-1.5 text-xs text-outline mt-0.5">
                                <span>{order.id}</span>
                                <span>•</span>
                                <span>{order.category.split("•")[0]}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Lender */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <img
                              alt={order.lenderName}
                              className="w-6 h-6 rounded-full object-cover"
                              src={order.lenderAvatar}
                            />
                            <div>
                              <span className="text-primary font-medium block">
                                {order.lenderName}
                              </span>
                              <span className="text-xs text-amber-600">
                                ★ {order.lenderRating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Schedule */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="font-medium text-primary block">{order.dates}</span>
                          <span className="text-xs text-on-surface-variant">{order.durationText}</span>
                        </td>

                        {/* Status badge */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              order.status === "Pending"
                                ? "bg-amber-50 text-amber-800 border border-amber-300"
                                : order.status === "Active"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                                : order.status === "Confirmed"
                                ? "bg-indigo-50 text-indigo-800 border border-indigo-300"
                                : order.status === "Completed"
                                ? "bg-slate-100 text-slate-700 border border-slate-300"
                                : "bg-rose-50 text-rose-800 border border-rose-300"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                order.status === "Pending"
                                  ? "bg-amber-500"
                                  : order.status === "Active"
                                  ? "bg-emerald-500"
                                  : order.status === "Confirmed"
                                  ? "bg-indigo-500"
                                  : order.status === "Completed"
                                  ? "bg-slate-500"
                                  : "bg-rose-500"
                              }`}
                            />
                            {order.status === "Pending"
                              ? "Chờ duyệt"
                              : order.status === "Active"
                              ? "Đang thuê"
                              : order.status === "Confirmed"
                              ? "Đã xác nhận"
                              : order.status === "Completed"
                              ? "Hoàn tất"
                              : "Đã hủy"}
                          </span>
                        </td>

                        {/* Financials */}
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <span className="font-bold text-primary block">
                            ${order.totalCost.toFixed(2)}
                          </span>
                          <span className="text-xs text-outline">{order.depositStatus}</span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedOrderForDetails(order)}
                              className="px-3 py-1.5 rounded-lg border border-outline-variant/60 text-primary hover:bg-surface-container text-xs font-semibold cursor-pointer"
                              type="button"
                            >
                              Chi tiết
                            </button>
                            <button
                              onClick={() => {
                                setSelectedOrderForMessage(order);
                                setMessageSent(false);
                              }}
                              className="p-1.5 rounded-lg text-secondary hover:bg-purple-50 cursor-pointer"
                              title="Nhắn tin chủ máy"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[18px]">mail</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Pagination & Count */}
        <section className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-outline-variant/30 text-body-sm text-on-surface-variant">
          <span>
            Hiển thị <strong>{filteredOrders.length}</strong> trên tổng số <strong>{orders.length}</strong> đơn thuê
          </span>
          <div className="flex items-center space-x-1">
            <button
              className="p-2 rounded-lg border border-outline-variant/40 text-outline opacity-40 cursor-not-allowed"
              disabled
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="w-9 h-9 rounded-lg bg-primary text-white font-medium text-center" type="button">
              1
            </button>
            <button className="p-2 rounded-lg border border-outline-variant/40 text-outline opacity-40 cursor-not-allowed" disabled type="button">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </section>
      </main>

      {/* Details Modal */}
      {selectedOrderForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-black/10 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-container flex-shrink-0">
                  <img
                    alt={selectedOrderForDetails.itemTitle}
                    className="w-full h-full object-cover"
                    src={selectedOrderForDetails.itemImage}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-primary text-title-md line-clamp-1">
                    {selectedOrderForDetails.itemTitle}
                  </h3>
                  <p className="text-xs text-outline">{selectedOrderForDetails.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForDetails(null)}
                className="text-outline hover:text-black cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-body-sm">
              <div className="flex justify-between items-center py-1 border-b border-outline-variant/15">
                <span className="text-on-surface-variant font-medium">Trạng thái</span>
                <span className="font-semibold text-primary">
                  {selectedOrderForDetails.statusText}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-outline-variant/15">
                <span className="text-on-surface-variant font-medium">Chủ thiết bị</span>
                <span className="font-semibold text-primary">
                  {selectedOrderForDetails.lenderName} (★ {selectedOrderForDetails.lenderRating.toFixed(1)})
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-outline-variant/15">
                <span className="text-on-surface-variant font-medium">Lịch thuê</span>
                <span className="font-semibold text-primary">
                  {selectedOrderForDetails.dates}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-outline-variant/15">
                <span className="text-on-surface-variant font-medium">Địa điểm bàn giao</span>
                <span className="font-semibold text-primary">
                  {selectedOrderForDetails.pickupLocation ?? "Campus Trung tâm"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-outline-variant/15">
                <span className="text-on-surface-variant font-medium">Tổng tiền thanh toán</span>
                <span className="font-bold text-primary text-title-md">
                  ${selectedOrderForDetails.totalCost.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-outline-variant/15">
                <span className="text-on-surface-variant font-medium">Tình trạng cọc Escrow</span>
                <span className="text-primary font-medium">
                  {selectedOrderForDetails.depositStatus}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low text-xs text-on-surface-variant flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">
                  shield
                </span>
                <span>
                  Được bảo vệ bởi <strong>UniLend Shield</strong>. Bảo hiểm hao mòn thiết bị và hỗ trợ hòa giải cộng đồng campus 24/7.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrderForDetails(null)}
                className="px-5 py-2.5 rounded-lg bg-black text-white text-sm font-semibold hover:bg-neutral-800 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {selectedOrderForMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-black/10 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <img
                  alt={selectedOrderForMessage.lenderName}
                  className="w-10 h-10 rounded-full object-cover"
                  src={selectedOrderForMessage.lenderAvatar}
                />
                <div>
                  <h4 className="font-bold text-primary">
                    Nhắn tin cho {selectedOrderForMessage.lenderName}
                  </h4>
                  <p className="text-xs text-outline">{selectedOrderForMessage.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedOrderForMessage(null);
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
                  ✓ Tin nhắn đã được gửi! {selectedOrderForMessage.lenderName} đã nhận được lời nhắn của bạn.
                </div>
              ) : (
                <>
                  <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-2">
                    Nội dung tin nhắn
                  </label>
                  <textarea
                    rows={4}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={`Chào ${selectedOrderForMessage.lenderName}, mình muốn trao đổi về thời gian nhận thiết bị ${selectedOrderForMessage.itemTitle}...`}
                    className="w-full p-3 rounded-xl border border-outline-variant text-sm focus:border-black focus:ring-1 focus:ring-black"
                  />
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedOrderForMessage(null);
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

      {/* Footer */}
      <footer className="docked full-width bottom bg-white border-t border-outline-variant/30 mt-16 transition-colors duration-150">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 py-10 w-full flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <span className="text-title-md font-bold text-primary">UNILEND.™</span>
            <span className="text-body-sm text-on-surface-variant">
              © 2025 UniLend Inc. Bảo lưu mọi quyền.
            </span>
          </div>
          <div className="flex items-center flex-wrap justify-center gap-6 text-label-md">
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="/#privacy">
              Chính sách bảo mật
            </Link>
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="/#terms">
              Điều khoản dịch vụ
            </Link>
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="/#security">
              Bảo mật hệ thống
            </Link>
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="/#cookies">
              Tùy chọn Cookie
            </Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1" href="/#help">
              <span className="material-symbols-outlined text-[14px]">shield</span> Trung tâm trợ giúp &amp; An toàn
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function MyRentalsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fafafd]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <MyRentalsContent />
    </Suspense>
  );
}
