"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./item-image-gallery.module.css";

type ItemImageGalleryProps = {
  images: string[];
  title: string;
};

export function ItemImageGallery({ images, title }: ItemImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex];

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
    <section className={styles.gallery} aria-label={`Thư viện ảnh ${title}`}>
      <div className={styles.mainImage}>
        <Image
          alt={`${title} - ảnh ${selectedIndex + 1}`}
          className={styles.image}
          src={selectedImage}
          fill
          priority
          sizes="(max-width: 800px) 100vw, 55vw"
          unoptimized
        />
        <span className={styles.imageCounter}>
          {selectedIndex + 1} / {images.length}
        </span>
      </div>
      {images.length > 1 && (
        <div className={styles.thumbnails} role="group" aria-label="Chọn ảnh">
          {images.map((image, index) => (
            <button
              aria-label={`Xem ảnh ${index + 1}`}
              aria-pressed={index === selectedIndex}
              className={`${styles.thumbnail}${index === selectedIndex ? ` ${styles.selected}` : ""}`}
              key={`${image}-${index}`}
              onClick={() => setSelectedIndex(index)}
              type="button"
            >
              <Image
                alt=""
                className={styles.image}
                src={image}
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
