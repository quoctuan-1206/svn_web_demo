import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./PageCommon.css";
import { catalogItemPath } from "../../utils/contentPaths";
import styles from "./NewsPage.module.css";
import { localizedField, searchHaystack } from "../../i18n/localizeContent";
import { formatLocaleDate } from "../../i18n/localeDate";

const PAGE_SIZE = 12;

function pickDate(p) {
  return p?.updatedAt || p?.createdAt || p?.date || 0;
}

export default function Solutions() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "en" ? "en" : "vi";
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
      arr = arr.filter((p) =>
        searchHaystack(p, [
          "title",
          "summary",
          "excerpt",
          "description",
        ]).includes(q),
      );
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
      <section className={`page-hero ${styles.pageHero}`}>
        <div className="container">
          <h1 className={styles.heroTitle}>
            <span className={styles.headingPrimary}>
              {t("pages.solutions.titlePrimary")}
            </span>{" "}
            <span className={styles.headingSecondary}>
              {t("pages.solutions.titleSecondary")}
            </span>
          </h1>
        </div>
      </section>

      <section className="page-content">
        <div className={`container ${styles.contentShell}`}>
          <div
            className={styles.filtersRow}
            aria-label={t("pages.solutions.filterAria")}
          >
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
                placeholder={t("pages.solutions.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={t("pages.solutions.searchAria")}
              />
            </div>

            <div className={`${styles.filterField} ${styles.filterDate}`}>
              <input
                type="date"
                className={styles.filterInput}
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                aria-label={t("common.fromDate")}
              />
              <span className={styles.dateSeparator} aria-hidden="true">
                –
              </span>
              <input
                type="date"
                className={styles.filterInput}
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                aria-label={t("common.toDate")}
              />
            </div>

            <div className={`${styles.filterField} ${styles.filterSort}`}>
              <select
                className={styles.filterInput}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                aria-label={t("common.sort")}
              >
                <option value="newest">{t("common.newest")}</option>
                <option value="oldest">{t("common.oldest")}</option>
              </select>
            </div>

            <button
              type="button"
              className={styles.resetBtn}
              onClick={resetFilters}
              disabled={!hasActiveFilter}
              aria-label={t("common.resetFilters")}
            >
              {t("common.reset")}
            </button>
          </div>

          {solutions.length ? (
            filteredSolutions.length ? (
              <>
                <div className={styles.grid} aria-label={t("pages.solutions.gridAria")}>
                  {visible.map((p) => {
                    const title = localizedField(p, "title", locale);
                    return (
                    <Link
                      key={p._id || p.id}
                      to={catalogItemPath(p)}
                      className={styles.card}
                      aria-label={title}
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
                        <div className={styles.kicker}>{t("catalog.solution")}</div>
                        <h2 className={styles.title}>{title}</h2>
                        <div className={styles.date}>
                          {formatLocaleDate(pickDate(p))}
                        </div>
                      </div>
                    </Link>
                  );
                  })}
                </div>

                <div className={styles.pagerRow} aria-label="Pagination row">
                  <div className={styles.pager} aria-label="Pagination">
                    <button
                      type="button"
                      className={styles.ctrl}
                      aria-label={t("common.prevPage")}
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
                            aria-label={t("common.pageN", { n: totalPages })}
                          >
                            {totalPages}
                          </button>
                        </>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      className={styles.ctrl}
                      aria-label={t("common.nextPage")}
                      disabled={!canNavigate}
                      onClick={goNext}
                    >
                      ›
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p className={styles.emptyState}>
                {t("pages.solutions.emptyFilter")}
              </p>
            )
          ) : (
            <p className={styles.emptyState}>
              {t("pages.solutions.emptyList")}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
