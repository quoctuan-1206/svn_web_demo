import styles from "./PageShell.module.css";

export default function PageShell({ eyebrow, title, subtitle, children }) {
  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className="container">
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h1 className={styles.title}>{title}</h1>
          {subtitle ? <p className={styles.sub}>{subtitle}</p> : null}
        </div>
      </header>

      <section className={styles.content}>
        <div className="container">{children}</div>
      </section>
    </main>
  );
}

