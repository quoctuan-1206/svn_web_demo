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

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    axios
      .get("/api/products", { params: { page: 1, limit: 200 } })
      .then((r) => {
        const raw = Array.isArray(r.data) ? r.data : r.data?.data || [];
        const productItems = raw.filter(
          (n) => n?.category === "product" && n?.isActive !== false,
        );
        setProducts(productItems);
      })
      .catch(() => {});
  }, []);

  return (
    <main className="page">
      <div className="page-hero">
        <div className="container">
          <p className="page-eyebrow">Thiết bị & Nền tảng</p>
          <h1>
            Sản phẩm <span className="green">Công nghệ</span>
          </h1>
          <p className="page-desc">
            Hệ sinh thái sản phẩm tự động hóa tiên tiến từ SVN Automation
          </p>
        </div>
      </div>

      <section className="page-content">
        <div className="container">
          <div className="prod-list">
            {products.length ? (
              products.map((p, i) => (
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
                      {formatDate(p.updatedAt || p.createdAt) || "Sản phẩm"}
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
                Chưa có sản phẩm nào được hiển thị.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
