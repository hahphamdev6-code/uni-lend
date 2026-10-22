"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AdminNavigation } from "../../components/admin-navigation";
import { useAuth } from "../../components/auth-provider";
import { adminStatsService } from "../../lib/api/adminStatsService";
import type { AdminStats } from "../../lib/api/types";
import styles from "./page.module.css";

const loanStatuses = [
  { key: "PENDING", label: "Đang chờ", color: styles.pending },
  { key: "APPROVED", label: "Đã duyệt", color: styles.approved },
  { key: "REJECTED", label: "Từ chối", color: styles.rejected },
  { key: "RETURNED", label: "Đã trả", color: styles.returned },
  { key: "CANCELLED", label: "Đã hủy", color: styles.cancelled },
  { key: "OVERDUE", label: "Quá hạn", color: styles.overdue },
] as const;

const numberFormat = new Intl.NumberFormat("vi-VN");

function formatNumber(value: number): string {
  return numberFormat.format(value);
}

export default function AdminPage() {
  const auth = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (auth.status !== "authenticated" || !auth.hasRole("ADMIN")) return;

    const controller = new AbortController();

    async function loadStats() {
      setLoading(true);
      setError("");
      try {
        setStats(await adminStatsService.get({ signal: controller.signal }));
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Không thể tải số liệu quản trị.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadStats();
    return () => controller.abort();
  }, [auth, retry]);

  const retryLoading = useCallback(() => setRetry((current) => current + 1), []);
  const loanTotal = stats
    ? Object.values(stats.loansByStatus).reduce((total, count) => total + count, 0)
    : 0;
  const highestStatusCount = stats
    ? Math.max(0, ...Object.values(stats.loansByStatus))
    : 0;
  const highestCategoryCount = stats
    ? Math.max(0, ...stats.mostBorrowedCategories.map(({ loanCount }) => loanCount))
    : 0;

  return (
    <main className={styles.page}>
      <AdminNavigation />
      <section className={styles.content} aria-labelledby="dashboard-title">
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>Quản trị hệ thống</span>
            <h1 id="dashboard-title">Tổng quan</h1>
            <p>Theo dõi tình hình hoạt động của UniLend.</p>
          </div>
          {stats && (
            <button
              className={styles.refreshButton}
              disabled={loading}
              onClick={retryLoading}
              type="button"
            >
              {loading ? "Đang cập nhật..." : "Làm mới số liệu"}
            </button>
          )}
        </div>

        {error ? (
          <div className={styles.state} role="alert">
            <p>{error}</p>
            <button className={styles.refreshButton} onClick={retryLoading} type="button">
              Thử lại
            </button>
          </div>
        ) : loading && !stats ? (
          <div className={styles.metrics} aria-label="Đang tải số liệu" aria-busy="true">
            {Array.from({ length: 3 }, (_, index) => (
              <div className={styles.skeleton} key={index} />
            ))}
          </div>
        ) : stats ? (
          <>
            <div className={styles.metrics} aria-live="polite">
              <article className={styles.metricCard}>
                <span className={styles.metricLabel}>Người dùng</span>
                <strong>{formatNumber(stats.totalUsers)}</strong>
                <Link href="/admin/users">Quản lý người dùng <span aria-hidden="true">→</span></Link>
              </article>
              <article className={styles.metricCard}>
                <span className={styles.metricLabel}>Đồ đang có trên nền tảng</span>
                <strong>{formatNumber(stats.totalItems)}</strong>
                <Link href="/admin/items">Quản lý đồ <span aria-hidden="true">→</span></Link>
              </article>
              <article className={styles.metricCard}>
                <span className={styles.metricLabel}>Lượt mượn</span>
                <strong>{formatNumber(loanTotal)}</strong>
                <span className={styles.metricFootnote}>Tổng lượt mượn theo mọi trạng thái</span>
              </article>
            </div>

            <div className={styles.charts}>
              <section className={styles.chartCard} aria-labelledby="loan-chart-title">
                <div className={styles.chartHeading}>
                  <div>
                    <h2 id="loan-chart-title">Lượt mượn theo trạng thái</h2>
                    <p>Phân bố {formatNumber(loanTotal)} lượt mượn</p>
                  </div>
                </div>
                <div className={styles.chartRows}>
                  {loanStatuses.map(({ key, label, color }) => {
                    const count = stats.loansByStatus[key] ?? 0;
                    const width = highestStatusCount ? (count / highestStatusCount) * 100 : 0;
                    return (
                      <div className={styles.chartRow} key={key}>
                        <span className={styles.chartLabel}>{label}</span>
                        <div
                          className={styles.barTrack}
                          role="img"
                          aria-label={`${label}: ${formatNumber(count)} lượt`}
                        >
                          <span className={`${styles.bar} ${color}`} style={{ width: `${width}%` }} />
                        </div>
                        <span className={styles.chartValue}>{formatNumber(count)}</span>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className={styles.chartCard} aria-labelledby="category-chart-title">
                <div className={styles.chartHeading}>
                  <div>
                    <h2 id="category-chart-title">Danh mục được mượn nhiều</h2>
                    <p>Top danh mục theo lượt mượn</p>
                  </div>
                  <Link href="/admin/categories">Quản lý danh mục <span aria-hidden="true">→</span></Link>
                </div>
                {stats.mostBorrowedCategories.length ? (
                  <div className={styles.chartRows}>
                    {stats.mostBorrowedCategories.map((category) => {
                      const width = highestCategoryCount
                        ? (category.loanCount / highestCategoryCount) * 100
                        : 0;
                      return (
                        <div className={styles.chartRow} key={category.categoryId}>
                          <span className={styles.chartLabel} title={category.categoryName}>
                            {category.categoryName}
                          </span>
                          <div
                            className={styles.barTrack}
                            role="img"
                            aria-label={`${category.categoryName}: ${formatNumber(category.loanCount)} lượt`}
                          >
                            <span className={`${styles.bar} ${styles.categoryBar}`} style={{ width: `${width}%` }} />
                          </div>
                          <span className={styles.chartValue}>{formatNumber(category.loanCount)}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className={styles.empty}>Chưa có lượt mượn theo danh mục.</p>
                )}
              </section>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
