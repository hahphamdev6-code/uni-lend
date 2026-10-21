"use client";

import { useState, type FormEvent } from "react";
import type { Category } from "../lib/api/types";
import type { CategoryInput } from "../lib/api/categoryService";
import { AdminModal } from "./admin-modal";

type CategoryFormProps = {
  category: Category | null;
  categories: Category[];
  isSaving: boolean;
  serverError: string;
  onCancel: () => void;
  onSave: (input: CategoryInput) => void;
};

type FieldErrors = {
  name?: string;
  description?: string;
};

function normalizeName(value: string): string {
  return value.toLocaleLowerCase("vi");
}

export function CategoryForm({
  category,
  categories,
  isSaving,
  serverError,
  onCancel,
  onSave,
}: CategoryFormProps) {
  const initialName = category?.name ?? "";
  const initialDescription = category?.description ?? "";
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const isDirty =
    name !== initialName || description !== initialDescription;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const nextErrors: FieldErrors = {};

    if (!trimmedName) nextErrors.name = "Vui lòng nhập tên danh mục.";
    else if (trimmedName.length > 100) {
      nextErrors.name = "Tên danh mục không được vượt quá 100 ký tự.";
    } else if (
      categories.some(
        (item) =>
          item.id !== category?.id &&
          normalizeName(item.name) === normalizeName(trimmedName),
      )
    ) {
      nextErrors.name = "Tên danh mục này đã tồn tại.";
    }
    if (trimmedDescription.length > 255) {
      nextErrors.description = "Mô tả không được vượt quá 255 ký tự.";
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSave({ name: trimmedName, description: trimmedDescription });
  }

  const titleId = "category-form-title";

  return (
    <AdminModal onClose={onCancel} titleId={titleId}>
      <h2 id={titleId}>{category ? "Chỉnh sửa danh mục" : "Thêm danh mục"}</h2>
      <form className="admin-category-form" onSubmit={handleSubmit}>
        {serverError && <p className="form-alert" role="alert">{serverError}</p>}
        <div className="form-field">
          <label htmlFor="category-name">Tên danh mục</label>
          <input
            autoFocus
            aria-describedby={fieldErrors.name ? "category-name-error" : undefined}
            aria-invalid={Boolean(fieldErrors.name)}
            className="admin-form-input"
            id="category-name"
            maxLength={100}
            onChange={(event) => setName(event.target.value)}
            value={name}
          />
          {fieldErrors.name && (
            <span className="field-error" id="category-name-error">{fieldErrors.name}</span>
          )}
        </div>
        <div className="form-field">
          <label htmlFor="category-description">Mô tả</label>
          <textarea
            aria-describedby={
              fieldErrors.description ? "category-description-error" : undefined
            }
            aria-invalid={Boolean(fieldErrors.description)}
            className="admin-form-input admin-form-textarea"
            id="category-description"
            maxLength={255}
            onChange={(event) => setDescription(event.target.value)}
            value={description}
          />
          {fieldErrors.description && (
            <span className="field-error" id="category-description-error">
              {fieldErrors.description}
            </span>
          )}
        </div>
        <div className="admin-modal-actions">
          <button
            className="admin-secondary-button"
            disabled={isSaving}
            onClick={onCancel}
            type="button"
          >
            Hủy
          </button>
          <button
            className="admin-primary-button"
            disabled={isSaving || !isDirty}
            type="submit"
          >
            {isSaving ? "Đang lưu..." : category ? "Lưu thay đổi" : "Thêm danh mục"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
