import Link from "next/link";
import styles from "./page.module.css";

export default function ForbiddenPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="forbidden-title">
        <span className={styles.code}>403</span>
        <h1 id="forbidden-title">Bạn không có quyền truy cập</h1>
        <p>Tài khoản hiện tại không được phép xem trang này.</p>
        <Link href="/">Quay về trang chủ</Link>
      </section>
    </main>
  );
}
