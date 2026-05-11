import { Link, useLocation } from "react-router-dom";
import styles from "./Footer.module.css";
import { useHomepageSection } from "../../../context/HomepageSectionContext";

export default function Footer({ withId = true } = {}) {
  const { pathname } = useLocation();
  const { activeSectionId } = useHomepageSection();
  const isHomepage = pathname === "/";
  const isActive = (to) => pathname === to || pathname.startsWith(`${to}/`);

  return (
    <footer className={styles.footer} id={withId ? "footer" : undefined}>
      <div className={styles.compact}>
        <div className={`container ${styles.row}`}>
          <nav className={styles.nav} aria-label="Footer navigation">
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
              to="/tong-quan"
            >
              Tổng Quan
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
              Sản Phẩm
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
              Giải Pháp
            </Link>
            <Link
              className={`${styles.link} ${isActive("/hien-dien-toan-cau") ? styles.active : ""}`}
              to="/hien-dien-toan-cau"
            >
              Hiện Diện Toàn Cầu
            </Link>
            <Link
              className={`${styles.link} ${isActive("/dich-vu-ho-tro") ? styles.active : ""}`}
              to="/dich-vu-ho-tro"
            >
              Dịch Vụ &amp; Hỗ Trợ
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
              Tin Tức
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
