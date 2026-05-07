import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Contact.module.css";

const QUICK_LINKS = [
  { to: "/", label: "Trang chủ" },
  { to: "/san-pham", label: "Sản phẩm" },
  { to: "/tin-tuc", label: "Tin tức" },
];

const PURPOSES = [
  "Need support/services",
  "Request a quote",
  "Partnership",
  "Careers",
  "Other",
];

const INDUSTRIES = [
  "Automotive",
  "Electronics",
  "Food & Beverage",
  "Logistics",
  "Energy",
  "Other",
];

const COUNTRIES = [
  "Vietnam",
  "Singapore",
  "Thailand",
  "Malaysia",
  "Japan",
  "Korea",
  "United States",
  "Other",
];

export default function Contact() {
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  function openForm() {
    setShowForm(true);
    window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      const first = formRef.current?.querySelector(
        "input, select, textarea, button"
      );
      first?.focus?.();
    }, 0);
  }

  return (
    <main className={styles.page}>
      <div className={`container ${styles.shell}`}>
        <section className={styles.col} aria-label="Liên hệ">
          <div className={styles.upper}>
            <div className={styles.headlineRow}>
              <h1 className={styles.title}>
                Hãy để chúng tôi đồng hành cùng bạn
              </h1>
              <button
                type="button"
                className={styles.scrollBtn}
                aria-label="Mở form liên hệ"
                onClick={openForm}
              >
                <span aria-hidden="true">↓</span>
              </button>
            </div>

            <nav className={styles.quickLinks} aria-label="Liên kết nhanh">
              {QUICK_LINKS.map((item) => (
                <Link key={item.to} className={styles.quickLink} to={item.to}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className={styles.lower}>
            <div className={styles.company}>
              <div className={styles.companyTitle}>SVN AUTOMATION CO., LTD</div>
              <p className={styles.companyLine}>
                Địa chỉ: Số 9 đường Đinh Thị Thi, Khu Nhà ở Đông Nam, Phường Hiệp
                Bình, Thành phố Hồ Chí Minh, Việt Nam
              </p>
              <p className={styles.companyLine}>
                Điện thoại liên hệ: (+84) 286 282 1235
              </p>

              <div className={styles.ctaWrap}>
                <button
                  type="button"
                  className={styles.contactBtn}
                  onClick={openForm}
                >
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
                  Liên hệ với chúng tôi
                </button>
              </div>
            </div>

            <hr className={styles.rule} />

            <div className={styles.bottomRow}>
              <p className={styles.copy}>Bản quyền © 2024 SVN Automation.</p>
              <div className={styles.socialRow} aria-label="Mạng xã hội">
                <a className={styles.social} href="#" aria-label="Facebook">
                  f
                </a>
                <a className={styles.social} href="#" aria-label="LinkedIn">
                  in
                </a>
                <a className={styles.social} href="#" aria-label="YouTube">
                  ▶
                </a>
              </div>
            </div>
          </div>
        </section>

        <aside className={styles.aside} aria-label="Biểu mẫu liên hệ">
          {showForm ? (
            <div className={styles.formCard} ref={formRef}>
              <h2 className={styles.formTitle}>Contact</h2>

              <form
                className={styles.form}
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <label className={styles.field}>
                  <span className={styles.label}>
                    Purpose of Contact<span className={styles.req}>*</span>
                  </span>
                  <select
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
                    className={styles.control}
                    type="text"
                    placeholder="Your Job Title"
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Industry</span>
                  <select className={styles.control} defaultValue="">
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
                  <select className={styles.control} defaultValue="" required>
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
                    className={`${styles.control} ${styles.textarea}`}
                    placeholder="Tell us more about your business needs"
                    rows={4}
                    required
                  />
                </label>

                <div className={styles.formActions}>
                  <button type="submit" className={styles.submitBtn}>
                    Gửi yêu cầu
                  </button>
                  <div className={styles.hint}>Điền thông tin và gửi.</div>
                </div>
              </form>
            </div>
          ) : (
            <div className={styles.colGraphic} aria-hidden="true" />
          )}
        </aside>
      </div>
    </main>
  );
}
