import PageShell from "./_shared/PageShell";
import Partners from "./Homepage/sections/Partners/Partners";
import styles from "./PartnersPage.module.css";

export default function PartnersPage() {
  return (
    <PageShell
      eyebrow="Đối tác"
      title={
        <>
          Đối Tác <span className="green">được chứng nhận</span>
        </>
      }
      subtitle="Trang Đối Tác (route `/doi-tac`) đồng nhất với section `#doi-tac` trên landing."
    >
      <div className={styles.embed}>
        <Partners />
      </div>
    </PageShell>
  );
}

