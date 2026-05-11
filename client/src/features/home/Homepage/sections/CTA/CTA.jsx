import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./CTA.module.css";
import ContactFormBlock from "../../../../pages/ContactFormBlock";

const QUICK_LINKS = [
  { to: "/", label: "Trang chủ" },
  { to: "/san-pham", label: "Sản phẩm" },
  { to: "/tin-tuc", label: "Tin tức" },
  { to: "/lien-he", label: "Liên hệ" },
];

export default function CTA() {
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);

  function openForm() {
    setShowForm(true);
    window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      const first = formRef.current?.querySelector(
        "input, select, textarea, button",
      );
      first?.focus?.();
    }, 0);
  }

  /** Nút mũi tên: bấm lần nữa khi form đang mở thì ẩn form */
  function toggleFormFromArrow() {
    setShowForm((wasOpen) => {
      if (wasOpen) return false;
      window.setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        const first = formRef.current?.querySelector(
          "input, select, textarea, button",
        );
        first?.focus?.();
      }, 0);
      return true;
    });
  }

  return (
    <section className={styles.section} id="lien-he" aria-label="Liên hệ">
      <div className={`${styles.container} ${styles.shell}`}>
        <div className={styles.col}>
          <div className={styles.upper}>
            <div className={styles.headlineRow}>
              <h2 className={styles.title}>
                Hãy để chúng tôi đồng hành cùng bạn
              </h2>
              <button
                type="button"
                className={styles.scrollBtn}
                aria-expanded={showForm}
                aria-label={
                  showForm ? "Đóng form liên hệ" : "Mở form liên hệ"
                }
                onClick={toggleFormFromArrow}
              >
                <svg
                  className={styles.scrollBtnIcon}
                  width="18"
                  height="18"
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
                Địa chỉ: Số 9 đường Đinh Thị Thi, Khu Nhà ở Đông Nam, Phường
                Hiệp Bình, Thành phố Hồ Chí Minh, Việt Nam
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
                  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M13.5 22v-9h3l.5-4h-4V7.5c0-1.16.32-2 2.44-2H17V2.14C16.39 2.05 14.59 2 12.6 2 8.52 2 6 4.16 6 7.36V9H3v4h3v9h4.5z"
                    />
                  </svg>
                </a>
                <a className={styles.social} href="#" aria-label="LinkedIn">
                  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M6.94 6.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM5 22V8h4v14H5zm6 0V13.2c0-2.12 2.06-2.87 3.2-1.55l.3.35V22h4v-8.9c0-3.45-3.22-4.42-5.6-2.03L15 11V8h-4v14z"
                    />
                  </svg>
                </a>
                <a className={styles.social} href="#" aria-label="YouTube">
                  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M21.6 7.2s-.2-1.4-.8-2c-.8-.8-1.7-.8-2.1-.9C16 4 12 4 12 4s-4 0-6.7.3c-.4 0-1.3.1-2.1.9-.6.6-.8 2-.8 2S2 8.9 2 10.6v1.8c0 1.7.2 3.4.2 3.4s.2 1.4.8 2c.8.8 1.9.8 2.4.9 1.8.2 7.6.3 7.6.3s4 0 6.7-.3c.4 0 1.3-.1 2.1-.9.6-.6.8-2 .8-2s.2-1.7.2-3.4v-1.8c0-1.7-.2-3.4-.2-3.4zM10 14.5v-7l6 3.5-6 3.5z"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <aside className={styles.formAside} aria-label="Biểu mẫu liên hệ">
          {showForm ? (
            <ContactFormBlock formRef={formRef} source="homepage_cta" />
          ) : (
            <div className={styles.colGraphic} aria-hidden="true" />
          )}
        </aside>
      </div>
    </section>
  );
}
