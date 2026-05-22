import styles from "./Solutions.module.css";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { catalogItemPath } from "../../../../../utils/catalogItemPath";

export default function Solutions() {
  const [solutions, setSolutions] = useState([]);
  const viewportRef = useRef(null);

  useEffect(() => {
    axios
      .get("/api/products", { params: { page: 1, limit: 200 } })
      .then((r) => {
        const raw = Array.isArray(r.data) ? r.data : r.data?.data || [];
        const solutionItems = raw.filter((n) => n?.category === "solution");
        setSolutions(solutionItems.slice(0, 12));
      })
      .catch(() => {});
  }, []);

  /** Khi track ngắn hơn viewport thì căn giữa (không giữ scrollLeft cũ sau resize). */
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const syncScroll = () => {
      const track = el.firstElementChild;
      if (!track) return;
      if (track.scrollWidth <= el.clientWidth + 1) {
        el.scrollLeft = 0;
      }
    };

    syncScroll();
    window.addEventListener("resize", syncScroll);
    return () => window.removeEventListener("resize", syncScroll);
  }, [solutions]);

  // Kéo chuột để lướt ngang qua các giải pháp khác.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    let isDown = false;
    let dragging = false;
    let pointerId = null;
    let startX = 0;
    let scrollStart = 0;
    let moved = 0;
    const DRAG_THRESHOLD = 6;

    const onPointerDown = (e) => {
      // Chỉ xử lý chuột trái; bỏ qua touch để dùng cuộn cảm ứng mặc định.
      if (e.pointerType === "touch") return;
      if (e.button !== 0) return;
      isDown = true;
      dragging = false;
      moved = 0;
      pointerId = e.pointerId;
      startX = e.clientX;
      scrollStart = el.scrollLeft;
    };

    const onPointerMove = (e) => {
      if (!isDown) return;
      const delta = e.clientX - startX;
      const absDelta = Math.abs(delta);
      if (absDelta > moved) moved = absDelta;

      if (!dragging && moved > DRAG_THRESHOLD) {
        dragging = true;
        el.classList.add(styles.isDragging);
        try {
          el.setPointerCapture(pointerId);
        } catch {}
      }

      if (dragging) {
        el.scrollLeft = scrollStart - delta;
        e.preventDefault();
      }
    };

    const endDrag = () => {
      if (!isDown) return;
      isDown = false;
      if (dragging) {
        dragging = false;
        el.classList.remove(styles.isDragging);
        try {
          if (pointerId != null) el.releasePointerCapture(pointerId);
        } catch {
          // ignore
        }
      }
      pointerId = null;
    };

    // Chỉ chặn click khi đã thật sự kéo, để Link "Khám phá thêm" vẫn hoạt động bình thường.
    const onClickCapture = (e) => {
      if (moved > DRAG_THRESHOLD) {
        e.preventDefault();
        e.stopPropagation();
      }
      moved = 0;
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    el.addEventListener("click", onClickCapture, true);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endDrag);
      el.removeEventListener("pointercancel", endDrag);
      el.removeEventListener("click", onClickCapture, true);
    };
  }, []);

  return (
    <section className={styles.section} id="giai-phap" aria-label="Solutions">
      <div className="container">
        <div className={styles.titleRow}>
          <h2 className={styles.heading}>
            <span className={styles.headingPrimary}>Giải pháp Tự động hóa</span>{" "}
            <span className={styles.headingSecondary}>Chuyên sâu</span>
          </h2>
          <Link
            className="sectionRouteBtn"
            to="/giai-phap"
            aria-label="Tới trang Giải pháp"
          >
            ⭢
          </Link>
        </div>
        <p className={styles.sub}>
          Dựa trên Nền tảng Kinh nghiệm Thực chiến (Industry Know-how)
        </p>

        <div
          className={styles.viewport}
          ref={viewportRef}
          aria-label="Giải pháp nổi bật"
          role="region"
        >
          <div className={styles.track}>
            {solutions.map((s) => (
              <article
                key={s._id || s.id || s.title}
                className={styles.card}
                aria-label={s.title}
              >
                <img
                  className={styles.img}
                  src={s.image || s.img}
                  alt={s.title || "Solution"}
                  loading="lazy"
                />
                <div className={styles.overlay} aria-hidden="true" />

                <div className={styles.panel}>
                  <h3 className={styles.cardTitle}>{s.title}</h3>
                  <span className={styles.divider} aria-hidden="true" />
                  <p className={styles.cardDesc}>{s.description || s.desc}</p>
                  <Link className={styles.cardLink} to={catalogItemPath(s)}>
                    Khám phá thêm <span aria-hidden="true">›</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
