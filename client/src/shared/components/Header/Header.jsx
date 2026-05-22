import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import { useHomepageSection } from "../../../context/HomepageSectionContext";

const LOGO_SRC = "/images/SVN1.png";
const SEARCH_ICON_SRC = "/images/search.png";

const NAV_ITEMS = [
  { to: "/ve-chung-toi", label: "Về" },
  { to: "/san-pham", label: "Sản Phẩm", sectionId: "san-pham" },
  { to: "/giai-phap", label: "Giải Pháp", sectionId: "giai-phap" },
  { to: "/doi-tac", label: "Đối Tác", sectionId: "doi-tac" },
  { to: "/tin-tuc", label: "Tin Tức", sectionId: "tin-tuc" },
  { to: "/tai-ve", label: "Tải Về" },
  { to: "/lien-he", label: "Liên Hệ", sectionId: "lien-he" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { activeSectionId } = useHomepageSection();

  const activePath = useMemo(() => location.pathname, [location.pathname]);
  const isHomepage = activePath === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToSection(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goHomeThenScroll(id) {
    if (location.pathname === "/") {
      scrollToSection(id);
      return;
    }
    navigate("/", { replace: false });
    window.setTimeout(() => scrollToSection(id), 0);
  }

  function handleNav(item) {
    setOpen(false);
    if (location.pathname === "/" && item?.sectionId) {
      scrollToSection(item.sectionId);
      return;
    }
    if (item?.to) {
      navigate(item.to);
      return;
    }
    if (item?.sectionId) goHomeThenScroll(item.sectionId);
  }

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={`container ${styles.inner}`}>
        <Link className={styles.brand} to="/" aria-label="Về trang chủ">
          <img className={styles.logo} src={LOGO_SRC} alt="SVN Automation" />
        </Link>

        <nav className={`${styles.nav} ${open ? styles.open : ""}`}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.to}
              type="button"
              className={`${styles.link} ${
                isHomepage
                  ? activeSectionId && item.sectionId === activeSectionId
                    ? styles.active
                    : ""
                  : activePath === item.to ||
                      activePath.startsWith(`${item.to}/`)
                    ? styles.active
                    : ""
              }`}
              onClick={() => handleNav(item)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className={styles.controls}>
          <Link
            className={styles.searchLink}
            to="/tim-kiem"
            aria-label="Tìm kiếm"
          >
            <img
              className={styles.searchIcon}
              src={SEARCH_ICON_SRC}
              alt=""
              aria-hidden="true"
            />
            <span className={styles.searchText}>Tìm kiếm</span>
          </Link>

          <button
            type="button"
            className={styles.langBtn}
            aria-label="Ngôn ngữ"
          >
            VI ▾
          </button>

          <button
            type="button"
            className={styles.burger}
            onClick={() => setOpen((v) => !v)}
            aria-label="Mở/đóng menu"
            aria-expanded={open}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
