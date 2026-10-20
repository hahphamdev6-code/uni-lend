"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  formatDate,
  loadItems,
  loadRequests,
  saveItems,
  saveRequests,
  type MarketplaceItem,
  type MarketplaceRequest,
} from "../lib/marketplace";

type Tab = "items" | "sent" | "received";
type Confirmation = { title: string; message: string; confirmLabel: string; action: () => void };

const tabs: { id: Tab; label: string }[] = [
  { id: "items", label: "Đồ của tôi" },
  { id: "sent", label: "Yêu cầu tôi đã gửi" },
  { id: "received", label: "Yêu cầu gửi đến tôi" },
];

const statusCopy: Record<MarketplaceRequest["status"], string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đang mượn",
  REJECTED: "Đã từ chối",
  RETURNED: "Đã trả",
  CANCELLED: "Đã hủy",
};

const itemStatusCopy: Record<MarketplaceItem["status"], string> = {
  AVAILABLE: "Có thể mượn",
  LENT_OUT: "Đang được mượn",
  UNAVAILABLE: "Tạm ẩn",
};

function RequestBadge({ status }: { status: MarketplaceRequest["status"] }) {
  return <span className={`status-badge loan-${status.toLowerCase()}`}><span />{statusCopy[status]}</span>;
}

function ItemBadge({ status }: { status: MarketplaceItem["status"] }) {
  return <span className={`status-badge item-${status.toLowerCase()}`}><span />{itemStatusCopy[status]}</span>;
}

