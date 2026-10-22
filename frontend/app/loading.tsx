import styles from "./loading.module.css";

export default function Loading() {
  return (
    <main className={styles.page} aria-label="Đang tải trang" aria-busy="true">
      <span className={styles.srOnly} role="status">Đang tải nội dung</span>
      <div className={styles.header}>
        <div className={`${styles.skeleton} ${styles.brand}`} />
        <div className={`${styles.skeleton} ${styles.action}`} />
      </div>
      <section className={styles.content}>
        <div className={`${styles.skeleton} ${styles.eyebrow}`} />
        <div className={`${styles.skeleton} ${styles.title}`} />
        <div className={`${styles.skeleton} ${styles.description}`} />
        <div className={styles.grid}>
          {Array.from({ length: 6 }, (_, index) => (
            <div className={styles.card} key={index}>
              <div className={`${styles.skeleton} ${styles.artwork}`} />
              <div className={styles.cardContent}>
                <div className={`${styles.skeleton} ${styles.line}`} />
                <div className={`${styles.skeleton} ${styles.shortLine}`} />
                <div className={`${styles.skeleton} ${styles.owner}`} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
