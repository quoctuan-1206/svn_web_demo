import styles from "./News.module.css";
import { Link } from "react-router-dom";
import { newsArticlePath } from "../../../../../utils/contentPaths";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { localizedField } from "../../../../../i18n/localizeContent";
import { formatLocaleDate } from "../../../../../i18n/localeDate";

const PAGE_SIZE = 3;

export default function News() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "en" ? "en" : "vi";
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
    <section className={styles.section} id="tin-tuc" aria-label={t("home.newsAria")}>
      <div className={`container ${styles.container}`}>
        <header className={styles.header}>
          <div className={styles.titleRow}>
            <h2 className={styles.title}>
              <Link
                to="/tin-tuc"
                className={styles.titleLink}
                aria-label={t("home.newsLinkAria")}
              >
                {t("home.newsTitlePrefix")}{" "}
                <span className={styles.headingPrimary}>
                  {t("home.newsTitleHighlight")}
                </span>
              </Link>
            </h2>
          </div>
          <p className={styles.sub}>{t("home.newsSub1")}</p>
          <p className={styles.sub}>{t("home.newsSub2")}</p>
        </header>

        <div className={styles.list} aria-label="Latest posts">
          {visible.map((p, i) => {
            const title = localizedField(p, "title", locale);
            return (
            <Link
              key={`${slide}-${p._id || p.id || i}`}
              to={newsArticlePath(p)}
              className={`${styles.item} ${styles.itemLink}`}
            >
              <div className={styles.date}>
                {formatLocaleDate(p.publishedAt || p.date)}
              </div>
              <h3 className={styles.itemTitle}>
                {String(title || "")
                  .split("\n")
                  .map((line, j) => (
                    <span key={j} className={styles.titleLine}>
                      {line}
                    </span>
                  ))}
              </h3>
            </Link>
          );
          })}
        </div>

        <div className={styles.controlsRow} aria-label="News controls">
          <div className={styles.controls}>
            <button
              type="button"
              className={styles.ctrl}
              aria-label={t("home.newsPrev")}
              disabled={!canNavigate}
              onClick={goPrev}
            >
              ‹
            </button>
            <button
              type="button"
              className={styles.ctrl}
              aria-label={t("home.newsNext")}
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
