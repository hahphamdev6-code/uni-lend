"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAdminToast } from "./admin-toast";
import { ItemImageUpload } from "./item-image-upload";
import { NotificationBell } from "./notification-bell";
import { useAuth } from "./auth-provider";
import { categoryService } from "../lib/api/categoryService";
import { itemService } from "../lib/api/itemService";
import type { Category, Item, ItemInput } from "../lib/api/types";
import styles from "./item-form.module.css";

type FormErrors = {
  title?: string;
  description?: string;
};

export function ItemForm({ itemId }: { itemId: number | null }) {
  const router = useRouter();
  const auth = useAuth();
  const { showToast } = useAdminToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryError, setCategoryError] = useState("");
  const [item, setItem] = useState<Item | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Item["status"]>("AVAILABLE");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const editing = itemId !== null;

  useEffect(() => {
    if (auth.status === "unauthenticated") router.replace("/login");
  }, [auth.status, router]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        setCategories(await categoryService.list({ signal: controller.signal }));
      } catch (loadCategoriesError) {
        if (controller.signal.aborted) return;
        setCategoryError(
          loadCategoriesError instanceof Error
            ? loadCategoriesError.message
            : "Không thể tải danh mục.",
        );
      }
    }

    void loadCategories();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!editing || itemId == null) return;
    const safeItemId = itemId;
    if (!Number.isSafeInteger(safeItemId) || safeItemId < 1) return;
    const controller = new AbortController();

    async function loadItem() {
      setLoadError("");
      try {
        const result = await itemService.getById(safeItemId, { signal: controller.signal });
        setItem(result);
        setTitle(result.title);
        setDescription(result.description ?? "");
        setCategoryId(result.category ? String(result.category.id) : "");
        setStatus(result.status);
      } catch (loadItemError) {
        if (controller.signal.aborted) return;
        setLoadError(
          loadItemError instanceof Error ? loadItemError.message : "Không thể tải thông tin món đồ.",
        );
      }
    }

    void loadItem();
    return () => controller.abort();
  }, [editing, itemId]);

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};
    const trimmedTitle = title.trim();
    if (!trimmedTitle) nextErrors.title = "Vui lòng nhập tên món đồ.";
    else if (trimmedTitle.length > 150) nextErrors.title = "Tên món đồ tối đa 150 ký tự.";

    if (description.length > 5000) {
      nextErrors.description = "Mô tả tối đa 5000 ký tự.";
    }
    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setSaveError("");
    if (Object.keys(nextErrors).length > 0) return;

    const input: ItemInput = {
      title: title.trim(),
      description: description.trim(),
      ...(categoryId ? { categoryId: Number(categoryId) } : {}),
      ...(editing && status !== "LENT_OUT" ? { status } : {}),
    };

    setSubmitting(true);
    try {
      if (editing && itemId !== null) {
        await itemService.update(itemId, input);
        if (imageFiles.length > 0) await itemService.uploadImages(itemId, imageFiles);
        showToast("success", "Đã cập nhật món đồ.");
      } else {
        const createdItem = await itemService.create(input);
        if (imageFiles.length > 0) {
          try {
            await itemService.uploadImages(createdItem.id, imageFiles);
          } catch (uploadError) {
            showToast(
              "error",
              `Đã đăng món đồ nhưng tải ảnh thất bại: ${
                uploadError instanceof Error ? uploadError.message : "Vui lòng thử tải ảnh lại."
              }`,
            );
            router.push(`/items/${createdItem.id}/edit`);
            return;
          }
        }
        showToast("success", "Đã đăng món đồ mới.");
      }
      router.push("/my");
    } catch (saveError) {
      setSaveError(saveError instanceof Error ? saveError.message : "Không thể lưu món đồ.");
    } finally {
      setSubmitting(false);
    }
  }

  const invalidItemId = editing && (!Number.isSafeInteger(itemId) || (itemId ?? 0) < 1);
  const loadingItem = editing && !item && !loadError && !invalidItemId;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="UniLend - về trang chủ">
          <span className={styles.brandMark} aria-hidden="true">U</span>
          <span>uni<span className={styles.brandAccent}>lend</span></span>
        </Link>
        <div className={styles.headerActions}>
          <NotificationBell />
          <Link className={styles.backLink} href="/my">Quản lý cá nhân</Link>
        </div>
      </header>

      <section className={styles.content}>
        <Link className={styles.backText} href="/my">← Quay lại quản lý cá nhân</Link>
        <div className={styles.formHeading}>
          <span className={styles.eyebrow}>{editing ? "Cập nhật thông tin" : "Chia sẻ cùng cộng đồng"}</span>
          <h1>{editing ? "Sửa món đồ" : "Đăng đồ mới"}</h1>
          <p>{editing ? "Cập nhật thông tin để mọi người hiểu rõ hơn về món đồ." : "Thêm thông tin món đồ để bạn bè quanh trường có thể tìm thấy."}</p>
        </div>

        {auth.status === "loading" || auth.status === "unauthenticated" || loadingItem ? (
          <div className={styles.formSkeleton} aria-label="Đang tải thông tin" aria-busy="true">
            <span className={styles.visuallyHidden} role="status">Đang tải thông tin</span>
            <div className={`${styles.skeletonLine} ${styles.skeletonHeading}`} />
            <div className={`${styles.skeletonLine} ${styles.skeletonLabel}`} />
            <div className={`${styles.skeletonLine} ${styles.skeletonField}`} />
            <div className={`${styles.skeletonLine} ${styles.skeletonLabel}`} />
            <div className={`${styles.skeletonLine} ${styles.skeletonArea}`} />
            <div className={`${styles.skeletonLine} ${styles.skeletonField}`} />
          </div>
        ) : auth.status === "error" ? (
          <div className={styles.statePanel} role="alert">{auth.error}</div>
        ) : invalidItemId ? (
          <div className={styles.statePanel} role="alert">
            <p>Mã món đồ không hợp lệ hoặc món đồ không còn tồn tại.</p>
            <Link className={styles.secondaryButton} href="/my">Quay lại đồ của tôi</Link>
          </div>
        ) : loadError ? (
          <div className={styles.statePanel} role="alert">
            <p>{loadError}</p>
            <Link className={styles.secondaryButton} href="/my">Quay lại đồ của tôi</Link>
          </div>
        ) : (
          <form className={styles.formCard} noValidate onSubmit={handleSubmit}>
            {saveError && <p className={styles.formError} role="alert">{saveError}</p>}
            <div className={styles.formSectionHeading}>
              <span className={styles.step}>01</span>
              <div>
                <h2>Thông tin món đồ</h2>
                <p>Các trường có dấu * là bắt buộc.</p>
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="item-title">Tên món đồ <span aria-hidden="true">*</span></label>
              <input
                aria-describedby={errors.title ? "title-error" : "title-count"}
                aria-invalid={Boolean(errors.title)}
                autoComplete="off"
                id="item-title"
                maxLength={150}
                placeholder="Ví dụ: Máy chiếu mini"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  if (errors.title) setErrors((current) => ({ ...current, title: undefined }));
                }}
              />
              <div className={styles.fieldFooter}>
                {errors.title
                  ? <span className={styles.fieldError} id="title-error">{errors.title}</span>
                  : <span />}
                <span className={styles.characterCount} id="title-count">{title.length}/150</span>
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="item-description">Mô tả</label>
              <textarea
                aria-describedby={errors.description ? "description-error" : "description-count"}
                aria-invalid={Boolean(errors.description)}
                id="item-description"
                maxLength={5000}
                placeholder="Mô tả tình trạng, cách sử dụng hoặc lưu ý khi mượn..."
                rows={5}
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                  if (errors.description) setErrors((current) => ({ ...current, description: undefined }));
                }}
              />
              <div className={styles.fieldFooter}>
                {errors.description
                  ? <span className={styles.fieldError} id="description-error">{errors.description}</span>
                  : <span />}
                <span className={styles.characterCount} id="description-count">{description.length}/5000</span>
              </div>
            </div>

            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label htmlFor="item-category">Danh mục</label>
                <select
                  id="item-category"
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  disabled={Boolean(categoryError)}
                >
                  <option value="">Chưa phân loại</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                {categoryError && <p className={styles.fieldError} role="alert">{categoryError}</p>}
              </div>

              {editing && (
                <div className={styles.field}>
                  <label htmlFor="item-status">Trạng thái</label>
                  <select
                    id="item-status"
                    value={status}
                    disabled={status === "LENT_OUT"}
                    onChange={(event) => {
                      const nextStatus = event.target.value;
                      if (nextStatus === "AVAILABLE" || nextStatus === "UNAVAILABLE") {
                        setStatus(nextStatus);
                      }
                    }}
                  >
                    <option value="AVAILABLE">Có thể mượn</option>
                    <option value="UNAVAILABLE">Tạm ngưng</option>
                    {status === "LENT_OUT" && <option value="LENT_OUT">Đang được mượn</option>}
                  </select>
                  {status === "LENT_OUT" && (
                    <p className={styles.fieldHint}>Không thể đổi trạng thái khi món đồ đang được mượn.</p>
                  )}
                </div>
              )}
            </div>

            <div className={styles.imageUpload}>
              <ItemImageUpload
                disabled={submitting}
                existingImages={item?.imageUrls ?? []}
                maxImages={5}
                onChange={setImageFiles}
                onRemoveExisting={(imageUrl) => {
                  if (!item) return;
                  const image = item.images.find((entry) => entry.imageUrl === imageUrl);
                  if (!image) {
                    showToast("error", "Không tìm thấy thông tin ảnh để xóa. Vui lòng tải lại trang.");
                    return;
                  }
                  void itemService.deleteImage(item.id, image.id)
                    .then(setItem)
                    .catch((deleteError: unknown) => {
                      showToast(
                        "error",
                        deleteError instanceof Error ? deleteError.message : "Không thể xóa ảnh.",
                      );
                    });
                }}
                value={imageFiles}
              />
            </div>

            <div className={styles.formActions}>
              <Link className={styles.cancelLink} href="/my">Hủy</Link>
              <button className={styles.submitButton} disabled={submitting} type="submit">
                {submitting ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Đăng món đồ"}
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
