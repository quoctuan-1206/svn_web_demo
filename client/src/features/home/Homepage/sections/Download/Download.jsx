import styles from "./Download.module.css";
import { Link } from "react-router-dom";

export default function Download() {
  return (
    <section className={styles.section} id="tai-ve" aria-label="Download">
      <div className={`container ${styles.container}`}>
        <div className={styles.row}>
          <p className={styles.text}>Đây là trang tải về</p>
          <Link className={styles.toPage} to="/tai-ve">
            Chuyển đến
          </Link>
        </div>
      </div>
    </section>
  );
}
