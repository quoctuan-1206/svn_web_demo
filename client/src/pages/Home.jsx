import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Home.css";

/* ── Hero ─────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg">
        <img
          src="https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=1600&q=80"
          alt="SVN Automation"
          className="hero-img"
        />
        <div className="hero-overlay" />
      </div>
      <div className="hero-content container">
        <p className="hero-eyebrow">SVN AUTOMATION CO., LTD</p>
        <h1 className="hero-title">
          Other People Make<br />
          Machines <span className="green">Task</span><br />
          WE MAKE THEM <span className="green">SING</span>
        </h1>
        <p className="hero-desc">
          Giải pháp tự động hóa công nghiệp toàn diện — từ robot cộng tác đến hệ thống 5G thông minh
        </p>
        <div className="hero-btns">
          <Link to="/san-pham" className="btn-primary">Khám phá Giải pháp</Link>
          <Link to="/lien-he" className="btn-outline">Liên hệ tư vấn</Link>
        </div>
        <div className="hero-stats">
          {[["15+", "Năm kinh nghiệm"], ["200+", "Dự án hoàn thành"], ["50+", "Đối tác toàn cầu"]].map(([n, l]) => (
            <div key={l} className="stat">
              <span className="stat-num">{n}</span>
              <span className="stat-label">{l}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="hero-scroll">
        <span />
      </div>
    </section>
  );
}

/* ── Products ─────────────────────────────────────────── */
function ProductsSection() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    axios.get("/api/products").then((r) => setProducts(r.data)).catch(() => {});
  }, []);

  return (
    <section className="products-section">
      <div className="container">
        <p className="section-label">Thiết bị & Nền tảng</p>
        <h2 className="section-title">Sản phẩm <span className="green">Công nghệ</span></h2>
        <p className="section-sub">Hệ sinh thái sản phẩm tự động hóa tiên tiến</p>
        <div className="cards-grid">
          {products.map((p) => (
            <div key={p.id} className="card">
              <div className="card-img-wrap">
                <img src={p.image} alt={p.title} className="card-img" />
                <span className="card-cat">{p.category}</span>
              </div>
              <div className="card-body">
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <Link to="/san-pham" className="card-link">Xem thêm →</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Solutions ────────────────────────────────────────── */
function SolutionsSection() {
  const [solutions, setSolutions] = useState([]);
  useEffect(() => {
    axios.get("/api/solutions").then((r) => setSolutions(r.data)).catch(() => {});
  }, []);

  return (
    <section className="solutions-section">
      <div className="container">
        <p className="section-label">Dựa trên Nền tảng Kinh nghiệm Thực chiến</p>
        <h2 className="section-title">
          Giải pháp <span className="green">Tự động</span>hóa Chuyên sâu
        </h2>
        <p className="section-sub">Industry Know-How tích lũy qua hàng trăm dự án</p>
        <div className="sol-grid">
          {solutions.map((s, i) => (
            <div key={s.id} className={`sol-card ${i === 0 ? "sol-featured" : ""}`}>
              <img src={s.image} alt={s.title} />
              <div className="sol-overlay">
                <h3>{s.title}</h3>
                <p>{s.description}</p>
                <Link to="/san-pham" className="sol-link">Khám phá thêm →</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Partners ─────────────────────────────────────────── */
function PartnersSection() {
  const [partners, setPartners] = useState([]);
  useEffect(() => {
    axios.get("/api/partners").then((r) => setPartners(r.data)).catch(() => {});
  }, []);

  return (
    <section className="partners-section" id="doi-tac">
      <div className="container">
        <h2 className="section-title">Đối tác được <span className="green">chứng nhận</span></h2>
        <p className="section-sub">Hợp tác với các thương hiệu hàng đầu thế giới</p>
        <div className="partners-grid">
          {partners.map((p) => (
            <div key={p.id} className="partner-card">
              <h3 className="partner-name">{p.name}</h3>
              <p className="partner-tag">{p.tagline}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── News ─────────────────────────────────────────────── */
function NewsSection() {
  const [news, setNews] = useState([]);
  useEffect(() => {
    axios.get("/api/news").then((r) => setNews(r.data)).catch(() => {});
  }, []);

  return (
    <section className="news-section">
      <div className="container">
        <div className="news-header">
          <div>
            <h2 className="section-title" style={{ textAlign: "left" }}>
              We Go <span className="green">The Extra Mile</span>
            </h2>
            <p style={{ color: "var(--white-dim)", marginTop: 8 }}>
              To help you keep the world in motion — Together, we Accompany the Future
            </p>
          </div>
          <Link to="/tin-tuc" className="btn-outline">Tất cả tin tức</Link>
        </div>
        <div className="news-grid">
          {news.map((n) => (
            <article key={n.id} className="news-card">
              <div className="news-img-wrap">
                <img src={n.image} alt={n.title} />
              </div>
              <div className="news-body">
                <span className="news-date">{n.date}</span>
                <h3>{n.title}</h3>
                <p>{n.excerpt}</p>
                <Link to="/tin-tuc" className="card-link">Đọc thêm →</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA Banner ───────────────────────────────────────── */
function CtaBanner() {
  return (
    <section className="cta-banner">
      <div className="container cta-inner">
        <div>
          <h2>Hãy để chúng tôi đồng hành cùng bạn 🤝</h2>
          <p>Kết nối với đội ngũ chuyên gia SVN Automation ngay hôm nay</p>
        </div>
        <Link to="/lien-he" className="btn-primary">Liên hệ ngay</Link>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <Hero />
      <ProductsSection />
      <SolutionsSection />
      <PartnersSection />
      <NewsSection />
      <CtaBanner />
    </main>
  );
}
