import { Link } from "react-router-dom";
import { FileDown } from "lucide-react";
import styles from "./Download.module.css";

export default function Download() {
  return (
    <section className={styles.section} id="tai-ve" aria-label="Tải về">
      <div className={`container ${styles.container}`}>
        <div className={styles.inner}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>Tải về</p>
            <h2 className={styles.title}>
              Tài liệu <span className={styles.accent}>PDF</span>
            </h2>
            <p className={styles.text}>
              Xuất sản phẩm, giải pháp và tin tức thành PDF — lưu catalogue,
              bài viết hoặc gửi cho đối tác.
            </p>
          </div>
          <Link className={styles.toPage} to="/tai-ve">
            <FileDown size={18} aria-hidden />
            Xem thư viện tải về
          </Link>
        </div>
      </div>
    </section>
  );
}
