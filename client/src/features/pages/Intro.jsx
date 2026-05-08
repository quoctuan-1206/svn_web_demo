import PageShell from "../../shared/layouts/PageShell/PageShell";
import styles from "./Intro.module.css";

export default function Intro() {
  return (
    <main className="page">
      <div className="container">
        <p className="page-eyebrow">Giới thiệu</p>
        <h1>
          SVN <span className="green">Automation</span>
        </h1>
        <p className="page-desc">Đây là trang Giới thiệu</p>
      </div>
    </main>
  );
}
