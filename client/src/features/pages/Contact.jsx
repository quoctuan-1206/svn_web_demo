import { useEffect, useRef } from "react";
import styles from "./Contact.module.css";
import ContactFormBlock from "./ContactFormBlock";

export default function Contact() {
  const formRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.pageInner}>
        <section className={styles.shell} aria-label="Liên hệ">
          <div className={styles.formOnly} aria-label="Biểu mẫu liên hệ">
            <ContactFormBlock formRef={formRef} />
          </div>
        </section>
      </div>
    </main>
  );
}
