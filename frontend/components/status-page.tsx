import Link from "next/link";
import styles from "./status-page.module.css";

type StatusPageProps = {
  code: "403" | "404";
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
};

export function StatusPage({
  code,
  title,
  description,
  href = "/",
  linkLabel = "Quay về trang chủ",
}: StatusPageProps) {
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="status-title">
        <span className={styles.code} aria-hidden="true">{code}</span>
        <h1 id="status-title">{title}</h1>
        <p>{description}</p>
        <Link href={href}>{linkLabel}</Link>
      </section>
    </main>
  );
}
