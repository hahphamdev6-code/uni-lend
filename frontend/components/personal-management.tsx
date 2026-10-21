"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ConfirmationDialog } from "./confirmation-dialog";
import { useAdminToast } from "./admin-toast";
import { useAuth } from "./auth-provider";
import { NotificationBell } from "./notification-bell";
import { ReviewDialog } from "./review-dialog";
import { itemService } from "../lib/api/itemService";
import { loanService } from "../lib/api/loanService";
import { reviewService } from "../lib/api/reviewService";
import { userService } from "../lib/api/userService";
import type { Item, Loan, PageResponse } from "../lib/api/types";
import styles from "./personal-management.module.css";

const PAGE_SIZE = 10;
const VIETNAM_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "Asia/Ho_Chi_Minh",
  year: "numeric",
});

type Tab = "items" | "outgoing" | "incoming";
type LoanAction = "approve" | "reject" | "return";

const tabs: { id: Tab; label: string }[] = [
  { id: "items", label: "Đồ của tôi" },
  { id: "outgoing", label: "Yêu cầu tôi đã gửi" },
  { id: "incoming", label: "Yêu cầu gửi đến tôi" },
];

const statusLabels: Record<Loan["status"], string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Đã từ chối",
  RETURNED: "Đã trả",
  CANCELLED: "Đã hủy",
  OVERDUE: "Quá hạn",
};

const actionDetails: Record<LoanAction, { title: string; message: string; confirm: string }> = {
  approve: {
    title: "Duyệt yêu cầu mượn?",
    message: "Món đồ sẽ được đánh dấu đang cho mượn và người gửi yêu cầu sẽ nhận được thông báo.",
    confirm: "Duyệt yêu cầu",
  },
  reject: {
    title: "Từ chối yêu cầu?",
    message: "Người gửi yêu cầu sẽ được thông báo về quyết định này.",
    confirm: "Từ chối yêu cầu",
  },
  return: {
    title: "Xác nhận đã trả đồ?",
    message: "Món đồ sẽ được chuyển về trạng thái có thể mượn.",
    confirm: "Xác nhận đã trả",
  },
};

