"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { categoryService } from "../../lib/api/categoryService";
import { itemService } from "../../lib/api/itemService";
import type { Category, Item, PageResponse } from "../../lib/api/types";
import styles from "./page.module.css";

const PAGE_SIZE = 9;

function ItemCard({ item }: { item: Item }) {
  const statusLabel =
    item.status === "AVAILABLE"
      ? "Có thể mượn"
      : item.status === "LENT_OUT"
        ? "Đang được mượn"
        : "Tạm ngưng";

  return (
    <article className={styles.itemCard}>
      <div className={styles.itemArtwork} aria-hidden="true">
        <span className={styles.statusBadge}>
          <span className={item.status === "AVAILABLE" ? styles.availableDot : styles.unavailableDot} />
          {statusLabel}
        </span>
        <svg viewBox="0 0 64 64" fill="none">
          <path d="m32 9 23 12.5v21L32 55 9 42.5v-21L32 9Z" />
          <path d="m9 21.5 23 13 23-13M32 34.5V55m-11-40 23 13" />
        </svg>
        <span className={styles.artworkCircle} />
      </div>
      <div className={styles.itemDetails}>
        <span className={styles.category}>{item.category?.name ?? "Chưa phân loại"}</span>
        <h2>{item.title}</h2>
        {item.description && <p className={styles.description}>{item.description}</p>}
        <div className={styles.owner}>
          <span className={styles.avatar} aria-hidden="true">
            {item.owner.fullName.trim().slice(0, 1).toLocaleUpperCase("vi")}
          </span>
          <span>{item.owner.fullName}</span>
          <span className={styles.ownerCaption}>· Sinh viên</span>
        </div>
      </div>
    </article>
  );
}

function LoadingGrid() {
  return (
    <div className={styles.grid} aria-label="Đang tải danh sách đồ" aria-busy="true">
      {Array.from({ length: 6 }, (_, index) => (
        <div className={styles.skeletonCard} key={index}>
          <div className={`${styles.skeleton} ${styles.skeletonArtwork}`} />
          <div className={styles.skeletonContent}>
            <div className={`${styles.skeleton} ${styles.skeletonCategory}`} />
            <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
            <div className={`${styles.skeleton} ${styles.skeletonOwner}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ItemsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryError, setCategoryError] = useState("");
  const [categoryRetry, setCategoryRetry] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [itemsPage, setItemsPage] = useState<PageResponse<Item> | null>(null);
  const [itemsError, setItemsError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      setCategoryError("");
      try {
        const data = await categoryService.list({ signal: controller.signal });
        setCategories(data);
      } catch (error) {
        if (controller.signal.aborted) return;
        setCategoryError(
          error instanceof Error ? error.message : "Không thể tải danh mục. Vui lòng thử lại.",
        );
      }
    }

    void loadCategories();
    return () => controller.abort();
  }, [categoryRetry]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadItems() {
      setLoading(true);
      setItemsError("");
      try {
        const result = await itemService.list(
          {
            page,
            size: PAGE_SIZE,
            ...(query.trim() ? { keyword: query.trim() } : {}),
            ...(selectedCategory ? { categoryId: Number(selectedCategory) } : {}),
          },
          { signal: controller.signal },
        );
        setItemsPage(result);
      } catch (error) {
        if (controller.signal.aborted) return;
        setItemsError(error instanceof Error ? error.message : "Không thể tải danh sách đồ.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadItems();
    return () => controller.abort();
  }, [page, query, retry, selectedCategory]);

  const retryLoading = useCallback(() => {
    setRetry((current) => current + 1);
    setCategoryRetry((current) => current + 1);
  }, []);

  function updateQuery(value: string) {
    setQuery(value);
    setPage(0);
  }

  function updateCategory(value: string) {
    setSelectedCategory(value);
    setPage(0);
  }

  const pageCount = itemsPage?.totalPages ?? 0;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="UniLend - về trang chủ">
          <span className={styles.brandMark} aria-hidden="true">
            U
          </span>
          <span>
            uni<span className={styles.brandAccent}>lend</span>
          </span>
        </Link>
        <nav className={styles.navigation} aria-label="Điều hướng chính">
          <Link href="/">Trang chủ</Link>
          <span aria-current="page">Danh sách đồ</span>
        </nav>
        <Link className={styles.backLink} href="/">
          Về trang chủ
        </Link>
      </header>

      <section className={styles.content} aria-labelledby="page-title">
        <div className={styles.heading}>
          <span className={styles.eyebrow}>Khám phá UniLend</span>
          <h1 id="page-title">Danh sách đồ</h1>
          <p>Tìm món đồ hữu ích và kết nối với những người bạn quanh trường.</p>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchField}>
            <label className={styles.visuallyHidden} htmlFor="item-search">
              Tìm theo tên món đồ
            </label>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m16 16 4 4" />
            </svg>
            <input
              id="item-search"
              type="search"
              placeholder="Bạn đang cần tìm món gì?"
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
            />
          </div>

          <div className={styles.filterField}>
            <label htmlFor="category-filter">Danh mục</label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(event) => updateCategory(event.target.value)}
              disabled={Boolean(categoryError)}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {itemsPage && !loading && !itemsError && (
          <p className={styles.resultCount} aria-live="polite">
            {itemsPage.totalElements} món đồ
          </p>
        )}

        {categoryError || itemsError ? (
          <div className={styles.statePanel} role="alert">
            <h2>Không thể tải danh sách đồ</h2>
            <p>{categoryError || itemsError}</p>
            <button className={styles.retryButton} onClick={retryLoading} type="button">
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <LoadingGrid />
        ) : itemsPage?.content.length ? (
          <>
            <div className={styles.grid}>
              {itemsPage.content.map((item) => (
                <ItemCard item={item} key={item.id} />
              ))}
            </div>
            {pageCount > 1 && (
              <nav className={styles.pagination} aria-label="Phân trang danh sách đồ">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(0, current - 1))}
                  disabled={page === 0}
                  aria-label="Trang trước"
                >
                  ← <span>Trước</span>
                </button>
                <span aria-live="polite">
                  Trang {page + 1} / {pageCount}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
                  disabled={page >= pageCount - 1}
                  aria-label="Trang sau"
                >
                  <span>Sau</span> →
                </button>
              </nav>
            )}
          </>
        ) : (
          <div className={styles.statePanel}>
            <span className={styles.emptyIcon} aria-hidden="true">
              ⌕
            </span>
            <h2>Chưa tìm thấy món đồ phù hợp</h2>
            <p>Thử từ khóa khác hoặc chọn một danh mục khác nhé.</p>
            {(query || selectedCategory) && (
              <button
                className={styles.retryButton}
                onClick={() => {
                  updateQuery("");
                  updateCategory("");
                }}
                type="button"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
