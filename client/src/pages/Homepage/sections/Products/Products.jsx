import styles from "./Products.module.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("/api/products")
      .then((r) => {
        const data = Array.isArray(r.data) ? r.data : r.data?.data || [];
        setProducts(data.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  return (
    <section className={styles.section} id="san-pham" aria-label="Products">
      <div className="container">
        <div className={styles.titleRow}>
          <h2 className="section-title">Sản phẩm Công nghệ</h2>
          <Link
            className="sectionRouteBtn"
            to="/san-pham"
            aria-label="Tới trang Sản phẩm"
          >
            Chuyển
          </Link>
        </div>
        <p className="section-sub">Thiết bị & Nền tảng</p>

        <div className={styles.grid}>
          {products.map((p) => (
            <article key={p._id || p.id} className={styles.card}>
              {p.image ? (
                <img
                  className={styles.img}
                  src={p.image}
                  alt={p.title}
                  loading="lazy"
                />
              ) : null}
              <div className={styles.overlay} aria-hidden="true" />
              <h3 className={styles.cardTitle}>{p.title}</h3>
            </article>
          ))}
        </div>

        <div className={styles.actions} />
      </div>
    </section>
  );
}
