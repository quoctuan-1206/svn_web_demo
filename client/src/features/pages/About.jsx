import { useEffect } from "react";
import "./PageCommon.css";

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="page page-about">
      <div className="container">
        <p className="page-eyebrow">Về chúng tôi</p>
        <h1>
          SVN <span className="green">Automation</span>
        </h1>
        <p className="page-desc">
          Đồng hành cùng nền công nghiệp Việt Nam trong hành trình số hóa và tự
          động hóa
        </p>
      </div>
    </main>
  );
}
