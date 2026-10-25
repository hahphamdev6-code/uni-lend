import Link from "next/link";
import styles from "./page.module.css";

const questions = [
  {
    number: "01",
    category: "Mượn đồ",
    question: "Làm thế nào để mượn một món đồ?",
    answer:
      "Đăng nhập, mở danh sách đồ và chọn món đang có thể mượn. Gửi yêu cầu kèm thời gian dự kiến; chờ chủ sở hữu duyệt rồi thống nhất thời gian, địa điểm nhận đồ.",
  },
  {
    number: "02",
    category: "Trả đồ",
    question: "Tôi cần làm gì khi trả đồ?",
    answer:
      "Trả đúng hạn và theo cách hai bên đã thống nhất. Cùng kiểm tra tình trạng món đồ khi bàn giao; chủ sở hữu xác nhận “Đã trả” trong mục Yêu cầu gửi đến tôi.",
  },
  {
    number: "03",
    category: "Đồ hư hỏng",
    question: "Nếu đồ bị hư hỏng hoặc thất lạc thì sao?",
    answer:
      "Báo ngay cho chủ sở hữu và quản trị viên, mô tả tình trạng, thời điểm phát hiện và gửi ảnh nếu có. Tạm ngừng sử dụng món đồ; đừng tự sửa chữa khi chưa thống nhất với chủ sở hữu.",
  },
];

export default function HelpPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="UniLend - về trang chủ">
          <span className={styles.brandMark} aria-hidden="true">U</span>
          <span>uni<span className={styles.brandAccent}>lend</span></span>
        </Link>
        <nav className={styles.navigation} aria-label="Điều hướng chính">
          <Link href="/">Trang chủ</Link>
          <Link href="/items">Khám phá đồ</Link>
          <span aria-current="page">Trợ giúp</span>
        </nav>
        <Link className={styles.headerLink} href="/my">Quản lý cá nhân</Link>
      </header>

      <section className={styles.content} aria-labelledby="help-title">
        <div className={styles.heading}>
          <span className={styles.eyebrow}>UniLend · Hướng dẫn nhanh</span>
          <h1 id="help-title">Cần trợ giúp?</h1>
          <p>Một vài lưu ý để việc mượn và chia sẻ đồ luôn rõ ràng, an toàn.</p>
        </div>

        <div className={styles.faqList}>
          {questions.map((entry) => (
            <details className={styles.faqItem} key={entry.number}>
              <summary>
                <span className={styles.questionNumber}>{entry.number}</span>
                <span className={styles.questionText}>
                  <span className={styles.category}>{entry.category}</span>
                  <strong>{entry.question}</strong>
                </span>
                <span className={styles.expandIcon} aria-hidden="true">+</span>
              </summary>
              <p className={styles.answer}>{entry.answer}</p>
            </details>
          ))}
        </div>

        <aside className={styles.contactCard} aria-labelledby="contact-title">
          <span className={styles.contactIcon} aria-hidden="true">?</span>
          <div>
            <h2 id="contact-title">Cần liên hệ quản trị viên?</h2>
            <p>
              Dùng kênh hỗ trợ chính thức của UniLend tại trường hoặc cộng đồng của bạn.
              Gửi kèm email tài khoản, tên món đồ hoặc mã giao dịch, thời điểm sự việc và ảnh
              liên quan để được hỗ trợ nhanh hơn.
            </p>
          </div>
          <Link href="/my">Xem giao dịch của tôi <span aria-hidden="true">→</span></Link>
        </aside>

        <p className={styles.footerNote}>
          Chưa tìm thấy món đồ phù hợp? <Link href="/items">Khám phá danh sách đồ</Link>
        </p>
      </section>
    </main>
  );
}
