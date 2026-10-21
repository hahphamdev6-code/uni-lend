"use client";

import Image from "next/image";
import { useState } from "react";
import { resolveImageUrl } from "../lib/api/imageUrl";
import styles from "./item-image-gallery.module.css";

type ItemImageGalleryProps = {
  images: string[];
  title: string;
};

export function ItemImageGallery({ images, title }: ItemImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeIndex = Math.min(selectedIndex, images.length - 1);
  const selectedImage = images[activeIndex];

  if (images.length === 0) {
    return (
      <div className={styles.emptyGallery} aria-label={`Chưa có ảnh cho ${title}`}>
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <rect x="8" y="12" width="48" height="40" rx="5" />
          <circle cx="23" cy="26" r="5" />
          <path d="m10 45 14-13 9 8 6-5 15 14" />
        </svg>
        <span>Chưa có hình ảnh</span>
      </div>
    );
  }

  return (
    <section
      className={styles.gallery}
      aria-label={`Thư viện ảnh ${title}`}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          setSelectedIndex((activeIndex - 1 + images.length) % images.length);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          setSelectedIndex((activeIndex + 1) % images.length);
        }
      }}
      tabIndex={0}
    >
      <div className={styles.mainImage}>
        <Image
          alt={`${title} - ảnh ${activeIndex + 1}`}
          className={styles.image}
          src={resolveImageUrl(selectedImage)}
          fill
          priority
          sizes="(max-width: 800px) 100vw, 55vw"
          unoptimized
        />
        {images.length > 1 && (
          <>
            <button
              aria-label="Xem ảnh trước"
              className={`${styles.navigationButton} ${styles.previousButton}`}
              onClick={() => setSelectedIndex((activeIndex - 1 + images.length) % images.length)}
              type="button"
            >
              ‹
            </button>
            <button
              aria-label="Xem ảnh tiếp theo"
              className={`${styles.navigationButton} ${styles.nextButton}`}
              onClick={() => setSelectedIndex((activeIndex + 1) % images.length)}
              type="button"
            >
              ›
            </button>
          </>
        )}
        <span className={styles.imageCounter}>
          {activeIndex + 1} / {images.length}
        </span>
      </div>
      {images.length > 1 && (
        <div className={styles.thumbnails} role="group" aria-label="Chọn ảnh">
          {images.map((image, index) => (
            <button
              aria-label={`Xem ảnh ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
              className={`${styles.thumbnail}${index === activeIndex ? ` ${styles.selected}` : ""}`}
              key={`${image}-${index}`}
              onClick={() => setSelectedIndex(index)}
              type="button"
            >
              <Image
                alt=""
                className={styles.image}
                src={resolveImageUrl(image)}
                fill
                sizes="100px"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
