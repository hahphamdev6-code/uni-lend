"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ImageUploader, type ExistingImage } from "./ImageUploader";
import { categoryService } from "../lib/api/categoryService";
import { itemService } from "../lib/api/itemService";
import type { Category, Item, ItemInput } from "../lib/api/types";
import styles from "./ItemForm.module.css";

interface ItemFormProps {
  item?: Item;
}

export function ItemForm({ item }: ItemFormProps) {
  const router = useRouter();
  const [persistedItem, setPersistedItem] = useState<Item | null>(item ?? null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [categoryId, setCategoryId] = useState(
    item?.category ? String(item.category.id) : "",
  );
  const [files, setFiles] = useState<File[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function loadCategories() {
      try {
        setCategories(await categoryService.list({ signal: controller.signal }));
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Không thể tải danh mục món đồ.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingCategories(false);
      }
    }

    void loadCategories();
    return () => controller.abort();
  }, []);

  const currentItem = persistedItem;
  const isEditing = Boolean(currentItem);
  const currentImages: ExistingImage[] = (currentItem?.images ?? [])
    .filter((image) => !removedImageIds.includes(image.id))
    .map((image) => ({ id: image.id, url: image.imageUrl }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    let savedItem = currentItem;

    const input: ItemInput = {
      title: title.trim(),
      description: description.trim(),
      ...(categoryId ? { categoryId: Number(categoryId) } : {}),
    };

    try {
      if (savedItem) {
        savedItem = await itemService.update(savedItem.id, input);
        setPersistedItem(savedItem);
      } else {
        savedItem = await itemService.create(input);
        setPersistedItem(savedItem);
      }

      const pendingImageIds = [...removedImageIds];
      for (const imageId of pendingImageIds) {
        savedItem = await itemService.deleteImage(savedItem.id, imageId);
        setRemovedImageIds((current) => current.filter((id) => id !== imageId));
        setPersistedItem(savedItem);
      }

      if (files.length > 0) {
        savedItem = await itemService.uploadImages(savedItem.id, files);
        setFiles([]);
        setPersistedItem(savedItem);
      }

      router.push(`/items/${savedItem.id}`);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Không thể lưu món đồ. Vui lòng thử lại.";
      setError(
        savedItem
          ? `Món đồ đã được lưu nhưng chưa hoàn tất việc cập nhật ảnh: ${message}`
          : message,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={(event) => void handleSubmit(event)}>
      <h1>{isEditing ? "Chỉnh sửa món đồ" : "Đăng món đồ mới"}</h1>
      <p className={styles.intro}>
        Thêm thông tin và hình ảnh để mọi người dễ dàng tìm thấy món đồ của bạn.
      </p>

      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor="item-title">Tên món đồ</label>
          <input
            autoComplete="off"
            disabled={isSubmitting}
            id="item-title"
            maxLength={150}
            onChange={(event) => setTitle(event.target.value)}
            required
            value={title}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="item-description">Mô tả</label>
          <textarea
            disabled={isSubmitting}
            id="item-description"
            maxLength={5000}
            onChange={(event) => setDescription(event.target.value)}
            value={description}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="item-category">Danh mục</label>
          <select
            disabled={isLoadingCategories || isSubmitting}
            id="item-category"
            onChange={(event) => setCategoryId(event.target.value)}
            value={categoryId}
          >
            <option value="">Chưa phân loại</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ImageUploader
        disabled={isSubmitting}
        existingImages={currentImages}
        maxFiles={5}
        maxSizeMB={5}
        onChange={setFiles}
        onRemoveExisting={(imageId) =>
          setRemovedImageIds((current) => [...current, imageId])
        }
        value={files}
      />

      {error && <p className={`form-alert ${styles.error}`} role="alert">{error}</p>}

      <div className={styles.actions}>
        <button className={styles.submit} disabled={isSubmitting} type="submit">
          {isSubmitting ? "Đang lưu món đồ..." : isEditing ? "Lưu thay đổi" : "Đăng món đồ"}
        </button>
        <Link className={styles.cancel} href="/items">Hủy</Link>
      </div>
    </form>
  );
}
