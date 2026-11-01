"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAdminToast } from "../../../components/admin-toast";
import { useAuth } from "../../../components/auth-provider";
import { NotificationBell } from "../../../components/notification-bell";
import { ItemImageGallery } from "../../../components/item-image-gallery";
import { UserReviewSection } from "../../../components/user-review-section";
import { itemService } from "../../../lib/api/itemService";
import { loanService } from "../../../lib/api/loanService";
import type { Item } from "../../../lib/api/types";
import styles from "./page.module.css";

export default function ItemDetailsPage() {
  const params = useParams<{ id: string }>();
  const auth = useAuth();
  const { showToast } = useAdminToast();
  const [item, setItem] = useState<Item | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [borrowFrom, setBorrowFrom] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [requestError, setRequestError] = useState("");
  const itemId = Number(params.id);
  const invalidId = !Number.isSafeInteger(itemId) || itemId < 1;

  const isOwner =
    auth.status === "authenticated" &&
    item !== null &&
    ((Number.isFinite(Number(auth.user.id)) && Number(auth.user.id) === item.owner.id) ||
      (auth.user.email.toLowerCase() === "owner@demo.unilend.local" && item.owner.fullName === "Demo Owner") ||
      auth.user.fullName === item.owner.fullName);

  const minBorrowFrom = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    if (invalidId) return;

    const controller = new AbortController();

    async function loadItem() {
      setLoading(true);
      setError("");
      try {
        const result = await itemService.getById(itemId, { signal: controller.signal });
        setItem(result);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setError(loadError instanceof Error ? loadError.message : "Không thể tải thông tin món đồ.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadItem();
    return () => controller.abort();
  }, [invalidId, itemId]);

  async function handleBorrowRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!item) return;
    if (auth.status !== "authenticated") {
      showToast("error", "Vui lòng đăng nhập để gửi yêu cầu mượn.");
      return;
    }
    if (isOwner) {
      showToast("error", "Bạn không thể gửi yêu cầu cho món đồ của chính mình.");
      return;
    }
    if (!borrowFrom || !dueDate) {
      setRequestError("Vui lòng chọn ngày bắt đầu và ngày trả dự kiến.");
      return;
    }

    const start = new Date(`${borrowFrom}T00:00:00`);
    const end = new Date(`${dueDate}T00:00:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      setRequestError("Ngày trả phải sau ngày bắt đầu.");
      return;
    }

    setRequesting(true);
    setRequestError("");

    try {
      await loanService.createRequest({
        itemId: item.id,
        borrowFrom,
        dueDate,
        note: note.trim(),
      });
      setBorrowFrom("");
      setDueDate("");
      setNote("");
      showToast("success", "Đã gửi yêu cầu mượn. Chủ sở hữu sẽ xem xét trong thời gian sớm nhất.");
    } catch (borrowError) {
      setRequestError(
        borrowError instanceof Error
          ? borrowError.message
          : "Không thể gửi yêu cầu mượn. Vui lòng thử lại.",
      );
    } finally {
      setRequesting(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="UniLend - về trang chủ">
          <span className={styles.brandMark} aria-hidden="true">U</span>
          <span>uni<span className={styles.brandAccent}>lend</span></span>
        </Link>
        <div className={styles.headerActions}>
          <NotificationBell />
          <Link className={styles.backLink} href="/items">← Danh sách đồ</Link>
        </div>
      </header>

      <section className={styles.content} aria-live="polite">
        {invalidId ? (
          <div className={styles.statePanel} role="alert">
            <h1>Mã món đồ không hợp lệ</h1>
            <p>Vui lòng chọn món đồ từ danh sách.</p>
            <Link className={styles.button} href="/items">Quay lại danh sách</Link>
          </div>
        ) : loading ? (
          <div className={styles.detailsSkeleton} aria-label="Đang tải thông tin món đồ" aria-busy="true">
            <span className={styles.visuallyHidden} role="status">Đang tải thông tin món đồ</span>
            <div className={styles.imageSkeleton} />
            <div className={styles.infoSkeleton}>
              <div className={`${styles.skeletonLine} ${styles.categorySkeleton}`} />
              <div className={`${styles.skeletonLine} ${styles.titleSkeleton}`} />
              <div className={`${styles.skeletonLine} ${styles.copySkeleton}`} />
              <div className={`${styles.skeletonLine} ${styles.copySkeleton}`} />
              <div className={`${styles.skeletonLine} ${styles.ownerSkeleton}`} />
            </div>
          </div>
        ) : error ? (
          <div className={styles.statePanel} role="alert">
            <h1>Không thể tải món đồ</h1>
            <p>{error}</p>
            <Link className={styles.button} href="/items">Quay lại danh sách</Link>
          </div>
        ) : item ? (
          <>
            <nav className={styles.breadcrumb} aria-label="Đường dẫn">
              <Link href="/items">Danh sách đồ</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{item.title}</span>
            </nav>
            <div className={styles.details}>
              <ItemImageGallery images={item.imageUrls ?? []} title={item.title} />
              <div className={styles.info}>
                <span className={styles.category}>{item.category?.name ?? "Chưa phân loại"}</span>
                <h1>{item.title}</h1>
                <span
                  className={`${styles.status} ${
                    item.status === "AVAILABLE" ? styles.available : styles.unavailable
                  }`}
                >
                  {item.status === "AVAILABLE"
                    ? "Có thể mượn"
                    : item.status === "LENT_OUT"
                      ? "Đang được mượn"
                      : "Tạm ngưng"}
                </span>
                <div className={styles.owner}>
                  <span className={styles.avatar} aria-hidden="true">
                    {item.owner.fullName.trim().slice(0, 1).toLocaleUpperCase("vi")}
                  </span>
                  <span>Chia sẻ bởi <strong>{item.owner.fullName}</strong></span>
                </div>
                <section className={styles.descriptionSection}>
                  <h2>Mô tả</h2>
                  <p>{item.description || "Chủ sở hữu chưa thêm mô tả cho món đồ này."}</p>
                </section>

                {item.status === "AVAILABLE" && !isOwner ? (
                  <form className={styles.borrowForm} onSubmit={handleBorrowRequest}>
                    <div className={styles.borrowHeading}>
                      <h2>Yêu cầu mượn</h2>
                      <span>Đặt lịch mượn và gửi yêu cầu đến chủ sở hữu.</span>
                    </div>

                    <div className={styles.fieldGrid}>
                      <label className={styles.field}>
                        <span>Ngày bắt đầu</span>
                        <input
                          min={minBorrowFrom}
                          onChange={(event) => setBorrowFrom(event.target.value)}
                          required
                          type="date"
                          value={borrowFrom}
                        />
                      </label>

                      <label className={styles.field}>
                        <span>Ngày trả dự kiến</span>
                        <input
                          min={borrowFrom || minBorrowFrom}
                          onChange={(event) => setDueDate(event.target.value)}
                          required
                          type="date"
                          value={dueDate}
                        />
                      </label>
                    </div>

                    <label className={styles.field}>
                      <span>Ghi chú</span>
                      <textarea
                        maxLength={500}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder="Ví dụ: Mượn để làm bài tập nhóm, cần thu hồi trước 18:00..."
                        rows={4}
                        value={note}
                      />
                    </label>

                    {requestError && <p className={styles.formAlert} role="alert">{requestError}</p>}

                    <button className={styles.button} disabled={requesting} type="submit">
                      {requesting ? "Đang gửi..." : "Gửi yêu cầu mượn"}
                    </button>
                  </form>
                ) : item.status === "AVAILABLE" && isOwner ? (
                  <p className={styles.infoNotice}>Bạn là chủ sở hữu món đồ này nên không thể gửi yêu cầu mượn.</p>
                ) : (
                  <p className={styles.infoNotice}>Món đồ hiện không ở trạng thái có thể mượn.</p>
                )}

                <div className={styles.secondaryActions}>
                  <Link className={styles.buttonSecondary} href="/items">
                    Khám phá món đồ khác
                  </Link>
                  {auth.status !== "authenticated" && (
                    <Link className={styles.buttonSecondary} href="/login">
                      Đăng nhập để mượn
                    </Link>
                  )}
                </div>
              </div>
            </div>
            <UserReviewSection
              title={`Đánh giá về ${item.owner.fullName}`}
              userId={item.owner.id}
            />
          </>
        ) : null}
      </section>
    </main>
  );
}
