import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./PageCommon.css";

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function News() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    axios
      .get("/api/news")
      .then((r) => {
        const data = Array.isArray(r.data) ? r.data : r.data?.data || [];
        setNews(data);
      })
      .catch(() => {});
  }, []);

  return (
    <main className="page">
      <div className="page-hero">
        <div className="container">
          <p className="page-eyebrow">SVN Automation</p>
          <h1>
            Tin tức <span className="green">& Sự kiện</span>
          </h1>
          <p className="page-desc">
            Cập nhật hoạt động, triển lãm và thành tựu mới nhất của SVN
          </p>
        </div>
      </div>

      <section className="page-content">
        <div className="container">
          <div className="news-page-grid">
            {news.map((n) => (
              <article key={n._id || n.id} className="news-card">
                <div className="news-img-wrap">
                  {n.image ? <img src={n.image} alt={n.title} /> : null}
                </div>
                <div className="news-body">
                  <span className="news-date">
                    {formatDate(n.publishedAt || n.date)}
                  </span>
                  <h3>{n.title}</h3>
                  <p>{n.excerpt || n.content}</p>
                  <Link to="/tin-tuc" className="card-link">
                    Đọc thêm →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
