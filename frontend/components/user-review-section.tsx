"use client";

import { useEffect, useState } from "react";
import { reviewService } from "../lib/api/reviewService";
import { userService } from "../lib/api/userService";
import type { PageResponse, Review, UserRatingResponse } from "../lib/api/types";
import styles from "./user-review-section.module.css";

const REVIEW_PAGE_SIZE = 10;

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Ngày không xác định";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function UserReviewSection({
  userId,
  title = "Đánh giá",
}: {
  userId?: number;
  title?: string;
}) {
  const [ratingSummary, setRatingSummary] = useState<UserRatingResponse | null>(null);
  const [reviewPage, setReviewPage] = useState<PageResponse<Review> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadReviews() {
      setLoading(true);
      setError("");
      try {
        let rating: UserRatingResponse;
        let resolvedUserId = userId;
        if (resolvedUserId === undefined) {
          const user = await userService.getMe({ signal: controller.signal });
          resolvedUserId = user.id;
          rating = user;
        } else {
          rating = await userService.getRating(resolvedUserId, { signal: controller.signal });
        }
        if (controller.signal.aborted) return;
        setRatingSummary(rating);
        const result = await reviewService.listByUser(
          resolvedUserId,
          { page, size: REVIEW_PAGE_SIZE },
          { signal: controller.signal },
        );
        if (!controller.signal.aborted) setReviewPage(result);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setError(loadError instanceof Error ? loadError.message : "Không thể tải đánh giá.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadReviews();
    return () => controller.abort();
  }, [page, userId]);

  return (
    <section className={styles.section} aria-labelledby="user-reviews-title">
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>Cộng đồng nói gì</span>
          <h2 id="user-reviews-title">{title}</h2>
        </div>
        {ratingSummary && (
          <div className={styles.summary} aria-label={`Điểm trung bình ${ratingSummary.averageRating} trên 5 từ ${ratingSummary.reviewCount} đánh giá`}>
            <span className={styles.summaryStars} aria-hidden="true">★</span>
            <strong>{ratingSummary.averageRating.toFixed(1)}</strong>
            <span>({ratingSummary.reviewCount} đánh giá)</span>
          </div>
        )}
      </div>

      {error ? (
        <p className={styles.state} role="alert">{error}</p>
      ) : loading ? (
        <p className={styles.state} role="status">Đang tải đánh giá...</p>
      ) : (reviewPage?.content.length ?? 0) === 0 ? (
        <p className={styles.state}>Chưa có đánh giá nào.</p>
      ) : (
        <>
          <div className={styles.reviewList}>
            {reviewPage?.content.map((review) => (
              <article className={styles.review} key={review.id}>
                <div className={styles.reviewTopline}>
                  <div className={styles.reviewer}>
                    <span className={styles.avatar} aria-hidden="true">
                      {review.reviewer?.fullName.trim().charAt(0).toLocaleUpperCase("vi") || "U"}
                    </span>
                    <div>
                      <strong>{review.reviewer?.fullName ?? "Thành viên UniLend"}</strong>
                      {review.itemTitle && <span>{review.itemTitle}</span>}
                    </div>
                  </div>
                  <time dateTime={review.createdAt}>{formatDate(review.createdAt)}</time>
                </div>
                <div className={styles.rating} aria-label={`${review.rating} trên 5 sao`}>
                  <span aria-hidden="true">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                  <strong>{review.rating}.0</strong>
                </div>
                {review.comment && <p className={styles.comment}>{review.comment}</p>}
              </article>
            ))}
          </div>
          {(reviewPage?.totalPages ?? 0) > 1 && (
            <nav className={styles.pagination} aria-label="Phân trang đánh giá">
              <button disabled={page === 0} onClick={() => setPage((value) => value - 1)} type="button">
                ← Trước
              </button>
              <span>Trang {page + 1} / {reviewPage?.totalPages}</span>
              <button
                disabled={page + 1 >= (reviewPage?.totalPages ?? 0)}
                onClick={() => setPage((value) => value + 1)}
                type="button"
              >
                Sau →
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
