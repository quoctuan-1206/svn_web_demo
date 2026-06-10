import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./CTA.module.css";
import contactStyles from "../../../../pages/Contact.module.css";
import ContactFormBlock from "../../../../pages/ContactFormBlock";

const QUICK_LINKS = [
  { to: "/giai-phap", labelKey: "home.quickSolutions" },
  { to: "/dich-vu-ho-tro", labelKey: "home.quickServices" },
  { to: "/san-pham", labelKey: "home.quickProducts" },
  { to: "/tong-quan", labelKey: "home.quickIntro" },
];

const SOCIAL_LINKS = [
  {
    href: "#",
    label: "LinkedIn",
    icon: "/images/In.png",
  },
  {
    href: "https://www.facebook.com/SVNAutomation",
    label: "Facebook",
    icon: "/images/Facebook.png",
    external: true,
  },
  {
    href: "https://www.youtube.com/@SVNAutomationCompanyLimited",
    label: "YouTube",
    icon: "/images/Youtube.png",
    external: true,
  },
];

export default function CTA() {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);

  function toggleFormFromArrow() {
    setShowForm((wasOpen) => {
      if (wasOpen) return false;
      window.setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
        const first = formRef.current?.querySelector(
          "input, select, textarea, button",
        );
        first?.focus?.();
      }, 0);
      return true;
    });
  }

  return (
    <section className={styles.section} id="lien-he" aria-label={t("home.contactAria")}>
      <div className={`${styles.container} ${styles.shell}`}>
        <div className={styles.leftColumn}>
          <div className={styles.topBody}>
            <header className={styles.headline}>
              <h2 className={styles.title}>{t("home.contactTitle")}</h2>
              <button
                type="button"
                className={`${styles.scrollBtn} ${showForm ? styles.scrollBtnOpen : ""}`}
                aria-expanded={showForm}
                aria-label={showForm ? t("home.closeForm") : t("home.openForm")}
                onClick={toggleFormFromArrow}
              >
                <svg
                  className={styles.scrollBtnIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12 5v14M5 13l7 7 7-7"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </header>

            <nav className={styles.quickLinks} aria-label={t("home.quickLinksAria")}>
              {QUICK_LINKS.map((item) => (
                <Link key={item.to} className={styles.quickLink} to={item.to}>
                  {t(item.labelKey)}
                </Link>
              ))}
            </nav>
          </div>

          <div className={styles.bottomBody}>
            <div className={styles.company}>
              <div className={styles.companyTitle}>SVN AUTOMATION CO., LTD</div>
              <p className={styles.companyLine}>{t("home.contactAddress")}</p>
              <p className={styles.companyLine}>{t("home.contactPhone")}</p>
            </div>

            <Link className={styles.contactBtn} to="/lien-he">
              <span className={styles.btnIcon} aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 6h16v12H4V6zm0 0l8 6 8-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              {t("home.contactUsBtn")}
            </Link>

            <hr className={styles.rule} />

            <div className={styles.bottomRow}>
              <p className={styles.copy}>{t("home.copyright")}</p>
              <div className={styles.socialRow} aria-label={t("home.socialAria")}>
                {SOCIAL_LINKS.map(({ href, label, icon, external }) => (
                  <a
                    key={label}
                    className={styles.social}
                    href={href}
                    aria-label={label}
                    {...(external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    <img
                      className={styles.socialIcon}
                      src={icon}
                      alt=""
                      width={24}
                      height={24}
                      loading="lazy"
                      draggable={false}
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside
          className={`${styles.formSlot} ${showForm ? styles.formSlotOpen : ""}`}
          aria-label={t("home.formAria")}
        >
          {showForm ? (
            <ContactFormBlock
              formRef={formRef}
              source="homepage_cta"
              hideTitle
              cardClassName={contactStyles.formCardCta}
            />
          ) : null}
        </aside>
      </div>
    </section>
  );
}
