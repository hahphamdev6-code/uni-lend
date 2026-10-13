import type { ReactNode } from "react";
import Link from "next/link";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({ eyebrow, title, description, children }: AuthShellProps) {
  return (
    <main className="auth-page">
      <header className="auth-header">
        <Link className="brand" href="/" aria-label="UniLend - về trang chủ">
          <span className="brand-mark" aria-hidden="true">u</span>
          <span>uni<span className="brand-accent">lend</span></span>
        </Link>
        <Link className="auth-home-link" href="/">Về trang chủ</Link>
      </header>
      <section className="auth-card">
        <span className="section-kicker">{eyebrow}</span>
        <h1>{title}</h1>
        <p className="auth-description">{description}</p>
        {children}
      </section>
      <p className="auth-disclaimer">UniLend đang ở giai đoạn thử nghiệm — dữ liệu chỉ lưu trên trình duyệt này. Không sử dụng mật khẩu thật.</p>
    </main>
  );
}
