import { useEffect } from "react";
import Partners from "../home/Homepage/sections/Partners/Partners";

export default function PartnersPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="page">
      <Partners />
    </main>
  );
}
