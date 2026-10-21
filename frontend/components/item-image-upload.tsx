"use client";

import Image from "next/image";
import { useId, useState } from "react";
import styles from "./item-image-upload.module.css";

const MAX_IMAGES = 8;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type ImagePreview = {
  key: string;
  file: File;
  name: string;
  src: string;
};

type ItemImageUploadProps = {
  value: File[];
  onChange: (files: File[]) => void;
  existingImages?: string[];
  onRemoveExisting?: (imageUrl: string) => void;
  disabled?: boolean;
  maxImages?: number;
};

export function ItemImageUpload({
  value,
  onChange,
  existingImages = [],
  onRemoveExisting,
  disabled = false,
  maxImages = MAX_IMAGES,
}: ItemImageUploadProps) {
  const inputId = useId();
  const [error, setError] = useState("");
  const [previews, setPreviews] = useState<ImagePreview[]>([]);
  const remainingSlots = Math.max(0, maxImages - existingImages.length - value.length);

  function readPreview(file: File): Promise<ImagePreview> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== "string") {
          reject(new Error(`Không thể xem trước ảnh ${file.name}.`));
          return;
        }
        resolve({
          key: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
          file,
          name: file.name,
          src: reader.result,
        });
      };
      reader.onerror = () => reject(new Error(`Không thể đọc ảnh ${file.name}.`));
      reader.readAsDataURL(file);
    });
  }

  async function addFiles(fileList: FileList | null) {
    if (!fileList) return;

    const selected = Array.from(fileList);
    const validFiles: File[] = [];
    const issues: string[] = [];

    for (const file of selected) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        issues.push(`${file.name}: chỉ hỗ trợ JPG, PNG hoặc WebP.`);
      } else if (file.size > MAX_FILE_SIZE) {
        issues.push(`${file.name}: dung lượng tối đa là 5 MB.`);
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length > remainingSlots) {
      issues.push(`Bạn chỉ có thể chọn thêm tối đa ${remainingSlots} ảnh.`);
    }

    const acceptedFiles = validFiles.slice(0, remainingSlots);
    if (acceptedFiles.length > 0) {
      onChange([...value, ...acceptedFiles]);
      try {
        const addedPreviews = await Promise.all(acceptedFiles.map(readPreview));
        setPreviews((current) => [...current, ...addedPreviews]);
      } catch (previewError) {
        setError(
          previewError instanceof Error
            ? previewError.message
            : "Không thể tạo ảnh xem trước.",
        );
      }
    }
    setError((current) => [current, ...issues].filter(Boolean).join(" "));
  }

  function removeFile(indexToRemove: number) {
    const removedFile = value[indexToRemove];
    onChange(value.filter((_, index) => index !== indexToRemove));
    setPreviews((current) => current.filter((preview) => preview.file !== removedFile));
    setError("");
  }

  return (
    <section className={styles.upload} aria-label="Ảnh món đồ">
      <div className={styles.heading}>
        <div>
          <h2>Hình ảnh món đồ</h2>
          <p>Tải lên tối đa {maxImages} ảnh, mỗi ảnh không quá 5 MB.</p>
        </div>
        <span className={styles.imageCount}>
          {existingImages.length + value.length}/{maxImages}
        </span>
      </div>

      <div className={styles.previewGrid}>
        {existingImages.map((imageUrl, index) => (
          <figure className={styles.preview} key={`${imageUrl}-${index}`}>
            <Image
              alt={`Ảnh món đồ hiện tại ${index + 1}`}
              className={styles.image}
              src={imageUrl}
              fill
              sizes="(max-width: 600px) 40vw, 180px"
              unoptimized
            />
            {onRemoveExisting && (
              <button
                aria-label={`Xóa ảnh hiện tại ${index + 1}`}
                className={styles.removeButton}
                disabled={disabled}
                onClick={() => onRemoveExisting(imageUrl)}
                type="button"
              >
                ×
              </button>
            )}
          </figure>
        ))}
        {previews.map((preview, index) => (
          <figure className={styles.preview} key={preview.key}>
            <Image
              alt={`Ảnh xem trước: ${preview.name}`}
              className={styles.image}
              src={preview.src}
              fill
              sizes="(max-width: 600px) 40vw, 180px"
              unoptimized
            />
            <button
              aria-label={`Xóa ảnh ${preview.name}`}
              className={styles.removeButton}
              disabled={disabled}
              onClick={() => removeFile(index)}
              type="button"
            >
              ×
            </button>
          </figure>
        ))}
        {remainingSlots > 0 && (
          <label className={`${styles.addTile}${disabled ? ` ${styles.disabled}` : ""}`} htmlFor={inputId}>
            <span aria-hidden="true">＋</span>
            <span>Thêm ảnh</span>
            <input
              accept={ACCEPTED_TYPES.join(",")}
              className={styles.visuallyHidden}
              disabled={disabled}
              id={inputId}
              multiple
              onChange={(event) => {
              void addFiles(event.currentTarget.files);
                event.currentTarget.value = "";
              }}
              type="file"
            />
          </label>
        )}
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
