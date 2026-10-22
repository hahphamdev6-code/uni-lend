"use client";

import { useState, type FormEvent } from "react";
import styles from "./review-dialog.module.css";

export function ReviewDialog({
  itemTitle,
  revieweeName,
  onClose,
  onSubmit,
}: {
  itemTitle: string;
  revieweeName: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (rating < 1 || rating > 5) {
      setError("Vui lòng chọn từ 1 đến 5 sao.");
      return;
    }
    if (comment.trim().length > 1000) {
      setError("Nhận xét tối đa 1000 ký tự.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await onSubmit(rating, comment.trim());
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể gửi đánh giá. Vui lòng thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const visibleRating = hoveredRating || rating;

  return (
    <div className={styles.backdrop}>
      <section
        aria-labelledby="review-dialog-title"
        aria-modal="true"
        className={styles.dialog}
        onKeyDown={(event) => {
          if (event.key === "Escape" && !submitting) onClose();
        }}
        role="dialog"
        tabIndex={-1}
      >
        <button
          aria-label="Đóng cửa sổ đánh giá"
          className={styles.closeButton}
          disabled={submitting}
          onClick={onClose}
          type="button"
        >
          ×
        </button>
        <span className={styles.eyebrow}>Giao dịch đã hoàn tất</span>
        <h2 id="review-dialog-title">Đánh giá {revieweeName}</h2>
        <p className={styles.itemTitle}>{itemTitle}</p>

        <form onSubmit={handleSubmit}>
          <fieldset className={styles.ratingField}>
            <legend>Trải nghiệm của bạn thế nào?</legend>
            <div className={styles.stars} onMouseLeave={() => setHoveredRating(0)}>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  aria-label={`${value} sao`}
                  aria-pressed={rating === value}
                  className={value <= visibleRating ? styles.selectedStar : styles.star}
                  key={value}
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  type="button"
                >
                  ★
                </button>
              ))}
            </div>
            <span className={styles.ratingHint} aria-live="polite">
              {rating ? `${rating} trên 5 sao` : "Chọn số sao"}
            </span>
          </fieldset>

          <label className={styles.commentLabel} htmlFor="review-comment">
            Nhận xét <span>(không bắt buộc)</span>
          </label>
          <textarea
            id="review-comment"
            maxLength={1000}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Chia sẻ thêm về trải nghiệm của bạn..."
            rows={4}
            value={comment}
          />
          <span className={styles.characterCount}>{comment.length}/1000</span>

          {error && <p className={styles.error} role="alert">{error}</p>}

          <div className={styles.actions}>
            <button
              className={styles.cancelButton}
              disabled={submitting}
              onClick={onClose}
              type="button"
            >
              Để sau
            </button>
            <button className={styles.submitButton} disabled={submitting} type="submit">
              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
