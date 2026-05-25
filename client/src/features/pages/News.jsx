import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./PageCommon.css";
import { newsArticlePath } from "../../utils/contentPaths";
import styles from "./NewsPage.module.css";
import { localizedField, searchHaystack } from "../../i18n/localizeContent";
import { formatLocaleDate } from "../../i18n/localeDate";

const PAGE_SIZE = 12;

function pickCategoryLabel(p) {
  const raw =
    p?.category ||
    p?.type ||
    p?.tag ||
    p?.label ||
    (Array.isArray(p?.tags) ? p.tags[0] : "");
  const v = String(raw || "").trim();
  return v || "";
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

function pickDate(n) {
  return n?.publishedAt || n?.date || n?.createdAt || 0;
}

export default function News() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "en" ? "en" : "vi";
  const [news, setNews] = useState([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    window.scrollTo(0, 0);
    axios
      .get("/api/news", { params: { page: 1, limit: 100 } })
      .then((r) => {
        const raw = Array.isArray(r.data) ? r.data : r.data?.data || [];
        const onlyPublished = raw.filter((n) => n?.isPublished === true);
        const data = onlyPublished.length ? onlyPublished : raw;
        setNews(data);
      })
      .catch(() => {});
  }, []);

  const filteredNews = useMemo(() => {
    let arr = news.slice();

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      arr = arr.filter((n) =>
        searchHaystack(n, [
          "title",
          "summary",
          "excerpt",
          "description",
          "content",
        ]).includes(q),
      );
    }

    if (dateFrom) {
      const fromTs = new Date(dateFrom).getTime();
      if (!Number.isNaN(fromTs)) {
        arr = arr.filter((n) => new Date(pickDate(n)).getTime() >= fromTs);
      }
    }

    if (dateTo) {
      const toTs = new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 - 1;
      if (!Number.isNaN(toTs)) {
        arr = arr.filter((n) => new Date(pickDate(n)).getTime() <= toTs);
      }
    }

    arr.sort((a, b) => {
      const da = new Date(pickDate(a)).getTime();
      const db = new Date(pickDate(b)).getTime();
      return sortOrder === "oldest" ? da - db : db - da;
    });

    return arr;
  }, [news, searchQuery, dateFrom, dateTo, sortOrder]);

  const totalPages = useMemo(() => {
    if (!filteredNews.length) return 1;
    return Math.max(1, Math.ceil(filteredNews.length / PAGE_SIZE));
  }, [filteredNews.length]);

  const visible = useMemo(() => {
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredNews.slice(start, start + PAGE_SIZE);
  }, [filteredNews, page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, dateFrom, dateTo, sortOrder]);

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const canNavigate = filteredNews.length > PAGE_SIZE;
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
              {t("pages.news.titlePrimary")}
            </span>{" "}
            <span className={styles.headingSecondary}>
              {t("pages.news.titleSecondary")}
            </span>
          </h1>
        </div>
      </section>

      <section className="page-content">
        <div className={`container ${styles.contentShell}`}>
          <div
            className={styles.filtersRow}
            aria-label={t("pages.news.filterAria")}
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
                placeholder={t("pages.news.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={t("pages.news.searchAria")}
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

          {news.length ? (
            filteredNews.length ? (
              <>
                <div className={styles.grid} aria-label={t("pages.news.gridAria")}>
                  {visible.map((n) => {
                    const title = localizedField(n, "title", locale);
                    return (
                    <Link
                      key={n._id || n.id}
                      to={newsArticlePath(n)}
                      className={styles.card}
                      aria-label={title}
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
                        <div className={styles.kicker}>
                          {pickCategoryLabel(n) || t("catalog.news")}
                        </div>
                        <h2 className={styles.title}>{title}</h2>
                        <div className={styles.date}>
                          {formatLocaleDate(
                            n.publishedAt || n.date || n.createdAt,
                          )}
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
                {t("pages.news.emptyFilter")}
              </p>
            )
          ) : (
            <p className={styles.emptyState}>{t("pages.news.emptyList")}</p>
          )}
        </div>
      </section>
    </main>
  );
}
