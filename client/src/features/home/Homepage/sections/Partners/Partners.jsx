import styles from "./Partners.module.css";
import { Link } from "react-router-dom";

const PARTNER_ITEMS = [
  {
    lines: ["Collaborative Robots", "For industrial Automation"],
    logo: "/images/JAKA.png",
    logoAlt: "Collaborative Robots",
  },
  {
    lines: ["The World Leader In", "Force Measurement"],
    logo: "/images/INTERFACE.png",
    logoAlt: "The World Leader In Force Measurement",
  },
  {
    lines: ["Intelligent Mobile Robots", "For Smart Manufacturing"],
    logo: "/images/IPLUS.png",
    logoAlt: "Intelligent Mobile Robots",
  },
  {
    lines: ["Leading Global Material", "Control System (MCS) Software"],
    logo: "/images/ROMARIC.png",
    logoAlt: "Leading Global Material Control System (MCS) Software",
  },
  {
    lines: ["Leading Around The Globe", "In Torque Products"],
    logo: "/images/MOUNTZ.png",
    logoAlt: "Leading Around The Globe In Torque Products",
  },
  {
    lines: ["SCADA Visualization", "Software"],
    logo: "/images/MICROSYS.png",
    logoAlt: "SCADA Visualization Software",
  },
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
            <span className={styles.headingPrimary}>Đối tác</span> được chứng
            nhận
          </h2>
        </header>

        <div className={styles.grid} aria-label="Partner highlights">
          {PARTNER_ITEMS.map(({ lines, logo, logoAlt }) => (
            <div key={lines.join(" ")} className={styles.item}>
              {logo ? (
                <img
                  className={styles.itemLogo}
                  src={logo}
                  alt={logoAlt ?? ""}
                  loading="lazy"
                  draggable={false}
                />
              ) : null}
              <div className={styles.itemTitle}>{lines[0]}</div>
              <div className={styles.itemSub}>{lines[1]}</div>
            </div>
          ))}
        </div>

        <div className={styles.ctaRow}>
          <Link
            className={styles.cta}
            to="/doi-tac"
            aria-label="Explore partners"
          >
            Explore our Global Delivery Model{" "}
            <span className={styles.ctaArrow}>›</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
