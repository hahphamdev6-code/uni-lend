"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { NotificationBell } from "../../../components/notification-bell";
import { ItemImageGallery } from "../../../components/item-image-gallery";
import { itemService } from "../../../lib/api/itemService";
import type { Item } from "../../../lib/api/types";
import styles from "./page.module.css";

export default function ItemDetailsPage() {
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const itemId = Number(params.id);
  const invalidId = !Number.isSafeInteger(itemId) || itemId < 1;

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
          <p className={styles.state}>Đang tải thông tin món đồ...</p>
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
                <Link className={styles.button} href="/items">
                  Khám phá món đồ khác
                </Link>
              </div>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
