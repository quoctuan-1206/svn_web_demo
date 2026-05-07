import PageShell from "./_shared/PageShell";
import styles from "./GlobalPresence.module.css";

const REGIONS = [
  { region: "Việt Nam", detail: "Triển khai dự án & hỗ trợ onsite" },
  { region: "Đông Nam Á", detail: "Tích hợp hệ thống & đối tác công nghệ" },
  { region: "Châu Âu", detail: "Thiết bị/tiêu chuẩn & best practices" },
  { region: "Nhật Bản", detail: "Robot/automation ecosystem" },
  { region: "Mỹ", detail: "Cloud/IIoT patterns & data monitoring" },
  { region: "Trung Quốc", detail: "Thiết bị công nghiệp & chuỗi cung ứng" },
];

export default function GlobalPresence() {
  return (
    <PageShell
      eyebrow="Hiện diện toàn cầu"
      title={
        <>
          Hiện Diện <span className="green">Toàn Cầu</span>
        </>
      }
      subtitle="Mạng lưới đối tác và năng lực tích hợp đa hệ giúp dự án triển khai nhanh, chuẩn hóa và mở rộng bền vững."
    >
      <div className={styles.stage}>
        <div className={styles.map} aria-hidden="true" />
        <div className={styles.grid}>
          {REGIONS.map((r) => (
            <div key={r.region} className={styles.card}>
              <div className={styles.region}>{r.region}</div>
              <div className={styles.detail}>{r.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

