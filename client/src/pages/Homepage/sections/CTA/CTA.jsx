import { Link } from "react-router-dom";
import styles from "./CTA.module.css";

const QUICK_LINKS = [
  { to: "/", label: "Trang chủ" },
  { to: "/san-pham", label: "Sản phẩm" },
  { to: "/tin-tuc", label: "Tin tức" },
  { to: "/lien-he", label: "Liên hệ" },
];

function scrollDownOneViewport() {
  window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
}

export default function CTA() {
  return (
    <section className={styles.section} id="lien-he" aria-label="Liên hệ">
      <div className={`container ${styles.shell}`}>
        <div className={styles.col}>
          <div className={styles.upper}>
            <div className={styles.headlineRow}>
              <h2 className={styles.title}>
                Hãy để chúng tôi đồng hành cùng bạn
              </h2>
              <button
                type="button"
                className={styles.scrollBtn}
                onClick={scrollDownOneViewport}
                aria-label="Cuộn xuống"
              >
                <span aria-hidden="true">↓</span>
              </button>
            </div>

            <nav className={styles.quickLinks} aria-label="Liên kết nhanh">
              {QUICK_LINKS.map((item) => (
                <Link key={item.to} className={styles.quickLink} to={item.to}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className={styles.lower}>
            <div className={styles.company}>
              <div className={styles.companyTitle}>SVN AUTOMATION CO., LTD</div>
              <p className={styles.companyLine}>
                Địa chỉ: Số 9 đường Đinh Thị Thi, Khu Nhà ở Đông Nam, Phường
                Hiệp Bình, Thành phố Hồ Chí Minh, Việt Nam
              </p>
              <p className={styles.companyLine}>
                Điện thoại liên hệ: (+84) 286 282 1235
              </p>

              <div className={styles.ctaWrap}>
                <Link className={styles.contactBtn} to="/lien-he">
                  <span className={styles.btnIcon} aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 6h16v12H4V6zm0 0l8 6 8-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  Liên hệ với chúng tôi
                </Link>
              </div>
            </div>

            <hr className={styles.rule} />

            <div className={styles.bottomRow}>
              <p className={styles.copy}>Bản quyền © 2024 SVN Automation.</p>
              <div className={styles.socialRow} aria-label="Mạng xã hội">
                <a className={styles.social} href="#" aria-label="Facebook">
                  f
                </a>
                <a className={styles.social} href="#" aria-label="LinkedIn">
                  in
                </a>
                <a className={styles.social} href="#" aria-label="YouTube">
                  ▶
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải để graphic nền hiển thị rõ (không che nội dung) */}
        <div className={styles.colGraphic} aria-hidden="true" />
      </div>
    </section>
  );
}
