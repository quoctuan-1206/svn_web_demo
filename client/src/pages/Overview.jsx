import { Link } from "react-router-dom";
import PageShell from "./_shared/PageShell";
import styles from "./Overview.module.css";

const HIGHLIGHTS = [
  {
    title: "Giải pháp end-to-end",
    desc: "Từ khảo sát, thiết kế, triển khai đến tối ưu vận hành sau bàn giao.",
  },
  {
    title: "Tech stack công nghiệp",
    desc: "Robot • PLC/SCADA • IoT • Vision AI • Data monitoring.",
  },
  {
    title: "Triển khai nhanh, vận hành ổn",
    desc: "Tập trung vào ROI, giảm downtime và tối ưu cycle time.",
  },
];

export default function Overview() {
  return (
    <PageShell
      eyebrow="Tổng quan"
      title={
        <>
          SVN <span className="green">Automation</span>
        </>
      }
      subtitle="Trang tổng quan giúp bạn nắm nhanh các nhóm sản phẩm, giải pháp và năng lực triển khai."
    >
      <div className={styles.grid}>
        {HIGHLIGHTS.map((h) => (
          <div key={h.title} className={styles.card}>
            <div className={styles.cardTitle}>{h.title}</div>
            <div className={styles.cardDesc}>{h.desc}</div>
          </div>
        ))}
      </div>

      <div className={styles.ctaRow}>
        <Link className={styles.primary} to="/san-pham">
          Xem Sản Phẩm →
        </Link>
        <Link className={styles.secondary} to="/giai-phap">
          Xem Giải Pháp →
        </Link>
        <Link className={styles.secondary} to="/dich-vu-ho-tro">
          Dịch vụ & Hỗ Trợ →
        </Link>
      </div>
    </PageShell>
  );
}

