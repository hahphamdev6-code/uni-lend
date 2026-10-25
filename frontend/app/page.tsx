"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { NotificationBell } from "../components/notification-bell";
import { RoleNavigation } from "../components/role-navigation";

type Category = "Tất cả" | "Học tập" | "Công nghệ" | "Đời sống";
type ProductIcon = "book" | "camera" | "projector" | "headphones" | "plant" | "calculator";

type Item = {
  name: string;
  category: Exclude<Category, "Tất cả">;
  owner: string;
  initials: string;
  icon: ProductIcon;
  color: string;
};

const categories: Category[] = ["Tất cả", "Học tập", "Công nghệ", "Đời sống"];
const HOME_PAGE_SIZE = 9;

const items: Item[] = [
  { name: "Giáo trình Giải tích", category: "Học tập", owner: "Minh Anh", initials: "MA", icon: "book", color: "lavender" },
  { name: "Máy ảnh film Canon", category: "Công nghệ", owner: "Quốc Bảo", initials: "QB", icon: "camera", color: "peach" },
  { name: "Máy chiếu mini", category: "Công nghệ", owner: "Thu Hà", initials: "TH", icon: "projector", color: "blue" },
  { name: "Tai nghe chụp tai", category: "Đời sống", owner: "Gia Huy", initials: "GH", icon: "headphones", color: "mint" },
  { name: "Cây xanh để bàn", category: "Đời sống", owner: "Linh Chi", initials: "LC", icon: "plant", color: "yellow" },
  { name: "Máy tính Casio", category: "Học tập", owner: "Tuấn Kiệt", initials: "TK", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Tô Thành", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Tô Thành", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Tô Thành", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "Giáo trình Giải tích", category: "Học tập", owner: "Minh Anh", initials: "MA", icon: "book", color: "lavender" },
  { name: "Máy ảnh film Canon", category: "Công nghệ", owner: "Quốc Bảo", initials: "QB", icon: "camera", color: "peach" },
  { name: "Máy chiếu mini", category: "Công nghệ", owner: "Thu Hà", initials: "TH", icon: "projector", color: "blue" },
  { name: "Tai nghe chụp tai", category: "Đời sống", owner: "Gia Huy", initials: "GH", icon: "headphones", color: "mint" },
  { name: "Cây xanh để bàn", category: "Đời sống", owner: "Linh Chi", initials: "LC", icon: "plant", color: "yellow" },
  { name: "Máy tính Casio", category: "Học tập", owner: "Tuấn Kiệt", initials: "TK", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Tô Thành", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Tô Thành", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Tô Thành", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "Giáo trình Giải tích", category: "Học tập", owner: "Minh Anh", initials: "MA", icon: "book", color: "lavender" },
  { name: "Máy ảnh film Canon", category: "Công nghệ", owner: "Quốc Bảo", initials: "QB", icon: "camera", color: "peach" },
  { name: "Máy chiếu mini", category: "Công nghệ", owner: "Thu Hà", initials: "TH", icon: "projector", color: "blue" },
  { name: "Tai nghe chụp tai", category: "Đời sống", owner: "Gia Huy", initials: "GH", icon: "headphones", color: "mint" },
  { name: "Cây xanh để bàn", category: "Đời sống", owner: "Linh Chi", initials: "LC", icon: "plant", color: "yellow" },
  { name: "Máy tính Casio", category: "Học tập", owner: "Tuấn Kiệt", initials: "TK", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Tô Thành", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Tô Thành", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Tô Thành", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "Giáo trình Giải tích", category: "Học tập", owner: "Minh Anh", initials: "MA", icon: "book", color: "lavender" },
  { name: "Máy ảnh film Canon", category: "Công nghệ", owner: "Quốc Bảo", initials: "QB", icon: "camera", color: "peach" },
  { name: "Máy chiếu mini", category: "Công nghệ", owner: "Thu Hà", initials: "TH", icon: "projector", color: "blue" },
  { name: "Tai nghe chụp tai", category: "Đời sống", owner: "Gia Huy", initials: "GH", icon: "headphones", color: "mint" },
  { name: "Cây xanh để bàn", category: "Đời sống", owner: "Linh Chi", initials: "LC", icon: "plant", color: "yellow" },
  { name: "Máy tính Casio", category: "Học tập", owner: "Tuấn Kiệt", initials: "TK", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Tô Thành", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Tô Thành", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Tô Thành", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" },
  { name: "điện thoại", category: "Công nghệ", owner: "Sang Trần", initials: "TH", icon: "calculator", color: "pink" }
];

function Icon({ name, size = 20 }: { name: ProductIcon | "search" | "arrow" | "spark" | "pin" | "box"; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "search":
      return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>;
    case "arrow":
      return <svg {...common}><path d="M5 12h14m-6-6 6 6-6 6" /></svg>;
    case "spark":
      return <svg {...common}><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" /><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" /></svg>;
    case "pin":
      return <svg {...common}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>;
    case "box":
      return <svg {...common}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 8 9 5 9-5m-18 0v8l9 5 9-5V8m-9 5v8" /></svg>;
    case "book":
      return <svg {...common}><path d="M12 7v14m0-14C9 4 5.5 4 3 5v13c2.5-1 6-.8 9 2m0-13c3-3 6.5-3 9-2v13c-2.5-1-6-.8-9 2" /><path d="M6 8h3m-3 4h3m6-4h3m-3 4h3" /></svg>;
    case "camera":
      return <svg {...common}><path d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v11H3V8a1 1 0 0 1 1-1Z" /><circle cx="12" cy="13" r="4" /></svg>;
    case "projector":
      return <svg {...common}><rect x="3" y="6" width="18" height="11" rx="2" /><circle cx="12" cy="11.5" r="2.5" /><path d="m8 17-1 4m9-4 1 4M3 9H1m22 0h-2" /></svg>;
    case "headphones":
      return <svg {...common}><path d="M3 13v-2a9 9 0 0 1 18 0v2" /><path d="M5 13h2v7H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2Zm14 0h-2v7h2a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2Z" /></svg>;
    case "plant":
      return <svg {...common}><path d="M12 21v-9m0 3c-5 0-7-3-7-7 4 0 7 2 7 7Zm0-3c0-5 3-8 8-8 0 5-3 8-8 8Zm-6 9h12l-1-6H7l-1 6Z" /></svg>;
    case "calculator":
      return <svg {...common}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8v4H8zm0 8h.01M12 15h.01M16 15h.01M8 18h.01M12 18h.01M16 18h.01" /></svg>;
  }
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category>("Tất cả");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi");

    return items.filter((item) => {
      const matchesCategory = activeCategory === "Tất cả" || item.category === activeCategory;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        `${item.name} ${item.category} ${item.owner}`.toLocaleLowerCase("vi").includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);
  const pageCount = Math.ceil(filteredItems.length / HOME_PAGE_SIZE);
  const paginatedItems = filteredItems.slice(
    page * HOME_PAGE_SIZE,
    (page + 1) * HOME_PAGE_SIZE,
  );

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="UniLend - về đầu trang">
          <span className="brand-mark"><Icon name="box" size={21} /></span>
          <span>uni<span className="brand-accent">lend</span></span>
        </a>
        <nav className="main-nav" aria-label="Điều hướng chính">
          <a className="nav-link active" href="#items">Khám phá</a>
          <a className="nav-link" href="#how-it-works">Cách hoạt động</a>
          <a className="nav-link" href="#community">Cộng đồng</a>
          <Link className="nav-link" href="/help">Trợ giúp</Link>
        </nav>
        <div className="header-auth-links">
          <NotificationBell />
          <RoleNavigation className="header-login" registerClassName="header-cta" />
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy">
          <span className="eyebrow"><Icon name="spark" size={16} /> Dùng chung, vui hơn mỗi ngày</span>
          <h1>Đồ hay quanh bạn.<br /><span>Chia sẻ dễ dàng.</span></h1>
          <p className="hero-description">
            Tìm món đồ bạn cần từ cộng đồng sinh viên — mượn dùng khi cần, chia sẻ khi có.
          </p>
          <form
            className="search-bar"
            onSubmit={(event) => {
              event.preventDefault();
              document.getElementById("items")?.scrollIntoView({ behavior: "smooth" });
            }}
            role="search"
          >
            <Icon name="search" size={21} />
            <label className="visually-hidden" htmlFor="item-search">Tìm món đồ hoặc danh mục</label>
            <input
              id="item-search"
              type="search"
              placeholder="Bạn đang cần tìm món gì?"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(0);
              }}
            />
            <button type="submit">Tìm kiếm</button>
          </form>
          <div className="hero-note"><Icon name="pin" size={16} /> Gần bạn, ngay trong cộng đồng trường</div>
        </div>

        <div className="hero-art" aria-label="Minh họa những món đồ được chia sẻ">
          <div className="hero-art-orbit orbit-one" />
          <div className="hero-art-orbit orbit-two" />
          <div className="hero-art-sticker sticker-top"><Icon name="spark" size={17} /> Chia sẻ điều hay</div>
          <div className="hero-feature">
            <div className="feature-image"><Icon name="camera" size={72} /></div>
            <div className="feature-details">
              <div><span className="availability-dot" /> Sẵn sàng chia sẻ</div>
              <strong>Máy ảnh film</strong>
              <span className="feature-owner"><span className="avatar small-avatar">QB</span> Của Quốc Bảo</span>
            </div>
            <span className="feature-heart" aria-hidden="true">♡</span>
          </div>
          <div className="floating-book"><Icon name="book" size={37} /></div>
          <div className="floating-headphones"><Icon name="headphones" size={34} /></div>
          <div className="hero-art-caption">Một cộng đồng nhỏ,<br />nhiều điều sẻ chia <span>✳</span></div>
        </div>
      </section>

      <section className="community-strip" id="community" aria-label="Giá trị UniLend">
        <div className="community-message"><span className="status-indicator" /> Cùng nhau tạo nên một campus sẻ chia</div>
        <div className="community-value"><strong>Tiện lợi</strong><span>Đúng thứ bạn cần</span></div>
        <div className="community-value"><strong>Gần gũi</strong><span>Ngay trong trường mình</span></div>
        <div className="community-value"><strong>Bền vững</strong><span>Dùng tốt, dùng lâu hơn</span></div>
      </section>

      <section className="discover-section" id="items">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Khám phá UniLend</span>
            <h2>Món đồ đang được sẻ chia</h2>
            <p>Tìm cảm hứng cho lần mượn — hoặc lần chia sẻ tiếp theo của bạn.</p>
          </div>
          <Link className="text-link" href="/items">Xem danh sách đồ <Icon name="arrow" size={17} /></Link>
        </div>

        <div className="catalogue-toolbar">
          <div className="category-tabs" role="group" aria-label="Lọc theo danh mục">
            {categories.map((category) => (
              <button
                className={`category-tab${activeCategory === category ? " selected" : ""}`}
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  setPage(0);
                }}
                type="button"
                aria-pressed={activeCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
          <span className="result-count">{filteredItems.length} món đồ</span>
        </div>

        {filteredItems.length > 0 ? (
          <div className="item-grid">
            {paginatedItems.map((item, index) => (
              <article className="item-card" key={`${item.name}-${item.owner}-${index}`}>
                <div className={`item-art ${item.color}`}>
                  <span className="item-availability"><span className="availability-dot" /> Có thể chia sẻ</span>
                  <Icon name={item.icon} size={64} />
                  <span className="item-art-decoration" aria-hidden="true" />
                </div>
                <div className="item-info">
                  <span className="item-category">{item.category}</span>
                  <h3>{item.name}</h3>
                  <div className="item-owner"><span className="avatar">{item.initials}</span><span>{item.owner}</span><span className="owner-campus">· Sinh viên</span></div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon"><Icon name="search" size={28} /></span>
            <h3>Chưa tìm thấy món đồ phù hợp</h3>
            <p>Thử từ khóa khác hoặc chọn một danh mục khác nhé.</p>
            <button className="reset-search" onClick={() => { setQuery(""); setActiveCategory("Tất cả"); setPage(0); }} type="button">
              Xóa bộ lọc
            </button>
          </div>
        )}
        {pageCount > 1 && (
          <nav className="catalogue-pagination" aria-label="Phân trang danh sách món đồ">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              disabled={page === 0}
              aria-label="Trang trước"
            >
              ← <span>Trước</span>
            </button>
            <span aria-live="polite">Trang {page + 1} / {pageCount}</span>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
              disabled={page >= pageCount - 1}
              aria-label="Trang sau"
            >
              <span>Sau</span> →
            </button>
          </nav>
        )}
      </section>

      <section className="how-section" id="how-it-works">
        <div className="how-intro">
          <span className="section-kicker">Thật đơn giản</span>
          <h2>Chia sẻ bắt đầu<br />từ một món đồ.</h2>
          <p>Một món đồ nằm yên có thể giúp ai đó hoàn thành cả một ngày.</p>
          <a className="how-link" href="#items">Khám phá món đồ <Icon name="arrow" size={17} /></a>
        </div>
        <div className="steps">
          <article className="step-card"><span className="step-number">01</span><span className="step-icon"><Icon name="search" size={22} /></span><h3>Tìm món bạn cần</h3><p>Khám phá những món đồ hữu ích được chia sẻ bởi bạn bè quanh trường.</p></article>
          <article className="step-card"><span className="step-number">02</span><span className="step-icon"><Icon name="pin" size={22} /></span><h3>Kết nối gần bạn</h3><p>Chọn món phù hợp và hẹn nhau ở nơi thuận tiện trong campus.</p></article>
          <article className="step-card"><span className="step-number">03</span><span className="step-icon"><Icon name="spark" size={22} /></span><h3>Dùng xong, sẻ chia</h3><p>Trả món đồ để người tiếp theo cũng có thể tận dụng niềm vui đó.</p></article>
        </div>
      </section>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#home"><span className="brand-mark"><Icon name="box" size={19} /></span><span>uni<span className="brand-accent">lend</span></span></a>
        <p>Mượn một món đồ. Kết nối một cộng đồng.</p>
        <Link className="footer-top-link" href="/help">Trợ giúp / FAQ</Link>
        <a className="footer-top-link" href="#home">Về đầu trang ↑</a>
      </footer>
    </main>
  );
}
