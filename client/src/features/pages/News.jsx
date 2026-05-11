import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./PageCommon.css";
import { newsArticlePath } from "../../utils/newsArticlePath";
import styles from "./NewsPage.module.css";

const PAGE_SIZE = 12;

function pickCategoryLabel(p) {
  const raw =
    p?.category ||
    p?.type ||
    p?.tag ||
    p?.label ||
    (Array.isArray(p?.tags) ? p.tags[0] : "");
  const v = String(raw || "").trim();
  return v || "News";
}

function pickImage(p) {
  return (
    p?.image ||
    p?.thumbnail ||
    p?.thumb ||
    p?.cover ||
    p?.coverImage ||
    p?.heroImage ||
    ""
  );
}

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
  const [page, setPage] = useState(1);

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

  const totalPages = useMemo(() => {
    if (!news.length) return 1;
    return Math.max(1, Math.ceil(news.length / PAGE_SIZE));
  }, [news.length]);

  const visible = useMemo(() => {
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return news.slice(start, start + PAGE_SIZE);
  }, [news, page, totalPages]);

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const canNavigate = news.length > PAGE_SIZE;

  function goPrev() {
    setPage((p) => (p - 1 < 1 ? totalPages : p - 1));
  }

  function goNext() {
    setPage((p) => (p + 1 > totalPages ? 1 : p + 1));
  }

  return (
    <main className={`page ${styles.page}`}>
      <section className="page-content">
        <div className={`container ${styles.contentShell}`}>
          {news.length ? (
            <>
              <div className={styles.grid} aria-label="News grid">
                {visible.map((n) => (
                  <Link
                    key={n._id || n.id}
                    to={newsArticlePath(n)}
                    className={styles.card}
                    aria-label={n.title}
                  >
                    <div className={styles.media} aria-hidden="true">
                      {pickImage(n) ? (
                        <img
                          className={styles.img}
                          src={pickImage(n)}
                          alt=""
                          loading="lazy"
                        />
                      ) : (
                        <div className={styles.imgFallback} />
                      )}
                    </div>

                    <div className={styles.meta}>
                      <div className={styles.kicker}>{pickCategoryLabel(n)}</div>
                      <h2 className={styles.title}>{n.title}</h2>
                      <div className={styles.date}>
                        {formatDate(n.publishedAt || n.date || n.createdAt)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className={styles.pagerRow} aria-label="Pagination row">
                <div className={styles.pager} aria-label="Pagination">
                  <button
                    type="button"
                    className={styles.ctrl}
                    aria-label="Trang trước"
                    disabled={!canNavigate}
                    onClick={goPrev}
                  >
                    ‹
                  </button>

                  <div className={styles.pageNums} aria-label="Pages">
                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
                      const p = idx + 1;
                      const active = p === page;
                      return (
                        <button
                          key={p}
                          type="button"
                          className={`${styles.pageNum} ${
                            active ? styles.pageNumActive : ""
                          }`}
                          onClick={() => setPage(p)}
                          aria-current={active ? "page" : undefined}
                          disabled={!canNavigate}
                        >
                          {p}
                        </button>
                      );
                    })}
                    {totalPages > 5 ? (
                      <>
                        <span className={styles.ellipsis} aria-hidden="true">
                          …
                        </span>
                        <button
                          type="button"
                          className={`${styles.pageNum} ${
                            page === totalPages ? styles.pageNumActive : ""
                          }`}
                          onClick={() => setPage(totalPages)}
                          disabled={!canNavigate}
                          aria-label={`Trang ${totalPages}`}
                        >
                          {totalPages}
                        </button>
                      </>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    className={styles.ctrl}
                    aria-label="Trang sau"
                    disabled={!canNavigate}
                    onClick={goNext}
                  >
                    ›
                  </button>
                </div>
              </div>

              <div className={styles.touchStrip} aria-label="Get in touch">
                <div className={styles.touchInner}>
                  <div className={styles.touchTitle}>Get in Touch with Us</div>
                  <Link className={styles.touchBtn} to="/lien-he" aria-label="Contact us">
                    Contact us <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <p style={{ color: "var(--white-dim)" }}>
              Chưa có tin tức / sự kiện nào được thêm.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
