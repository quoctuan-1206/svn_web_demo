import styles from "./Partners.module.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// const PartnersGlobe = lazy(() => import("./PartnersGlobe"));
//
// class GlobeErrorBoundary extends Component {
//   constructor(props) {
//     super(props);
//     this.state = { hasError: false };
//   }
//
//   static getDerivedStateFromError() {
//     return { hasError: true };
//   }
//
//   componentDidCatch(error) {
//     console.error("[PartnersGlobe]", error);
//   }
//
//   render() {
//     if (this.state.hasError) {
//       return this.props.fallback;
//     }
//     return this.props.children;
//   }
// }
//
// function PartnersGlobeSlot() {
//   const hostRef = useRef(null);
//   const [mountGlobe, setMountGlobe] = useState(false);
//
//   useEffect(() => {
//     const el = hostRef.current;
//     if (!el) return undefined;
//
//     if (typeof IntersectionObserver === "undefined") {
//       setMountGlobe(true);
//       return undefined;
//     }
//
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry?.isIntersecting) {
//           setMountGlobe(true);
//           observer.disconnect();
//         }
//       },
//       { rootMargin: "120px", threshold: 0.05 },
//     );
//
//     observer.observe(el);
//     return () => observer.disconnect();
//   }, []);
//
//   const fallback = (
//     <img
//       className={styles.globeFallback}
//       src="/images/3der.png"
//       alt=""
//       draggable={false}
//     />
//   );
//
//   return (
//     <div ref={hostRef} className={styles.globeCanvas} aria-hidden="true">
//       {mountGlobe ? (
//         <GlobeErrorBoundary fallback={fallback}>
//           <Suspense fallback={fallback}>
//             <PartnersGlobe />
//           </Suspense>
//         </GlobeErrorBoundary>
//       ) : (
//         fallback
//       )}
//     </div>
//   );
// }

const GLOBE_IMAGE_SRC = "/images/centerdoitac.png";

function PartnersGlobeImage() {
  return (
    <div className={styles.globeCanvas} aria-hidden="true">
      <img
        className={styles.globeImage}
        src={GLOBE_IMAGE_SRC}
        alt=""
        draggable={false}
      />
    </div>
  );
}

const PARTNER_ITEMS = [
  {
    lines: ["Collaborative Robots", "For industrial Automation"],
    logo: "/images/JAKA.png",
    logoAlt: "Collaborative Robots",
  },
  {
    lines: ["The World Leader In", "Force Measurement"],
    logo: "/images/ITF.png",
    logoAlt: "The World Leader In Force Measurement",
  },
  {
    lines: ["Intelligent Mobile Robots", "For Smart Manufacturing"],
    logo: "/images/IPLUS.png",
    logoAlt: "Intelligent Mobile Robots",
  },
  {
    lines: ["Leading Global Material", "Control System (MCS) Software"],
    logo: "/images/RC.png",
    logoAlt: "Leading Global Material Control System (MCS) Software",
  },
  {
    lines: ["Leading Around The Globe", "In Torque Products"],
    logo: "/images/MZ.png",
    logoAlt: "Leading Around The Globe In Torque Products",
  },
  {
    lines: ["SCADA Visualization", "Software"],
    logo: "/images/MCS.png",
    logoAlt: "SCADA Visualization Software",
  },
];

export default function Partners() {
  const { t } = useTranslation();

  return (
    <section
      className={styles.section}
      id="doi-tac"
      aria-label={t("home.partnersAria")}
    >
      <div className="container">
        <header className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.headingPrimary}>
              {t("home.partnersTitlePrimary")}
            </span>{" "}
            {t("home.partnersTitleSecondary")}
          </h2>
        </header>

        <div className={styles.gridWrap}>
          <div className={styles.grid} aria-label={t("home.partnersGridAria")}>
            {PARTNER_ITEMS.map(({ lines, logo, logoAlt }) => (
              <div key={lines.join(" ")} className={styles.item}>
                {logo ? (
                  <img
                    className={styles.itemLogo}
                    src={logo}
                    alt={logoAlt ?? ""}
                    loading="lazy"
                    draggable={false}
                  />
                ) : null}
                <div className={styles.itemTitle}>{lines[0]}</div>
                <div className={styles.itemSub}>{lines[1]}</div>
              </div>
            ))}
          </div>
          <PartnersGlobeImage />
        </div>

        <div className={styles.ctaRow}>
          <Link
            className={styles.cta}
            to="/doi-tac"
            aria-label={t("home.partnersCtaAria")}
          >
            {t("home.partnersCta")}{" "}
            <span className={styles.ctaArrow}>›</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
