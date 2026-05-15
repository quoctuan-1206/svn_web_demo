import styles from "./Hero.module.css";

const HERO_BG_SRC = "/images/bg1.png";

export default function Hero() {
  return (
    <section className={styles.hero} id="hero" aria-label="SVN Automation">
      <img
        className={styles.bgImg}
        src={HERO_BG_SRC}
        alt="background image"
        aria-hidden="true"
        draggable={false}
      />
      <div className={styles.overlay} aria-hidden="true" />
    </section>
  );
}
