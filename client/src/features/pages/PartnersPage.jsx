import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./PageCommon.css";
import styles from "./NewsPage.module.css";

export default function PartnersPage() {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className={`page ${styles.page}`}>
      <section className={`page-hero ${styles.pageHero}`}>
        <div className="container">
          <h1 className={styles.heroTitle}>
            <span className={styles.headingPrimary}>
              {t("home.partnersTitlePrimary")}
            </span>{" "}
            <span className={styles.headingSecondary}>
              {t("home.partnersTitleSecondary")}
            </span>
          </h1>
        </div>
      </section>
    </main>
  );
}
