import styles from "./Solutions.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { catalogItemPath } from "../../../../../utils/catalogItemPath";

export default function Solutions() {
  const [solutions, setSolutions] = useState([]);

  useEffect(() => {
    axios
      .get("/api/products", { params: { page: 1, limit: 200 } })
      .then((r) => {
        const raw = Array.isArray(r.data) ? r.data : r.data?.data || [];
        const solutionItems = raw.filter((n) => n?.category === "solution");
        // Public API đã lọc isActive=true; ở đây chỉ cần lấy đúng category.
        setSolutions(solutionItems.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  return (
    <section className={styles.section} id="giai-phap" aria-label="Solutions">
      <div className="container">
        <div className={styles.titleRow}>
          <h2 className={styles.heading}>
            <span className={styles.headingPrimary}>Giải pháp Tự động hóa</span>{" "}
            <span className={styles.headingSecondary}>Chuyên sâu</span>
          </h2>
          <Link
            className="sectionRouteBtn"
            to="/giai-phap"
            aria-label="Tới trang Giải pháp"
          >
            ⭢
          </Link>
        </div>
        <p className={styles.sub}>Nền tảng kỹ thuật vững &amp; triển khai thực tế</p>

        <div className={styles.grid} aria-label="Giải pháp nổi bật">
          {solutions.map((s) => (
            <article
              key={s._id || s.id || s.title}
              className={styles.card}
              aria-label={s.title}
            >
              <img
                className={styles.img}
                src={s.image || s.img}
                alt={s.title || "Solution"}
                loading="lazy"
              />
              <div className={styles.overlay} aria-hidden="true" />

              <div className={styles.panel}>
                <h3 className={styles.cardTitle}>{s.title}</h3>
                <p className={styles.cardDesc}>{s.description || s.desc}</p>
                <Link className={styles.cardLink} to={catalogItemPath(s)}>
                  Xem chi tiết →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
