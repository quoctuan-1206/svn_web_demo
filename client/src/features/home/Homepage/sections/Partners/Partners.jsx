import styles from "./Partners.module.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const PARTNER_ITEMS = [
  {
    lines: ["Collaborative Robots", "For industrial Automation"],
    logo: "/images/jakalogo.png",
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
  const { t } = useTranslation();

  return (
    <section
      className={styles.section}
      id="doi-tac"
      aria-label={t("home.partnersAria")}
    >
      <div className="container">
        <header className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.headingPrimary}>
              {t("home.partnersTitlePrimary")}
            </span>{" "}
            {t("home.partnersTitleSecondary")}
          </h2>
        </header>

        <div className={styles.gridWrap}>
          <div className={styles.grid} aria-label={t("home.partnersGridAria")}>
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
          <img
            className={styles.centerGlobe}
            src="/images/ear.png"
            alt=""
            aria-hidden="true"
            draggable={false}
          />
        </div>

        <div className={styles.ctaRow}>
          <Link
            className={styles.cta}
            to="/doi-tac"
            aria-label={t("home.partnersCtaAria")}
          >
            {t("home.partnersCta")}{" "}
            <span className={styles.ctaArrow}>›</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
