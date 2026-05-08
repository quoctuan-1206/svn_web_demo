import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";

const LOGO_SRC =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAaCAYAAADFTB7LAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABFBJREFUeNrsV11oFFcUPjO7W9ymjddE10hNdkKEpKXUKQoq2u5soy+2EIVa2ljJYvMgVNxNQVQMJv481ZQkIKXQkhqo2z60dG2wFFK7s1C0D0ImfWj6YjMppYYYzUQaiC+5njNzJ06SXd3drOBDDxzu35mz3/3uueeeBfhflifSch0c1cMaNipqWLRwXhuLlgqgvwhAMWyaBBgli4leSgYLA9g+xwBqW7CnPdbunGxd/yum+iRgAZmzgI9H/Hhe2E77ZW74JK6vX3PJKg3A9jliraWArSTwm6ZtfdCL/RSBtVuUm+MHiPkWWYLuibvN/aGKZGdxMdg+pwpQBI65x3d0Zy08hkH9/M+jGWw7PHMXUfsR6Pzxj9/Zz3wyTyPDegVLtuVyJmcBpqEOYW/IZuIhuOUIbTKNfkdt/yhVlZcsZCcqSTx27957LH+ADjvqE8oaipf91auSBNLIcdlyAoSpkxLws0t138vO+qGN38DHERPq2FZ7HPSXw+ntv8OJLb/a4843HHvyo66DBXPUujI51cw4SEp5+ddG3gA1DDG2AsCaBei5DnA67Wjbjxz0UcdmcKzHbneFE/MtgXTnXSE/6YMS7Hkx+49zDCHOMTYLucUEIjXiAE1sW3ifWBBghm6i9RvcGP8WNle9beuO9Qfh3//+sOe8QhvU8PC+b5bAuLXwd27d2R/jnDdxCaJ5AfzoSpzh1de6rgEMjzvqSkRxAK95FgHOPmSRwL1T32WPB26eWeJ8Gm2jfdxm0T1qkr9vvx+b4zwuS1K0kj06F9oA4wMJhrvp6Hqztw3au9VIlpAlVjvTHGKC1anZf2yQdSu3wl3sE6uumFMUDpLdUqi8+imH7t0IsgqgMfxFEx6rhccbXVuRZ6K2YwFDzZ2kXecjg2YPDGaZvzhEutBH0hiB2h1JBPy8+VrdV3vzfuoO/4Ds4UPf81av9STyyrrnJuHQpstQvfI2HP+lFf6crBkGOFbQW0w5b8x7motsNnqStZFnjjTrK8esfS9dZa/XGMZ3I42XOzIfFFVMEECT7sH8zDnZEECyy85wOheogBywqoPVcPVAaxwLgxQWBf3bN3yJgC4srx48MpDoxuqCyTK0fbL70UeN5ZYLkDY2HHqmBl4IhlmZPxhBQIB++vGNTe1q6CtJyEieNJPAh7vFZ5dCkMESyZRlbp1qvGB0ZT6kh10NYFpHEIpQBIRjiRvYz/hk0Pe+8nnJ43hJNXPipyMqgtHwiAgU+B1QthJAZMjAms5q3fKZDk+jhEIhFVVDVbLMK955t7/Y1rOu5Vor+j8JORXdOCoVpJbQuOe294q+a6N5Lp5rT7JHzJvCJiUqG/pWnZiY6PQVCrCsrEzzlGXk7L5wSP0qoQ0idWlibYUA0yDWh0W6IkCUFKdR61HfFf4otd2fmZnRi2FQEQwoHjbYoprPdAsaD1vuGJAZQ/hxbWMiPxpeX2hnPvX/ix8IMACrd4STNOl6SAAAAABJRU5ErkJggg==";

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
          <img className={styles.logo} src={LOGO_SRC} alt="SVN Automation" />
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
