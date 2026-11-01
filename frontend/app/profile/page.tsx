"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth-context";
import { AppHeader } from "../app-header";
import { itemService } from "../../lib/api/itemService";
import {
  RENTAL_ITEMS,
  SYSTEM_USERS,
  getCustomListings,
  getCustomLoanRecords,
  getDeletedListingIds,
  mergeBackendItemsWithCatalog,
  deleteCustomListing,
  type RentalListingItem,
  type CustomLoanRecord,
} from "../rental-catalog";

type ManagementTab = "rentals" | "listings" | "history" | "favorites" | "reviews";

export default function ProfileDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ManagementTab>("rentals");
  const [filterTag, setFilterTag] = useState("all");
  const [myListings, setMyListings] = useState<RentalListingItem[]>([]);
  const [customLoans, setCustomLoans] = useState<CustomLoanRecord[]>([]);

  useEffect(() => {
    async function loadData() {
      setCustomLoans(getCustomLoanRecords());
      const deletedIds = new Set(getDeletedListingIds());
      const isDeleted = (item: { id: string; dbId?: number }) => {
        return (
          deletedIds.has(item.id) ||
          (item.dbId !== undefined && deletedIds.has(String(item.dbId)))
        );
      };

      const userCustom = getCustomListings().filter(
        (item) => (item.ownerId === user.id || item.ownerEmail === user.email) && !isDeleted(item)
      );
      const defaultMine = RENTAL_ITEMS.filter(
        (item) => item.ownerId === user.id && !isDeleted(item)
      );

      const seen = new Set<string>();
      const combined: RentalListingItem[] = [];
      for (const item of [...userCustom, ...defaultMine]) {
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

      setMyListings(combined);
    }
    loadData();
  }, [user.id, user.email]);

  const activeRentals = useMemo(() => {
    return customLoans.filter(
      (loan) =>
        loan.borrowerId === user.id &&
        loan.status !== "Completed" &&
        loan.status !== "Cancelled"
    );
  }, [customLoans, user.id]);

  const historyRentals = useMemo(() => {
    return customLoans.filter(
      (loan) =>
        loan.borrowerId === user.id &&
        (loan.status === "Completed" || loan.status === "Cancelled")
    );
  }, [customLoans, user.id]);

  const handleDeleteListing = async (id: string, title: string, dbId?: number) => {
    if (confirm(`Bạn có chắc chắn muốn xóa tin đăng "${title}"?`)) {
      deleteCustomListing(id, dbId);
      const targetDbId = dbId ?? (Number(id) > 0 ? Number(id) : undefined);
      if (targetDbId) {
        try {
          await itemService.delete(targetDbId);
        } catch {
          // offline fallback
        }
      }
      setMyListings((prev) =>
        prev.filter((item) => item.id !== id && (dbId === undefined || item.dbId !== dbId) && String(item.dbId) !== id)
      );
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col relative selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* Soft Ambient Background Glows matching Stitch Design */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[18%] -left-[10%] w-[58vw] h-[58vw] rounded-full blur-[120px] opacity-70 bg-gradient-to-br from-[#FEF2F6] via-[#F8EDF9] to-transparent" />
        <div className="absolute top-[28%] -right-[12%] w-[50vw] h-[50vw] rounded-full blur-[140px] opacity-60 bg-gradient-to-bl from-[#F2EDFF] via-[#EBF3FF] to-transparent" />
        <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] rounded-full blur-[130px] opacity-50 bg-gradient-to-t from-[#FEF0F4] to-transparent" />
      </div>

      {/* Synchronized Header */}
      <AppHeader />

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
                    title="Đã xác thực danh tính Campus"
                  >
                    <span className="material-symbols-outlined text-[16px] fill-icon">verified</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-semibold text-on-surface tracking-tight">
                    {user.fullName}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                    <span className="material-symbols-outlined text-[14px]">shield</span>
                    Thành viên sinh viên
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-outline">
                  <span className="font-medium text-on-surface">{user.email}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-on-surface-variant font-medium">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    Đang trực tuyến
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/40 text-xs font-semibold text-on-surface">
                    <span className="material-symbols-outlined text-[14px] text-secondary">school</span>
                    {user.university}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold">
                    <span className="material-symbols-outlined text-[14px] text-amber-600 fill-icon">star</span>
                    {user.rating.toFixed(1)} ({user.reviews} đánh giá cộng đồng)
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/30 text-xs font-semibold text-outline">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    Thành viên từ 2025
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:self-center">
              <Link
                href="/create-listing"
                className="btn-unilend-cta-soft inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>+ Đăng thiết bị</span>
              </Link>
              <button
                type="button"
                className="btn-unilend-cta inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg font-semibold text-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                <span>Chỉnh sửa hồ sơ</span>
              </button>
            </div>
          </div>
        </section>

        {/* 2. Overview Statistics Bar */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-6 border border-outline-variant/30 hover:border-outline-variant/60 transition-all shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider font-semibold text-outline">Đơn Đang Thuê</span>
              <span className="p-2 rounded-lg bg-surface-container-low text-on-surface">
                <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold text-on-surface">{user.activeRentalsCount}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                  Đúng tiến độ
                </span>
              </div>
              <p className="text-xs text-outline">{user.activeRentalTitle} · {user.activeRentalDue}</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-6 border border-outline-variant/30 hover:border-outline-variant/60 transition-all shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider font-semibold text-outline">Thiết Bị Chia Sẻ</span>
              <span className="p-2 rounded-lg bg-surface-container-low text-on-surface">
                <span className="material-symbols-outlined text-[18px]">inventory_2</span>
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold text-on-surface">5</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed border border-secondary/20 text-xs font-semibold">
                  +1 Yêu cầu đang chờ
                </span>
              </div>
              <p className="text-xs text-outline">5 thiết bị đang hoạt động cho thuê</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-6 border border-outline-variant/30 hover:border-outline-variant/60 transition-all shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider font-semibold text-outline">Giao Dịch Hoàn Tất</span>
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
              <p className="text-xs text-outline">Lịch sử bàn giao an toàn tuyệt đối</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-6 border border-outline-variant/30 hover:border-outline-variant/60 transition-all shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider font-semibold text-outline">Độ Uy Tín Campus</span>
              <span className="p-2 rounded-lg bg-surface-container-low text-on-surface">
                <span className="material-symbols-outlined text-[18px]">security</span>
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold text-on-surface">100%</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                  Đã xác thực
                </span>
              </div>
              <p className="text-xs text-outline">Không tranh chấp, giữ cọc Escrow an toàn</p>
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
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "rentals"
                    ? "bg-primary text-on-primary shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span>Đơn đang thuê</span>
                <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-[11px]">
                  {activeRentals.length > 0 ? activeRentals.length : 1}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("listings")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "listings"
                    ? "bg-primary text-on-primary shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span>Tin đăng của tôi</span>
                <span className="px-1.5 py-0.5 bg-surface-container-high rounded-full text-[11px]">
                  {myListings.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "history"
                    ? "bg-primary text-on-primary shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span>Lịch sử thuê</span>
                <span className="px-1.5 py-0.5 bg-surface-container-high rounded-full text-[11px]">
                  {historyRentals.length > 0 ? historyRentals.length : 23}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("reviews")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "reviews"
                    ? "bg-primary text-on-primary shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span>Đánh giá</span>
                <span className="px-1.5 py-0.5 bg-surface-container-high rounded-full text-[11px]">18</span>
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs font-semibold text-outline hidden sm:inline">Bộ lọc:</span>
              {["all", "urgent", "electronics"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setFilterTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-colors cursor-pointer ${
                    filterTag === tag
                      ? "bg-on-surface text-surface-container-lowest"
                      : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  {tag === "all" ? "Tất cả" : tag === "urgent" ? "Sắp đến hạn" : "Thiết bị điện tử"}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          {activeTab === "listings" ? (
            myListings.length === 0 ? (
              <div className="py-16 text-center bg-surface-container-low/50 rounded-2xl border border-dashed border-outline-variant/60">
                <span className="material-symbols-outlined text-4xl text-outline mb-2">inventory_2</span>
                <h3 className="text-base font-bold text-on-surface">Bạn chưa đăng thiết bị nào</h3>
                <p className="text-xs text-outline mt-1 mb-5 max-w-sm mx-auto">
                  Hãy đăng các thiết bị điện tử, máy ảnh hoặc đồ dùng bạn có để tạo thêm thu nhập bền vững!
                </p>
                <Link
                  href="/create-listing"
                  className="btn-unilend-cta inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Đăng thiết bị ngay</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myListings.map((item) => {
                  const isCustom = item.id.startsWith("custom-") || (item.dbId !== undefined && item.dbId > 16);
                  return (
                    <div
                      key={item.id}
                      className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300 group"
                    >
                      <div>
                        <div className="relative h-52 w-full overflow-hidden bg-surface-container-low">
                          <img
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            src={item.image}
                          />
                          <div className="absolute top-3 left-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-xs font-semibold shadow-xs">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                              {item.status === "LENT_OUT" ? "Đang cho mượn" : "Sẵn sàng cho thuê"}
                            </span>
                          </div>
                          <div className="absolute top-3 right-3 flex items-center gap-1">
                            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide uppercase">
                              Tin của bạn
                            </span>
                          </div>
                        </div>

                        <div className="p-6 space-y-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-base font-bold text-on-surface tracking-tight group-hover:text-secondary transition-colors line-clamp-1">
                                {item.title}
                              </h3>
                              <p className="text-xs text-outline mt-0.5 line-clamp-1">
                                {item.categoryLabel || item.category} · {item.conditionScore || item.condition}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="text-base font-bold text-on-surface">${item.pricePerDay}</span>
                              <span className="block text-[11px] text-outline">/ ngày</span>
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl bg-surface-container-low/80 border border-outline-variant/30 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-outline font-semibold">Địa điểm bàn giao</span>
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

                      <div className="p-6 pt-0 flex flex-wrap items-center gap-2">
                        <Link
                          href={`/items/${item.id}`}
                          className="flex-1 py-2 px-3 rounded-lg bg-primary text-on-primary font-semibold text-xs hover:bg-slate-800 transition-all text-center cursor-pointer whitespace-nowrap"
                        >
                          Xem tin trên Chợ
                        </Link>
                        <Link
                          href="/create-listing"
                          className="py-2 px-3 rounded-lg border border-outline-variant/50 text-on-surface font-semibold text-xs hover:bg-surface-container-low transition-colors text-center whitespace-nowrap cursor-pointer"
                        >
                          Sửa tin
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteListing(item.id, item.title, item.dbId)}
                          title="Xóa tin đăng"
                          className="py-2 px-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : activeTab === "history" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {historyRentals.length > 0 ? (
                historyRentals.map((hist) => (
                  <div
                    key={hist.id}
                    className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-6 space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <img src={hist.itemImage} alt={hist.itemTitle} className="w-14 h-14 rounded-xl object-cover" />
                      <div>
                        <h4 className="text-sm font-bold text-on-surface line-clamp-1">{hist.itemTitle}</h4>
                        <p className="text-xs text-outline">Đã hoàn tất • Đã nhận lại cọc</p>
                      </div>
                    </div>
                    <div className="text-xs space-y-1 text-on-surface-variant pt-2 border-t border-outline-variant/20">
                      <div>Thời gian: {hist.datesLabel}</div>
                      <div>Chủ máy: {hist.ownerName} ({hist.ownerUniversity})</div>
                      <div>Tổng chi phí: ${hist.totalCost}</div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {/* Default History Fallback Cards */}
                  <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <img src={RENTAL_ITEMS[2].image} alt={RENTAL_ITEMS[2].title} className="w-14 h-14 rounded-xl object-cover" />
                      <div>
                        <h4 className="text-sm font-bold text-on-surface line-clamp-1">{RENTAL_ITEMS[2].title}</h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          Hoàn tất ngày 10/10/2025
                        </span>
                      </div>
                    </div>
                    <div className="text-xs space-y-1.5 text-on-surface-variant pt-2 border-t border-outline-variant/20">
                      <div className="flex justify-between">
                        <span className="text-outline">Chủ thiết bị:</span>
                        <span className="font-semibold">{RENTAL_ITEMS[2].ownerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-outline">Tổng chi phí:</span>
                        <span className="font-bold text-on-surface">$105.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-outline">Ký quỹ hoàn tất:</span>
                        <span className="text-emerald-700 font-semibold">Đã hoàn cọc 100%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <img src={RENTAL_ITEMS[3].image} alt={RENTAL_ITEMS[3].title} className="w-14 h-14 rounded-xl object-cover" />
                      <div>
                        <h4 className="text-sm font-bold text-on-surface line-clamp-1">{RENTAL_ITEMS[3].title}</h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          Hoàn tất ngày 28/09/2025
                        </span>
                      </div>
                    </div>
                    <div className="text-xs space-y-1.5 text-on-surface-variant pt-2 border-t border-outline-variant/20">
                      <div className="flex justify-between">
                        <span className="text-outline">Chủ thiết bị:</span>
                        <span className="font-semibold">{RENTAL_ITEMS[3].ownerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-outline">Tổng chi phí:</span>
                        <span className="font-bold text-on-surface">$76.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-outline">Ký quỹ hoàn tất:</span>
                        <span className="text-emerald-700 font-semibold">Đã hoàn cọc 100%</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : activeTab === "reviews" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={SYSTEM_USERS[2].avatar}
                        alt={SYSTEM_USERS[2].fullName}
                        className="w-10 h-10 rounded-full object-cover border border-outline-variant/40"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-on-surface">{SYSTEM_USERS[2].fullName}</h4>
                        <p className="text-outline text-[11px]">{SYSTEM_USERS[2].university}</p>
                      </div>
                    </div>
                    <div className="flex text-amber-500">
                      <span className="material-symbols-outlined text-[15px] fill-icon">star</span>
                      <span className="text-xs font-bold text-on-surface ml-1">5.0</span>
                    </div>
                  </div>
                  <p className="text-on-surface-variant text-xs leading-relaxed">
                    “Máy ảnh được bàn giao trong tình trạng như mới, cảm biến sạch sẽ. Nhận tại tủ Smart Locker đúng giờ, thủ tục cực kỳ nhanh gọn!”
                  </p>
                </div>
                <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-outline text-[11px]">
                  <span>Thiết bị: Sony Alpha 7 IV</span>
                  <span>2 tuần trước</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={SYSTEM_USERS[3].avatar}
                        alt={SYSTEM_USERS[3].fullName}
                        className="w-10 h-10 rounded-full object-cover border border-outline-variant/40"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-on-surface">{SYSTEM_USERS[3].fullName}</h4>
                        <p className="text-outline text-[11px]">{SYSTEM_USERS[3].university}</p>
                      </div>
                    </div>
                    <div className="flex text-amber-500">
                      <span className="material-symbols-outlined text-[15px] fill-icon">star</span>
                      <span className="text-xs font-bold text-on-surface ml-1">5.0</span>
                    </div>
                  </div>
                  <p className="text-on-surface-variant text-xs leading-relaxed">
                    “Thuê máy render đồ án tốt nghiệp, máy chạy cực êm. Trả đồ đúng hạn và tiền cọc hoàn lại gần như tức thì. Rất uy tín!”
                  </p>
                </div>
                <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-outline text-[11px]">
                  <span>Thiết bị: MacBook Pro M3</span>
                  <span>1 tháng trước</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={SYSTEM_USERS[4].avatar}
                        alt={SYSTEM_USERS[4].fullName}
                        className="w-10 h-10 rounded-full object-cover border border-outline-variant/40"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-on-surface">{SYSTEM_USERS[4].fullName}</h4>
                        <p className="text-outline text-[11px]">{SYSTEM_USERS[4].university}</p>
                      </div>
                    </div>
                    <div className="flex text-amber-500">
                      <span className="material-symbols-outlined text-[15px] fill-icon">star</span>
                      <span className="text-xs font-bold text-on-surface ml-1">5.0</span>
                    </div>
                  </div>
                  <p className="text-on-surface-variant text-xs leading-relaxed">
                    “Chủ thiết bị hướng dẫn sử dụng rất nhiệt tình. Vali có sẵn đầy đủ phụ kiện bọc bảo vệ. Sẽ tiếp tục thuê cho các chuyến đi tới.”
                  </p>
                </div>
                <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-outline text-[11px]">
                  <span>Thiết bị: Rimowa Cabin</span>
                  <span>2 tháng trước</span>
                </div>
              </div>
            </div>
          ) : (
            /* activeTab === "rentals" */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeRentals.length > 0 ? (
                activeRentals.map((rental) => (
                  <div
                    key={rental.id}
                    className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300 group"
                  >
                    <div>
                      <div className="relative h-52 w-full overflow-hidden bg-surface-container-low">
                        <img
                          alt={rental.itemTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          src={rental.itemImage}
                        />
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/90 backdrop-blur-md text-white text-xs font-semibold shadow-xs">
                            <span className="material-symbols-outlined text-[14px]">alarm</span>
                            Hạn trả: {rental.dueDate}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide uppercase">
                            {rental.status === "Pending" ? "Chờ duyệt" : "Đang thuê"}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <div>
                          <h3 className="text-base font-bold text-on-surface tracking-tight group-hover:text-secondary transition-colors line-clamp-1">
                            {rental.itemTitle}
                          </h3>
                          <p className="text-xs text-outline mt-0.5">Thời gian: {rental.datesLabel}</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-surface-container-low/80 border border-outline-variant/30 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-outline font-semibold">Chủ thiết bị</span>
                            <span className="font-semibold text-on-surface">
                              {rental.ownerName} ({rental.ownerUniversity})
                            </span>
                          </div>
                          <div className="flex items-start gap-2 pt-1 border-t border-outline-variant/20 text-on-surface-variant">
                            <span className="material-symbols-outlined text-[16px] text-outline flex-shrink-0 mt-0.5">
                              meeting_room
                            </span>
                            <span className="line-clamp-1">{rental.pickupLocation}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-0 flex items-center gap-3">
                      <Link
                        href="/my-rentals"
                        className="flex-1 py-2.5 px-3 rounded-lg bg-primary text-on-primary font-semibold text-xs hover:bg-slate-800 transition-all text-center cursor-pointer"
                      >
                        Quản lý đơn thuê
                      </Link>
                      <button
                        type="button"
                        className="py-2.5 px-4 rounded-lg border border-outline-variant/50 text-on-surface font-semibold text-xs hover:bg-surface-container-low transition-colors text-center whitespace-nowrap cursor-pointer"
                      >
                        Xin gia hạn
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300 group">
                  <div>
                    <div className="relative h-52 w-full overflow-hidden bg-surface-container-low">
                      <img
                        alt={RENTAL_ITEMS[1].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={RENTAL_ITEMS[1].image}
                      />
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/90 backdrop-blur-md text-white text-xs font-semibold shadow-xs">
                          <span className="material-symbols-outlined text-[14px]">alarm</span>
                          Hạn trả: 3 ngày tới (18/11)
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide uppercase">
                          Đang thuê
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-base font-bold text-on-surface tracking-tight group-hover:text-secondary transition-colors">
                          {RENTAL_ITEMS[1].title}
                        </h3>
                        <p className="text-xs text-outline mt-0.5">64GB Unified Memory · 2TB SSD · Space Black</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-surface-container-low/80 border border-outline-variant/30 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-outline font-semibold">Chủ thiết bị</span>
                          <span className="font-semibold text-on-surface">
                            {RENTAL_ITEMS[1].ownerName} ({RENTAL_ITEMS[1].ownerUniversity})
                          </span>
                        </div>
                        <div className="flex items-start gap-2 pt-1 border-t border-outline-variant/20 text-on-surface-variant">
                          <span className="material-symbols-outlined text-[16px] text-outline flex-shrink-0 mt-0.5">
                            meeting_room
                          </span>
                          <span>Nhận tại Campus Smart Locker #14</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex items-center gap-3">
                    <Link
                      href="/my-rentals"
                      className="flex-1 py-2.5 px-3 rounded-lg bg-primary text-on-primary font-semibold text-xs hover:bg-slate-800 transition-all text-center cursor-pointer"
                    >
                      Quản lý đơn thuê
                    </Link>
                    <button
                      type="button"
                      className="py-2.5 px-4 rounded-lg border border-outline-variant/50 text-on-surface font-semibold text-xs hover:bg-surface-container-low transition-colors text-center whitespace-nowrap cursor-pointer"
                    >
                      Xin gia hạn
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* 4. Community Reviews & Trust Endorsements */}
        <section className="bg-surface-container-lowest/85 backdrop-blur-xl rounded-3xl p-6 sm:p-8 lg:p-10 border border-outline-variant/30 shadow-[0_4px_30px_rgba(15,23,42,0.02)] space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-on-surface tracking-tight">
                  Đánh Giá &amp; Uy Tín Cộng Đồng
                </h2>
                <span className="p-1 rounded-md bg-emerald-50 text-emerald-700">
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                </span>
              </div>
              <p className="text-xs text-outline mt-1">Đánh giá xác thực 100% từ các bạn sinh viên đã hoàn tất giao dịch</p>
            </div>

            <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant/30">
              <div className="flex items-center text-amber-500">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="material-symbols-outlined text-[18px] fill-icon">star</span>
                ))}
              </div>
              <span className="text-sm font-bold text-on-surface">4.9 / 5.0</span>
              <span className="text-outline text-xs">(18 đánh giá)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 flex flex-col justify-between space-y-4 hover:border-outline-variant/70 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={SYSTEM_USERS[2].avatar}
                      alt={SYSTEM_USERS[2].fullName}
                      className="w-10 h-10 rounded-full object-cover border border-outline-variant/40"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">{SYSTEM_USERS[2].fullName}</h4>
                      <p className="text-outline text-[11px]">{SYSTEM_USERS[2].university}</p>
                    </div>
                  </div>
                  <div className="flex text-amber-500">
                    <span className="material-symbols-outlined text-[15px] fill-icon">star</span>
                    <span className="text-xs font-bold text-on-surface ml-1">5.0</span>
                  </div>
                </div>
                <p className="text-on-surface-variant text-xs leading-relaxed">
                  “Máy ảnh được bàn giao trong tình trạng như mới, cảm biến sạch sẽ. Nhận tại tủ Smart Locker đúng giờ, thủ tục cực kỳ nhanh gọn!”
                </p>
              </div>
              <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-outline text-[11px]">
                <span>Thiết bị: Sony Alpha 7 IV</span>
                <span>2 tuần trước</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 flex flex-col justify-between space-y-4 hover:border-outline-variant/70 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={SYSTEM_USERS[3].avatar}
                      alt={SYSTEM_USERS[3].fullName}
                      className="w-10 h-10 rounded-full object-cover border border-outline-variant/40"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">{SYSTEM_USERS[3].fullName}</h4>
                      <p className="text-outline text-[11px]">{SYSTEM_USERS[3].university}</p>
                    </div>
                  </div>
                  <div className="flex text-amber-500">
                    <span className="material-symbols-outlined text-[15px] fill-icon">star</span>
                    <span className="text-xs font-bold text-on-surface ml-1">5.0</span>
                  </div>
                </div>
                <p className="text-on-surface-variant text-xs leading-relaxed">
                  “Thuê máy render đồ án tốt nghiệp, máy chạy cực êm. Trả đồ đúng hạn và tiền cọc hoàn lại gần như tức thì. Rất uy tín!”
                </p>
              </div>
              <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-outline text-[11px]">
                <span>Thiết bị: MacBook Pro M3</span>
                <span>1 tháng trước</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 flex flex-col justify-between space-y-4 hover:border-outline-variant/70 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={SYSTEM_USERS[4].avatar}
                      alt={SYSTEM_USERS[4].fullName}
                      className="w-10 h-10 rounded-full object-cover border border-outline-variant/40"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">{SYSTEM_USERS[4].fullName}</h4>
                      <p className="text-outline text-[11px]">{SYSTEM_USERS[4].university}</p>
                    </div>
                  </div>
                  <div className="flex text-amber-500">
                    <span className="material-symbols-outlined text-[15px] fill-icon">star</span>
                    <span className="text-xs font-bold text-on-surface ml-1">5.0</span>
                  </div>
                </div>
                <p className="text-on-surface-variant text-xs leading-relaxed">
                  “Chủ thiết bị hướng dẫn sử dụng rất nhiệt tình. Vali có sẵn đầy đủ phụ kiện bọc bảo vệ. Sẽ tiếp tục thuê cho các chuyến đi tới.”
                </p>
              </div>
              <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-outline text-[11px]">
                <span>Thiết bị: Rimowa Cabin</span>
                <span>2 tháng trước</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#f8f9ff] border-t border-[#c6c6cd]/30 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-6 lg:px-12 max-w-[1360px] mx-auto gap-4">
          <p className="text-xs text-on-surface-variant">© 2026 UniLend Technologies Inc. Bảo lưu mọi quyền.</p>
          <div className="flex flex-wrap items-center gap-6 text-xs text-on-surface-variant font-medium">
            <Link className="hover:text-primary transition-colors" href="/">
              Chính sách bảo mật
            </Link>
            <Link className="hover:text-primary transition-colors" href="/">
              Điều khoản dịch vụ
            </Link>
            <Link className="hover:text-primary transition-colors" href="/">
              An toàn &amp; Bảo hiểm
            </Link>
            <Link className="hover:text-primary transition-colors" href="/">
              Trạng thái hệ thống
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
