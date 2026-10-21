"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ItemForm } from "../../../../components/ItemForm";
import { itemService } from "../../../../lib/api/itemService";
import type { Item } from "../../../../lib/api/types";
import styles from "../../../../components/ItemForm.module.css";

export default function EditItemPage() {
  const params = useParams<{ id: string }>();
  const itemId = Number(params.id);
  const [item, setItem] = useState<Item | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const invalidId = !Number.isSafeInteger(itemId) || itemId < 1;

  useEffect(() => {
    if (invalidId) return;
    const controller = new AbortController();
    async function loadItem() {
      try {
        setItem(await itemService.getById(itemId, { signal: controller.signal }));
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Không thể tải thông tin món đồ.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadItem();
    return () => controller.abort();
  }, [invalidId, itemId]);

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <Link className={styles.headerLink} href="/items">← Danh sách đồ</Link>
      </header>
      {invalidId ? (
        <p className="form-alert" role="alert">Mã món đồ không hợp lệ.</p>
      ) : loading ? (
        <p role="status">Đang tải món đồ...</p>
      ) : error || invalidId || !item ? (
        <p className="form-alert" role="alert">
          {error || "Không tìm thấy món đồ cần chỉnh sửa."}
        </p>
      ) : (
        <ItemForm item={item} />
      )}
    </main>
  );
}
