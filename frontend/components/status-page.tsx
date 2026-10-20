import Link from "next/link";

type StatusPageProps = {
  code: "403" | "404";
  title: string;
  description: string;
  href: string;
  linkLabel: string;
};

export function StatusPage({ code, title, description, href, linkLabel }: StatusPageProps) {
  return (
    <main className="status-page">
      <header className="status-page-header"><Link className="brand" href="/" aria-label="UniLend, về trang chủ"><span className="brand-mark">U</span><span>uni<span className="brand-accent">lend</span></span></Link></header>
      <section className="status-page-content">
        <span className="status-page-code">{code}</span>
        <span className="manage-kicker">UNILEND · KHÔNG GIAN CHIA SẺ</span>
        <h1>{title}</h1>
        <p>{description}</p>
        <Link className="primary-button" href={href}>{linkLabel}</Link>
      </section>
    </main>
  );
}