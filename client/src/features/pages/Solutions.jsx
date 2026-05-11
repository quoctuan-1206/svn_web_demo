import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./PageCommon.css";
import { catalogItemPath } from "../../utils/catalogItemPath";
import styles from "./NewsPage.module.css";

const PAGE_SIZE = 12;

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
  const [page, setPage] = useState(1);

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

  const totalPages = useMemo(() => {
    if (!solutions.length) return 1;
    return Math.max(1, Math.ceil(solutions.length / PAGE_SIZE));
  }, [solutions.length]);

  const visible = useMemo(() => {
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return solutions.slice(start, start + PAGE_SIZE);
  }, [solutions, page, totalPages]);

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const canNavigate = solutions.length > PAGE_SIZE;

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
          {solutions.length ? (
            <>
              <div className={styles.grid} aria-label="Solutions grid">
                {visible.map((p) => (
                  <Link
                    key={p._id || p.id}
                    to={catalogItemPath(p)}
                    className={styles.card}
                    aria-label={p.title}
                  >
                    <div className={styles.media} aria-hidden="true">
                      {p.image ? (
                        <img className={styles.img} src={p.image} alt="" loading="lazy" />
                      ) : (
                        <div className={styles.imgFallback} />
                      )}
                    </div>
                    <div className={styles.meta}>
                      <div className={styles.kicker}>Giải pháp</div>
                      <h2 className={styles.title}>{p.title}</h2>
                      <div className={styles.date}>
                        {formatDate(p.updatedAt || p.createdAt)}
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
                      const pg = idx + 1;
                      const active = pg === page;
                      return (
                        <button
                          key={pg}
                          type="button"
                          className={`${styles.pageNum} ${
                            active ? styles.pageNumActive : ""
                          }`}
                          onClick={() => setPage(pg)}
                          aria-current={active ? "page" : undefined}
                          disabled={!canNavigate}
                        >
                          {pg}
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
              Chưa có giải pháp nào được hiển thị.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
