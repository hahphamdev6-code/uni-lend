import Link from "next/link";
import styles from "./admin-navigation.module.css";

export function AdminNavigation() {
  return (
    <header className={styles.header}>
      <Link className={styles.brand} href="/admin" aria-label="UniLend - trang quản trị">
        Uni<span>Lend</span>
        <small>ADMIN</small>
      </Link>
      <nav className={styles.nav} aria-label="Điều hướng quản trị">
        <Link href="/admin">Tổng quan</Link>
        <Link href="/admin/users">Người dùng</Link>
        <Link href="/admin/categories">Danh mục</Link>
      </nav>
      <Link className={styles.homeLink} href="/">Về trang chính</Link>
    </header>
  );
}
