import PageShell from "./_shared/PageShell";
import styles from "./DownloadPage.module.css";

function downloadBrochure() {
  const content = `SVN Automation - Brochure (placeholder)

Company: SVN AUTOMATION CO., LTD

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

export default function DownloadPage() {
  return (
    <PageShell
      eyebrow="Tải về"
      title={
        <>
          Tải Về <span className="green">tài liệu</span>
        </>
      }
      subtitle="Trang Tải Về (route `/tai-ve`) đồng nhất với section `#tai-ve` trên landing."
    >
      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.badge}>BROCHURE</div>
          <div className={styles.title}>SVN Automation Company Profile</div>
          <div className={styles.desc}>
            Tài liệu giới thiệu (placeholder). Bạn có thể thay bằng PDF thật sau.
          </div>
          <button type="button" className={styles.primary} onClick={downloadBrochure}>
            Tải ngay
          </button>
        </div>

        <div className={styles.cardAlt}>
          <div className={styles.altTitle}>Need a custom deck?</div>
          <div className={styles.altDesc}>
            Gửi yêu cầu, chúng tôi sẽ chuẩn bị deck theo ngành hàng và bài toán của bạn.
          </div>
          <a className={styles.secondary} href="/#lien-he">
            Yêu cầu tư vấn →
          </a>
        </div>
      </div>
    </PageShell>
  );
}

