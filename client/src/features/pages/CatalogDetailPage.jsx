import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import styles from "./NewsDetailPage.module.css";
import { catalogItemPath } from "../../utils/catalogItemPath";
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

/** @param {{ variant: "product" | "solution" }} props */
export default function CatalogDetailPage({ variant }) {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const listPath = variant === "solution" ? "/giai-phap" : "/san-pham";
  const listLabel = variant === "solution" ? "Giải pháp" : "Sản phẩm";
  const relatedTitle = variant === "solution" ? "Giải pháp khác" : "Sản phẩm khác";

  const bodySource = useMemo(() => {
    if (!item) return "";
    const c = String(item.content || "").trim();
    if (c) return c;
    return String(item.description || "").trim();
  }, [item]);

  const leadText = useMemo(() => {
    if (!item) return "";
    return String(item.excerpt || item.description || "").trim();
  }, [item]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!slug) {
      setError("Thiếu đường dẫn.");
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
          setError("Nội dung không thuộc mục này.");
          return;
        }
        setItem(data);
      })
      .catch(() => {
        if (cancelled) return;
        setItem(null);
        setError("Không tìm thấy hoặc đã ẩn.");
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
        <div className={`container ${styles.state}`}>Đang tải…</div>
      </main>
    );
  }

  if (error || !item) {
    return (
      <main className={styles.page}>
        <div className={`container ${styles.state}`}>
          <p>{error || "Không tìm thấy."}</p>
          <Link className={styles.backLink} to={listPath}>
            ← Quay lại {listLabel}
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
          <span className={styles.breadcrumbCurrent}>Chi tiết</span>
        </div>
      </div>

      <div className={`container ${styles.layout}`}>
        <article className={styles.main}>
          <header className={styles.header}>
            <h1 className={styles.title}>{item.title}</h1>
            {leadText ? <p className={styles.excerpt}>{leadText}</p> : null}
            <time className={styles.date} dateTime={item.updatedAt || item.createdAt}>
              {formatDate(item.updatedAt || item.createdAt)}
            </time>
          </header>

          <section className={styles.content} aria-label="Nội dung chính">
            <ArticleBody content={bodySource} />
          </section>
        </article>

        <aside className={styles.sidebar} aria-label="Liên quan">
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
                      {formatDateShort(rel.updatedAt || rel.createdAt)}
                    </span>
                    <span className={styles.relatedTitle}>{rel.title}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {related.length === 0 ? (
            <p className={styles.sidebarEmpty}>Chưa có mục liên quan.</p>
          ) : null}
          <Link className={styles.allNews} to={listPath}>
            Tất cả {listLabel.toLowerCase()} →
          </Link>
        </aside>
      </div>
    </main>
  );
}
