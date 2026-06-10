import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./LanguageSwitcher.module.css";

const GLOBE_ICON_SRC = "/images/traidat.png";

const LANGUAGES = [
  { code: "vi", labelKey: "header.langVi" },
  { code: "en", labelKey: "header.langEn" },
];

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  function setLanguage(code) {
    i18n.changeLanguage(code);
    setOpen(false);
  }

  const current = i18n.language?.startsWith("en") ? "EN" : "VI";

  return (
    <div className={styles.wrap} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        aria-label={t("header.langMenu")}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
      >
        <img
          className={styles.globeIcon}
          src={GLOBE_ICON_SRC}
          alt=""
          width={28}
          height={28}
          aria-hidden="true"
        />
        <span className={styles.langLabel}>{current}</span>
      </button>
      {open ? (
        <ul className={styles.menu} role="listbox" aria-label={t("header.langMenu")}>
          {LANGUAGES.map((lang) => {
            const active = i18n.language?.startsWith(lang.code);
            return (
              <li key={lang.code} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={`${styles.option} ${active ? styles.optionActive : ""}`}
                  onClick={() => setLanguage(lang.code)}
                >
                  {t(lang.labelKey)}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
