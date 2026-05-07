import { createContext, useEffect, useMemo, useState } from "react";

export const HomepageSectionContext = createContext({
  activeSectionId: "hero",
});

export function HomepageSectionProvider({ sectionIds, children }) {
  const ids = useMemo(() => sectionIds ?? [], [sectionIds]);
  const [activeSectionId, setActiveSectionId] = useState(ids[0] ?? "hero");

  useEffect(() => {
    if (!ids.length) return;
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveSectionId(visible.target.id);
      },
      { root: null, threshold: [0.35, 0.5, 0.65] },
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);

  return (
    <HomepageSectionContext.Provider value={{ activeSectionId }}>
      {children}
    </HomepageSectionContext.Provider>
  );
}

