import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductsManagement from "../../components/ProductsManagement";
import NewsManagement from "../../components/NewsManagement";
import ContactsManagement from "../../components/ContactsManagement";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra xem có token không
    const token = localStorage.getItem("adminToken");
    const adminData = localStorage.getItem("admin");

    if (!token) {
      navigate("/admin/login");
      return;
    }

    if (adminData) {
      setAdmin(JSON.parse(adminData));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <h1>Admin Dashboard</h1>
        </div>
        <div className="header-right">
          <span className="admin-name">{admin?.username}</span>
          <button onClick={handleLogout} className="logout-btn">
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="admin-container">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            <button
              className={`nav-item ${activeTab === "products" ? "active" : ""}`}
              onClick={() => setActiveTab("products")}
            >
              📦 Quản lý Sản phẩm
            </button>
            <button
              className={`nav-item ${activeTab === "news" ? "active" : ""}`}
              onClick={() => setActiveTab("news")}
            >
              📰 Quản lý Tin tức
            </button>
            <button
              className={`nav-item ${activeTab === "contacts" ? "active" : ""}`}
              onClick={() => setActiveTab("contacts")}
            >
              📧 Quản lý Liên hệ
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="admin-content">
          {activeTab === "products" && <ProductsManagement />}
          {activeTab === "news" && <NewsManagement />}
          {activeTab === "contacts" && <ContactsManagement />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
