import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  filterSiteSearch,
  pickRandomSearchSuggestions,
} from "../../shared/search/siteSearch";
import { useSiteSearchIndex } from "../../shared/search/useSiteSearchIndex";
import "./PageCommon.css";
import styles from "./Search.module.css";

const SEARCH_ICON_SRC = "/images/search.png";
const PAGE_SIZE = 10;
const SUGGESTION_COUNT = 5;

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [suggestions, setSuggestions] = useState([]);
  const { entries, loading } = useSiteSearchIndex();
  const navigate = useNavigate();
  const location = useLocation();

  const results = useMemo(
    () => filterSiteSearch(entries, query, 500),
    [entries, query],
  );

  const total = results.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const visible = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return results.slice(start, start + PAGE_SIZE);
  }, [results, page]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (loading || !entries.length) return;
    setSuggestions(pickRandomSearchSuggestions(entries, SUGGESTION_COUNT));
  }, [entries, loading]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  function scrollToSection(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goHomeThenScroll(id) {
    if (location.pathname === "/") {
      scrollToSection(id);
      return;
    }
    navigate("/", { replace: false });
    window.setTimeout(() => scrollToSection(id), 0);
  }

  function goToResult(result) {
    if (!result) return;
    if (result.sectionId) {
      goHomeThenScroll(result.sectionId);
      return;
    }
    navigate(result.to);
  }

  const hasQuery = query.trim().length > 0;
  const displayItems = hasQuery ? visible : suggestions;
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(page * PAGE_SIZE, total);
  const showEmpty = hasQuery && !loading && results.length === 0;
  const canPaginate = total > PAGE_SIZE;
  const showSuggestions = !hasQuery && !loading && suggestions.length > 0;

  return (
    <main className={`page ${styles.page}`}>
      <div className={`container ${styles.wrap}`}>
        <h1 className={styles.title}>Chúng tôi có thể giúp bạn tìm gì?</h1>

        <div className={styles.searchBlock} role="search">
          <label className={styles.searchField}>
            <img
              className={styles.searchIcon}
              src={SEARCH_ICON_SRC}
              alt=""
              aria-hidden="true"
            />
            <input
              className={styles.searchInput}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Bạn cần tìm gì?"
              aria-label="Tìm kiếm nội dung"
              autoComplete="off"
            />
          </label>
          <p className={styles.hint}>Nhập chủ đề, dịch vụ hoặc sản phẩm</p>
        </div>

        {hasQuery && !loading && total > 0 ? (
          <p className={styles.summary}>
            Hiển thị {rangeStart}–{rangeEnd} trong {total} kết quả
          </p>
        ) : null}

        {showSuggestions ? (
          <p className={styles.summary}>Gợi ý: sản phẩm, giải pháp và tin tức</p>
        ) : null}

        {loading ? (
          <p className={styles.status}>Đang tải dữ liệu...</p>
        ) : null}

        {showEmpty ? (
          <p className={styles.status}>Không tìm thấy kết quả phù hợp.</p>
        ) : null}

        {displayItems.length > 0 ? (
          <ul className={styles.list}>
            {displayItems.map((result) => (
              <li key={`${result.type}-${result.id}`}>
                <button
                  type="button"
                  className={styles.item}
                  onClick={() => goToResult(result)}
                >
                  <div className={styles.thumb} aria-hidden="true">
                    {result.image ? (
                      <img
                        className={styles.thumbImg}
                        src={result.image}
                        alt=""
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.thumbFallback} />
                    )}
                  </div>

                  <div className={styles.body}>
                    <span className={styles.category}>
                      {String(result.typeLabel || "").toUpperCase()}
                    </span>
                    <h2 className={styles.itemTitle}>{result.title}</h2>
                    {result.description ? (
                      <p className={styles.snippet}>{result.description}</p>
                    ) : null}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {hasQuery && !loading && canPaginate ? (
          <nav className={styles.pager} aria-label="Phân trang kết quả">
            <button
              type="button"
              className={styles.pagerBtn}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Trước
            </button>
            <span className={styles.pagerMeta}>
              Trang {page} / {totalPages}
            </span>
            <button
              type="button"
              className={styles.pagerBtn}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Sau
            </button>
          </nav>
        ) : null}
      </div>
    </main>
  );
}
