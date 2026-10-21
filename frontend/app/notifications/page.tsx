"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useNotifications } from "../../components/notifications-provider";
import {
  notificationService,
  type Notification,
} from "../../lib/api/notificationService";
import type { PageResponse } from "../../lib/api/types";
import styles from "./page.module.css";

const PAGE_SIZE = 20;

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Thời gian không xác định";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getNotificationHref(link?: string | null): string | null {
  return link?.startsWith("/") && !link.startsWith("//") ? link : null;
}

export default function NotificationsPage() {
  const { authenticated, markRead, markAllRead } = useNotifications();
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<PageResponse<Notification> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (!authenticated) return;

    const controller = new AbortController();

    async function loadNotifications() {
      setLoading(true);
      setError("");
      try {
        const response = await notificationService.list({
          page,
          size: PAGE_SIZE,
        });
        setResult(response);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Không thể tải thông báo. Vui lòng thử lại.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadNotifications();
    return () => controller.abort();
  }, [authenticated, page, retry]);

  const retryLoading = useCallback(() => {
    setLoading(true);
    setRetry((current) => current + 1);
  }, []);

  async function handleMarkRead(notification: Notification) {
    if (notification.read) return;
    setActionError("");
    setResult((current) =>
      current
        ? {
            ...current,
            content: current.content.map((entry) =>
              entry.id === notification.id ? { ...entry, read: true } : entry,
            ),
          }
        : current,
    );
    try {
      await markRead(notification.id);
    } catch (requestError) {
      setResult((current) =>
        current
          ? {
              ...current,
              content: current.content.map((entry) =>
                entry.id === notification.id ? { ...entry, read: false } : entry,
              ),
            }
          : current,
      );
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể cập nhật trạng thái thông báo.",
      );
    }
  }

  async function handleMarkAllRead() {
    if (!result?.content.some((notification) => !notification.read)) return;
    const previous = result;
    setActionError("");
    setResult((current) =>
      current
        ? {
            ...current,
            content: current.content.map((notification) => ({ ...notification, read: true })),
          }
        : current,
    );

    try {
      await markAllRead();
    } catch (requestError) {
      setResult(previous);
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể đánh dấu tất cả đã đọc.",
      );
    }
  }

  const pageCount = result?.totalPages ?? 0;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="UniLend - về trang chủ">
          <span className={styles.brandMark} aria-hidden="true">U</span>
          <span>uni<span className={styles.brandAccent}>lend</span></span>
        </Link>
        <Link className={styles.backLink} href="/">Về trang chủ</Link>
      </header>

      <section className={styles.content} aria-labelledby="notifications-title">
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>Cập nhật từ UniLend</span>
            <h1 id="notifications-title">Thông báo</h1>
            <p>Theo dõi các cập nhật mới nhất liên quan đến hoạt động của bạn.</p>
          </div>
          {authenticated && result?.content.some((notification) => !notification.read) && (
            <button className={styles.secondaryButton} onClick={handleMarkAllRead} type="button">
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>

        {!authenticated ? (
          <div className={styles.statePanel}>
            <h2>Đăng nhập để xem thông báo</h2>
            <p>Thông báo được liên kết với tài khoản của bạn.</p>
            <Link className={styles.primaryButton} href="/login">Đăng nhập</Link>
          </div>
        ) : error ? (
          <div className={styles.statePanel} role="alert">
            <h2>Không thể tải thông báo</h2>
            <p>{error}</p>
            <button className={styles.primaryButton} onClick={retryLoading} type="button">
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className={styles.notificationList} aria-label="Đang tải thông báo" aria-busy="true">
            {Array.from({ length: 5 }, (_, index) => (
              <div className={styles.skeleton} key={index} />
            ))}
          </div>
        ) : result?.content.length ? (
          <>
            {actionError && <p className={styles.actionError} role="alert">{actionError}</p>}
            <ul className={styles.notificationList}>
              {result.content.map((notification) => (
                <li key={notification.id}>
                  <article className={`${styles.notification}${notification.read ? "" : ` ${styles.unread}`}`}>
                    <span className={styles.indicator} aria-hidden="true" />
                    <div className={styles.notificationBody}>
                      <h2>
                        <button
                          className={styles.titleButton}
                          onClick={() => void handleMarkRead(notification)}
                          type="button"
                        >
                          {notification.title}
                        </button>
                      </h2>
                      <p>{notification.message}</p>
                      <time dateTime={notification.createdAt}>
                        {formatDate(notification.createdAt)}
                      </time>
                    </div>
                    {!notification.read && (
                      <button
                        className={styles.readButton}
                        onClick={() => void handleMarkRead(notification)}
                        type="button"
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}
                    {getNotificationHref(notification.link) && (
                      <Link className={styles.openLink} href={getNotificationHref(notification.link) ?? "/notifications"}>
                        Mở
                      </Link>
                    )}
                  </article>
                </li>
              ))}
            </ul>
            {pageCount > 1 && (
              <nav className={styles.pagination} aria-label="Phân trang thông báo">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((current) => Math.max(0, current - 1))}
                  type="button"
                >
                  ← Trước
                </button>
                <span aria-live="polite">Trang {page + 1} / {pageCount}</span>
                <button
                  disabled={page >= pageCount - 1}
                  onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
                  type="button"
                >
                  Sau →
                </button>
              </nav>
            )}
          </>
        ) : (
          <div className={styles.statePanel}>
            <span className={styles.emptyIcon} aria-hidden="true">♧</span>
            <h2>Không có thông báo nào</h2>
            <p>Khi có cập nhật mới, thông báo sẽ xuất hiện ở đây.</p>
          </div>
        )}
      </section>
    </main>
  );
}
