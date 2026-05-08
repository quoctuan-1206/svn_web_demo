import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Gọi API login (sau khi backend xong)
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Đăng nhập thất bại");
        return;
      }

      // Lưu token vào localStorage
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("admin", JSON.stringify(data.admin));

      // Chuyển hướng đến dashboard
      navigate("/admin/dashboard");
    } catch (err) {
      setError("Lỗi kết nối: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="login-shell">
        <div className="login-left" aria-hidden="true">
          <div className="login-brand">SVN Automation</div>
          <div className="login-tagline">
            Đăng nhập quản trị để quản lý sản phẩm, tin tức và nội dung hệ thống.
          </div>
        </div>

        <div className="login-box">
          <h1 className="login-title">Đăng nhập</h1>
          <p className="login-sub">Admin portal</p>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Tài khoản</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
