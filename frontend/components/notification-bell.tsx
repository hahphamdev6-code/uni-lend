"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useNotifications } from "./notifications-provider";
import styles from "./notification-bell.module.css";

function formatNotificationDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Vừa xong";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function getNotificationHref(link?: string | null): string {
  return link?.startsWith("/") && !link.startsWith("//") ? link : "/notifications";
}

export function NotificationBell() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [actionError, setActionError] = useState("");
  const {
    notifications,
    unreadCount,
    loading,
    error,
    authenticated,
    refresh,
    markRead,
    markAllRead,
  } = useNotifications();
  const recentNotifications = notifications.slice(0, 5);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function openNotification(id: number, isRead: boolean, href: string) {
    setActionError("");
    try {
      if (!isRead) await markRead(id);
      setOpen(false);
      router.push(href);
    } catch (actionError) {
      setActionError(
        actionError instanceof Error
          ? actionError.message
          : "Không thể cập nhật trạng thái thông báo.",
      );
    }
  }

  async function handleMarkAllRead() {
    setActionError("");
    try {
      await markAllRead();
    } catch (actionError) {
      setActionError(
        actionError instanceof Error
          ? actionError.message
          : "Không thể đánh dấu thông báo đã đọc.",
      );
    }
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        aria-controls="notifications-menu"
        aria-expanded={open}
        aria-label={unreadCount > 0 ? `Thông báo, ${unreadCount} chưa đọc` : "Thông báo"}
        className={styles.bellButton}
        onClick={() => {
          setOpen((current) => !current);
          setActionError("");
        }}
        type="button"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className={styles.badge} aria-hidden="true">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section
          className={styles.dropdown}
          id="notifications-menu"
          aria-label="Thông báo gần đây"
        >
          <header className={styles.dropdownHeader}>
            <div>
              <h2>Thông báo</h2>
              {authenticated && <span>{unreadCount} chưa đọc</span>}
            </div>
            {authenticated && unreadCount > 0 && (
              <button className={styles.textButton} onClick={handleMarkAllRead} type="button">
                Đánh dấu đã đọc
              </button>
            )}
          </header>

          {!authenticated ? (
            <div className={styles.messageState}>
              <p>Đăng nhập để xem thông báo của bạn.</p>
              <Link href="/login" onClick={() => setOpen(false)}>Đăng nhập</Link>
            </div>
          ) : error ? (
            <div className={styles.messageState} role="alert">
              <p>{error}</p>
              <button className={styles.textButton} onClick={() => void refresh()} type="button">
                Thử lại
              </button>
            </div>
          ) : loading && recentNotifications.length === 0 ? (
            <div className={styles.skeletonList} aria-label="Đang tải thông báo" aria-busy="true">
              <span /><span /><span />
            </div>
          ) : recentNotifications.length === 0 ? (
            <p className={styles.messageState}>Không có thông báo nào.</p>
          ) : (
            <ul className={styles.list}>
              {recentNotifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    className={`${styles.notification}${notification.read ? "" : ` ${styles.unread}`}`}
                    onClick={() =>
                      void openNotification(
                        notification.id,
                        notification.read,
                        getNotificationHref(notification.link),
                      )
                    }
                    type="button"
                  >
                    <span className={styles.unreadIndicator} aria-hidden="true" />
                    <span className={styles.notificationCopy}>
                      <strong>{notification.title}</strong>
                      <span className={styles.message}>{notification.message}</span>
                      <time dateTime={notification.createdAt}>
                        {formatNotificationDate(notification.createdAt)}
                      </time>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {actionError && <p className={styles.actionError} role="alert">{actionError}</p>}
          <footer className={styles.dropdownFooter}>
            <Link href="/notifications" onClick={() => setOpen(false)}>
              Xem tất cả thông báo
            </Link>
          </footer>
        </section>
      )}
    </div>
  );
}
