import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../admin.css";
import { apiOriginUrl } from "../../../utils/apiOriginUrl";

function EyeIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={props.className}
    >
      <path
        d="M2.2 12s3.5-7 9.8-7 9.8 7 9.8 7-3.5 7-9.8 7-9.8-7-9.8-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 15.2A3.2 3.2 0 1 0 12 8.8a3.2 3.2 0 0 0 0 6.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeOffIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={props.className}
    >
      <path
        d="M3 3l18 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10.6 5.2A10.5 10.5 0 0 1 12 5c6.3 0 9.8 7 9.8 7a19.3 19.3 0 0 1-4.1 5.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.4 6.4C3.7 8.6 2.2 12 2.2 12s3.5 7 9.8 7c1.2 0 2.3-.2 3.3-.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.2 10.2a3.2 3.2 0 0 0 4.4 4.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black"
      aria-hidden="true"
    />
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    return !loading && username.trim().length > 0 && password.length > 0;
  }, [loading, username, password]);

  async function handleLogin() {
    if (!canSubmit) return;
    setError("");
    setLoading(true);

    try {
      const resp = await fetch(apiOriginUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        setError(data?.message || "Sai tài khoản hoặc mật khẩu");
        return;
      }

      const token = data?.token;
      if (!token) {
        setError("Đăng nhập thất bại: thiếu token");
        return;
      }

      localStorage.setItem("svn_token", token);
      navigate("/admin/dashboard");
    } catch (e) {
      setError(e?.message || "Không thể kết nối server");
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter") {
      handleLogin();
    }
  }

  return (
    <div className="admin-shell">
      <div className="admin-shell__bg" />
      <div className="admin-shell__content admin-login">
        <div className="admin-login__grid">
          <div className="admin-login__left">
            <div className="admin-login__brand">SVN Automation</div>
            <div className="admin-login__headline">Admin Panel</div>
            <div className="admin-login__tagline">
              Đăng nhập để quản lý sản phẩm, giải pháp và tin tức.
            </div>
          </div>

          <div className="admin-card admin-fade-up admin-login__card">
            <div className="admin-login__cardHeader">
              <div className="admin-logo admin-login__logo">
                <span className="admin-login__logoText">SVN</span>
              </div>
              <div>
                <div className="admin-login__cardTitle">Đăng nhập</div>
                <div className="admin-login__cardSub">
                  Quản trị hệ thống SVN Automation
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Username
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Nhập username"
                  autoComplete="username"
                  className="admin-input admin-login__input w-full px-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="admin-login__passwordRow">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={onKeyDown}
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    autoComplete="current-password"
                    className="admin-input admin-login__input w-full px-3 text-sm"
                  />
                  <button
                    type="button"
                    className="admin-login__togglePw"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="admin-login__togglePwIcon" />
                    ) : (
                      <EyeIcon className="admin-login__togglePwIcon" />
                    )}
                  </button>
                </div>
              </div>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              ) : null}

              <button
                type="button"
                disabled={!canSubmit}
                onClick={handleLogin}
                className="admin-button-primary admin-login__submit inline-flex w-full items-center justify-center gap-2 px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Spinner /> : null}
                <span>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</span>
              </button>

              <div className="admin-login__hint">
                Token sẽ được lưu tại{" "}
                <span className="font-medium">localStorage</span> với key{" "}
                <span className="font-mono">svn_token</span>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
