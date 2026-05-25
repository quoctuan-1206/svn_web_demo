import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./Contact.module.css";

export const PURPOSES = [
  "Need support/services",
  "Request a quote",
  "Partnership",
  "Careers",
  "Other",
];

const PURPOSE_LABEL_KEYS = {
  "Need support/services": "contactForm.purposeSupport",
  "Request a quote": "contactForm.purposeQuote",
  Partnership: "contactForm.purposePartner",
  Careers: "contactForm.purposeCareers",
  Other: "contactForm.purposeOther",
};

export const INDUSTRIES = [
  "Automotive",
  "Electronics",
  "Food & Beverage",
  "Logistics",
  "Energy",
  "Other",
];

export const COUNTRIES = [
  "Vietnam",
  "Singapore",
  "Thailand",
  "Malaysia",
  "Japan",
  "Korea",
  "United States",
  "Other",
];

/** Form liên hệ (dùng trên trang /lien-he và trong CTA homepage) */
export default function ContactFormBlock({
  formRef,
  source = "contact_page",
  cardClassName = "",
  hideTitle = false,
  showMarketingConsent = false,
}) {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setMessage(null);
    setSubmitting(true);

    const fd = new FormData(form);
    const industry = fd.get("industry");
    const body = {
      purpose: fd.get("purpose"),
      fullName: fd.get("fullName"),
      email: fd.get("email"),
      companyName: fd.get("companyName"),
      jobTitle: fd.get("jobTitle"),
      industry: industry || "",
      country: fd.get("country"),
      businessNeeds: fd.get("businessNeeds"),
      source,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setMessage({
          type: "error",
          text: json?.message || t("contactForm.error"),
        });
        return;
      }
      setMessage({
        type: "ok",
        text: t("contactForm.success"),
      });
      form.reset();
      const purposeSelect = form.querySelector('[name="purpose"]');
      if (purposeSelect) purposeSelect.value = PURPOSES[0];
    } catch {
      setMessage({
        type: "error",
        text: t("contactForm.networkError"),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className={[styles.formCard, cardClassName].filter(Boolean).join(" ")}
      ref={formRef}
    >
      {!hideTitle ? (
        <h2 className={styles.formTitle}>{t("contactForm.title")}</h2>
      ) : null}

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span className={styles.label}>
            {t("contactForm.purpose")}
            <span className={styles.req}>*</span>
          </span>
          <select
            name="purpose"
            className={styles.control}
            defaultValue={PURPOSES[0]}
            required
          >
            {PURPOSES.map((p) => (
              <option key={p} value={p}>
                {t(PURPOSE_LABEL_KEYS[p] || p)}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>
            {t("contactForm.fullName")}
            <span className={styles.req}>*</span>
          </span>
          <input
            name="fullName"
            className={styles.control}
            type="text"
            placeholder={t("contactForm.placeholderName")}
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>
            {t("contactForm.email")}
            <span className={styles.req}>*</span>
          </span>
          <input
            name="email"
            className={styles.control}
            type="email"
            placeholder={t("contactForm.placeholderEmail")}
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>
            {t("contactForm.company")}
            <span className={styles.req}>*</span>
          </span>
          <input
            name="companyName"
            className={styles.control}
            type="text"
            placeholder={t("contactForm.placeholderCompany")}
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>
            {t("contactForm.jobTitle")}
            <span className={styles.req}>*</span>
          </span>
          <input
            name="jobTitle"
            className={styles.control}
            type="text"
            placeholder={t("contactForm.placeholderJob")}
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>{t("contactForm.industry")}</span>
          <select name="industry" className={styles.control} defaultValue="">
            <option value="" disabled>
              {t("contactForm.selectIndustry")}
            </option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>
            {t("contactForm.country")}
            <span className={styles.req}>*</span>
          </span>
          <select name="country" className={styles.control} defaultValue="" required>
            <option value="" disabled>
              {t("contactForm.selectCountry")}
            </option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>
            {t("contactForm.needs")}
            <span className={styles.req}>*</span>
          </span>
          <textarea
            name="businessNeeds"
            className={`${styles.control} ${styles.textarea}`}
            placeholder={t("contactForm.placeholderNeeds")}
            rows={4}
            required
          />
        </label>

        {showMarketingConsent ? (
          <label className={styles.consentRow}>
            <input
              type="checkbox"
              name="marketingConsent"
              className={styles.consentCheck}
            />
            <span className={styles.consentText}>
              {t("contactForm.consent")}
            </span>
          </label>
        ) : null}

        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={submitting}
          >
            {submitting ? t("contactForm.submitting") : t("contactForm.submit")}
          </button>
          {message?.type === "ok" ? (
            <div className={styles.formMessageOk}>{message.text}</div>
          ) : message?.type === "error" ? (
            <div className={styles.formMessageErr}>{message.text}</div>
          ) : (
            <div className={styles.hint}>{t("contactForm.hint")}</div>
          )}
        </div>
      </form>
    </div>
  );
}
