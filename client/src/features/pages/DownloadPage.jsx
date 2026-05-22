import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import "./PageCommon.css";
import styles from "./DownloadPage.module.css";
import PdfDownloadButton from "../../shared/components/PdfDownloadButton/PdfDownloadButton";
import { catalogItemPath, newsArticlePath } from "../../utils/contentPaths";

const TABS = [
  { id: "all", label: "Tất cả" },
  { id: "product", label: "Sản phẩm" },
  { id: "solution", label: "Giải pháp" },
  { id: "news", label: "Tin tức" },
];

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

function pickDate(item, kind) {
  if (kind === "news") {
    return item?.publishedAt || item?.date || item?.createdAt;
  }
  return item?.updatedAt || item?.createdAt;
}

export default function DownloadPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    let cancelled = false;

    Promise.all([
      axios.get("/api/products", { params: { page: 1, limit: 200 } }),
      axios.get("/api/news", { params: { page: 1, limit: 100 } }),
    ])
      .then(([productsRes, newsRes]) => {
        if (cancelled) return;

        const rawProducts = Array.isArray(productsRes.data)
          ? productsRes.data
          : productsRes.data?.data || [];
        const rawNews = Array.isArray(newsRes.data)
          ? newsRes.data
          : newsRes.data?.data || [];

        const catalog = rawProducts
          .filter((p) => p?.isActive !== false)
          .map((p) => ({
            id: String(p._id || p.id || p.slug),
            kind: p?.category === "solution" ? "solution" : "product",
            typeLabel: p?.category === "solution" ? "Giải pháp" : "Sản phẩm",
            title: p?.title || "Không có tiêu đề",
            date: pickDate(p, "product"),
            to: catalogItemPath(p),
            raw: p,
          }));

        const news = rawNews
          .filter((n) => n?.isPublished !== false)
          .map((n) => ({
            id: String(n._id || n.id || n.slug),
            kind: "news",
            typeLabel: "Tin tức",
            title: n?.title || "Không có tiêu đề",
            date: pickDate(n, "news"),
            to: newsArticlePath(n),
            raw: n,
          }));

        setItems([...catalog, ...news]);
      })
      .catch(() => setItems([]))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = items.slice();
    if (tab !== "all") list = list.filter((i) => i.kind === tab);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((i) => {
        const hay = [i.title, i.typeLabel]
          .map((v) => String(v || "").toLowerCase())
          .join(" ");
        return hay.includes(q);
      });
    }
    list.sort((a, b) => {
      const da = new Date(a.date || 0).getTime();
      const db = new Date(b.date || 0).getTime();
      return db - da;
    });
    return list;
  }, [items, tab, query]);

  const counts = useMemo(() => {
    const c = { all: items.length, product: 0, solution: 0, news: 0 };
    for (const i of items) c[i.kind] = (c[i.kind] || 0) + 1;
    return c;
  }, [items]);

  return (
    <main className={`page ${styles.page}`}>
      <section className="page-hero">
        <div className="container">
          <h1>
            Tài liệu <span>PDF</span>
          </h1>
          <p className="page-desc">
            Xuất nội dung sản phẩm, giải pháp và tin tức thành file PDF để lưu
            hoặc chia sẻ. Chọn mục bên dưới hoặc mở trang chi tiết để tải.
          </p>
        </div>
      </section>

      <section className={`page-content ${styles.content}`}>
        <div className={`container ${styles.shell}`}>
          <div className={styles.toolbar}>
            <div
              className={styles.tabs}
              role="tablist"
              aria-label="Loại tài liệu"
            >
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  className={`${styles.tab} ${tab === t.id ? styles.tabActive : ""}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                  <span className={styles.tabCount}>{counts[t.id] ?? 0}</span>
                </button>
              ))}
            </div>

            <label className={styles.search}>
              <Search className={styles.searchIcon} size={16} aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo tên…"
                aria-label="Tìm tài liệu"
              />
            </label>
          </div>

          {loading ? (
            <p className={styles.state}>Đang tải danh sách…</p>
          ) : filtered.length === 0 ? (
            <p className={styles.state}>
              {items.length === 0
                ? "Chưa có nội dung để tải."
                : "Không có kết quả phù hợp."}
            </p>
          ) : (
            <ul className={styles.list}>
              {filtered.map((entry) => (
                <li key={`${entry.kind}-${entry.id}`} className={styles.row}>
                  <div className={styles.rowMain}>
                    <span className={styles.badge}>{entry.typeLabel}</span>
                    <h2 className={styles.rowTitle}>
                      <Link to={entry.to}>{entry.title}</Link>
                    </h2>
                    {entry.date ? (
                      <time className={styles.rowDate} dateTime={entry.date}>
                        {formatDate(entry.date)}
                      </time>
                    ) : null}
                  </div>
                  <div className={styles.rowActions}>
                    <Link className={styles.viewLink} to={entry.to}>
                      Xem chi tiết
                    </Link>
                    <PdfDownloadButton
                      item={entry.raw}
                      kind={entry.kind}
                      compact
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
