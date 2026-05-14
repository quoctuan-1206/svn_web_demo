// IntroGrid.jsx

import styles from "./IntroGrid.module.css";

import img1 from "./img1.png";
import img2 from "./img2.png";
import img3 from "./img3.png";
import img4 from "./img4.png";
import img5 from "./img5.png";
import img6 from "./img6.png";
import img7 from "./img7.png";
import img8 from "./img8.png";
import img9 from "./img9.png";
import img10 from "./img10.png";
import img11 from "./img11.png";
import img12 from "./img12.png";

const ROWS = [
  {
    dir: "right",
    images: [img1, img2, img3, img4],
  },
  {
    dir: "left",
    images: [img5, img6, img7, img8],
  },
  {
    dir: "right",
    images: [img9, img10, img11, img12],
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
