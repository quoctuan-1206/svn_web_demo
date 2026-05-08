import { Link, useLocation } from "react-router-dom";
import styles from "./Footer.module.css";

export default function Footer({ withId = true } = {}) {
  const { pathname } = useLocation();
  const isActive = (to) => pathname === to || pathname.startsWith(`${to}/`);

  return (
    <footer className={styles.footer} id={withId ? "footer" : undefined}>
      <div className={styles.compact}>
        <div className={`container ${styles.row}`}>
          <nav className={styles.nav} aria-label="Footer navigation">
            <Link
              className={`${styles.link} ${isActive("/tong-quan") ? styles.active : ""}`}
              to="/tong-quan"
            >
              Tổng Quan
            </Link>
            <Link
              className={`${styles.link} ${isActive("/san-pham") ? styles.active : ""}`}
              to="/san-pham"
            >
              Sản Phẩm
            </Link>
            <Link
              className={`${styles.link} ${isActive("/giai-phap") ? styles.active : ""}`}
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
              className={`${styles.link} ${isActive("/tin-tuc") ? styles.active : ""}`}
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
