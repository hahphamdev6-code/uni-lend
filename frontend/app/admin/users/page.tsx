"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminNavigation } from "../../../components/admin-navigation";
import { ConfirmationDialog } from "../../../components/confirmation-dialog";
import { useAdminToast } from "../../../components/admin-toast";
import { useAuth } from "../../../components/auth-provider";
import { adminUserService, type AdminUser } from "../../../lib/api/adminUserService";
import type { PageResponse } from "../../../lib/api/types";
import styles from "../admin-page.module.css";

const PAGE_SIZE = 10;

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(date);
}

export default function AdminUsersPage() {
  const auth = useAuth();
  const { showToast } = useAdminToast();
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<PageResponse<AdminUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [pendingUser, setPendingUser] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch(query.trim());
      setPage(0);
    }, 250);
    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    if (auth.status !== "authenticated" || !auth.hasRole("ADMIN")) return;

    const controller = new AbortController();
    async function loadUsers() {
      setLoading(true);
      setError("");
      try {
        const response = await adminUserService.list(
          { keyword: search || undefined, page, size: PAGE_SIZE },
          { signal: controller.signal },
        );
        setResult(response);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        const message = requestError instanceof Error
          ? requestError.message
          : "Không thể tải danh sách người dùng.";
        setError(message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadUsers();
    return () => controller.abort();
  }, [auth, page, retry, search]);

  const retryLoading = useCallback(() => setRetry((current) => current + 1), []);

  async function confirmToggleStatus() {
    if (!pendingUser) return;
    if (auth.status !== "authenticated" || !auth.hasRole("ADMIN")) {
      showToast("error", "Bạn không có quyền quản lý tài khoản.");
      setPendingUser(null);
      return;
    }

    setSaving(true);
    try {
      const updatedUser = await adminUserService.setEnabled(pendingUser.id, !pendingUser.enabled);
      setResult((current) =>
        current
          ? {
            ...current,
            content: current.content.map((user) =>
              user.id === updatedUser.id ? updatedUser : user,
            ),
          }
          : current,
      );
      showToast("success", updatedUser.enabled ? "Đã mở khóa tài khoản." : "Đã khóa tài khoản.");
      setPendingUser(null);
    } catch (requestError) {
      showToast(
        "error",
        requestError instanceof Error
          ? requestError.message
          : "Không thể cập nhật trạng thái tài khoản.",
      );
    } finally {
      setSaving(false);
    }
  }

  const pageCount = result?.totalPages ?? 0;

  return (
    <main className={styles.page}>
      <AdminNavigation />
      <section className={styles.content} aria-labelledby="users-title">
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>Quản trị hệ thống</span>
            <h1 id="users-title">Người dùng</h1>
            <p>Tìm kiếm tài khoản và quản lý quyền truy cập.</p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <label className={styles.visuallyHidden} htmlFor="user-search">
            Tìm người dùng theo tên hoặc email
          </label>
          <input
            className={styles.search}
            id="user-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo tên hoặc email..."
            type="search"
            value={query}
          />
          <span className={styles.count} aria-live="polite">
            {result ? `${result.totalElements} tài khoản` : ""}
          </span>
        </div>

        {error ? (
          <div className={styles.state} role="alert">
            <p>{error}</p>
            <button className={styles.button} onClick={retryLoading} type="button">Thử lại</button>
          </div>
        ) : loading ? (
          <div className={styles.tableWrap} aria-label="Đang tải người dùng" aria-busy="true">
            {Array.from({ length: 6 }, (_, index) => <div className={styles.skeleton} key={index} />)}
          </div>
        ) : result?.content.length ? (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Người dùng</th>
                    <th scope="col">Vai trò</th>
                    <th scope="col">Trạng thái</th>
                    <th scope="col">Ngày tham gia</th>
                    <th scope="col"><span className={styles.visuallyHidden}>Thao tác</span></th>
                  </tr>
                </thead>
                <tbody>
                  {result.content.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <span className={styles.primaryText}>{user.fullName}</span>
                        <span className={styles.secondaryText}>{user.email}</span>
                      </td>
                      <td>{user.roles.join(", ") || "USER"}</td>
                      <td>
                        <span className={`${styles.status} ${user.enabled ? styles.statusActive : styles.statusLocked}`}>
                          {user.enabled ? "Hoạt động" : "Đã khóa"}
                        </span>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <button
                          className={user.enabled ? styles.dangerButton : styles.secondaryButton}
                          onClick={() => setPendingUser(user)}
                          type="button"
                        >
                          {user.enabled ? "Khóa" : "Mở khóa"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pageCount > 1 && (
              <nav className={styles.pagination} aria-label="Phân trang người dùng">
                <button disabled={page === 0} onClick={() => setPage((value) => Math.max(0, value - 1))} type="button">
                  ← Trước
                </button>
                <span>Trang {page + 1} / {pageCount}</span>
                <button disabled={page >= pageCount - 1} onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))} type="button">
                  Sau →
                </button>
              </nav>
            )}
          </>
        ) : (
          <div className={styles.empty}>
            {search ? "Không tìm thấy người dùng phù hợp với nội dung tìm kiếm." : "Chưa có tài khoản nào."}
          </div>
        )}
      </section>

      {pendingUser && (
        <ConfirmationDialog
          busy={saving}
          confirmLabel={pendingUser.enabled ? "Xác nhận khóa" : "Xác nhận mở khóa"}
          onCancel={() => setPendingUser(null)}
          onConfirm={() => void confirmToggleStatus()}
          pendingLabel="Đang xử lý..."
          title={pendingUser.enabled ? "Khóa tài khoản này?" : "Mở khóa tài khoản này?"}
          tone={pendingUser.enabled ? "danger" : "primary"}
        >
          {pendingUser.enabled ? "Tài khoản sẽ bị khóa: " : "Tài khoản sẽ được mở khóa: "}
          <strong>{pendingUser.fullName}</strong> ({pendingUser.email})
        </ConfirmationDialog>
      )}
    </main>
  );
}
