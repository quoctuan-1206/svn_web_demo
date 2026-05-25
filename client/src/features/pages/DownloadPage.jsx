import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import "./PageCommon.css";
import styles from "./DownloadPage.module.css";
import PdfDownloadButton from "../../shared/components/PdfDownloadButton/PdfDownloadButton";
import { catalogItemPath, newsArticlePath } from "../../utils/contentPaths";
import { localizedField } from "../../i18n/localizeContent";
import { formatLocaleDate } from "../../i18n/localeDate";

const TAB_IDS = ["all", "product", "solution", "news"];

function pickDate(item, kind) {
  if (kind === "news") {
    return item?.publishedAt || item?.date || item?.createdAt;
  }
  return item?.updatedAt || item?.createdAt;
}

export default function DownloadPage() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  const tabs = useMemo(
    () =>
      TAB_IDS.map((id) => ({
        id,
        label:
          id === "all"
            ? t("catalog.all")
            : t(`catalog.${id === "news" ? "news" : id}`),
      })),
    [t, i18n.language],
  );

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
            title: p?.title,
            date: pickDate(p, "product"),
            to: catalogItemPath(p),
            raw: p,
          }));

        const news = rawNews
          .filter((n) => n?.isPublished !== false)
          .map((n) => ({
            id: String(n._id || n.id || n.slug),
            kind: "news",
            title: n?.title,
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

  const locale = i18n.language === "en" ? "en" : "vi";

  const displayItems = useMemo(() => {
    return items.map((entry) => ({
      ...entry,
      typeLabel: t(`catalog.${entry.kind}`),
      title:
        localizedField(entry.raw, "title", locale) || t("common.untitled"),
    }));
  }, [items, t, locale]);

  const filtered = useMemo(() => {
    let list = displayItems.slice();
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
  }, [displayItems, tab, query]);

  const counts = useMemo(() => {
    const c = { all: displayItems.length, product: 0, solution: 0, news: 0 };
    for (const i of displayItems) c[i.kind] = (c[i.kind] || 0) + 1;
    return c;
  }, [displayItems]);

  return (
    <main className={`page ${styles.page}`}>
      <section className={`page-hero ${styles.hero}`}>
        <div className="container">
          <h1 className={styles.heroTitle}>
            <span className={styles.headingPrimary}>
              {t("pages.download.titlePrimary")}
            </span>{" "}
            {t("pages.download.titleSuffix")}
          </h1>
          <p className="page-desc">{t("pages.download.desc")}</p>
        </div>
      </section>

      <section className={`page-content ${styles.content}`}>
        <div className={`container ${styles.shell}`}>
          <div className={styles.toolbar}>
            <div
              className={styles.tabs}
              role="tablist"
              aria-label={t("pages.download.tabsAria")}
            >
              {tabs.map((tabItem) => (
                <button
                  key={tabItem.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === tabItem.id}
                  className={`${styles.tab} ${tab === tabItem.id ? styles.tabActive : ""}`}
                  onClick={() => setTab(tabItem.id)}
                >
                  {tabItem.label}
                  <span className={styles.tabCount}>
                    {counts[tabItem.id] ?? 0}
                  </span>
                </button>
              ))}
            </div>

            <label className={styles.search}>
              <Search className={styles.searchIcon} size={16} aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("pages.download.searchPlaceholder")}
                aria-label={t("pages.download.searchAria")}
              />
            </label>
          </div>

          {loading ? (
            <p className={styles.state}>{t("pages.download.loading")}</p>
          ) : filtered.length === 0 ? (
            <p className={styles.state}>
              {items.length === 0
                ? t("pages.download.empty")
                : t("pages.download.noResults")}
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
                        {formatLocaleDate(entry.date)}
                      </time>
                    ) : null}
                  </div>
                  <div className={styles.rowActions}>
                    <Link className={styles.viewLink} to={entry.to}>
                      {t("common.viewDetail")}
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
