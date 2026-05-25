import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./Footer.module.css";
import { useHomepageSection } from "../../../context/HomepageSectionContext";

export default function Footer({ withId = true } = {}) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { activeSectionId } = useHomepageSection();
  const isHomepage = pathname === "/";
  const isActive = (to) => pathname === to || pathname.startsWith(`${to}/`);

  return (
    <footer className={styles.footer} id={withId ? "footer" : undefined}>
      <div className={styles.compact}>
        <div className={`container ${styles.row}`}>
          <nav className={styles.nav} aria-label={t("footer.aria")}>
            <Link
              className={`${styles.link} ${
                isHomepage
                  ? activeSectionId === "hero"
                    ? styles.active
                    : ""
                  : isActive("/tong-quan")
                    ? styles.active
                    : ""
              }`}
              to="/"
            >
              {t("footer.overview")}
            </Link>
            <Link
              className={`${styles.link} ${
                isHomepage
                  ? activeSectionId === "san-pham"
                    ? styles.active
                    : ""
                  : isActive("/san-pham")
                    ? styles.active
                    : ""
              }`}
              to="/san-pham"
            >
              {t("footer.products")}
            </Link>
            <Link
              className={`${styles.link} ${
                isHomepage
                  ? activeSectionId === "giai-phap"
                    ? styles.active
                    : ""
                  : isActive("/giai-phap")
                    ? styles.active
                    : ""
              }`}
              to="/giai-phap"
            >
              {t("footer.solutions")}
            </Link>
            <Link
              className={`${styles.link} ${isActive("/hien-dien-toan-cau") ? styles.active : ""}`}
              to="/"
            >
              {t("footer.global")}
            </Link>
            <Link
              className={`${styles.link} ${isActive("/dich-vu-ho-tro") ? styles.active : ""}`}
              to="/"
            >
              {t("footer.services")}
            </Link>
            <Link
              className={`${styles.link} ${
                isHomepage
                  ? activeSectionId === "tin-tuc"
                    ? styles.active
                    : ""
                  : isActive("/tin-tuc")
                    ? styles.active
                    : ""
              }`}
              to="/tin-tuc"
            >
              {t("footer.news")}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
