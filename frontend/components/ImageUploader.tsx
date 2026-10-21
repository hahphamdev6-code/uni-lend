"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { resolveImageUrl } from "../lib/api/imageUrl";
import styles from "./ImageUploader.module.css";

export interface ExistingImage {
  id: number;
  url: string;
}

interface ImageUploaderProps {
  value: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  existingImages?: ExistingImage[];
  onRemoveExisting?: (imageId: number) => void;
  error?: string;
  disabled?: boolean;
}

interface Preview {
  file: File;
  url: string;
}

const MIME_EXTENSIONS: Record<string, readonly string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/jpg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};

function fileKey(file: File): string {
  return JSON.stringify([file.name, file.size, file.lastModified]);
}

export function ImageUploader({
  value,
  onChange,
  maxFiles = 5,
  maxSizeMB = 5,
  existingImages = [],
  onRemoveExisting,
  error,
  disabled = false,
}: ImageUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrls = useRef(new Map<File, string>());
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const remainingSlots = Math.max(0, maxFiles - existingImages.length - value.length);

  useEffect(() => {
    const selectedFiles = new Set(value);
    for (const [file, url] of objectUrls.current) {
      if (!selectedFiles.has(file)) {
        URL.revokeObjectURL(url);
        objectUrls.current.delete(file);
      }
    }

    setPreviews(value.map((file) => {
      let url = objectUrls.current.get(file);
      if (!url) {
        url = URL.createObjectURL(file);
        objectUrls.current.set(file, url);
      }
      return { file, url };
    }));
  }, [value]);

  useEffect(() => () => {
    for (const url of objectUrls.current.values()) {
      URL.revokeObjectURL(url);
    }
    objectUrls.current.clear();
  }, []);

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;

    const accepted: File[] = [];
    const issues: string[] = [];
    const seen = new Set(value.map(fileKey));

    for (const file of Array.from(fileList)) {
      const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      const acceptedExtensions = MIME_EXTENSIONS[file.type.toLowerCase()];

      if (!acceptedExtensions || !acceptedExtensions.includes(extension)) {
        issues.push(`${file.name}: chỉ chấp nhận ảnh JPG, JPEG hoặc PNG đúng định dạng.`);
        continue;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        issues.push(`${file.name}: dung lượng không được vượt quá ${maxSizeMB} MB.`);
        continue;
      }
      if (seen.has(fileKey(file))) {
        issues.push(`${file.name}: ảnh này đã được chọn.`);
        continue;
      }
      if (existingImages.length + value.length + accepted.length >= maxFiles) {
        issues.push(`${file.name}: đã đạt giới hạn tối đa ${maxFiles} ảnh.`);
        continue;
      }

      seen.add(fileKey(file));
      accepted.push(file);
    }

    if (accepted.length > 0) onChange([...value, ...accepted]);
    setValidationErrors(issues);
  }

  const displayedError = [error, ...validationErrors].filter(Boolean).join(" ");

  return (
    <section className={styles.upload} aria-label="Ảnh món đồ">
      <div className={styles.heading}>
        <div>
          <h2>Hình ảnh món đồ</h2>
          <p>Tải lên tối đa {maxFiles} ảnh, mỗi ảnh không quá {maxSizeMB} MB.</p>
        </div>
        <span className={styles.imageCount}>
          {existingImages.length + value.length}/{maxFiles}
        </span>
      </div>

      <div className={styles.previewGrid}>
        {existingImages.map((image, index) => (
          <figure className={styles.preview} key={image.id}>
            <Image
              alt={`Ảnh món đồ hiện tại ${index + 1}`}
              className={styles.previewImage}
              src={resolveImageUrl(image.url)}
              fill
              sizes="(max-width: 600px) 40vw, 180px"
              unoptimized
            />
            {index === 0 && <figcaption className={styles.previewLabel}>Ảnh đại diện</figcaption>}
            {onRemoveExisting && (
              <button
                aria-label={`Xóa ảnh hiện tại ${index + 1}`}
                className={styles.removeButton}
                disabled={disabled}
                onClick={() => onRemoveExisting(image.id)}
                type="button"
              >
                ×
              </button>
            )}
          </figure>
        ))}
        {previews.map((preview, index) => (
          <figure className={styles.preview} key={fileKey(preview.file)}>
            <Image
              alt={`Ảnh xem trước: ${preview.file.name}`}
              className={styles.previewImage}
              src={preview.url}
              fill
              sizes="(max-width: 600px) 40vw, 180px"
              unoptimized
            />
            {existingImages.length + index === 0 && (
              <figcaption className={styles.previewLabel}>Ảnh đại diện</figcaption>
            )}
            <button
              aria-label={`Xóa ảnh ${preview.file.name}`}
              className={styles.removeButton}
              disabled={disabled}
              onClick={() => onChange(value.filter((file) => file !== preview.file))}
              type="button"
            >
              ×
            </button>
          </figure>
        ))}
        {remainingSlots > 0 && (
          <button
            aria-describedby={displayedError ? `${inputId}-error` : undefined}
            className={`${styles.addTile}${isDragging ? ` ${styles.dragging}` : ""}`}
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            onDragEnter={(event) => {
              event.preventDefault();
              if (!disabled) setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              if (!disabled) addFiles(event.dataTransfer.files);
            }}
            type="button"
          >
            <span className={styles.addIcon} aria-hidden="true">＋</span>
            <span>Kéo thả hoặc chọn ảnh</span>
          </button>
        )}
        <input
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          aria-hidden="true"
          className={styles.visuallyHidden}
          disabled={disabled || remainingSlots === 0}
          id={inputId}
          aria-label="Chọn ảnh món đồ"
          multiple
          onChange={(event) => {
            addFiles(event.currentTarget.files);
            event.currentTarget.value = "";
          }}
          ref={inputRef}
          tabIndex={-1}
          type="file"
        />
      </div>

      {displayedError && (
        <p className={`field-error ${styles.error}`} id={`${inputId}-error`} role="alert">
          {displayedError}
        </p>
      )}
    </section>
  );
}
