import styles from "./News.module.css";
import { Link } from "react-router-dom";
import { newsArticlePath } from "../../../../../utils/newsArticlePath";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const PAGE_SIZE = 3;

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
  const [items, setItems] = useState([]);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    axios
      .get("/api/news?page=1&limit=50")
      .then((r) => {
        const data = Array.isArray(r.data) ? r.data : r.data?.data || [];
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
  }, []);

  const totalSlides = useMemo(() => {
    if (!items.length) return 1;
    return Math.ceil(items.length / PAGE_SIZE);
  }, [items.length]);

  const visible = useMemo(() => {
    const start = slide * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, slide]);

  useEffect(() => {
    setSlide((s) => Math.min(s, Math.max(0, totalSlides - 1)));
  }, [totalSlides]);

  function goPrev() {
    setSlide((s) => (s - 1 + totalSlides) % totalSlides);
  }

  function goNext() {
    setSlide((s) => (s + 1) % totalSlides);
  }

  const canNavigate = items.length > PAGE_SIZE;

  return (
    <section className={styles.section} id="tin-tuc" aria-label="News">
      <div className={`container ${styles.container}`}>
        <header className={styles.header}>
          <div className={styles.titleRow}>
            <h2 className={styles.title}>
              We Go{" "}
              <span className={styles.headingPrimary}>The Extra Mile</span>
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
          {visible.map((p, i) => (
            <Link
              key={`${slide}-${p._id || p.id || i}`}
              to={newsArticlePath(p)}
              className={`${styles.item} ${styles.itemLink}`}
            >
              <div className={styles.date}>
                {formatDate(p.publishedAt || p.date)}
              </div>
              <h3 className={styles.itemTitle}>
                {String(p.title || "")
                  .split("\n")
                  .map((line, j) => (
                    <span key={j} className={styles.titleLine}>
                      {line}
                    </span>
                  ))}
              </h3>
            </Link>
          ))}
        </div>

        <div className={styles.controlsRow} aria-label="News controls">
          <div className={styles.controls}>
            <button
              type="button"
              className={styles.ctrl}
              aria-label="Tin trước"
              disabled={!canNavigate}
              onClick={goPrev}
            >
              ‹
            </button>
            <button
              type="button"
              className={styles.ctrl}
              aria-label="Tin sau"
              disabled={!canNavigate}
              onClick={goNext}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}