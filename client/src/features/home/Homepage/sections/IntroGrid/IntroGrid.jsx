import styles from "./IntroGrid.module.css";

const ROWS = [
  {
    dir: "right",
    images: [
      "/images/img1.png",
      "/images/img2.png",
      "/images/img3.png",
      "/images/img4.png",
    ],
  },
  {
    dir: "left",
    images: [
      "/images/img5.png",
      "/images/img6.png",
      "/images/img7.png",
      "/images/img8.png",
    ],
  },
  {
    dir: "right",
    images: [
      "/images/img9.png",
      "/images/img10.png",
      "/images/img11.png",
      "/images/img12.png",
    ],
  },
];

export default function IntroGrid() {
  return (
    <section className={styles.section} id="gioi-thieu" aria-label="Giới thiệu">
      <div className={styles.marqueeMask} aria-hidden="true">
        <div className={styles.marquee}>
          {ROWS.map((row, idx) => (
            <div
              key={idx}
              className={`${styles.row} ${
                row.dir === "left" ? styles.rowLeft : styles.rowRight
              }`}
            >
              <div className={styles.track}>
                {[...row.images, ...row.images, ...row.images].map((src, i) => (
                  <div className={styles.cell} key={`${idx}-${i}`}>
                    <img src={src} alt="" loading="lazy" draggable={false} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.overlay} />
      <div className={styles.content}>
        <h2 className={styles.title}>Other People Make Machines Task</h2>
        <h2 className={styles.title}>WE MAKE THEM SING</h2>
      </div>
    </section>
  );
}
