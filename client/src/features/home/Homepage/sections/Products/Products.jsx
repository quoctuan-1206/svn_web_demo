import styles from "./Products.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { catalogItemPath } from "../../../../../utils/contentPaths";
import { localizedField } from "../../../../../i18n/localizeContent";

export default function Products() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "en" ? "en" : "vi";
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("/api/products", { params: { page: 1, limit: 200 } })
      .then((r) => {
        const raw = Array.isArray(r.data) ? r.data : r.data?.data || [];
        const productItems = raw.filter((n) => n?.category === "product");
        setProducts(productItems.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  return (
    <section
      className={styles.section}
      id="san-pham"
      aria-label={t("home.productsAria")}
    >
      <div className="container">
        <div className={styles.titleRow}>
          <h2 className={styles.heading}>
            <Link
              to="/san-pham"
              className={styles.headingLink}
              aria-label={t("home.productsLinkAria")}
            >
              <span className={styles.headingPrimary}>
                {t("home.productsTitlePrimary")}
              </span>{" "}
              <span className={styles.headingSecondary}>
                {t("home.productsTitleSecondary")}
              </span>
            </Link>
          </h2>
        </div>
        <p className={styles.sub}>{t("home.productsSub")}</p>

        <div className={styles.grid}>
          {products.map((p) => {
            const title = localizedField(p, "title", locale);
            return (
            <Link
              key={p._id || p.id}
              className={styles.card}
              to={catalogItemPath(p)}
              aria-label={title}
            >
              {p.image ? (
                <img
                  className={styles.img}
                  src={p.image}
                  alt={title}
                  loading="lazy"
                />
              ) : null}
              <h3 className={styles.cardTitle}>{title}</h3>
            </Link>
          );
          })}
        </div>
      </div>
    </section>
  );
}
