import Link from "next/link";
import { ItemForm } from "../../../components/ItemForm";
import styles from "../../../components/ItemForm.module.css";

export default function NewItemPage() {
  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <Link className={styles.headerLink} href="/items" aria-label="Quay lại danh sách đồ">
          ← Danh sách đồ
        </Link>
      </header>
      <ItemForm />
    </main>
  );
}