function formatDate(value: string | null): string {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getOverdueDays(dueDate: string | null): number | null {
  const match = dueDate?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const dueDateUtc = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (new Date(dueDateUtc).toISOString().slice(0, 10) !== dueDate) return null;

  const todayParts = VIETNAM_DATE_FORMATTER.formatToParts(new Date());
  const todayPart = (type: Intl.DateTimeFormatPartTypes) =>
    Number(todayParts.find((part) => part.type === type)?.value);
  const todayUtc = Date.UTC(todayPart("year"), todayPart("month") - 1, todayPart("day"));

  return Math.max(0, Math.floor((todayUtc - dueDateUtc) / 86_400_000));
}

function ItemStatus({ item }: { item: Item }) {
  const label =
    item.status === "AVAILABLE"
      ? "Có thể mượn"
      : item.status === "LENT_OUT"
        ? "Đang được mượn"
        : "Tạm ngưng";
  const tone =
    item.status === "AVAILABLE"
      ? styles.statusAvailable
      : item.status === "LENT_OUT"
        ? styles.statusPending
        : styles.statusMuted;
  return <span className={`${styles.badge} ${tone}`}>{label}</span>;
}

function LoanStatus({ loan }: { loan: Loan }) {
  const { status } = loan;
  const tone =
    status === "PENDING"
      ? styles.statusPending
      : status === "APPROVED"
        ? styles.statusApproved
        : status === "RETURNED"
          ? styles.statusAvailable
          : status === "OVERDUE"
            ? styles.statusOverdue
            : status === "REJECTED"
              ? styles.statusRejected
              : styles.statusMuted;
  const overdueDays = status === "OVERDUE" ? getOverdueDays(loan.dueDate) : null;
  return (
    <span className={`${styles.badge} ${tone}`}>
      {statusLabels[status]}
      {overdueDays !== null && ` · trễ ${overdueDays} ngày`}
    </span>
  );
}

export function PersonalManagement() {
  const router = useRouter();
  const auth = useAuth();
  const { showToast } = useAdminToast();
  const [tab, setTab] = useState<Tab>("items");
  const [page, setPage] = useState(0);
  const [itemsPage, setItemsPage] = useState<PageResponse<Item> | null>(null);
  const [loansPage, setLoansPage] = useState<PageResponse<Loan> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [confirmation, setConfirmation] = useState<{ loan: Loan; action: LoanAction } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [apiUserId, setApiUserId] = useState<number | null>(null);
  const [reviewedLoans, setReviewedLoans] = useState<Record<number, boolean>>({});
  const [reviewCheckError, setReviewCheckError] = useState("");
  const [reviewCheckRetry, setReviewCheckRetry] = useState(0);
  const [reviewingLoan, setReviewingLoan] = useState<Loan | null>(null);

  useEffect(() => {
    if (auth.status === "unauthenticated") router.replace("/login");
  }, [auth.status, router]);

  useEffect(() => {
    if (auth.status !== "authenticated") return;
    const controller = new AbortController();

    async function loadPage() {
      setLoading(true);
      setError("");
      try {
        if (tab === "items") {
          setItemsPage(await itemService.listMine(
            { page, size: PAGE_SIZE },
            { signal: controller.signal },
          ));
        } else {
          const result =
            tab === "outgoing"
              ? await loanService.listMine({ page, size: PAGE_SIZE }, { signal: controller.signal })
              : await loanService.listIncoming({ page, size: PAGE_SIZE }, { signal: controller.signal });
          setLoansPage(result);
        }
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setError(loadError instanceof Error ? loadError.message : "Không thể tải dữ liệu quản lý.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadPage();
    return () => controller.abort();
  }, [auth.status, page, reload, tab]);

  useEffect(() => {
    if (auth.status !== "authenticated") return;
    const controller = new AbortController();
    setApiUserId(null);
    userService.getMe({ signal: controller.signal })
      .then((profile) => {
        if (!controller.signal.aborted) {
          setApiUserId(profile.id);
          setReviewCheckError("");
        }
      })
      .catch((profileError: unknown) => {
        if (controller.signal.aborted) return;
        setReviewCheckError(
          profileError instanceof Error
            ? profileError.message
            : "Không thể xác định tài khoản để kiểm tra đánh giá.",
        );
      });
    return () => controller.abort();
  }, [auth.status, reviewCheckRetry]);

  useEffect(() => {
    if (!apiUserId || tab === "items" || !loansPage) return;
    const controller = new AbortController();
    const returnedLoans = loansPage.content.filter((loan) => loan.status === "RETURNED");
    setReviewCheckError("");

    async function checkReviews() {
      try {
        const entries = await Promise.all(returnedLoans.map(async (loan) => {
          const reviews = await reviewService.listByLoan(
            loan.id,
            { signal: controller.signal },
          );
          return [loan.id, reviews.some((review) => review.reviewer?.id === apiUserId)] as const;
        }));
        if (!controller.signal.aborted) setReviewedLoans(Object.fromEntries(entries));
      } catch (reviewError) {
        if (controller.signal.aborted) return;
        setReviewCheckError(
          reviewError instanceof Error ? reviewError.message : "Không thể kiểm tra đánh giá đã gửi.",
        );
      }
    }

    void checkReviews();
    return () => controller.abort();
  }, [apiUserId, loansPage, reviewCheckRetry, tab]);

  const changeTab = useCallback((nextTab: Tab) => {
    setTab(nextTab);
    setPage(0);
    setError("");
  }, []);

  async function runAction() {
    if (!confirmation) return;
    setSubmitting(true);
    try {
      const { loan, action } = confirmation;
      if (action === "approve") await loanService.approve(loan.id);
      else if (action === "reject") await loanService.reject(loan.id);
      else await loanService.markReturned(loan.id);

      showToast("success", action === "approve"
        ? "Đã duyệt yêu cầu mượn."
        : action === "reject"
          ? "Đã từ chối yêu cầu mượn."
          : "Đã xác nhận người mượn trả đồ.");
      setConfirmation(null);
      setReload((current) => current + 1);
    } catch (actionError) {
      showToast(
        "error",
        actionError instanceof Error ? actionError.message : "Không thể cập nhật yêu cầu.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function submitReview(rating: number, comment: string) {
    if (!reviewingLoan) return;
    await reviewService.create(reviewingLoan.id, {
      rating,
      ...(comment ? { comment } : {}),
    });
    setReviewedLoans((current) => ({ ...current, [reviewingLoan.id]: true }));
    setReviewingLoan(null);
    showToast("success", "Đã gửi đánh giá. Cảm ơn bạn!");
  }

  const currentPage = tab === "items" ? itemsPage : loansPage;
  const totalPages = currentPage?.totalPages ?? 0;
  const pageCount = Math.max(totalPages, 1);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="UniLend - về trang chủ">
          <span className={styles.brandMark} aria-hidden="true">U</span>
          <span>uni<span className={styles.brandAccent}>lend</span></span>
        </Link>
        <nav className={styles.navigation} aria-label="Điều hướng chính">
          <Link href="/">Trang chủ</Link>
          <Link href="/items">Khám phá đồ</Link>
          <span aria-current="page">Quản lý cá nhân</span>
        </nav>
        <div className={styles.headerActions}>
          <NotificationBell />
          <Link className={styles.profileLink} href="/profile">Hồ sơ</Link>
        </div>
      </header>

      <section className={styles.content} aria-labelledby="management-title">
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>Không gian của bạn</span>
            <h1 id="management-title">Quản lý cá nhân</h1>
            <p>Theo dõi món đồ bạn chia sẻ và những yêu cầu mượn trong cộng đồng.</p>
          </div>
          <Link className={styles.primaryButton} href="/items/new">＋ Đăng đồ mới</Link>
        </div>

        <div className={styles.tabs} role="tablist" aria-label="Nội dung quản lý">
          {tabs.map((entry) => (
            <button
              aria-selected={tab === entry.id}
              aria-controls="management-panel"
              className={tab === entry.id ? styles.activeTab : ""}
              id={`tab-${entry.id}`}
              key={entry.id}
              onClick={() => changeTab(entry.id)}
              role="tab"
              type="button"
            >
              {entry.label}
            </button>
          ))}
        </div>

        {auth.status === "error" ? (
          <div className={styles.statePanel} role="alert">{auth.error}</div>
        ) : auth.status !== "authenticated" ? (
          <div className={styles.statePanel} role="status">Đang xác thực phiên đăng nhập...</div>
        ) : error ? (
          <div className={styles.statePanel} role="alert">
            <h2>Không thể tải dữ liệu</h2>
            <p>{error}</p>
            <button className={styles.secondaryButton} onClick={() => setReload((value) => value + 1)} type="button">
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className={styles.loadingList} aria-label="Đang tải dữ liệu" aria-busy="true">
            <span className={styles.visuallyHidden} role="status">Đang tải dữ liệu</span>
            {Array.from({ length: 4 }, (_, index) => (
              <div className={styles.loadingSkeleton} key={index} />
            ))}
          </div>
        ) : tab === "items" ? (
          <section
            aria-labelledby={`tab-${tab}`}
            className={styles.listPanel}
            id="management-panel"
            role="tabpanel"
          >
            {(itemsPage?.content.length ?? 0) > 0 ? (
              <div className={styles.itemList}>
                {itemsPage?.content.map((item) => (
                  <article className={styles.itemRow} key={item.id}>
                    <div className={styles.itemMark} aria-hidden="true">↗</div>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemCategory}>{item.category?.name ?? "Chưa phân loại"}</span>
                      <h2>{item.title}</h2>
                      <p>Đăng ngày {formatDate(item.createdAt)}</p>
                    </div>
                    <ItemStatus item={item} />
                    <Link className={styles.editLink} href={`/items/${item.id}/edit`}>Sửa đồ</Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon} aria-hidden="true">＋</span>
                <h2>Bạn chưa đăng món đồ nào</h2>
                <p>Chia sẻ món đồ ít dùng để giúp bạn bè quanh trường có thêm lựa chọn.</p>
                <Link className={styles.primaryButton} href="/items/new">Đăng món đồ đầu tiên</Link>
              </div>
            )}
          </section>
        ) : (
          <section
            aria-labelledby={`tab-${tab}`}
            className={styles.listPanel}
            id="management-panel"
            role="tabpanel"
          >
            {(loansPage?.content.length ?? 0) > 0 ? (
              <div className={styles.loanList}>
                {loansPage?.content.map((loan) => (
                  <article className={styles.loanCard} key={loan.id}>
                    <div className={styles.loanTopline}>
                      <LoanStatus loan={loan} />
                      <span className={styles.requestDate}>Gửi ngày {formatDate(loan.requestedAt)}</span>
                    </div>
                    <h2>{loan.item.title}</h2>
                    <p className={styles.loanPerson}>
                      {tab === "incoming" ? "Người gửi" : "Chủ món đồ"}:{" "}
                      <strong>{tab === "incoming" ? loan.borrower.fullName : loan.owner.fullName}</strong>
                    </p>
                    <div className={styles.loanDates}>
                      <span>Mượn từ <strong>{formatDate(loan.borrowFrom)}</strong></span>
                      <span>Hạn trả <strong>{formatDate(loan.dueDate)}</strong></span>
                    </div>
                    {loan.note && <p className={styles.loanNote}>“{loan.note}”</p>}
                    {tab === "incoming" && (
                      <div className={styles.loanActions}>
                        {loan.status === "PENDING" && (
                          <>
                            <button
                              className={styles.approveButton}
                              onClick={() => setConfirmation({ loan, action: "approve" })}
                              type="button"
                            >
                              Duyệt
                            </button>
                            <button
                              className={styles.rejectButton}
                              onClick={() => setConfirmation({ loan, action: "reject" })}
                              type="button"
                            >
                              Từ chối
                            </button>
                          </>
                        )}
                        {(loan.status === "APPROVED" || loan.status === "OVERDUE") && (
                          <button
                            className={styles.approveButton}
                            onClick={() => setConfirmation({ loan, action: "return" })}
                            type="button"
                          >
                            Đã trả
                          </button>
                        )}
                      </div>
                    )}
                    {loan.status === "RETURNED" && reviewedLoans[loan.id] !== true && (
                      <div className={styles.loanActions}>
                        <button
                          className={styles.reviewButton}
                          onClick={() => setReviewingLoan(loan)}
                          type="button"
                        >
                          ★ Đánh giá
                        </button>
                      </div>
                    )}
                    {loan.status === "RETURNED" && reviewedLoans[loan.id] === true && (
                      <p className={styles.reviewedLabel}>✓ Bạn đã đánh giá giao dịch này</p>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon} aria-hidden="true">⌁</span>
                <h2>{tab === "incoming" ? "Chưa có yêu cầu nào gửi đến" : "Bạn chưa gửi yêu cầu mượn"}</h2>
                <p>
                  {tab === "incoming"
                    ? "Khi có bạn gửi yêu cầu mượn đồ của bạn, thông tin sẽ xuất hiện tại đây."
                    : "Khám phá danh sách đồ và gửi yêu cầu mượn món bạn cần nhé."}
                </p>
                {tab === "outgoing" && <Link className={styles.primaryButton} href="/items">Khám phá đồ</Link>}
              </div>
            )}
          </section>
        )}
        {reviewCheckError && tab !== "items" && (
          <p className={styles.reviewCheckError} role="alert">
            Không thể kiểm tra đánh giá: {reviewCheckError}{" "}
            <button onClick={() => setReviewCheckRetry((value) => value + 1)} type="button">
              Thử lại
            </button>
          </p>
        )}

        {!loading && !error && totalPages > 1 && (
          <nav className={styles.pagination} aria-label="Phân trang">
            <button disabled={page === 0} onClick={() => setPage((value) => value - 1)} type="button">
              ← Trước
            </button>
            <span>Trang {page + 1} / {pageCount}</span>
            <button disabled={page + 1 >= pageCount} onClick={() => setPage((value) => value + 1)} type="button">
              Sau →
            </button>
          </nav>
        )}
      </section>

      {confirmation && (
        <ConfirmationDialog
          busy={submitting}
          cancelLabel="Để sau"
          confirmLabel={actionDetails[confirmation.action].confirm}
          onCancel={() => setConfirmation(null)}
          onConfirm={() => void runAction()}
          pendingLabel="Đang xử lý..."
          title={actionDetails[confirmation.action].title}
        >
          {actionDetails[confirmation.action].message}
        </ConfirmationDialog>
      )}
      {reviewingLoan && (
        <ReviewDialog
          itemTitle={reviewingLoan.item.title}
          revieweeName={tab === "incoming" ? reviewingLoan.borrower.fullName : reviewingLoan.owner.fullName}
          onClose={() => setReviewingLoan(null)}
          onSubmit={submitReview}
        />
      )}
    </main>
  );
}
