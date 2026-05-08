import styles from "./Partners.module.css";
import { Link } from "react-router-dom";

const PARTNER_LINES = [
  ["Collaborative Robots", "For industrial Automation"],
  ["The World Leader In", "Force Measurement"],
  ["Intelligent Mobile Robots", "For Smart Manufacturing"],
  ["Leading Global Material", "Control System (MCS) Software"],
  ["Leading Around The Globe", "In Torque Products"],
  ["SCADA Visualization", "Software"],
];

export default function Partners() {
  return (
    <section
      className={styles.section}
      id="doi-tac"
      aria-label="Đối tác được chứng nhận"
    >
      <div className="container">
        <header className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.titleAccent}>Đối tác</span> được chứng nhận
          </h2>
        </header>

        <div className={styles.grid} aria-label="Partner highlights">
          {PARTNER_LINES.map((lines) => (
            <div key={lines.join(" ")} className={styles.item}>
              <div className={styles.itemTitle}>{lines[0]}</div>
              <div className={styles.itemSub}>{lines[1]}</div>
            </div>
          ))}
        </div>

        <div className={styles.ctaRow}>
          <Link className={styles.cta} to="/doi-tac" aria-label="Explore partners">
            Explore our Global Delivery Model <span className={styles.ctaArrow}>›</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
