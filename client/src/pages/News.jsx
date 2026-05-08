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
      .get("/api/news", { params: { page: 1, limit: 100 } })
      .then((r) => {
        const raw = Array.isArray(r.data) ? r.data : r.data?.data || [];
        const onlyPublished = raw.filter((n) => n?.isPublished === true);
        const data = onlyPublished.length ? onlyPublished : raw;
        data.sort((a, b) => {
          const da = new Date(a?.publishedAt || a?.date || a?.createdAt || 0).getTime();
          const db = new Date(b?.publishedAt || b?.date || b?.createdAt || 0).getTime();
          return db - da;
        });
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
          <div className="prod-list">
            {news.length ? (
              news.map((n, i) => (
                <div
                  key={n._id || n.id}
                  className={`prod-item ${i % 2 !== 0 ? "reverse" : ""}`}
                >
                  <div className="prod-img">
                    {n.image ? <img src={n.image} alt={n.title} /> : null}
                  </div>

                  <div className="prod-text">
                    <span
                      className="card-cat"
                      style={{ display: "inline-block", marginBottom: 16 }}
                    >
                      {formatDate(n.publishedAt || n.date || n.createdAt) ||
                        "Tin tức"}
                    </span>
                    <h2>{n.title}</h2>
                    <p>{n.excerpt || n.content}</p>
                    <Link
                      to="/tin-tuc"
                      className="btn-primary"
                      style={{ display: "inline-block", marginTop: 24 }}
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: "var(--white-dim)" }}>
                Chưa có tin tức / sự kiện nào được thêm.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
