import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import styles from "./NewsDetailPage.module.css";
import { newsArticlePath } from "../../utils/contentPaths";
import { ArticleBody } from "./ArticleBody";

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateShort(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function NewsDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /** Chỉ gallery — không hiển thị ảnh đại diện ở phần minh họa chi tiết */
  const illustrationUrls = useMemo(() => {
    if (!article) return [];
    const gallery = Array.isArray(article.gallery) ? article.gallery : [];
    return [...new Set(gallery.filter(Boolean))];
  }, [article]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!slug) {
      setError("Thiếu đường dẫn bài viết.");
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
        setError("Không tìm thấy bài viết hoặc đã gỡ xuống.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

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

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={`container ${styles.state}`}>Đang tải…</div>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className={styles.page}>
        <div className={`container ${styles.state}`}>
          <p>{error || "Không tìm thấy bài viết."}</p>
          <Link className={styles.backLink} to="/tin-tuc">
            ← Quay lại Tin tức
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.breadcrumb}>
        <div className="container">
          <Link to="/tin-tuc">Tin tức</Link>
          <span aria-hidden="true"> / </span>
          <span className={styles.breadcrumbCurrent}>Chi tiết</span>
        </div>
      </div>

      <div className={`container ${styles.layout}`}>
        <article className={styles.main}>
          <header className={styles.header}>
            <h1 className={styles.title}>{article.title}</h1>
            {article.excerpt ? (
              <p className={styles.excerpt}>{article.excerpt}</p>
            ) : null}
            <time
              className={styles.date}
              dateTime={article.publishedAt || article.createdAt}
            >
              {formatDate(
                article.publishedAt || article.date || article.createdAt,
              )}
            </time>
          </header>

          {illustrationUrls.length > 0 ? (
            <section className={styles.gallery} aria-label="Hình ảnh minh họa">
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

          <section className={styles.content} aria-label="Nội dung chính">
            <ArticleBody content={article.content} />
          </section>
        </article>

        <aside className={styles.sidebar} aria-label="Tin liên quan">
          <h2 className={styles.sidebarTitle}>Tin liên quan</h2>
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
                      {formatDateShort(
                        item.publishedAt || item.date || item.createdAt,
                      )}
                    </span>
                    <span className={styles.relatedTitle}>{item.title}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {related.length === 0 ? (
            <p className={styles.sidebarEmpty}>Chưa có tin liên quan.</p>
          ) : null}
          <Link className={styles.allNews} to="/tin-tuc">
            Tất cả tin tức →
          </Link>
        </aside>
      </div>
    </main>
  );
}