export function ManageDashboard() {
  const [tab, setTab] = useState<Tab>("items");
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [requests, setRequests] = useState<MarketplaceRequest[]>([]);
  const [search, setSearch] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [toast, setToast] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    window.queueMicrotask(() => {
      setItems(loadItems());
      setRequests(loadRequests());
      const requestedTab = new URLSearchParams(window.location.search).get("tab");
      if (requestedTab === "items" || requestedTab === "sent" || requestedTab === "received") setTab(requestedTab);
      const pendingToast = window.sessionStorage.getItem("unilend-toast");
      if (pendingToast) {
        setToast(pendingToast);
        window.sessionStorage.removeItem("unilend-toast");
      }
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const incoming = useMemo(() => requests.filter((request) => request.owner === "Minh Anh"), [requests]);
  const outgoing = useMemo(() => requests.filter((request) => request.borrower === "Minh Anh"), [requests]);
  const pendingIncoming = incoming.filter((request) => request.status === "PENDING").length;
  const visibleItems = items.filter((item) => `${item.title} ${item.category} ${itemStatusCopy[item.status]}`.toLocaleLowerCase("vi").includes(search.trim().toLocaleLowerCase("vi")));
  const activeRequests = (tab === "sent" ? outgoing : incoming).filter((request) => `${request.itemTitle} ${tab === "sent" ? request.owner : request.borrower} ${statusCopy[request.status]}`.toLocaleLowerCase("vi").includes(search.trim().toLocaleLowerCase("vi")));

  function showToast(message: string) {
    setToast(message);
  }

  function askToConfirm(title: string, message: string, confirmLabel: string, action: () => void) {
    setConfirmation({ title, message, confirmLabel, action });
  }

  function updateRequest(requestId: string, status: MarketplaceRequest["status"]) {
    const nextRequests = requests.map((request) => request.id === requestId ? { ...request, status } : request);
    const affectedRequest = requests.find((request) => request.id === requestId);
    const nextItems = affectedRequest
      ? items.map((item) => item.id === affectedRequest.itemId
        ? { ...item, status: status === "APPROVED" ? "LENT_OUT" as const : status === "RETURNED" && item.status === "LENT_OUT" ? "AVAILABLE" as const : item.status }
        : item)
      : items;
    setRequests(nextRequests);
    setItems(nextItems);
    saveRequests(nextRequests);
    saveItems(nextItems);
    setConfirmation(null);
    showToast(status === "APPROVED" ? "Đã duyệt yêu cầu mượn." : status === "REJECTED" ? "Đã từ chối yêu cầu." : status === "RETURNED" ? "Đã xác nhận món đồ được trả." : "Đã hủy yêu cầu mượn.");
  }

  if (!ready) return <main className="manage-loading">Đang tải không gian của bạn...</main>;

  return (
    <main className="manage-page">
      <header className="manage-header">
        <Link className="brand" href="/" aria-label="UniLend, về trang khám phá"><span className="brand-mark">U</span><span>uni<span className="brand-accent">lend</span></span></Link>
        <nav className="manage-global-nav" aria-label="Điều hướng chính"><Link href="/">Khám phá</Link><span className="current">Không gian của tôi</span></nav>
        <div className="manage-user"><span className="manage-avatar">MA</span><span>Minh Anh</span></div>
      </header>

      <div className="manage-main">
        <div className="manage-title-row">
          <div><span className="manage-kicker">GÓC CỦA MINH ANH</span><h1>Không gian của tôi</h1><p>Quản lý món đồ và những kết nối sẻ chia của bạn.</p></div>
          <Link className="primary-button new-item-button" href="/quan-ly/dang-moi"><span aria-hidden="true">＋</span> Đăng đồ mới</Link>
        </div>

        <section className="manage-overview" aria-label="Tổng quan">
          <div className="overview-item"><span className="overview-number">{items.length.toString().padStart(2, "0")}</span><span className="overview-label">Món đồ đã đăng</span></div>
          <div className="overview-item"><span className="overview-number">{outgoing.length.toString().padStart(2, "0")}</span><span className="overview-label">Yêu cầu đã gửi</span></div>
          <div className="overview-item"><span className="overview-number">{pendingIncoming.toString().padStart(2, "0")}</span><span className="overview-label">Đang chờ bạn</span></div>
          <div className="overview-note"><span className="overview-note-mark">↗</span><span>Một món đồ hữu ích,<br />thêm một người bạn mới.</span></div>
        </section>

        <section className="manage-workspace">
          <div className="manage-tabs" role="tablist" aria-label="Quản lý đồ và yêu cầu">
            {tabs.map((entry) => <button key={entry.id} className={`manage-tab${tab === entry.id ? " active" : ""}`} type="button" role="tab" aria-selected={tab === entry.id} onClick={() => { setTab(entry.id); setSearch(""); }}>
              {entry.label}{entry.id === "received" && pendingIncoming > 0 && <span className="tab-count">{pendingIncoming}</span>}
            </button>)}
          </div>
          <div className="workspace-toolbar">
            <div><h2>{tab === "items" ? "Những món đồ bạn đang chia sẻ" : tab === "sent" ? "Hành trình mượn đồ của bạn" : "Mọi người đang cần bạn"}</h2><p>{tab === "items" ? `${items.length} món đồ trong bộ sưu tập` : tab === "sent" ? `${outgoing.length} yêu cầu đã gửi` : `${incoming.length} yêu cầu liên quan đến đồ của bạn`}</p></div>
            <label className="manage-search"><span aria-hidden="true">⌕</span><span className="visually-hidden">Tìm kiếm trong danh sách</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={tab === "items" ? "Tìm món đồ" : "Tìm yêu cầu"} /></label>
          </div>

          {tab === "items" ? (
            visibleItems.length ? <div className="managed-items-list">{visibleItems.map((item, index) => <article className="managed-item" key={item.id}>
              <div className={`managed-item-number tone-${index % 4}`}>{String(index + 1).padStart(2, "0")}</div>
              <div className="managed-item-details"><span className="managed-item-category">{item.category}</span><h3>{item.title}</h3><p>{item.description || "Chưa có mô tả cho món đồ này."}</p></div>
              <ItemBadge status={item.status} />
              <Link className="icon-link" href={`/quan-ly/${item.id}/sua`} aria-label={`Sửa ${item.title}`} title="Sửa món đồ">↗</Link>
            </article>)}</div> : <div className="manage-empty"><span>⌕</span><h3>Chưa có món đồ phù hợp</h3><p>Thử một từ khóa khác hoặc đăng món đồ đầu tiên của bạn.</p><Link href="/quan-ly/dang-moi">Đăng đồ mới</Link></div>
          ) : activeRequests.length ? <div className="request-list">{activeRequests.map((request) => <article className="request-card" key={request.id}>
            <div className="request-card-top"><div className="request-item-mark">{request.itemTitle.slice(0, 1)}</div><div className="request-item-heading"><span>{tab === "sent" ? "CHỦ MÓN ĐỒ" : "NGƯỜI MƯỢN"}</span><h3>{request.itemTitle}</h3></div><RequestBadge status={request.status} /></div>
            <div className="request-person"><span className="avatar">{(tab === "sent" ? request.owner : request.borrower).split(" ").map((part) => part[0]).slice(-2).join("")}</span><span>{tab === "sent" ? request.owner : request.borrower}</span><span className="person-caption">· {tab === "sent" ? "Chủ món đồ" : "Sinh viên"}</span></div>
            <div className="request-dates"><div><span>NGÀY NHẬN</span><strong>{formatDate(request.borrowFrom)}</strong></div><span className="date-divider" aria-hidden="true">→</span><div><span>NGÀY TRẢ DỰ KIẾN</span><strong>{formatDate(request.dueDate)}</strong></div></div>
            {request.note && <p className="request-note">“{request.note}”</p>}
            <div className="request-card-footer"><span>Yêu cầu #{request.id.slice(-1).padStart(2, "0")}</span><div className="request-actions">
              {tab === "received" && request.status === "PENDING" && <><button className="text-action reject-action" type="button" onClick={() => askToConfirm("Từ chối yêu cầu này?", `Yêu cầu mượn “${request.itemTitle}” sẽ được đánh dấu đã từ chối.`, "Từ chối yêu cầu", () => updateRequest(request.id, "REJECTED"))}>Từ chối</button><button className="small-primary-button" type="button" onClick={() => askToConfirm("Duyệt yêu cầu mượn?", `Đồng ý cho ${request.borrower} mượn “${request.itemTitle}”.`, "Duyệt yêu cầu", () => updateRequest(request.id, "APPROVED"))}>Duyệt yêu cầu</button></>}
              {tab === "received" && request.status === "APPROVED" && <button className="small-primary-button" type="button" onClick={() => askToConfirm("Xác nhận đã trả đồ?", `Xác nhận “${request.itemTitle}” đã được trả lại.`, "Đã nhận lại đồ", () => updateRequest(request.id, "RETURNED"))}>Đã trả</button>}
              {tab === "sent" && request.status === "PENDING" && <button className="text-action reject-action" type="button" onClick={() => askToConfirm("Hủy yêu cầu mượn?", `Yêu cầu mượn “${request.itemTitle}” sẽ bị hủy.`, "Hủy yêu cầu", () => updateRequest(request.id, "CANCELLED"))}>Hủy yêu cầu</button>}
            </div></div>
          </article>)}</div> : <div className="manage-empty"><span>⌕</span><h3>Chưa có yêu cầu nào</h3><p>Khi có cập nhật mới, danh sách sẽ hiển thị tại đây.</p></div>}
        </section>
        <footer className="manage-footer"><span>UNILEND · DÙNG CHUNG, VUI HƠN MỖI NGÀY</span><Link href="/">Quay lại khám phá ↗</Link></footer>
      </div>

      {confirmation && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmation(null); }}><section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><span className="confirm-modal-mark">?</span><h2 id="confirm-title">{confirmation.title}</h2><p>{confirmation.message}</p><div className="confirm-actions"><button className="secondary-button" type="button" onClick={() => setConfirmation(null)}>Để sau</button><button className="primary-button" type="button" onClick={confirmation.action}>{confirmation.confirmLabel}</button></div></section></div>}
      {toast && <div className="toast-message" role="status"><span aria-hidden="true">✓</span>{toast}<button type="button" aria-label="Đóng thông báo" onClick={() => setToast("")}>×</button></div>}
    </main>
  );
}