import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";

const NAV_ITEMS = [
  { to: "/gioi-thieu", label: "Giới Thiệu", sectionId: "gioi-thieu" },
  { to: "/san-pham", label: "Sản Phẩm", sectionId: "san-pham" },
  { to: "/giai-phap", label: "Giải Pháp", sectionId: "giai-phap" },
  { to: "/doi-tac", label: "Đối Tác", sectionId: "doi-tac" },
  { to: "/tin-tuc", label: "Tin Tức", sectionId: "tin-tuc" },
  { to: "/tai-ve", label: "Tải Về", sectionId: "tai-ve" },
  { to: "/lien-he", label: "Liên Hệ", sectionId: "lien-he" },
];

function normalize(s) {
  return (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const activePath = useMemo(() => location.pathname, [location.pathname]);

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
    if (item?.sectionId) {
      goHomeThenScroll(item.sectionId);
      return;
    }
    if (item?.to) navigate(item.to);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    const q = normalize(query);
    if (!q) return;

    const match =
      NAV_ITEMS.find((s) => normalize(s.label) === q) ||
      NAV_ITEMS.find((s) => normalize(s.label).includes(q)) ||
      NAV_ITEMS.find((s) => normalize(s.to).includes(q));

    if (!match) return;
    setOpen(false);
    if (match.sectionId) {
      goHomeThenScroll(match.sectionId);
      return;
    }
    navigate(match.to);
  }

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={`container ${styles.inner}`}>
        <Link className={styles.brand} to="/" aria-label="Go to home">
          <span className={styles.brandMark}>SVN</span>
          <span className={styles.brandTag}>AUTOMATION</span>
        </Link>

        <nav className={`${styles.nav} ${open ? styles.open : ""}`}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.to}
              type="button"
              className={`${styles.link} ${activePath === item.to ? styles.active : ""}`}
              onClick={() => handleNav(item)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className={styles.controls}>
          <form
            className={styles.search}
            onSubmit={handleSearchSubmit}
            role="search"
          >
            <input
              className={styles.searchInput}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm..."
              aria-label="Tìm kiếm"
            />
            <button type="submit" className={styles.searchBtn} aria-label="Tìm">
              ⌕
            </button>
          </form>

          <button
            type="button"
            className={styles.langBtn}
            aria-label="Language"
          >
            VI ▾
          </button>

          <button
            type="button"
            className={styles.burger}
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
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
