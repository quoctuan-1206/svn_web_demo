import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Homepage from "./pages/Homepage/Homepage";
import Contact from "./pages/Contact";
import Products from "./pages/Products";
import News from "./pages/News";
import Intro from "./pages/Intro";
import Solutions from "./pages/Solutions";
import PartnersPage from "./pages/PartnersPage";
import DownloadPage from "./pages/DownloadPage";
import GlobalPresence from "./pages/GlobalPresence";
import ServicesSupport from "./pages/ServicesSupport";
import About from "./pages/About";
import Overview from "./pages/Overview";

import AdminLayout from "./admin/components/AdminLayout";
import LoginPage from "./admin/pages/LoginPage";
import Dashboard from "./admin/pages/Dashboard";
import ProductsAdmin from "./admin/pages/ProductsAdmin";
import NewsAdmin from "./admin/pages/NewsAdmin";

function AppShell() {
  const { pathname } = useLocation();
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <>
      {!isAdminPage ? <Header /> : null}

      <div className={!isAdminPage ? "has-fixed-footer" : undefined}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Homepage />} />
          <Route path="/tong-quan" element={<Overview />} />
          <Route path="/gioi-thieu" element={<Intro />} />
          <Route path="/san-pham" element={<Products />} />
          <Route path="/giai-phap" element={<Solutions />} />
          <Route path="/doi-tac" element={<PartnersPage />} />
          <Route path="/tin-tuc" element={<News />} />
          <Route path="/tai-ve" element={<DownloadPage />} />
          <Route path="/hien-dien-toan-cau" element={<GlobalPresence />} />
          <Route path="/dich-vu-ho-tro" element={<ServicesSupport />} />
          <Route path="/lien-he" element={<Contact />} />
          <Route path="/ve-chung-toi" element={<About />} />

          {/* Admin */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<ProductsAdmin />} />
            <Route path="news" element={<NewsAdmin />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {!isAdminPage ? (
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
      <AppShell />
    </BrowserRouter>
  );
}
