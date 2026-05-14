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

function pickDate(p) {
  return p?.updatedAt || p?.createdAt || p?.date || 0;
}

export default function Solutions() {
  const [solutions, setSolutions] = useState([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

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

  const filteredSolutions = useMemo(() => {
    let arr = solutions.slice();

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      arr = arr.filter((p) => {
        const haystack = [p?.title, p?.summary, p?.excerpt, p?.description]
          .map((v) => String(v || "").toLowerCase())
          .join(" ");
        return haystack.includes(q);
      });
    }

    if (dateFrom) {
      const fromTs = new Date(dateFrom).getTime();
      if (!Number.isNaN(fromTs)) {
        arr = arr.filter((p) => new Date(pickDate(p)).getTime() >= fromTs);
      }
    }

    if (dateTo) {
      const toTs = new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 - 1;
      if (!Number.isNaN(toTs)) {
        arr = arr.filter((p) => new Date(pickDate(p)).getTime() <= toTs);
      }
    }

    arr.sort((a, b) => {
      const da = new Date(pickDate(a)).getTime();
      const db = new Date(pickDate(b)).getTime();
      return sortOrder === "oldest" ? da - db : db - da;
    });

    return arr;
  }, [solutions, searchQuery, dateFrom, dateTo, sortOrder]);

  const totalPages = useMemo(() => {
    if (!filteredSolutions.length) return 1;
    return Math.max(1, Math.ceil(filteredSolutions.length / PAGE_SIZE));
  }, [filteredSolutions.length]);

  const visible = useMemo(() => {
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredSolutions.slice(start, start + PAGE_SIZE);
  }, [filteredSolutions, page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, dateFrom, dateTo, sortOrder]);

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const canNavigate = filteredSolutions.length > PAGE_SIZE;
  const hasActiveFilter = Boolean(
    searchQuery || dateFrom || dateTo || sortOrder !== "newest",
  );

  function resetFilters() {
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
    setSortOrder("newest");
  }

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
          <div className={styles.filtersRow} aria-label="Bộ lọc giải pháp">
            <div className={`${styles.filterField} ${styles.filterSearch}`}>
              <svg
                className={styles.searchIcon}
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="text"
                className={styles.filterInput}
                placeholder="Tìm kiếm giải pháp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Tìm kiếm giải pháp"
              />
            </div>

            <div className={`${styles.filterField} ${styles.filterDate}`}>
              <input
                type="date"
                className={styles.filterInput}
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                aria-label="Từ ngày"
              />
              <span className={styles.dateSeparator} aria-hidden="true">
                –
              </span>
              <input
                type="date"
                className={styles.filterInput}
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                aria-label="Đến ngày"
              />
            </div>

            <div className={`${styles.filterField} ${styles.filterSort}`}>
              <select
                className={styles.filterInput}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                aria-label="Sắp xếp"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
              </select>
            </div>

            <button
              type="button"
              className={styles.resetBtn}
              onClick={resetFilters}
              disabled={!hasActiveFilter}
              aria-label="Đặt lại bộ lọc"
            >
              Đặt lại
            </button>
          </div>

          {solutions.length ? (
            filteredSolutions.length ? (
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
                          <img
                            className={styles.img}
                            src={p.image}
                            alt=""
                            loading="lazy"
                          />
                        ) : (
                          <div className={styles.imgFallback} />
                        )}
                      </div>
                      <div className={styles.meta}>
                        <div className={styles.kicker}>Giải pháp</div>
                        <h2 className={styles.title}>{p.title}</h2>
                        <div className={styles.date}>
                          {formatDate(pickDate(p))}
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
                      {Array.from({ length: Math.min(totalPages, 5) }).map(
                        (_, idx) => {
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
                        },
                      )}
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
                    <div className={styles.touchTitle}>
                      Get in Touch with Us
                    </div>
                    <Link
                      className={styles.touchBtn}
                      to="/lien-he"
                      aria-label="Contact us"
                    >
                      Contact us <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <p className={styles.emptyState}>
                Không tìm thấy giải pháp phù hợp với bộ lọc hiện tại.
              </p>
            )
          ) : (
            <p className={styles.emptyState}>
              Chưa có giải pháp nào được hiển thị.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
