"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AdminNavigation } from "../../../components/admin-navigation";
import { CategoryForm } from "../../../components/category-form";
import { ConfirmModal } from "../../../components/confirm-modal";
import { useAdminToast } from "../../../components/admin-toast";
import { useAuth } from "../../../components/auth-provider";
import {
  categoryService,
  type CategoryInput,
} from "../../../lib/api/categoryService";
import { ApiClientError } from "../../../lib/api/apiClient";
import type { Category, PageResponse } from "../../../lib/api/types";
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

export default function AdminCategoriesPage() {
  const auth = useAuth();
  const { showToast } = useAdminToast();
  const [result, setResult] = useState<PageResponse<Category> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
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
    const controller = new AbortController();
    let active = true;
    async function loadCategories() {
      setLoading(true);
      setError("");
      try {
        const response = await categoryService.list(
          { page, size: PAGE_SIZE },
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
            : "Không thể tải danh sách danh mục.",
        );
      } finally {
        if (active && !controller.signal.aborted) setLoading(false);
      }
    }

    void loadCategories();
    return () => {
      active = false;
      controller.abort();
    };
  }, [page, retry]);

  const retryLoading = useCallback(() => setRetry((current) => current + 1), []);
  const categories = result?.content ?? [];

  function openCreateDialog() {
    setEditingCategory(null);
    setFormError("");
    setFormOpen(true);
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category);
    setFormError("");
    setFormOpen(true);
  }

  function closeFormDialog() {
    if (saving) return;
    setFormOpen(false);
    setFormError("");
  }

  async function handleSave(input: CategoryInput) {
    if (savingRef.current) return;
    if (auth.status !== "authenticated" || !auth.hasRole("ADMIN")) return;

    const categoryBeingEdited = editingCategory;
    savingRef.current = true;
    setSaving(true);
    setFormError("");
    try {
      if (categoryBeingEdited) {
        const updated = await categoryService.update(categoryBeingEdited.id, input);
        if (!mountedRef.current) return;
        setResult((current) =>
          current
            ? {
                ...current,
                content: current.content
                  .map((category) => category.id === updated.id ? updated : category)
                  .sort((left, right) => left.name.localeCompare(right.name, "vi")),
              }
            : current,
        );
        showToast("success", `Đã cập nhật danh mục ${updated.name}.`);
      } else {
        const created = await categoryService.create(input);
        if (!mountedRef.current) return;
        setPage(0);
        setResult((current) => {
          if (!current || page !== 0) return current;
          return {
            ...current,
            content: [...current.content, created]
              .sort((left, right) => left.name.localeCompare(right.name, "vi"))
              .slice(0, PAGE_SIZE),
            totalElements: current.totalElements + 1,
          };
        });
        showToast("success", `Đã thêm danh mục ${created.name}.`);
      }
      setFormOpen(false);
      setEditingCategory(null);
      setRetry((current) => current + 1);
    } catch (requestError) {
      if (!mountedRef.current || isAuthorizationFailure(requestError)) return;
      const action = categoryBeingEdited ? "cập nhật" : "thêm";
      const detail = requestError instanceof Error
        ? requestError.message
        : "Vui lòng thử lại.";
      const message = `Không thể ${action} danh mục ${input.name}. ${detail}`;
      setFormError(message);
      showToast("error", message);
    } finally {
      savingRef.current = false;
      if (mountedRef.current) setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingCategory || savingRef.current) return;
    if (auth.status !== "authenticated" || !auth.hasRole("ADMIN")) return;

    const categoryToDelete = deletingCategory;
    savingRef.current = true;
    setSaving(true);
    try {
      await categoryService.delete(categoryToDelete.id);
      if (!mountedRef.current) return;
      setResult((current) =>
        current
          ? {
              ...current,
              content: current.content.filter(
                (category) => category.id !== categoryToDelete.id,
              ),
              totalElements: Math.max(0, current.totalElements - 1),
            }
          : current,
      );
      showToast("success", `Đã xóa danh mục ${categoryToDelete.name}.`);
      setDeletingCategory(null);
      const remainingElements = Math.max(0, (result?.totalElements ?? 1) - 1);
      const lastPage = Math.max(0, Math.ceil(remainingElements / PAGE_SIZE) - 1);
      setPage((current) => Math.min(current, lastPage));
      setRetry((current) => current + 1);
    } catch (requestError) {
      if (!mountedRef.current || isAuthorizationFailure(requestError)) return;
      const detail = requestError instanceof Error
        ? requestError.message
        : "Vui lòng thử lại.";
      showToast(
        "error",
        `Không thể xóa danh mục ${categoryToDelete.name}. ${detail}`,
      );
    } finally {
      savingRef.current = false;
      if (mountedRef.current) setSaving(false);
    }
  }

  const pageCount = result?.totalPages ?? 0;

  return (
    <main className={styles.page}>
      <AdminNavigation />
      <section className={styles.content} aria-labelledby="categories-title">
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>Quản trị nội dung</span>
            <h1 id="categories-title">Danh mục</h1>
            <p>Tạo và cập nhật danh mục dùng để phân loại món đồ.</p>
          </div>
          <button
            className={styles.button}
            onClick={openCreateDialog}
            type="button"
          >
            + Thêm danh mục
          </button>
        </div>

        {!error && result && (
          <p className={styles.count} aria-live="polite">
            {result.totalElements} danh mục
          </p>
        )}

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
            aria-label="Đang tải danh mục"
            aria-busy="true"
            role="status"
          >
            {Array.from({ length: 5 }, (_, index) => (
              <div className={styles.skeleton} key={index} />
            ))}
          </div>
        ) : categories.length ? (
          <>
            <div className={styles.tableWrap}>
              <table
                className={`${styles.table} admin-categories-table`}
                aria-label="Danh sách danh mục"
              >
                <caption className={styles.visuallyHidden}>Danh sách danh mục</caption>
                <thead>
                  <tr>
                    <th scope="col">Tên danh mục</th>
                    <th scope="col">Mô tả</th>
                    <th scope="col">Ngày tạo</th>
                    <th scope="col"><span className={styles.visuallyHidden}>Thao tác</span></th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td><span className={styles.primaryText}>{category.name}</span></td>
                      <td>
                        {category.description || (
                          <span className={styles.secondaryText}>Chưa có mô tả</span>
                        )}
                      </td>
                      <td>{formatDate(category.createdAt)}</td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={styles.secondaryButton}
                            onClick={() => openEditDialog(category)}
                            type="button"
                          >
                            Sửa
                          </button>
                          <button
                            className={styles.dangerButton}
                            onClick={() => setDeletingCategory(category)}
                            type="button"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pageCount > 1 && (
              <nav className={styles.pagination} aria-label="Phân trang danh mục">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((current) => Math.max(0, current - 1))}
                  type="button"
                >
                  ← Trước
                </button>
                <span>Trang {page + 1} / {pageCount}</span>
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
          <div className="empty-state" role="status">
            <h3>Chưa có danh mục</h3>
            <p>Hãy thêm danh mục đầu tiên để phân loại món đồ.</p>
          </div>
        )}
      </section>

      {formOpen && (
        <CategoryForm
          key={editingCategory?.id ?? "new-category"}
          category={editingCategory}
          categories={categories}
          isSaving={saving}
          onCancel={closeFormDialog}
          onSave={(input) => void handleSave(input)}
          serverError={formError}
        />
      )}

      {deletingCategory && (
        <ConfirmModal
          confirmLabel="Xác nhận xóa"
          description={
            <>
              Bạn có chắc muốn xóa danh mục <strong>{deletingCategory.name}</strong>? Nếu danh
              mục đang được món đồ sử dụng, máy chủ có thể từ chối thao tác này.
            </>
          }
          destructive
          isPending={saving}
          onCancel={() => {
            if (!saving) setDeletingCategory(null);
          }}
          onConfirm={() => void handleDelete()}
          pendingLabel="Đang xóa..."
          title="Xóa danh mục?"
        />
      )}
    </main>
  );
}
