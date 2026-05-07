import styles from "./Partners.module.css";
import { Link } from "react-router-dom";

export default function Partners() {
  return (
    <section
      className={styles.section}
      id="doi-tac"
      aria-label="Đối tác được chứng nhận"
    >
      <div className={styles.overlay} aria-hidden="true" />
      <div className={`container ${styles.inner}`}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>
            Đối tác được <span className={styles.accent}>chứng nhận</span>
          </h2>
          <Link
            className="sectionRouteBtn"
            to="/doi-tac"
            aria-label="Tới trang Đối tác"
          >
            Chuyển
          </Link>
        </div>
        <p className={styles.sub}>
          Hợp tác cùng các thương hiệu hàng đầu — tiêu chuẩn, minh bạch và bền
          vững.
        </p>

        <div className={styles.actions} />
      </div>
    </section>
  );
}
