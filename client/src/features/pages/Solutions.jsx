import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./PageCommon.css";
import { catalogItemPath } from "../../utils/catalogItemPath";

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

export default function Solutions() {
  const [solutions, setSolutions] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    axios
      .get("/api/products", { params: { page: 1, limit: 200 } })
      .then((r) => {
        const raw = Array.isArray(r.data) ? r.data : r.data?.data || [];
        const solutionItems = raw.filter(
          (n) => n?.category === "solution" && n?.isActive !== false,
        );
        setSolutions(solutionItems);
      })
      .catch(() => {});
  }, []);

  return (
    <main className="page">
      <div className="page-hero">
        <div className="container">
          <p className="page-eyebrow">Giải pháp</p>
          <h1>
            Giải pháp <span className="green">Tự động hóa</span>
          </h1>
          <p className="page-desc">
            Các giải pháp tự động hóa được thiết kế và phát triển bởi SVN Automation
          </p>
        </div>
      </div>

      <section className="page-content">
        <div className="container">
          <div className="prod-list">
            {solutions.length ? (
              solutions.map((p, i) => (
                <div
                  key={p._id || p.id}
                  className={`prod-item ${i % 2 !== 0 ? "reverse" : ""}`}
                >
                  <div className="prod-img">
                    {p.image ? <img src={p.image} alt={p.title} /> : null}
                  </div>
                  <div className="prod-text">
                    <span
                      className="card-cat"
                      style={{ display: "inline-block", marginBottom: 16 }}
                    >
                      {formatDate(p.updatedAt || p.createdAt) || "Giải pháp"}
                    </span>
                    <h2>{p.title}</h2>
                    <p>{p.excerpt || p.description}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24 }}>
                      <Link to={catalogItemPath(p)} className="btn-primary" style={{ display: "inline-block" }}>
                        Xem chi tiết
                      </Link>
                      <Link
                        to="/lien-he"
                        className="btn-primary"
                        style={{ display: "inline-block", opacity: 0.92 }}
                      >
                        Tư vấn
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: "var(--white-dim)" }}>
                Chưa có giải pháp nào được hiển thị.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
