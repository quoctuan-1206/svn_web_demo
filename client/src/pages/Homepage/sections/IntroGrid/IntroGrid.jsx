import styles from "./IntroGrid.module.css";
import { Link } from "react-router-dom";

export default function IntroGrid() {
  return (
    <section className={styles.section} id="gioi-thieu" aria-label="Giới thiệu">
      <div className={styles.overlay} aria-hidden="true" />
      <div className={`container ${styles.inner}`}>
        <p className={styles.kicker}>SVN Automation</p>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>Giới thiệu</h2>
          <Link
            className="sectionRouteBtn"
            to="/gioi-thieu"
            aria-label="Tới trang Giới thiệu"
          >
            Chuyển
          </Link>
        </div>
        <p className={styles.sub}>
          Từ thiết kế hệ thống đến triển khai thực tế, chúng tôi đồng hành cùng
          doanh nghiệp trong hành trình tự động hoá.
        </p>

        <div className={styles.actions} />
      </div>
    </section>
  );
}
