import { useState } from "react";
import styles from "./Contact.module.css";

export const PURPOSES = [
  "Need support/services",
  "Request a quote",
  "Partnership",
  "Careers",
  "Other",
];

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
export default function ContactFormBlock({ formRef, source = "contact_page" }) {
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
          text: json?.message || "Gửi không thành công. Thử lại sau.",
        });
        return;
      }
      setMessage({
        type: "ok",
        text: "Đã gửi yêu cầu. Chúng tôi sẽ liên hệ lại sớm.",
      });
      form.reset();
      const purposeSelect = form.querySelector('[name="purpose"]');
      if (purposeSelect) purposeSelect.value = PURPOSES[0];
    } catch {
      setMessage({
        type: "error",
        text: "Lỗi mạng. Kiểm tra kết nối và thử lại.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.formCard} ref={formRef}>
      <h2 className={styles.formTitle}>Contact</h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span className={styles.label}>
            Purpose of Contact<span className={styles.req}>*</span>
          </span>
          <select
            name="purpose"
            className={styles.control}
            defaultValue={PURPOSES[0]}
            required
          >
            {PURPOSES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>
            Full Name<span className={styles.req}>*</span>
          </span>
          <input
            name="fullName"
            className={styles.control}
            type="text"
            placeholder="Your First names and Last name"
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>
            Email<span className={styles.req}>*</span>
          </span>
          <input
            name="email"
            className={styles.control}
            type="email"
            placeholder="Business Email Address"
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>
            Company Name<span className={styles.req}>*</span>
          </span>
          <input
            name="companyName"
            className={styles.control}
            type="text"
            placeholder="Your Company Name"
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>
            Job Title<span className={styles.req}>*</span>
          </span>
          <input
            name="jobTitle"
            className={styles.control}
            type="text"
            placeholder="Your Job Title"
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Industry</span>
          <select name="industry" className={styles.control} defaultValue="">
            <option value="" disabled>
              Select Your Industry
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
            Country Name<span className={styles.req}>*</span>
          </span>
          <select name="country" className={styles.control} defaultValue="" required>
            <option value="" disabled>
              Select Your Country
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
            Business needs<span className={styles.req}>*</span>
          </span>
          <textarea
            name="businessNeeds"
            className={`${styles.control} ${styles.textarea}`}
            placeholder="Tell us more about your business needs"
            rows={4}
            required
          />
        </label>

        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={submitting}
          >
            {submitting ? "Đang gửi…" : "Gửi yêu cầu"}
          </button>
          {message?.type === "ok" ? (
            <div className={styles.formMessageOk}>{message.text}</div>
          ) : message?.type === "error" ? (
            <div className={styles.formMessageErr}>{message.text}</div>
          ) : (
            <div className={styles.hint}>Điền thông tin và gửi.</div>
          )}
        </div>
      </form>
    </div>
  );
}
