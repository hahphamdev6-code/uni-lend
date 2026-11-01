"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "../app-header";
import { useAuth } from "../auth-context";
import { itemService } from "../../lib/api/itemService";
import { loanService } from "../../lib/api/loanService";
import {
  deleteCustomListing,
  getCustomListings,
  getCustomLoanRecords,
  getDeletedListingIds,
  getRentalItemById,
  getSystemUser,
  mergeBackendItemsWithCatalog,
  RENTAL_ITEMS,
  SYSTEM_USERS,
  updateCustomLoanStatus,
  type RentalListingItem,
} from "../rental-catalog";

type ManagementStatus =
  | "All"
  | "Pending"
  | "Confirmed"
  | "Active"
  | "Return Pending"
  | "Completed"
  | "Rejected / Disputed";

type OwnerRentalOrder = {
  id: string;
  itemTitle: string;
  category: string;
  itemImage: string;
  renterName: string;
  renterAvatar: string;
  renterUniversity?: string;
  renterRating: number;
  renterRentalsCount: number;
  status: "Pending" | "Confirmed" | "Active" | "Return Pending" | "Completed" | "Disputed";
  statusText: string;
  statusBadgeColor: string;
  dates: string;
  durationText: string;
  payoutAmount: number;
  depositAmount: number;
  pickupInfo: string;
  renterNote?: string;
  hasReturnEvidence?: boolean;
  evidenceThumbnails?: string[];
  disputeCaseId?: string;
  disputeNote?: string;
};

const INITIAL_OWNER_ORDERS: OwnerRentalOrder[] = [
  {
    id: "#UL-849204",
    itemTitle: RENTAL_ITEMS[0].title,
    category: "Quay phim & Chụp ảnh • 4K 60p",
    itemImage: RENTAL_ITEMS[0].image,
    renterName: SYSTEM_USERS[1].fullName,
    renterAvatar: SYSTEM_USERS[1].avatar,
    renterUniversity: SYSTEM_USERS[1].university,
    renterRating: SYSTEM_USERS[1].rating,
    renterRentalsCount: 14,
    status: "Return Pending",
    statusText: "Chờ kiểm tra hoàn trả • Cần nghiệm thu",
    statusBadgeColor: "bg-purple-100 text-purple-900 border-purple-300",
    dates: "24/10 – 27/10/2025",
    durationText: "Đã trả lúc 17:45 hôm nay",
    payoutAmount: 135.0,
    depositAmount: 150.0,
    pickupInfo: RENTAL_ITEMS[0].pickupArea ?? RENTAL_ITEMS[0].location,
    hasReturnEvidence: true,
    evidenceThumbnails: [
      RENTAL_ITEMS[0].gallery?.[1]?.src ?? RENTAL_ITEMS[0].image,
      RENTAL_ITEMS[0].gallery?.[2]?.src ?? RENTAL_ITEMS[0].image,
    ],
  },
  {
    id: "#UL-850193",
    itemTitle: RENTAL_ITEMS[8].title,
    category: "Chống rung & Gimbal • Sợi Carbon",
    itemImage: RENTAL_ITEMS[8].image,
    renterName: SYSTEM_USERS[2].fullName,
    renterAvatar: SYSTEM_USERS[2].avatar,
    renterUniversity: SYSTEM_USERS[2].university,
    renterRating: SYSTEM_USERS[2].rating,
    renterRentalsCount: 9,
    status: "Pending",
    statusText: "Chờ chủ thiết bị phê duyệt",
    statusBadgeColor: "bg-amber-100 text-amber-900 border-amber-300",
    dates: "30/10 – 02/11/2025 (3 Ngày)",
    durationText: "Nhận 12 phút trước • Tự động hết hạn sau 23 giờ",
    payoutAmount: 120.0,
    depositAmount: 150.0,
    pickupInfo: RENTAL_ITEMS[8].pickupArea ?? RENTAL_ITEMS[8].location,
    renterNote:
      "Quay phim tài liệu bài tập tốt nghiệp. Cần tính năng lấy nét LiDAR ban đêm.",
  },
  {
    id: "#UL-848802",
    itemTitle: RENTAL_ITEMS[9].title,
    category: "Ống kính quang học • Telephoto Zoom",
    itemImage: RENTAL_ITEMS[9].image,
    renterName: SYSTEM_USERS[3].fullName,
    renterAvatar: SYSTEM_USERS[3].avatar,
    renterUniversity: SYSTEM_USERS[3].university,
    renterRating: SYSTEM_USERS[3].rating,
    renterRentalsCount: 8,
    status: "Confirmed",
    statusText: "Đã xác nhận • Đã lên lịch nhận đồ",
    statusBadgeColor: "bg-sky-100 text-sky-900 border-sky-300",
    dates: "29/10 – 01/11/2025",
    durationText: "Ngày mai, 10:00 AM (Sẵn sàng bàn giao)",
    payoutAmount: 105.0,
    depositAmount: 180.0,
    pickupInfo: RENTAL_ITEMS[9].pickupArea ?? RENTAL_ITEMS[9].location,
  },
  {
    id: "#UL-847291",
    itemTitle: RENTAL_ITEMS[1].title,
    category: "Máy tính & Đồ họa • Cấu hình 64GB / 2TB",
    itemImage: RENTAL_ITEMS[1].image,
    renterName: SYSTEM_USERS[4].fullName,
    renterAvatar: SYSTEM_USERS[4].avatar,
    renterUniversity: SYSTEM_USERS[4].university,
    renterRating: SYSTEM_USERS[4].rating,
    renterRentalsCount: 7,
    status: "Active",
    statusText: "Đang cho thuê • Hạn trả còn 2 ngày (29/10)",
    statusBadgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
    dates: "25/10 – 29/10/2025",
    durationText: "Đã bàn giao ngày 25/10 lúc 09:15",
    payoutAmount: 220.0,
    depositAmount: 300.0,
    pickupInfo: RENTAL_ITEMS[1].pickupArea ?? RENTAL_ITEMS[1].location,
  },
  {
    id: "#UL-781102",
    itemTitle: RENTAL_ITEMS[5].title,
    category: "Gia dụng & Làm sạch • Tia Laser Detect",
    itemImage: RENTAL_ITEMS[5].image,
    renterName: SYSTEM_USERS[5].fullName,
    renterAvatar: SYSTEM_USERS[5].avatar,
    renterUniversity: SYSTEM_USERS[5].university,
    renterRating: SYSTEM_USERS[5].rating,
    renterRentalsCount: 5,
    status: "Disputed",
    statusText: "Đang xử lý tranh chấp / Yêu cầu bồi hoàn",
    statusBadgeColor: "bg-rose-100 text-rose-900 border-rose-300",
    dates: "22/10 – 25/10/2025",
    durationText: "Đã trả ngày 26/10 • Khiếu nại từ chủ máy",
    payoutAmount: 66.0,
    depositAmount: 90.0,
    pickupInfo: RENTAL_ITEMS[5].pickupArea ?? RENTAL_ITEMS[5].location,
    disputeCaseId: "#CS-9912",
    disputeNote:
      "Báo cáo thiếu đầu hút khe hẹp trong hộp phụ kiện. Đội hỗ trợ hòa giải UniLend đang xử lý vụ việc #CS-9912.",
  },
];

function OwnerManagementContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "orders" ? "orders" : "equipment";

  const [primaryTab, setPrimaryTab] = useState<"equipment" | "orders">(initialTab);
  const [equipmentFilter, setEquipmentFilter] = useState<"All" | "Available" | "LentOut">("All");
  const [myEquipment, setMyEquipment] = useState<RentalListingItem[]>([]);
  const [orders, setOrders] = useState<OwnerRentalOrder[]>(INITIAL_OWNER_ORDERS);
  const [selectedStatus, setSelectedStatus] = useState<ManagementStatus>("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadEquipment() {
      const deletedIds = new Set(getDeletedListingIds());
      const isDeleted = (item: { id: string; dbId?: number }) => {
        return (
          deletedIds.has(item.id) ||
          (item.dbId !== undefined && deletedIds.has(String(item.dbId)))
        );
      };

      const localCustom = getCustomListings().filter((i) => !isDeleted(i));
      const defaultMine = RENTAL_ITEMS.filter(
        (item) => item.ownerId === user.id && !isDeleted(item)
      );
      const seen = new Set<string>();
      const combined: RentalListingItem[] = [];

      for (const item of localCustom) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          combined.push(item);
        }
      }
      for (const item of defaultMine) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          combined.push(item);
        }
      }

      try {
        const mine = await itemService.listMine();
        if (mine?.content && mine.content.length > 0) {
          mine.content.forEach((dbItem) => {
            const foundIdx = combined.findIndex(
              (c) => c.dbId === dbItem.id || c.id === String(dbItem.id)
            );
            if (foundIdx >= 0) {
              combined[foundIdx] = {
                ...combined[foundIdx],
                title: dbItem.title || combined[foundIdx].title,
                status: dbItem.status,
              };
            } else if (!isDeleted({ id: String(dbItem.id), dbId: dbItem.id })) {
              const mapped = mergeBackendItemsWithCatalog([dbItem]);
              const foundMapped = mapped.find(
                (m) => m.dbId === dbItem.id || m.id === String(dbItem.id)
              );
              if (foundMapped && !seen.has(foundMapped.id)) {
                seen.add(foundMapped.id);
                combined.push(foundMapped);
              }
            }
          });
        }
      } catch {
        // offline fallback
      }

      setMyEquipment(combined);
    }
    loadEquipment();
  }, [user.id, user.email]);

  const handleDeleteEquipment = async (id: string, title: string, dbId?: number) => {
    if (confirm(`Bạn có chắc chắn muốn xóa thiết bị "${title}" khỏi danh mục quản lý không?`)) {
      deleteCustomListing(id, dbId);
      const targetDbId = dbId ?? (Number(id) > 0 ? Number(id) : undefined);
      if (targetDbId) {
        try {
          await itemService.delete(targetDbId);
        } catch {
          // offline fallback
        }
      }
      setMyEquipment((prev) =>
        prev.filter((item) => item.id !== id && (dbId === undefined || item.dbId !== dbId) && String(item.dbId) !== id)
      );
    }
  };

  const filteredEquipment = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return myEquipment.filter((item) => {
      let matchesFilter = true;
      if (equipmentFilter === "Available") matchesFilter = item.status !== "LENT_OUT";
      if (equipmentFilter === "LentOut") matchesFilter = item.status === "LENT_OUT";

      const searchable = `${item.title} ${item.brand || ""} ${item.category} ${item.location || ""}`.toLowerCase();
      const matchesQuery = q.length === 0 || searchable.includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [myEquipment, equipmentFilter, searchQuery]);

  const pendingOrdersCount = useMemo(() => orders.filter((o) => o.status === "Pending").length, [orders]);
  const activeOrdersCount = useMemo(() => orders.filter((o) => o.status === "Active").length, [orders]);
  const returnPendingCount = useMemo(() => orders.filter((o) => o.status === "Return Pending").length, [orders]);
  const availableEquipmentCount = useMemo(() => myEquipment.filter((i) => i.status !== "LENT_OUT").length, [myEquipment]);

  useEffect(() => {
    async function loadIncomingRequests() {
      const localOrders: OwnerRentalOrder[] = getCustomLoanRecords().map((rec) => {
        const matchedCatalog = getRentalItemById(rec.itemId);
        return {
          id: rec.id,
          itemTitle: rec.itemTitle,
          category: rec.category,
          itemImage: rec.itemImage,
          renterName: rec.borrowerName,
          renterAvatar: rec.borrowerAvatar,
          renterUniversity: rec.borrowerUniversity,
          renterRating: rec.borrowerRating ?? getSystemUser({ id: rec.borrowerId }).rating,
          renterRentalsCount: 12,
          status:
            rec.status === "Cancelled"
              ? "Disputed"
              : rec.status,
          statusText:
            rec.status === "Pending"
              ? "Chờ chủ thiết bị phê duyệt"
              : rec.status === "Confirmed"
              ? "Đã xác nhận • Đã lên lịch nhận đồ"
              : rec.status === "Completed"
              ? "Đã hoàn tất • Đã giải tỏa cọc Escrow"
              : "Đang cho thuê thiết bị",
          statusBadgeColor:
            rec.status === "Pending"
              ? "bg-amber-100 text-amber-900 border-amber-300"
              : rec.status === "Confirmed"
              ? "bg-sky-100 text-sky-900 border-sky-300"
              : rec.status === "Completed"
              ? "bg-slate-100 text-slate-800 border-slate-300"
              : "bg-emerald-100 text-emerald-900 border-emerald-300",
          dates: `${rec.borrowFrom} – ${rec.dueDate} (${rec.rentalDays} Ngày)`,
          durationText: `Chủ thiết bị: ${rec.ownerName}`,
          payoutAmount: rec.totalCost,
          depositAmount: rec.depositAmount,
          pickupInfo: rec.pickupLocation || matchedCatalog.location,
          renterNote: rec.note,
          hasReturnEvidence: false,
        };
      });

      try {
        const res = await loanService.listIncoming();
        if (res?.content && res.content.length > 0) {
          const mapped: OwnerRentalOrder[] = res.content.map((loan) => {
            const matchedCatalog = getRentalItemById(String(loan.item?.id ?? 1));
            const borrowerUser = loan.borrower ? getSystemUser(loan.borrower) : SYSTEM_USERS[1];
            return {
              id: `#UL-${loan.id}`,
              itemTitle: loan.item?.title || matchedCatalog.title,
              category: matchedCatalog.categoryLabel ?? matchedCatalog.category,
              itemImage: matchedCatalog.image,
              renterName: loan.borrower?.fullName || borrowerUser.fullName,
              renterAvatar: loan.borrower?.avatarUrl || borrowerUser.avatar,
              renterUniversity: loan.borrower?.university || borrowerUser.university,
              renterRating: borrowerUser.rating,
              renterRentalsCount: 12,
              status:
                loan.status === "PENDING"
                  ? "Pending"
                  : loan.status === "APPROVED"
                  ? "Confirmed"
                  : loan.status === "RETURNED"
                  ? "Completed"
                  : "Active",
              statusText: `Trạng thái DB: ${loan.status}`,
              statusBadgeColor:
                loan.status === "PENDING"
                  ? "bg-amber-100 text-amber-900 border-amber-300"
                  : "bg-sky-100 text-sky-900 border-sky-300",
              dates: `${loan.borrowFrom} – ${loan.dueDate}`,
              durationText: "Đơn thuê đồng bộ SQL",
              payoutAmount: matchedCatalog.pricePerDay * 3,
              depositAmount: matchedCatalog.securityDeposit ?? 150.0,
              pickupInfo: matchedCatalog.location,
              hasReturnEvidence: false,
            };
          });
          const seen = new Set(mapped.map((m) => m.id));
          const uniqueLocal = localOrders.filter((l) => !seen.has(l.id));
          setOrders([...uniqueLocal, ...mapped, ...INITIAL_OWNER_ORDERS]);
          return;
        }
      } catch {
        // Fallback to local + initial synchronized orders
      }
      if (localOrders.length > 0) {
        const seen = new Set(localOrders.map((l) => l.id));
        setOrders([...localOrders, ...INITIAL_OWNER_ORDERS.filter((o) => !seen.has(o.id))]);
      }
    }
    loadIncomingRequests();
  }, []);

  // Modals
  const [inspectionModalOrder, setInspectionModalOrder] = useState<OwnerRentalOrder | null>(null);
  const [opticsCheck, setOpticsCheck] = useState(true);
  const [accessoriesCheck, setAccessoriesCheck] = useState(true);
  const [bodyCheck, setBodyCheck] = useState(true);

  const [messageRenter, setMessageRenter] = useState<OwnerRentalOrder | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  const [lockerPinModalOrder, setLockerPinModalOrder] = useState<OwnerRentalOrder | null>(null);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      let matchesStatus = true;
      if (selectedStatus === "Pending") matchesStatus = order.status === "Pending";
      else if (selectedStatus === "Confirmed") matchesStatus = order.status === "Confirmed";
      else if (selectedStatus === "Active") matchesStatus = order.status === "Active";
      else if (selectedStatus === "Return Pending") matchesStatus = order.status === "Return Pending";
      else if (selectedStatus === "Completed") matchesStatus = order.status === "Completed";
      else if (selectedStatus === "Rejected / Disputed") matchesStatus = order.status === "Disputed";

      const searchable = `${order.itemTitle} ${order.id} ${order.renterName} ${order.category}`.toLowerCase();
      const matchesQuery = q.length === 0 || searchable.includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [orders, selectedStatus, searchQuery]);

  // Actions
  const handleApprove = async (id: string) => {
    const numId = parseInt(id.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(numId) && numId > 0) {
      try {
        await loanService.approve(numId);
      } catch {
        // Offline fallback
      }
    }
    updateCustomLoanStatus(id, "Confirmed");
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status: "Confirmed",
              statusText: "Đã xác nhận • Đã lên lịch nhận đồ",
              statusBadgeColor: "bg-sky-100 text-sky-900 border-sky-300",
              durationText: "Chủ máy vừa phê duyệt",
            }
          : o
      )
    );
  };

  const handleDecline = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn từ chối yêu cầu thuê này không?")) {
      const numId = parseInt(id.replace(/[^0-9]/g, ""), 10);
      if (!isNaN(numId) && numId > 0) {
        try {
          await loanService.reject(numId);
        } catch {
          // Offline fallback
        }
      }
      updateCustomLoanStatus(id, "Cancelled");
      setOrders((prev) => prev.filter((o) => o.id !== id));
    }
  };

  const handleConfirmInspection = async () => {
    if (!inspectionModalOrder) return;
    const numId = parseInt(inspectionModalOrder.id.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(numId) && numId > 0) {
      try {
        await loanService.markReturned(numId);
      } catch {
        // Offline fallback
      }
    }
    updateCustomLoanStatus(inspectionModalOrder.id, "Completed");
    setOrders((prev) =>
      prev.map((o) =>
        o.id === inspectionModalOrder.id
          ? {
              ...o,
              status: "Completed",
              statusText: "Đã hoàn tất • Đã giải tỏa cọc Escrow",
              statusBadgeColor: "bg-slate-100 text-slate-800 border-slate-300",
              durationText: "Đã nghiệm thu xong • Giải tỏa $150.00",
            }
          : o
      )
    );
    setInspectionModalOrder(null);
  };

  return (
    <div className="bg-[#fafafd] text-on-surface font-sans antialiased min-h-screen flex flex-col selection:bg-rose-100 selection:text-black">
      {/* Synchronized Header */}
      <AppHeader />

      {/* Main Workspace Canvas */}
      <main className="relative z-10 flex-1 w-full max-w-[1360px] mx-auto px-6 lg:px-12 py-8 space-y-8">
        {/* Breadcrumbs & Quick Ledger Status */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-body-sm text-on-surface-variant">
            <Link className="hover:text-primary transition-colors" href="/">
              Trang chủ
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface-variant font-medium">Cổng Chủ Thiết Bị</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-semibold">Quản lý cho thuê</span>
          </nav>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-outline-variant/40 rounded-full text-label-md text-on-surface shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Quỹ Escrow Đang Bảo Vệ</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-outline-variant/40 rounded-full text-label-md text-on-surface shadow-xs">
              <span className="material-symbols-outlined text-[15px] text-secondary">security</span>
              <span>Bảo hiểm Chủ thiết bị $100,000</span>
            </div>
          </div>
        </div>

        {/* Page Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
          <div>
            <h1 className="text-3xl sm:text-headline-lg font-semibold text-primary tracking-tight">
              Quản Lý Cho Thuê Thiết Bị
            </h1>
            <p className="text-body-lg text-on-surface-variant mt-1.5 max-w-2xl font-normal">
              Phê duyệt yêu cầu mượn đồ từ sinh viên, cấp mã PIN Smart Locker, kiểm tra thiết bị hoàn trả và quản lý doanh thu đồng bộ MySQL.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/create-listing"
              className="btn-unilend-cta h-10 px-4 rounded-lg text-sm font-semibold transition-all duration-200 shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>+ Đăng thiết bị</span>
            </Link>
            <button
              type="button"
              onClick={() => alert("Đã xuất báo cáo sổ cái giao dịch dạng CSV.")}
              className="h-10 px-4 rounded-lg bg-white hover:bg-neutral-50 border border-outline-variant/60 text-primary text-label-lg font-semibold transition-all duration-200 shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Xuất sổ cái</span>
            </button>
            <button
              type="button"
              onClick={() => alert("Sẵn sàng quét mã QR / thẻ xác thực từ người thuê.")}
              className="h-10 px-4 rounded-lg bg-white hover:bg-neutral-50 border border-outline-variant/60 text-primary text-label-lg font-semibold transition-all duration-200 shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
              <span>Quét mã nhận</span>
            </button>
          </div>
        </div>

        {/* Top Metric Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Metric 1 */}
          <div
            onClick={() => setPrimaryTab("equipment")}
            className={`cursor-pointer bg-white/95 backdrop-blur-md border rounded-2xl p-5 shadow-xs transition-all ${
              primaryTab === "equipment"
                ? "border-primary ring-2 ring-primary/10"
                : "border-outline-variant/40 hover:border-outline-variant/80"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
                Kho thiết bị của tôi
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-700">
                <span className="material-symbols-outlined text-[20px]">inventory_2</span>
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">{myEquipment.length}</span>
              <span className="text-xs text-purple-800 bg-purple-100/70 px-2 py-0.5 rounded-full font-semibold">
                {availableEquipmentCount} sẵn sàng
              </span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-body-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
              <span>Đang niêm yết trên Chợ UniLend</span>
            </div>
          </div>

          {/* Metric 2 */}
          <div
            onClick={() => {
              setPrimaryTab("orders");
              setSelectedStatus("Pending");
            }}
            className={`cursor-pointer bg-white/95 backdrop-blur-md border rounded-2xl p-5 shadow-xs transition-all ${
              primaryTab === "orders" && selectedStatus === "Pending"
                ? "border-primary ring-2 ring-primary/10"
                : "border-outline-variant/40 hover:border-outline-variant/80"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
                Yêu cầu chờ duyệt
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700">
                <span className="material-symbols-outlined text-[20px]">notifications_active</span>
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">{pendingOrdersCount}</span>
              <span className="text-xs text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full font-semibold">
                Cần xử lý ngay
              </span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-body-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-outline">timelapse</span>
              <span>Thời gian phản hồi ~18 phút</span>
            </div>
          </div>

          {/* Metric 3 */}
          <div
            onClick={() => {
              setPrimaryTab("orders");
              setSelectedStatus("Active");
            }}
            className={`cursor-pointer bg-white/95 backdrop-blur-md border rounded-2xl p-5 shadow-xs transition-all ${
              primaryTab === "orders" && selectedStatus === "Active"
                ? "border-primary ring-2 ring-primary/10"
                : "border-outline-variant/40 hover:border-outline-variant/80"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
                Đang cho thuê
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700">
                <span className="material-symbols-outlined text-[20px]">swap_horizontal_circle</span>
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">{activeOrdersCount}</span>
              <span className="text-xs text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full font-semibold">
                Đang được sử dụng
              </span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-body-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-outline">verified_user</span>
              <span>Tỷ lệ hoàn trả đúng hạn 100%</span>
            </div>
          </div>

          {/* Metric 4 */}
          <div
            onClick={() => {
              setPrimaryTab("orders");
              setSelectedStatus("Return Pending");
            }}
            className={`cursor-pointer bg-white/95 backdrop-blur-md border rounded-2xl p-5 shadow-xs transition-all ${
              primaryTab === "orders" && selectedStatus === "Return Pending"
                ? "border-primary ring-2 ring-primary/10"
                : "border-outline-variant/40 hover:border-outline-variant/80"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
                Chờ kiểm tra hoàn trả
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-700">
                <span className="material-symbols-outlined text-[20px]">fact_check</span>
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">{returnPendingCount}</span>
              <span className="text-xs text-purple-800 bg-purple-100/70 px-2 py-0.5 rounded-full font-semibold">
                Cần nghiệm thu
              </span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-body-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-outline">lock_clock</span>
              <span>Quỹ Escrow bảo vệ an toàn</span>
            </div>
          </div>
        </section>

        {/* Primary Workspace Navigation Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/30 pb-0">
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={() => {
                setPrimaryTab("equipment");
                setSearchQuery("");
              }}
              className={`pb-3.5 px-1 text-sm sm:text-base font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                primaryTab === "equipment"
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">inventory_2</span>
              <span>Thiết bị cho thuê của tôi</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                {myEquipment.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPrimaryTab("orders");
                setSearchQuery("");
              }}
              className={`pb-3.5 px-1 text-sm sm:text-base font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                primaryTab === "orders"
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
              <span>Yêu cầu &amp; Đơn thuê</span>
              {pendingOrdersCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 animate-pulse">
                  {pendingOrdersCount} chờ duyệt
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700">
                  {orders.length}
                </span>
              )}
            </button>
          </div>

          <Link
            href="/create-listing"
            className="btn-unilend-cta mb-2 hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>+ Đăng thiết bị mới</span>
          </Link>
        </div>

        {primaryTab === "equipment" ? (
          /* TAB 1: KHO THIẾT BỊ CỦA TÔI */
          <div className="space-y-6">
            {/* Equipment Filter & Search Bar */}
            <div className="bg-white/95 backdrop-blur-md border border-outline-variant/40 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                {(
                  [
                    { key: "All", label: "Tất cả thiết bị", count: myEquipment.length },
                    { key: "Available", label: "Sẵn sàng cho thuê", count: availableEquipmentCount },
                    { key: "LentOut", label: "Đang cho mượn", count: myEquipment.length - availableEquipmentCount },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setEquipmentFilter(tab.key)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                      equipmentFilter === tab.key
                        ? "bg-primary text-white"
                        : "bg-neutral-100 text-on-surface-variant hover:text-primary"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="opacity-80">({tab.count})</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-72">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                    search
                  </span>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo tên máy, hãng, trạm..."
                    className="w-full h-9 pl-9 pr-3 text-xs bg-neutral-50 border border-outline-variant/50 rounded-lg outline-none focus:border-primary focus:bg-white transition-all"
                  />
                </div>
                <Link
                  href="/create-listing"
                  className="btn-unilend-cta h-9 px-3 rounded-lg text-xs font-bold shrink-0 flex sm:hidden items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Đăng đồ</span>
                </Link>
              </div>
            </div>

            {/* Equipment Grid */}
            {filteredEquipment.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-outline-variant/60 shadow-xs">
                <span className="material-symbols-outlined text-4xl text-outline mb-2">inventory_2</span>
                <h3 className="text-base font-bold text-on-surface">Không tìm thấy thiết bị nào trong kho</h3>
                <p className="text-xs text-outline mt-1 mb-5 max-w-sm mx-auto">
                  Hãy đăng các thiết bị điện tử, máy ảnh hoặc đồ dùng bạn có để tạo thêm thu nhập bền vững!
                </p>
                <Link
                  href="/create-listing"
                  className="btn-unilend-cta inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Đăng thiết bị ngay</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEquipment.map((item) => {
                  const isCustom = item.id.startsWith("custom-") || (item.dbId !== undefined && item.dbId > 16);
                  const isLent = item.status === "LENT_OUT";
                  const itemPendingOrders = orders.filter(
                    (o) =>
                      o.status === "Pending" &&
                      (o.itemTitle.toLowerCase().includes(item.title.toLowerCase()) ||
                        item.title.toLowerCase().includes(o.itemTitle.toLowerCase()))
                  );

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300 group"
                    >
                      <div>
                        {/* Cover Image */}
                        <div className="relative h-52 w-full overflow-hidden bg-neutral-100">
                          <img
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            src={item.image}
                          />
                          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md text-white shadow-xs ${
                                isLent ? "bg-blue-600/90" : "bg-emerald-600/90"
                              }`}
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {isLent ? "swap_calls" : "check_circle"}
                              </span>
                              <span>{isLent ? "Đang cho mượn" : "Sẵn sàng cho thuê"}</span>
                            </span>
                            {itemPendingOrders.length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPrimaryTab("orders");
                                  setSelectedStatus("Pending");
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-xs animate-bounce"
                              >
                                <span className="material-symbols-outlined text-[13px]">notifications</span>
                                <span>{itemPendingOrders.length} Yêu cầu thuê mới!</span>
                              </button>
                            )}
                          </div>
                          <div className="absolute top-3 right-3">
                            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide uppercase">
                              {item.conditionScore || item.condition}
                            </span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-6 space-y-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-base font-bold text-on-surface tracking-tight group-hover:text-secondary transition-colors line-clamp-1">
                                {item.title}
                              </h3>
                              <p className="text-xs text-outline mt-0.5 line-clamp-1">
                                {item.brand && item.brand !== "UniLend Verified" ? `${item.brand} • ` : ""}
                                {item.categoryLabel || item.category}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="text-base font-bold text-primary">${item.pricePerDay}</span>
                              <span className="block text-[11px] text-outline">/ ngày</span>
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl bg-neutral-50 border border-outline-variant/30 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-outline font-semibold">Trạm giao nhận</span>
                              <span className="font-semibold text-on-surface truncate max-w-[180px]">
                                {item.pickupArea || item.location}
                              </span>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20">
                              <span className="text-outline font-semibold">Cọc bảo đảm</span>
                              <span className="font-semibold text-emerald-700">${item.securityDeposit}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-6 pt-0 flex flex-wrap items-center gap-2">
                        <Link
                          href={`/items/${item.id}`}
                          className="flex-1 py-2 px-3 rounded-lg bg-primary text-white font-semibold text-xs hover:bg-neutral-800 transition-all text-center cursor-pointer whitespace-nowrap flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                          <span>Xem trên Chợ</span>
                        </Link>
                        <Link
                          href="/create-listing"
                          className="py-2 px-3 rounded-lg border border-outline-variant/50 text-on-surface font-semibold text-xs hover:bg-neutral-50 transition-colors text-center whitespace-nowrap cursor-pointer flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[15px]">edit</span>
                          <span>Sửa</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteEquipment(item.id, item.title, item.dbId)}
                          title="Xóa thiết bị"
                          className="py-2 px-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* TAB 2: YÊU CẦU & ĐƠN THUÊ */
          <div className="space-y-6">
            {/* Filter Controls Bar */}
            <section className="bg-white/95 backdrop-blur-md border border-outline-variant/40 rounded-2xl p-4 space-y-4 shadow-xs">
              {/* Status Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-outline-variant/30 scrollbar-none text-label-lg font-medium">
                {(
                  [
                    { key: "All", label: "Tất cả" },
                    { key: "Pending", label: "Chờ duyệt" },
                    { key: "Confirmed", label: "Đã xác nhận" },
                    { key: "Active", label: "Đang cho thuê" },
                    { key: "Return Pending", label: "Chờ kiểm tra trả" },
                    { key: "Completed", label: "Hoàn tất" },
                    { key: "Rejected / Disputed", label: "Từ chối / Khiếu nại" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setSelectedStatus(tab.key as ManagementStatus)}
                    className={`px-3.5 py-2 rounded-lg flex items-center gap-2 shrink-0 transition-colors cursor-pointer ${
                      selectedStatus === tab.key
                        ? "bg-primary text-white font-semibold"
                        : "hover:bg-neutral-100 text-on-surface-variant hover:text-primary"
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Search & Filters */}
              <div className="flex flex-col lg:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                    search
                  </span>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 bg-white border border-outline-variant/60 rounded-xl text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="Tìm theo tên thiết bị, mã đơn (#UL-849204), hoặc tên người thuê..."
                    type="text"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedStatus("All");
                  }}
                  className="h-11 px-4 rounded-xl bg-white border border-outline-variant/60 text-sm font-semibold hover:bg-neutral-50 transition-colors flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-base">refresh</span>
                  <span>Đặt lại</span>
                </button>
              </div>
            </section>

            {/* Rental Cards Pipeline */}
            <section className="space-y-6">
              {filteredOrders.map((order) => {
                const isReturnPending = order.status === "Return Pending";
                const isPending = order.status === "Pending";
                const isConfirmed = order.status === "Confirmed";
                const isActive = order.status === "Active";
                const isDisputed = order.status === "Disputed";

                return (
                  <article
                    key={order.id}
                    className={`bg-white/95 backdrop-blur-md rounded-2xl p-6 lg:p-7 shadow-xs transition-all duration-200 border ${
                      isReturnPending
                        ? "border-purple-300 ring-1 ring-purple-200"
                        : isDisputed
                        ? "border-rose-300 bg-rose-50/20"
                        : "border-outline-variant/40 hover:border-outline-variant"
                    }`}
                  >
                    {/* Header ribbon */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-outline-variant/30">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${order.statusBadgeColor}`}
                        >
                          <span className="w-2 h-2 rounded-full bg-current" />
                          {order.statusText}
                        </span>
                        <span className="text-body-sm text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-secondary">
                            location_on
                          </span>
                          {order.pickupInfo}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-body-sm text-on-surface-variant">
                        <span className="font-mono text-outline font-medium">{order.id}</span>
                      </div>
                    </div>

                    {/* Card Body Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 items-start">
                      {/* Equipment Info (4 cols) */}
                      <div className="lg:col-span-4 flex gap-4">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-surface-container border border-outline-variant/40 shrink-0 overflow-hidden relative">
                          <img
                            alt={order.itemTitle}
                            className="w-full h-full object-cover"
                            src={order.itemImage}
                          />
                        </div>
                        <div className="flex flex-col justify-center space-y-1">
                          <span className="text-xs text-secondary uppercase font-bold tracking-wider">
                            {order.category}
                          </span>
                          <h3 className="font-bold text-title-lg text-primary leading-tight">
                            {order.itemTitle}
                          </h3>
                          <p className="text-xs text-on-surface-variant font-mono">
                            Mã đơn {order.id}
                          </p>
                        </div>
                      </div>

                      {/* Renter & Custody Window (4 cols) */}
                      <div className="lg:col-span-4 space-y-3.5 border-t lg:border-t-0 lg:border-l lg:border-r border-outline-variant/30 lg:px-6 pt-4 lg:pt-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              alt={order.renterName}
                              className="w-10 h-10 rounded-full object-cover border border-outline-variant/50"
                              src={order.renterAvatar}
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-body-md text-primary">
                                  {order.renterName}
                                </span>
                                <span className="material-symbols-outlined text-emerald-600 text-[16px] fill-icon">
                                  verified
                                </span>
                              </div>
                              <p className="text-xs text-outline">{order.renterUniversity || "ĐH Quốc Gia TP.HCM"}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="inline-flex items-center gap-1 text-label-md font-bold text-amber-600">
                              <span className="material-symbols-outlined text-[15px] fill-icon">
                                star
                              </span>
                              <span>{order.renterRating.toFixed(1)}</span>
                            </div>
                            <span className="block text-[11px] text-outline">
                              ({order.renterRentalsCount} lần thuê)
                            </span>
                          </div>
                        </div>

                        <div className="p-3 bg-neutral-50 rounded-xl border border-outline-variant/30 space-y-1.5">
                          <div className="flex items-center justify-between text-body-sm">
                            <span className="text-outline">Thời gian thuê:</span>
                            <span className="font-semibold text-primary">{order.dates}</span>
                          </div>
                          <div className="flex items-center justify-between text-body-sm">
                            <span className="text-outline">Trạng thái:</span>
                            <span className="font-medium text-on-surface-variant">
                              {order.durationText}
                            </span>
                          </div>
                        </div>

                        {order.renterNote && (
                          <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/50 text-xs text-amber-900 flex items-start gap-2">
                            <span className="material-symbols-outlined text-[16px] text-amber-700 mt-0.5">
                              chat_bubble
                            </span>
                            <p className="line-clamp-2">“{order.renterNote}”</p>
                          </div>
                        )}
                      </div>

                      {/* Financials & Owner Action Terminal (4 cols) */}
                      <div className="lg:col-span-4 flex flex-col justify-between h-full space-y-4 border-t lg:border-t-0 border-outline-variant/30 pt-4 lg:pt-0">
                        <div className="bg-neutral-50 p-3.5 rounded-xl border border-outline-variant/30 space-y-2">
                          <div className="flex justify-between items-center text-body-sm">
                            <span className="text-outline">Thu nhập cho thuê:</span>
                            <span className="font-bold text-emerald-700 text-body-lg">
                              ${order.payoutAmount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-on-surface-variant pt-1 border-t border-outline-variant/20">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px] text-secondary">
                                lock
                              </span>
                              Cọc bảo đảm (Escrow):
                            </span>
                            <span className="font-semibold font-mono text-primary">
                              ${order.depositAmount.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons based on Status */}
                        <div className="space-y-2 pt-1">
                          {isReturnPending && (
                            <button
                              type="button"
                              onClick={() => {
                                setInspectionModalOrder(order);
                                setOpticsCheck(true);
                                setAccessoriesCheck(true);
                                setBodyCheck(true);
                              }}
                              className="w-full h-11 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-body-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">verified</span>
                              <span>Nghiệm thu thiết bị &amp; Hoàn cọc</span>
                            </button>
                          )}

                          {isPending && (
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => handleApprove(order.id)}
                                className="h-11 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-body-sm transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[18px]">check</span>
                                <span>Phê duyệt</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDecline(order.id)}
                                className="h-11 px-3 rounded-xl bg-white hover:bg-rose-50 border border-rose-300 text-rose-700 font-semibold text-body-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                                <span>Từ chối</span>
                              </button>
                            </div>
                          )}

                          {isConfirmed && (
                            <>
                              <button
                                type="button"
                                onClick={() => setLockerPinModalOrder(order)}
                                className="w-full h-11 px-4 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-semibold text-body-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[18px]">key</span>
                                <span>Cấp mã Smart Locker</span>
                              </button>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMessageRenter(order);
                                    setMessageSent(false);
                                  }}
                                  className="h-10 px-3 rounded-xl bg-white hover:bg-neutral-100 border border-outline-variant/60 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[16px]">chat</span>
                                  <span>Nhắn tin</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => alert(`Ngăn tủ Smart Locker: #A-08 tại Trạm Trung tâm Campus`)}
                                  className="h-10 px-3 rounded-xl bg-white hover:bg-neutral-100 border border-outline-variant/60 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[16px]">pin_drop</span>
                                  <span>Địa điểm</span>
                                </button>
                              </div>
                            </>
                          )}

                          {isActive && (
                            <>
                              <button
                                type="button"
                                onClick={() => alert(`Đang xem dữ liệu hành trình của đơn ${order.id}.`)}
                                className="w-full h-11 px-4 rounded-xl bg-white hover:bg-neutral-100 border border-outline-variant/60 text-primary font-semibold text-body-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                                <span>Xem chi tiết đơn thuê</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setMessageRenter(order);
                                  setMessageSent(false);
                                }}
                                className="w-full h-10 px-4 rounded-xl bg-white hover:bg-neutral-100 border border-outline-variant/60 text-on-surface font-semibold text-body-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[18px]">forum</span>
                                <span>Liên hệ người thuê</span>
                              </button>
                            </>
                          )}

                          {isDisputed && (
                            <button
                              type="button"
                              onClick={() => alert(`Vụ việc ${order.disputeCaseId}: Ban kiểm định đang xử lý hòa giải.`)}
                              className="w-full h-11 px-4 rounded-xl bg-primary hover:bg-neutral-800 text-white font-semibold text-body-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">gavel</span>
                              <span>Xem hồ sơ tranh chấp</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          </div>
        )}
      </main>

      {/* Inspection Modal */}
      {inspectionModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-black/10 animate-fadeIn space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-900">
                  Nghiệm thu hoàn trả &amp; Giải tỏa cọc Escrow
                </span>
                <h3 className="text-title-lg font-bold text-primary mt-1">
                  Danh sách kiểm tra tình trạng thiết bị
                </h3>
                <p className="text-xs text-outline">
                  {inspectionModalOrder.id} • {inspectionModalOrder.itemTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectionModalOrder(null)}
                className="text-outline hover:text-black cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 bg-neutral-50 p-4 rounded-xl border border-outline-variant/30 text-body-sm">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={opticsCheck}
                  onChange={(e) => setOpticsCheck(e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary rounded border-outline-variant"
                />
                <div>
                  <span className="font-semibold text-primary block">Tình trạng quang học &amp; Cảm biến</span>
                  <span className="text-xs text-on-surface-variant">Kính cảm biến sạch sẽ, không trầy xước, ngàm kết nối hoạt động tốt.</span>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-outline-variant/20">
                <input
                  type="checkbox"
                  checked={accessoriesCheck}
                  onChange={(e) => setAccessoriesCheck(e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary rounded border-outline-variant"
                />
                <div>
                  <span className="font-semibold text-primary block">Kiểm tra đầy đủ phụ kiện</span>
                  <span className="text-xs text-on-surface-variant">2 pin Sony chính hãng, dock sạc, dây đeo và hộp chống sốc Pelican.</span>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-outline-variant/20">
                <input
                  type="checkbox"
                  checked={bodyCheck}
                  onChange={(e) => setBodyCheck(e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary rounded border-outline-variant"
                />
                <div>
                  <span className="font-semibold text-primary block">Ngoại quan thân máy</span>
                  <span className="text-xs text-on-surface-variant">Đúng với hiện trạng ban đầu (Độ mới 9.8/10). Không cấn móp hoặc dính ẩm.</span>
                </div>
              </label>
            </div>

            <div className="bg-neutral-50 rounded-xl p-4 border border-outline-variant/30 space-y-2 text-body-sm">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Giải tỏa cọc ngay lập tức cho {inspectionModalOrder.renterName}:</span>
                <span className="font-bold text-primary">${inspectionModalOrder.depositAmount.toFixed(2)} USD</span>
              </div>
              <div className="flex items-center justify-between font-semibold text-emerald-800">
                <span>Thu nhập chuyển về tài khoản của bạn:</span>
                <span className="font-bold text-title-md">${inspectionModalOrder.payoutAmount.toFixed(2)} USD</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setInspectionModalOrder(null)}
                className="px-4 py-2 rounded-lg border border-outline-variant/60 text-sm font-semibold hover:bg-neutral-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmInspection}
                className="px-5 py-2 rounded-lg bg-black text-white text-sm font-bold shadow-md hover:bg-neutral-800 cursor-pointer"
              >
                Xác nhận &amp; Giải tỏa cọc Escrow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Locker PIN Modal */}
      {lockerPinModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-black/10 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <h4 className="font-bold text-primary">Mã Mở Tủ Smart Locker</h4>
              <button
                type="button"
                onClick={() => setLockerPinModalOrder(null)}
                className="text-outline hover:text-black cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="text-center py-3 space-y-2">
              <span className="text-xs text-outline uppercase font-semibold">Mã xác thực bàn giao 1 lần</span>
              <div className="text-3xl font-mono font-bold tracking-widest text-primary bg-neutral-100 py-3 rounded-xl border border-outline-variant/40">
                849-204
              </div>
              <p className="text-xs text-on-surface-variant">
                Tủ #A-08 tại Trạm Smart Locker Campus. Người mượn {lockerPinModalOrder.renterName} cũng sẽ nhận được mã mở này đồng thời.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                alert("Đã gửi mã PIN tủ Smart Locker tới người mượn.");
                setLockerPinModalOrder(null);
              }}
              className="w-full py-2.5 rounded-lg bg-black text-white text-sm font-semibold hover:bg-neutral-800 cursor-pointer"
            >
              Xác nhận gửi mã PIN
            </button>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {messageRenter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-black/10 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <img
                  alt={messageRenter.renterName}
                  className="w-10 h-10 rounded-full object-cover"
                  src={messageRenter.renterAvatar}
                />
                <div>
                  <h4 className="font-bold text-primary">Nhắn tin cho {messageRenter.renterName}</h4>
                  <p className="text-xs text-outline">{messageRenter.id} • {messageRenter.itemTitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMessageRenter(null);
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
                  ✓ Tin nhắn đã được gửi! {messageRenter.renterName} sẽ nhận được thông báo.
                </div>
              ) : (
                <>
                  <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-2">
                    Nội dung tin nhắn gửi người thuê
                  </label>
                  <textarea
                    rows={4}
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder={`Chào ${messageRenter.renterName}, mình muốn trao đổi về thông tin nhận thiết bị...`}
                    className="w-full p-3 rounded-xl border border-outline-variant text-sm focus:border-black focus:ring-1 focus:ring-black"
                  />
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setMessageRenter(null);
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
                    if (messageContent.trim()) {
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
          <div className="flex flex-wrap items-center justify-center gap-6 text-label-md">
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="/#terms">
              Điều khoản dịch vụ
            </Link>
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="/#privacy">
              Chính sách bảo mật
            </Link>
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="/#guarantee">
              Bảo hiểm chủ thiết bị
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

export default function OwnerRentalManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fafafd]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <OwnerManagementContent />
    </Suspense>
  );
}
