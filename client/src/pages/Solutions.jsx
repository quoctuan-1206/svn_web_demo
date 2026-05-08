import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./PageCommon.css";

export default function Solutions() {
  const [solutions, setSolutions] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    axios
      .get("/api/products", { params: { page: 1, limit: 200 } })
      .then((r) => {
        const raw = Array.isArray(r.data) ? r.data : r.data?.data || [];
        const solutionItems = raw.filter((n) => n?.category === "solution");
        const onlyPublished = solutionItems.filter((n) => n?.isPublished === true);
        const data = onlyPublished.length ? onlyPublished : solutionItems;
        setSolutions(data);
      })
      .catch(() => {});
  }, []);

  return (
    <main className="page">
      <div className="page-hero">
        <div className="container">
          <p className="page-eyebrow">Giải pháp</p>
          <p className="page-desc">
            Một vài giải pháp tự động hóa được thiết kế và phát triển bởi SVN Automation
          </p>
        </div>
      </div>

      <section className="page-content">
        <div className="container">
          <div className="prod-list">
            {solutions.map((p, i) => (
              <div
                key={p._id || p.id}
                className={`prod-item ${i % 2 !== 0 ? "reverse" : ""}`}
              >
                <div className="prod-img">
                  {p.image ? <img src={p.image} alt={p.title} /> : null}
                </div>
                <div className="prod-text">
                  {p.category ? (
                    <span
                      className="card-cat"
                      style={{ display: "inline-block", marginBottom: 16 }}
                    >
                      {p.category === "solution" ? "Giải pháp" : p.category}
                    </span>
                  ) : null}
                  <h2>{p.title}</h2>
                  <p>{p.description}</p>
                  <Link
                    to="/lien-he"
                    className="btn-primary"
                    style={{ display: "inline-block", marginTop: 24 }}
                  >
                    Tư vấn ngay
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
