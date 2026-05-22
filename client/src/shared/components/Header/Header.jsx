import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import { useHomepageSection } from "../../../context/HomepageSectionContext";
import { filterSiteSearch } from "../../search/siteSearch";
import { useSiteSearchIndex } from "../../search/useSiteSearchIndex";

const LOGO_SRC = "/images/SVN1.png";

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
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { activeSectionId } = useHomepageSection();
  const { entries, loading: searchLoading } = useSiteSearchIndex();
  const searchWrapRef = useRef(null);

  const activePath = useMemo(() => location.pathname, [location.pathname]);
  const isHomepage = activePath === "/";

  const searchResults = useMemo(
    () => filterSiteSearch(entries, query, 10),
    [entries, query],
  );

  const showSearchPanel =
    searchOpen && query.trim().length > 0 && (searchLoading || searchResults.length > 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
    setQuery("");
  }, [location.pathname]);

  useEffect(() => {
    function onDocPointerDown(e) {
      if (!searchWrapRef.current?.contains(e.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("pointerdown", onDocPointerDown);
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
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

  function goToSearchResult(result) {
    if (!result) return;
    setOpen(false);
    setSearchOpen(false);
    setQuery("");
    if (result.sectionId) {
      goHomeThenScroll(result.sectionId);
      return;
    }
    navigate(result.to);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    const first = searchResults[0];
    if (first) {
      goToSearchResult(first);
      return;
    }
    if (query.trim()) setSearchOpen(true);
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
                  : activePath === item.to || activePath.startsWith(`${item.to}/`)
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
          <div className={styles.searchWrap} ref={searchWrapRef}>
            <form
              className={styles.search}
              onSubmit={handleSearchSubmit}
              role="search"
            >
              <input
                className={styles.searchInput}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Tìm kiếm ..."
                aria-label="Tìm kiếm nội dung"
                aria-expanded={showSearchPanel}
                aria-controls="site-search-results"
                aria-autocomplete="list"
                autoComplete="off"
              />
            </form>

            {showSearchPanel ? (
              <div
                id="site-search-results"
                className={styles.searchResults}
                role="listbox"
                aria-label="Kết quả tìm kiếm"
              >
                {searchLoading ? (
                  <p className={styles.searchHint}>Đang tải dữ liệu…</p>
                ) : (
                  searchResults.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      type="button"
                      role="option"
                      className={styles.searchResult}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => goToSearchResult(result)}
                    >
                      <span className={styles.searchResultType}>
                        {result.typeLabel}
                      </span>
                      <span className={styles.searchResultTitle}>
                        {result.title}
                      </span>
                      {result.subtitle ? (
                        <span className={styles.searchResultSub}>
                          {result.subtitle}
                        </span>
                      ) : null}
                    </button>
                  ))
                )}
              </div>
            ) : null}

            {searchOpen && query.trim() && !searchLoading && !searchResults.length ? (
              <div className={styles.searchResults} role="status">
                <p className={styles.searchHint}>Không tìm thấy kết quả</p>
              </div>
            ) : null}
          </div>

          <button type="button" className={styles.langBtn} aria-label="Ngôn ngữ">
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
