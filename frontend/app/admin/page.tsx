import Link from "next/link";
import styles from "./page.module.css";

export default function AdminPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/">Uni<span>Lend</span></Link>
        <Link href="/">Về trang chủ</Link>
      </header>
      <section className={styles.content}>
        <span className={styles.eyebrow}>Khu vực dành cho quản trị viên</span>
        <h1>Quản trị UniLend</h1>
        <p>Bạn đã đăng nhập với quyền quản trị.</p>
        <div className={styles.actions}>
          <Link href="/admin/items">Quản lý đồ</Link>
          <Link href="/">Khám phá trang chủ</Link>
        </div>
      </section>
    </main>
  );
}
