import styles from "./Hero.module.css";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className={styles.hero} id="hero" aria-label="SVN Automation">
      <div className={styles.titleRow}>
        <h2 className={styles.title}>Tổng quan</h2>
      </div>
      <div className={styles.bg} aria-hidden="true" />
    </section>
  );
}
