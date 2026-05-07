import styles from "./Solutions.module.css";
import { Link } from "react-router-dom";

const SOLUTIONS = [
  {
    title: "IoT",
    img: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=1400&q=70",
    desc: "Thu thập dữ liệu hiện trường, giám sát realtime, cảnh báo thông minh.",
  },
  {
    title: "Robot",
    img: "https://images.unsplash.com/photo-1507149833265-60c372daea22?auto=format&fit=crop&w=1400&q=70",
    desc: "Tích hợp robot cộng tác, tối ưu thao tác, nâng hiệu suất và an toàn.",
  },
  {
    title: "Vision AI",
    img: "https://images.unsplash.com/photo-1581092921461-39b21d0bdb22?auto=format&fit=crop&w=1400&q=70",
    desc: "Kiểm tra chất lượng tự động, phát hiện lỗi, truy vết theo lô.",
  },
  {
    title: "Tự động hóa dây chuyền",
    img: "https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&w=1400&q=70",
    desc: "Thiết kế & triển khai line automation: PLC, HMI, SCADA, MES.",
  },
  {
    title: "Tối ưu năng lượng",
    img: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1400&q=70",
    desc: "Giảm tiêu thụ, theo dõi điện năng, tối ưu vận hành theo ca.",
  },
  {
    title: "Bảo trì dự đoán",
    img: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=1400&q=70",
    desc: "Phát hiện bất thường, cảnh báo sớm, giảm downtime ngoài kế hoạch.",
  },
];

export default function Solutions() {
  return (
    <section className={styles.section} id="giai-phap" aria-label="Solutions">
      <div className="container">
        <div className={styles.titleRow}>
          <h2 className="section-title">Giải pháp chuyên sâu</h2>
          <Link
            className="sectionRouteBtn"
            to="/giai-phap"
            aria-label="Tới trang Giải pháp"
          >
            Chuyển
          </Link>
        </div>
        <p className="section-sub">
          Nền tảng kỹ thuật vững + kinh nghiệm triển khai thực tế = giải pháp
          hiệu quả & bền vững.
        </p>
        <div className={styles.actions} />

        <div className={styles.grid}>
          {SOLUTIONS.map((s) => (
            <article key={s.title} className={styles.card}>
              <img
                className={styles.img}
                src={s.img}
                alt={s.title}
                loading="lazy"
              />
              <div className={styles.overlay} />
              <div className={styles.content}>
                <h3 className={styles.title}>{s.title}</h3>
                <p className={styles.desc}>{s.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
