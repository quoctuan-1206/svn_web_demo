import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

const HomepageSectionContext = createContext({ activeSectionId: null });

const SECTION_IDS = [
  "hero",
  "gioi-thieu",
  "san-pham",
  "giai-phap",
  "doi-tac",
  "tin-tuc",
  "lien-he",
];

export function HomepageSectionProvider({ children }) {
  const { pathname } = useLocation();
  const [activeSectionId, setActiveSectionId] = useState(null);

  useEffect(() => {
    if (pathname !== "/") {
      setActiveSectionId(null);
      return;
    }

    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      Boolean,
    );
    if (!sections.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (best?.target?.id) setActiveSectionId(best.target.id);
      },
      {
        root: null,
        threshold: [0.45, 0.55, 0.65],
        rootMargin: "-56px 0px 0px 0px",
      },
    );

    sections.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [pathname]);

  const value = useMemo(() => ({ activeSectionId }), [activeSectionId]);
  return (
    <HomepageSectionContext.Provider value={value}>
      {children}
    </HomepageSectionContext.Provider>
  );
}

export function useHomepageSection() {
  return useContext(HomepageSectionContext);
}

