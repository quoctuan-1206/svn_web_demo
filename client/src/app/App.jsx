import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Header from "../shared/components/Header/Header";
import Footer from "../shared/components/Footer/Footer";
import {
  HomepageSectionProvider,
  useHomepageSection,
} from "../context/HomepageSectionContext";
import Homepage from "../features/home/Homepage/Homepage";
import Contact from "../features/pages/Contact";
import Products from "../features/pages/Products";
import News from "../features/pages/News";
import NewsDetailPage from "../features/pages/NewsDetailPage";
import CatalogDetailPage from "../features/pages/CatalogDetailPage";
import Solutions from "../features/pages/Solutions";
import PartnersPage from "../features/pages/PartnersPage";
import DownloadPage from "../features/pages/DownloadPage";
import GlobalPresence from "../features/pages/GlobalPresence";
import ServicesSupport from "../features/pages/ServicesSupport";
import About from "../features/pages/About";
import Overview from "../features/pages/Overview";
import SearchPage from "../features/pages/Search";

import AdminLayout from "../features/admin/components/AdminLayout";
import LoginPage from "../features/admin/pages/LoginPage";
import Dashboard from "../features/admin/pages/Dashboard";
import ProductsAdmin from "../features/admin/pages/ProductsAdmin";
import NewsAdmin from "../features/admin/pages/NewsAdmin";
import ContactLeadsAdmin from "../features/admin/pages/ContactLeadsAdmin";

function AppShell() {
  const { pathname } = useLocation();
  const { activeSectionId } = useHomepageSection();
  const isAdminPage = pathname.startsWith("/admin");
  const isHomepage = pathname === "/";
  /** Trang chi tiết tin: không footer cố định, không padding đáy cho footer */
  const isArticleStyleDetail =
    /^\/tin-tuc\/.+|^\/san-pham\/.+|^\/giai-phap\/.+/.test(pathname);
  const useFixedFooterShell = !isAdminPage && !isArticleStyleDetail;
  const isContactPage = pathname === "/lien-he";
  const hideGlobalFooterOnCta = isHomepage && activeSectionId === "lien-he";
  const showGlobalFooter =
    useFixedFooterShell && !hideGlobalFooterOnCta && !isContactPage;
  /** Homepage fullpage snap: không padding đáy (tránh lệch section); footer vẫn fixed */
  const contentShellClass =
    showGlobalFooter && !isHomepage ? "has-fixed-footer" : undefined;

  return (
    <>
      {!isAdminPage ? <Header /> : null}

      <div className={contentShellClass}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Homepage />} />
          <Route path="/tong-quan" element={<Overview />} />
          <Route
            path="/san-pham/:slug"
            element={<CatalogDetailPage variant="product" />}
          />
          <Route path="/san-pham" element={<Products />} />
          <Route
            path="/giai-phap/:slug"
            element={<CatalogDetailPage variant="solution" />}
          />
          <Route path="/giai-phap" element={<Solutions />} />
          <Route path="/doi-tac" element={<PartnersPage />} />
          <Route path="/tin-tuc/:slug" element={<NewsDetailPage />} />
          <Route path="/tin-tuc" element={<News />} />
          <Route path="/tai-ve" element={<DownloadPage />} />
          <Route path="/hien-dien-toan-cau" element={<GlobalPresence />} />
          <Route path="/dich-vu-ho-tro" element={<ServicesSupport />} />
          <Route path="/lien-he" element={<Contact />} />
          <Route path="/ve-chung-toi" element={<About />} />
          <Route path="/tim-kiem" element={<SearchPage />} />

          {/* Admin */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<ProductsAdmin fixedCategory="product" />} />
            <Route path="solutions" element={<ProductsAdmin fixedCategory="solution" />} />
            <Route path="news" element={<NewsAdmin />} />
            <Route path="contacts" element={<ContactLeadsAdmin />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {showGlobalFooter ? (
        <div className="global-footer-fixed">
          <Footer />
        </div>
      ) : null}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <HomepageSectionProvider>
        <AppShell />
      </HomepageSectionProvider>
    </BrowserRouter>
  );
}
