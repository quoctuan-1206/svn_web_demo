import { useEffect } from "react";
import "./PageCommon.css";

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="page page-about">
      <div className="container about-hero">
        <p className="page-eyebrow">Về chúng tôi</p>
        <h1 className="about-title">
          SVN <span className="green">Automation</span>
        </h1>
      </div>
    </main>
  );
}
