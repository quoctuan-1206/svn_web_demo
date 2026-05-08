import styles from "./News.module.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

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
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios
      .get("/api/news")
      .then((r) => {
        const data = Array.isArray(r.data) ? r.data : r.data?.data || [];
        setPosts(data.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  return (
    <section className={styles.section} id="tin-tuc" aria-label="News">
      <div className={`container ${styles.container}`}>
        <header className={styles.header}>
          <div className={styles.titleRow}>
            <h2 className={styles.title}>
              We Go <span className={styles.accent}>The Extra Mile</span>
            </h2>
            <Link
              className="sectionRouteBtn"
              to="/tin-tuc"
              aria-label="Tới trang Tin tức"
            >
              ⭢
            </Link>
          </div>
          <p className={styles.sub}>To help you keep the world in motion</p>
          <p className={styles.sub}>Together, we Accompany the Future</p>
        </header>

        <div className={styles.list} aria-label="Latest posts">
          {posts.map((p) => (
            <article key={p._id || p.id} className={styles.item}>
              <div className={styles.date}>
                {formatDate(p.publishedAt || p.date)}
              </div>
              <h3 className={styles.itemTitle}>
                {String(p.title || "")
                  .split("\n")
                  .map((line, i) => (
                    <span key={i} className={styles.titleLine}>
                      {line}
                    </span>
                  ))}
              </h3>
            </article>
          ))}
        </div>

        <div className={styles.controlsRow} aria-label="News controls">
          <div className={styles.controls}>
            <button type="button" className={styles.ctrl} aria-label="Previous">
              ‹
            </button>
            <button type="button" className={styles.ctrl} aria-label="Next">
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
