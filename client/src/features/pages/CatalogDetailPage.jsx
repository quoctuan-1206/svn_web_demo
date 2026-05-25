import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import styles from "./NewsDetailPage.module.css";
import { catalogItemPath } from "../../utils/contentPaths";
import { ArticleBody } from "./ArticleBody";
import { localizedField } from "../../i18n/localizeContent";
import { formatLocaleDate } from "../../i18n/localeDate";

/** @param {{ variant: "product" | "solution" }} props */
export default function CatalogDetailPage({ variant }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "en" ? "en" : "vi";
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const listPath = variant === "solution" ? "/giai-phap" : "/san-pham";
  const listLabel = t(
    variant === "solution" ? "catalog.solution" : "catalog.product",
  );
  const relatedTitle = t(
    variant === "solution"
      ? "detail.relatedSolutions"
      : "detail.relatedProducts",
  );

  const bodySource = useMemo(() => {
    if (!item) return "";
    const c = localizedField(item, "content", locale);
    if (c) return c;
    return localizedField(item, "description", locale);
  }, [item, locale]);

  const leadText = useMemo(() => {
    if (!item) return "";
    return (
      localizedField(item, "excerpt", locale) ||
      localizedField(item, "description", locale)
    );
  }, [item, locale]);

  const displayTitle = item
    ? localizedField(item, "title", locale) || t("common.untitled")
    : "";

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!slug) {
      setError(t("detail.missingSlug"));
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    const param = decodeURIComponent(slug);

    axios
      .get(`/api/products/${encodeURIComponent(param)}`)
      .then((res) => {
        if (cancelled) return;
        const data = res.data;
        if (data?.category && data.category !== variant) {
          setItem(null);
          setError(t("detail.wrongCategory"));
          return;
        }
        setItem(data);
      })
      .catch(() => {
        if (cancelled) return;
        setItem(null);
        setError(t("detail.notFoundHidden"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, variant]);

  useEffect(() => {
    if (!item?._id && !item?.id) return;
    const id = String(item._id || item.id);
    axios
      .get("/api/products", { params: { page: 1, limit: 200 } })
      .then((r) => {
        const raw = Array.isArray(r.data) ? r.data : r.data?.data || [];
        const list = Array.isArray(raw) ? raw : [];
        const sameCat = list.filter(
          (p) =>
            p?.category === variant &&
            String(p._id || p.id) !== id &&
            p?.isActive !== false,
        );
        setRelated(sameCat.slice(0, 8));
      })
      .catch(() => {});
  }, [item?._id, item?.id, variant]);

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={`container ${styles.state}`}>{t("detail.loading")}</div>
      </main>
    );
  }

  if (error || !item) {
    return (
      <main className={styles.page}>
        <div className={`container ${styles.state}`}>
          <p>{error || t("detail.notFound")}</p>
          <Link className={styles.backLink} to={listPath}>
            ← {t("detail.backTo", { label: listLabel })}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.breadcrumb}>
        <div className="container">
          <Link to={listPath}>{listLabel}</Link>
          <span aria-hidden="true"> / </span>
          <span className={styles.breadcrumbCurrent}>
            {t("detail.breadcrumbDetail")}
          </span>
        </div>
      </div>

      <div className={`container ${styles.layout}`}>
        <article className={styles.main}>
          <header className={styles.header}>
            <h1 className={styles.title}>{displayTitle}</h1>
            {leadText ? <p className={styles.excerpt}>{leadText}</p> : null}
            <time
              className={styles.date}
              dateTime={item.updatedAt || item.createdAt}
            >
              {formatLocaleDate(item.updatedAt || item.createdAt, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </header>

          <section
            className={styles.content}
            aria-label={t("detail.mainContentAria")}
          >
            <ArticleBody content={bodySource} />
          </section>
        </article>

        <aside className={styles.sidebar} aria-label={t("detail.relatedAria")}>
          <h2 className={styles.sidebarTitle}>{relatedTitle}</h2>
          <ul className={styles.relatedList}>
            {related.map((rel) => (
              <li key={rel._id || rel.id}>
                <Link className={styles.relatedLink} to={catalogItemPath(rel)}>
                  {rel.image ? (
                    <img
                      className={styles.relatedThumb}
                      src={rel.image}
                      alt=""
                    />
                  ) : (
                    <div className={styles.relatedThumbPlaceholder} />
                  )}
                  <div className={styles.relatedMeta}>
                    <span className={styles.relatedDate}>
                      {formatLocaleDate(rel.updatedAt || rel.createdAt)}
                    </span>
                    <span className={styles.relatedTitle}>
                      {localizedField(rel, "title", locale)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {related.length === 0 ? (
            <p className={styles.sidebarEmpty}>{t("detail.noRelated")}</p>
          ) : null}
          <Link className={styles.allNews} to={listPath}>
            {t("detail.viewAll", { label: listLabel })}
          </Link>
        </aside>
      </div>
    </main>
  );
}
