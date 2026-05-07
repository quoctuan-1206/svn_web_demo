import styles from "./Download.module.css";
import { Link } from "react-router-dom";

function downloadBrochure() {
  const content = `SVN Automation - Brochure (placeholder)

Company: SVN AUTOMATION CO., LTD
Tone: black / neon green / white

Sections:
- Products
- Solutions
- Partners
- News

Contact:
info@svnautomation.com
`;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "SVN-Automation-Brochure.txt";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function Download() {
  return (
    <section className={styles.section} id="tai-ve" aria-label="Download">
      <div className={`container ${styles.container}`}>
        <header className={styles.header}>
          <div className={styles.eyebrow}>Tải về</div>
          <div className={styles.titleRow}>
            <h2 className={styles.heading}>
              Tải Về <span className="green">tài liệu</span>
            </h2>
            <Link
              className="sectionRouteBtn"
              to="/tai-ve"
              aria-label="Tới trang Tải về"
            >
              Chuyển
            </Link>
          </div>
          <p className={styles.sub}>
            Brochure, deck và tài liệu kỹ thuật — tải nhanh hoặc yêu cầu bộ tài
            liệu theo ngành.
          </p>
        </header>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.badge}>BROCHURE</div>
            <div className={styles.cardTitle}>
              SVN Automation Company Profile
            </div>
            <div className={styles.desc}>
              Tài liệu giới thiệu (placeholder). Bạn có thể thay bằng PDF thật
              sau.
            </div>
            <button
              type="button"
              className={styles.primary}
              onClick={downloadBrochure}
            >
              Tải ngay
            </button>
          </div>

          <div className={styles.cardAlt}>
            <div className={styles.altTitle}>Need a custom deck?</div>
            <div className={styles.altDesc}>
              Gửi yêu cầu, chúng tôi sẽ chuẩn bị deck theo ngành hàng và bài
              toán của bạn.
            </div>
            <a className={styles.secondary} href="/#lien-he">
              Yêu cầu tư vấn →
            </a>
            <div />
          </div>
        </div>
      </div>
    </section>
  );
}
