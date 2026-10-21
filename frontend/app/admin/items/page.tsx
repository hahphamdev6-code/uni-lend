import Link from "next/link";
import styles from "../page.module.css";

export default function AdminItemsPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/">Uni<span>Lend</span></Link>
        <Link href="/admin">← Bảng quản trị</Link>
      </header>
      <section className={styles.content}>
        <span className={styles.eyebrow}>Quản trị nội dung</span>
        <h1>Quản lý đồ</h1>
        <p>
          Trang này được bảo vệ cho tài khoản ADMIN. Các thao tác quản lý đồ sẽ
          được hiển thị tại đây khi API quản trị sẵn sàng.
        </p>
        <div className={styles.actions}>
          <Link href="/items">Xem danh sách công khai</Link>
        </div>
      </section>
    </main>
  );
}
