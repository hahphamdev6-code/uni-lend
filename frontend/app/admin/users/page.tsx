"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AdminNavigation } from "../../../components/admin-navigation";
import { ConfirmModal } from "../../../components/confirm-modal";
import { useAdminToast } from "../../../components/admin-toast";
import { useAuth } from "../../../components/auth-provider";
import { adminUserService, type AdminUser } from "../../../lib/api/adminUserService";
import { ApiClientError } from "../../../lib/api/apiClient";
import type { PageResponse } from "../../../lib/api/types";
import styles from "../admin-page.module.css";

const PAGE_SIZE = 10;

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(date);
}

function isAuthorizationFailure(error: unknown): boolean {
  return error instanceof ApiClientError &&
    (error.statusCode === 401 || error.statusCode === 403);
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
  const mountedRef = useRef(true);
  const savingRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(query.trim());
      setPage(0);
    }, 350);
    return () => window.clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    if (auth.status !== "authenticated" || !auth.hasRole("ADMIN")) return;

    const controller = new AbortController();
    let active = true;
    async function loadUsers() {
      setLoading(true);
      setError("");
      try {
        const response = await adminUserService.list(
          { keyword: search || undefined, page, size: PAGE_SIZE },
          { signal: controller.signal },
        );
        if (active) setResult(response);
      } catch (requestError) {
        if (!active || controller.signal.aborted || isAuthorizationFailure(requestError)) {
          return;
        }
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Không thể tải danh sách người dùng.",
        );
      } finally {
        if (active && !controller.signal.aborted) setLoading(false);
      }
    }

    void loadUsers();
    return () => {
      active = false;
      controller.abort();
    };
  }, [auth, page, retry, search]);

  const retryLoading = useCallback(() => setRetry((current) => current + 1), []);
  const clearSearch = useCallback(() => setQuery(""), []);

  async function confirmToggleStatus() {
    if (!pendingUser || savingRef.current) return;
    if (auth.status !== "authenticated" || !auth.hasRole("ADMIN")) {
      setPendingUser(null);
      return;
    }

    savingRef.current = true;
    setSaving(true);
    const wasEnabled = pendingUser.enabled;
    try {
      const updatedUser = await adminUserService.setEnabled(
        pendingUser.id,
        !wasEnabled,
      );
      if (!mountedRef.current) return;
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
      showToast(
        "success",
        `Đã ${updatedUser.enabled ? "mở khóa" : "khóa"} tài khoản ${updatedUser.email}.`,
      );
      setPendingUser(null);
    } catch (requestError) {
      if (!mountedRef.current || isAuthorizationFailure(requestError)) return;
      const action = wasEnabled ? "khóa" : "mở khóa";
      const detail = requestError instanceof Error
        ? requestError.message
        : "Vui lòng thử lại.";
      showToast(
        "error",
        `Không thể ${action} tài khoản ${pendingUser.email}. ${detail}`,
      );
    } finally {
      savingRef.current = false;
      if (mountedRef.current) setSaving(false);
    }
  }

  const pageCount = result?.totalPages ?? 0;
  const isSearching = query.trim().length > 0;

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
          <div className="admin-search-control">
            <input
              className={styles.search}
              id="user-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              type="search"
              value={query}
            />
            {query && (
              <button
                aria-label="Xóa từ khóa tìm kiếm"
                className="admin-clear-search"
                onClick={clearSearch}
                type="button"
              >
                Xóa
              </button>
            )}
          </div>
          <span className={styles.count} aria-live="polite">
            {result ? `${result.totalElements} kết quả` : ""}
          </span>
        </div>

        {error ? (
          <div className={styles.state}>
            <p className="form-alert" role="alert">{error}</p>
            <button className={styles.button} onClick={retryLoading} type="button">
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div
            className={styles.tableWrap}
            aria-label="Đang tải người dùng"
            aria-busy="true"
            role="status"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <div className={styles.skeleton} key={index} />
            ))}
          </div>
        ) : result?.content.length ? (
          <>
            <div className={styles.tableWrap}>
              <table
                className={`${styles.table} admin-users-table`}
                aria-label="Danh sách người dùng"
              >
                <caption className={styles.visuallyHidden}>Danh sách tài khoản người dùng</caption>
                <thead>
                  <tr>
                    <th scope="col">Người dùng</th>
                    <th scope="col">Email</th>
                    <th scope="col">Vai trò</th>
                    <th scope="col">Trạng thái</th>
                    <th scope="col">Ngày tạo</th>
                    <th scope="col"><span className={styles.visuallyHidden}>Thao tác</span></th>
                  </tr>
                </thead>
                <tbody>
                  {result.content.map((user) => {
                    const isSelf =
                      auth.status === "authenticated" &&
                      user.email.trim().toLocaleLowerCase("vi") ===
                        auth.user.email.trim().toLocaleLowerCase("vi");
                    const locked = !user.enabled;
                    const helpId = `user-action-help-${user.id}`;

                    return (
                      <tr key={user.id}>
                        <td>
                          <span className="admin-user-identity">
                            <span className="admin-user-avatar" aria-hidden="true">
                              {user.fullName.trim().charAt(0).toLocaleUpperCase("vi") || "?"}
                            </span>
                            <span className={styles.primaryText}>{user.fullName}</span>
                          </span>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.roles.join(", ") || "USER"}</td>
                        <td>
                          <span className={`${styles.status} ${locked ? styles.statusLocked : styles.statusActive}`}>
                            {locked ? "Đã khóa" : "Hoạt động"}
                          </span>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          {isSelf && user.enabled ? (
                            <span className="admin-self-action" title="Bạn không thể tự khóa tài khoản của mình.">
                              <button
                                aria-describedby={helpId}
                                className={styles.dangerButton}
                                disabled
                                type="button"
                              >
                                Khóa
                              </button>
                              <span className={styles.visuallyHidden} id={helpId}>
                                Bạn không thể tự khóa tài khoản của mình.
                              </span>
                            </span>
                          ) : (
                            <button
                              className={locked ? styles.secondaryButton : styles.dangerButton}
                              onClick={() => setPendingUser(user)}
                              type="button"
                            >
                              {locked ? "Mở khóa" : "Khóa"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {pageCount > 1 && (
              <nav className={styles.pagination} aria-label="Phân trang người dùng">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((value) => Math.max(0, value - 1))}
                  type="button"
                >
                  ← Trước
                </button>
                <span>Trang {page + 1} / {pageCount}</span>
                <button
                  disabled={page >= pageCount - 1}
                  onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}
                  type="button"
                >
                  Sau →
                </button>
              </nav>
            )}
          </>
        ) : (
          <div className="empty-state" role="status">
            <h3>{isSearching ? "Không tìm thấy kết quả" : "Chưa có tài khoản"}</h3>
            <p>
              {isSearching
                ? "Không có người dùng phù hợp với từ khóa này."
                : "Hiện chưa có tài khoản người dùng nào."}
            </p>
          </div>
        )}
      </section>

      {pendingUser && (
        <ConfirmModal
          confirmLabel={pendingUser.enabled ? "Xác nhận khóa" : "Xác nhận mở khóa"}
          description={
            <>
              {pendingUser.enabled
                ? "Người dùng sẽ không thể đăng nhập cho đến khi được mở khóa. Tài khoản: "
                : "Người dùng sẽ có thể đăng nhập trở lại. Tài khoản: "}
              <strong>{pendingUser.fullName}</strong> ({pendingUser.email})
            </>
          }
          destructive={pendingUser.enabled}
          isPending={saving}
          onCancel={() => {
            if (!saving) setPendingUser(null);
          }}
          onConfirm={() => void confirmToggleStatus()}
          pendingLabel={pendingUser.enabled ? "Đang khóa..." : "Đang mở khóa..."}
          title={pendingUser.enabled ? "Khóa tài khoản này?" : "Mở khóa tài khoản này?"}
        />
      )}
    </main>
  );
}
