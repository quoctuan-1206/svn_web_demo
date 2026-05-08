import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./PageCommon.css";

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    axios
      .get("/api/products", { params: { page: 1, limit: 200 } })
      .then((r) => {
        const raw = Array.isArray(r.data) ? r.data : r.data?.data || [];
        const productItems = raw.filter((n) => n?.category === "product");
        const onlyPublished = productItems.filter((n) => n?.isPublished === true);
        const data = onlyPublished.length ? onlyPublished : productItems;
        setProducts(data);
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
            {products.map((p, i) => (
              <div
                key={p._id || p.id}
                className={`prod-item ${i % 2 !== 0 ? "reverse" : ""}`}
              >
                <div className="prod-img">
                  {p.image ? <img src={p.image} alt={p.title} /> : null}
                </div>
                <div className="prod-text">
                  {p.category ? (
                    <span
                      className="card-cat"
                      style={{ display: "inline-block", marginBottom: 16 }}
                    >
                      {p.category}
                    </span>
                  ) : null}
                  <h2>{p.title}</h2>
                  <p>{p.description}</p>
                  <Link
                    to="/lien-he"
                    className="btn-primary"
                    style={{ display: "inline-block", marginTop: 24 }}
                  >
                    Tư vấn ngay
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
