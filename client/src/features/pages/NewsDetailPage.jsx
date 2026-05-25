import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import styles from "./NewsDetailPage.module.css";
import { newsArticlePath } from "../../utils/contentPaths";
import { ArticleBody } from "./ArticleBody";
import { localizedField } from "../../i18n/localizeContent";
import { formatLocaleDate } from "../../i18n/localeDate";

export default function NewsDetailPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "en" ? "en" : "vi";
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const illustrationUrls = useMemo(() => {
    if (!article) return [];
    const gallery = Array.isArray(article.gallery) ? article.gallery : [];
    return [...new Set(gallery.filter(Boolean))];
  }, [article]);

  const displayTitle = article
    ? localizedField(article, "title", locale) || t("common.untitled")
    : "";
  const displayExcerpt = article
    ? localizedField(article, "excerpt", locale)
    : "";
  const bodySource = article
    ? localizedField(article, "content", locale)
    : "";

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!slug) {
      setError(t("detail.missingNewsSlug"));
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    const param = decodeURIComponent(slug);

    axios
      .get(`/api/news/${encodeURIComponent(param)}`)
      .then((res) => {
        if (cancelled) return;
        setArticle(res.data);
      })
      .catch(() => {
        if (cancelled) return;
        setArticle(null);
        setError(t("detail.notFoundNews"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, t]);

  useEffect(() => {
    if (!article?._id && !article?.id) return;
    const id = String(article._id || article.id);
    axios
      .get("/api/news", { params: { page: 1, limit: 80 } })
      .then((r) => {
        const raw = Array.isArray(r.data) ? r.data : r.data?.data || [];
        const list = Array.isArray(raw) ? raw : [];
        const filtered = list.filter((n) => String(n._id || n.id) !== id);
        setRelated(filtered.slice(0, 8));
      })
      .catch(() => {});
  }, [article?._id, article?.id]);

  const newsLabel = t("catalog.news");

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={`container ${styles.state}`}>{t("detail.loading")}</div>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className={styles.page}>
        <div className={`container ${styles.state}`}>
          <p>{error || t("detail.notFound")}</p>
          <Link className={styles.backLink} to="/tin-tuc">
            ← {t("detail.backToNews")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.breadcrumb}>
        <div className="container">
          <Link to="/tin-tuc">{newsLabel}</Link>
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
            {displayExcerpt ? (
              <p className={styles.excerpt}>{displayExcerpt}</p>
            ) : null}
            <time
              className={styles.date}
              dateTime={article.publishedAt || article.createdAt}
            >
              {formatLocaleDate(
                article.publishedAt || article.date || article.createdAt,
                { year: "numeric", month: "long", day: "numeric" },
              )}
            </time>
          </header>

          {illustrationUrls.length > 0 ? (
            <section
              className={styles.gallery}
              aria-label={t("detail.galleryAria")}
            >
              <div
                className={
                  illustrationUrls.length === 1
                    ? styles.gallerySingle
                    : styles.galleryGrid
                }
              >
                {illustrationUrls.map((url, idx) => (
                  <figure key={`${url}-${idx}`} className={styles.figure}>
                    <img
                      src={url}
                      alt=""
                      loading={idx === 0 ? "eager" : "lazy"}
                    />
                  </figure>
                ))}
              </div>
            </section>
          ) : null}

          <section
            className={styles.content}
            aria-label={t("detail.mainContentAria")}
          >
            <ArticleBody content={bodySource} />
          </section>
        </article>

        <aside className={styles.sidebar} aria-label={t("detail.relatedNews")}>
          <h2 className={styles.sidebarTitle}>{t("detail.relatedNews")}</h2>
          <ul className={styles.relatedList}>
            {related.map((item) => (
              <li key={item._id || item.id}>
                <Link className={styles.relatedLink} to={newsArticlePath(item)}>
                  {item.image ? (
                    <img
                      className={styles.relatedThumb}
                      src={item.image}
                      alt=""
                    />
                  ) : (
                    <div className={styles.relatedThumbPlaceholder} />
                  )}
                  <div className={styles.relatedMeta}>
                    <span className={styles.relatedDate}>
                      {formatLocaleDate(
                        item.publishedAt || item.date || item.createdAt,
                      )}
                    </span>
                    <span className={styles.relatedTitle}>
                      {localizedField(item, "title", locale)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {related.length === 0 ? (
            <p className={styles.sidebarEmpty}>{t("detail.noRelated")}</p>
          ) : null}
          <Link className={styles.allNews} to="/tin-tuc">
            {t("detail.viewAllNews")}
          </Link>
        </aside>
      </div>
    </main>
  );
}
