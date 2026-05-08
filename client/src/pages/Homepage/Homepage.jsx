import Hero from "./sections/Hero/Hero";
import IntroGrid from "./sections/IntroGrid/IntroGrid";
import Products from "./sections/Products/Products";
import Solutions from "./sections/Solutions/Solutions";
import Partners from "./sections/Partners/Partners";
import News from "./sections/News/News";
import CTA from "./sections/CTA/CTA";
import styles from "./Homepage.module.css";
import { HomepageSectionProvider } from "../../context/HomepageSectionContext";

const SECTION_IDS = [
  "hero",
  "gioi-thieu",
  "san-pham",
  "giai-phap",
  "doi-tac",
  "tin-tuc",
  "lien-he",
];

export default function Homepage() {
  return (
    <HomepageSectionProvider sectionIds={SECTION_IDS}>
      <main className={styles.page} data-homepage-fullpage>
        <Hero />
        <IntroGrid />
        <Products />
        <Solutions />
        <Partners />
        <News />
        <CTA />
      </main>
    </HomepageSectionProvider>
  );
}

