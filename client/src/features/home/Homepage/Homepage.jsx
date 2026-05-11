import Hero from "./sections/Hero/Hero";
import IntroGrid from "./sections/IntroGrid/IntroGrid";
import Products from "./sections/Products/Products";
import Solutions from "./sections/Solutions/Solutions";
import Partners from "./sections/Partners/Partners";
import News from "./sections/News/News";
import CTA from "./sections/CTA/CTA";
import styles from "./Homepage.module.css";

export default function Homepage() {
  return (
    <main className={styles.page} data-homepage-fullpage>
      <Hero />
      <IntroGrid />
      <Products />
      <Solutions />
      <Partners />
      <News />
      <CTA />
    </main>
  );
}
