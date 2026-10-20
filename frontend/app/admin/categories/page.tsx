"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AdminNavigation } from "../../../components/admin-navigation";
import { useAdminToast } from "../../../components/admin-toast";
import { useAuth } from "../../../components/auth-provider";
import {
  categoryService,
  type CategoryInput,
} from "../../../lib/api/categoryService";
import type { Category } from "../../../lib/api/types";
import styles from "../admin-page.module.css";

type CategoryFormValues = {
  name: string;
  description: string;
};

const emptyForm: CategoryFormValues = { name: "", description: "" };

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(date);
}

export default function AdminCategoriesPage() {
  const auth = useAuth();
  const { showToast } = useAdminToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [formValues, setFormValues] = useState<CategoryFormValues>(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function loadCategories() {
      setLoading(true);
      setError("");
      try {
        const result = await categoryService.list({ signal: controller.signal });
        setCategories(result);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Không thể tải danh mục.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadCategories();
    return () => controller.abort();
  }, [retry]);

  const retryLoading = useCallback(() => setRetry((current) => current + 1), []);

  function openCreateDialog() {
    setEditingCategory(null);
    setFormValues(emptyForm);
    setFormError("");
    setFormOpen(true);
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category);
    setFormValues({ name: category.name, description: category.description ?? "" });
    setFormError("");
    setFormOpen(true);
  }

  function closeFormDialog() {
    if (saving) return;
    setFormOpen(false);
    setFormError("");
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (auth.status !== "authenticated" || !auth.hasRole("ADMIN")) {
      showToast("error", "Bạn không có quyền quản lý danh mục.");
      return;
    }

    const name = formValues.name.trim();
    const description = formValues.description.trim();
    if (!name) {
      setFormError("Vui lòng nhập tên danh mục.");
      return;
    }
    if (name.length > 100) {
      setFormError("Tên danh mục không được vượt quá 100 ký tự.");
      return;
    }
    if (description.length > 255) {
      setFormError("Mô tả không được vượt quá 255 ký tự.");
      return;
    }

    const input: CategoryInput = { name, description };
    setSaving(true);
    setFormError("");
    try {
      if (editingCategory) {
        const updated = await categoryService.update(editingCategory.id, input);
        setCategories((current) =>
          current.map((category) => category.id === updated.id ? updated : category)
            .sort((left, right) => left.name.localeCompare(right.name, "vi")),
        );
        showToast("success", "Đã cập nhật danh mục.");
      } else {
        const created = await categoryService.create(input);
        setCategories((current) =>
          [...current, created].sort((left, right) => left.name.localeCompare(right.name, "vi")),
        );
        showToast("success", "Đã tạo danh mục mới.");
      }
      setFormOpen(false);
      setEditingCategory(null);
      setFormValues(emptyForm);
    } catch (requestError) {
      setFormError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể lưu danh mục. Vui lòng thử lại.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingCategory) return;
    if (auth.status !== "authenticated" || !auth.hasRole("ADMIN")) {
      showToast("error", "Bạn không có quyền quản lý danh mục.");
      return;
    }

    setSaving(true);
    try {
      await categoryService.delete(deletingCategory.id);
      setCategories((current) => current.filter((category) => category.id !== deletingCategory.id));
      showToast("success", "Đã xóa danh mục.");
      setDeletingCategory(null);
    } catch (requestError) {
      showToast(
        "error",
        requestError instanceof Error
          ? requestError.message
          : "Không thể xóa danh mục. Danh mục có thể đang được sử dụng.",
      );
    } finally {
      setSaving(false);
    }
  }

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
          <button className={styles.button} onClick={openCreateDialog} type="button">
            + Thêm danh mục
          </button>
        </div>

        {error ? (
          <div className={styles.state} role="alert">
            <p>{error}</p>
            <button className={styles.button} onClick={retryLoading} type="button">Thử lại</button>
          </div>
        ) : loading ? (
          <div className={styles.tableWrap} aria-label="Đang tải danh mục" aria-busy="true">
            {Array.from({ length: 5 }, (_, index) => <div className={styles.skeleton} key={index} />)}
          </div>
        ) : categories.length ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
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
                    <td>{category.description || <span className={styles.secondaryText}>Chưa có mô tả</span>}</td>
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
        ) : (
          <div className={styles.state}>
            Chưa có danh mục nào. Tạo danh mục đầu tiên để bắt đầu.
          </div>
        )}
      </section>

      {formOpen && (
        <div className={styles.modalBackdrop}>
          <section
            aria-labelledby="category-form-title"
            aria-modal="true"
            className={styles.modal}
            role="dialog"
          >
            <h2 id="category-form-title">
              {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
            </h2>
            <form onSubmit={(event) => void handleSave(event)}>
              {formError && <p className={styles.formError} role="alert">{formError}</p>}
              <label className={styles.fieldLabel} htmlFor="category-name">Tên danh mục</label>
              <input
                autoFocus
                className={styles.input}
                id="category-name"
                maxLength={100}
                onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))}
                placeholder="Ví dụ: Học tập"
                value={formValues.name}
              />
              <label className={styles.fieldLabel} htmlFor="category-description">Mô tả</label>
              <textarea
                className={styles.textarea}
                id="category-description"
                maxLength={255}
                onChange={(event) => setFormValues((current) => ({ ...current, description: event.target.value }))}
                placeholder="Mô tả ngắn về danh mục"
                value={formValues.description}
              />
              <div className={styles.modalActions}>
                <button className={styles.secondaryButton} disabled={saving} onClick={closeFormDialog} type="button">
                  Hủy
                </button>
                <button className={styles.button} disabled={saving} type="submit">
                  {saving ? "Đang lưu..." : editingCategory ? "Lưu thay đổi" : "Tạo danh mục"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deletingCategory && (
        <div className={styles.modalBackdrop}>
          <section
            aria-labelledby="delete-category-title"
            aria-modal="true"
            className={styles.modal}
            role="dialog"
          >
            <h2 id="delete-category-title">Xóa danh mục?</h2>
            <p>
              Bạn có chắc muốn xóa <strong>{deletingCategory.name}</strong>? Nếu danh mục đang
              được món đồ sử dụng, máy chủ có thể từ chối thao tác này.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.secondaryButton}
                disabled={saving}
                onClick={() => setDeletingCategory(null)}
                type="button"
              >
                Hủy
              </button>
              <button className={styles.dangerButton} disabled={saving} onClick={() => void handleDelete()} type="button">
                {saving ? "Đang xóa..." : "Xác nhận xóa"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
