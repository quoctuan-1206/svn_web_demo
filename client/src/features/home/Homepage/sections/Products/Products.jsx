import styles from "./Products.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("/api/products", { params: { page: 1, limit: 200 } })
      .then((r) => {
        const raw = Array.isArray(r.data) ? r.data : r.data?.data || [];
        const productItems = raw.filter((n) => n?.category === "product");
        const onlyPublished = productItems.filter((n) => n?.isPublished === true);
        const data = onlyPublished.length ? onlyPublished : productItems;
        setProducts(data.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  return (
    <section className={styles.section} id="san-pham" aria-label="Products">
      <div className="container">
        <div className={styles.titleRow}>
          <h2 className={styles.heading}>
            <span className={styles.headingPrimary}>Sản phẩm</span>{" "}
            <span className={styles.headingSecondary}>Công nghệ</span>
          </h2>
          <Link
            className="sectionRouteBtn"
            to="/san-pham"
            aria-label="Tới trang Sản phẩm"
          >
            ⭢
          </Link>
        </div>
        <p className={styles.sub}>Thiết bị &amp; Nền tảng</p>

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
      </div>
    </section>
  );
}
