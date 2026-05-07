import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./PageCommon.css";
import "./Solutions.css";

export default function Solutions() {
  const [solutions, setSolutions] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    axios.get("/api/solutions").then((r) => setSolutions(r.data)).catch(() => {});
  }, []);

  return (
    <main className="page">
      <div className="page-hero">
        <div className="container">
          <p className="page-eyebrow">Industry Know-How</p>
          <h1>Giải pháp <span className="green">Tự động hóa</span></h1>
          <p className="page-desc">Chuyên sâu theo từng ngành — được tích lũy qua hàng trăm dự án thực tế</p>
        </div>
      </div>

      <section className="page-content">
        <div className="container">
          <div className="sol-list">
            {solutions.map((s, i) => (
              <div key={s.id} className={`prod-item ${i % 2 !== 0 ? "reverse" : ""}`}>
                <div className="prod-img">
                  <img src={s.image} alt={s.title} />
                </div>
                <div className="prod-text">
                  <h2>{s.title}</h2>
                  <p>{s.description}</p>
                  <p style={{ marginTop: 12, color: "var(--white-dim)" }}>
                    SVN cung cấp tư vấn kỹ thuật chuyên sâu, thiết kế hệ thống tùy chỉnh và hỗ trợ kỹ thuật 24/7 cho mọi giải pháp triển khai.
                  </p>
                  <Link to="/lien-he" className="btn-primary" style={{ display: "inline-block", marginTop: 24 }}>
                    Tư vấn giải pháp
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
