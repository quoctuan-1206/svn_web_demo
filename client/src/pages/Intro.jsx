import PageShell from "./_shared/PageShell";
import styles from "./Intro.module.css";

const TILES = [
  {
    title: "People",
    img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=70",
  },
  {
    title: "Robot",
    img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1600&q=70",
  },
  {
    title: "Technology",
    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=70",
  },
];

export default function Intro() {
  return (
    <PageShell
      eyebrow="Giới thiệu"
      title={
        <>
          Giới thiệu <span className="green">SVN Automation</span>
        </>
      }
      subtitle="Other People Make Machines Task — WE MAKE THEM SING. Tập trung vào hiệu suất, ổn định và khả năng mở rộng."
    >
      <div className={styles.grid}>
        {TILES.map((t) => (
          <article key={t.title} className={styles.tile}>
            <img className={styles.img} src={t.img} alt={t.title} loading="lazy" />
            <div className={styles.tileOverlay} />
            <div className={styles.tileMeta}>
              <div className={styles.tileTitle}>{t.title}</div>
              <div className={styles.tileSub}>SVN Automation</div>
            </div>
          </article>
        ))}

        <div className={styles.quote}>
          <div className={styles.quoteFrame}>
            <p className={styles.quoteText}>
              Other People Make Machines Task
              <br />
              <span className={styles.quoteAccent}>WE MAKE THEM SING</span>
            </p>
            <p className={styles.quoteNote}>
              Từ thiết kế giải pháp đến triển khai & tối ưu vận hành: tập trung vào năng suất và độ tin cậy.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

