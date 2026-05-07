import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "/api";

function UserIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={props.className}
    >
      <path
        d="M20 21a8 8 0 1 0-16 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 13a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LockIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={props.className}
    >
      <path
        d="M7 11V8a5 5 0 0 1 10 0v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6.5 11h11A2.5 2.5 0 0 1 20 13.5v6A2.5 2.5 0 0 1 17.5 22h-11A2.5 2.5 0 0 1 4 19.5v-6A2.5 2.5 0 0 1 6.5 11Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
      const resp = await fetch(`${API_BASE}/auth/login`, {
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
    <div className="relative min-h-screen w-full overflow-hidden bg-[#070707]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_-10%,rgba(0,230,118,0.14),transparent_60%),radial-gradient(900px_circle_at_100%_0%,rgba(168,85,247,0.10),transparent_55%)]" />
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
        <div className="w-96 rounded-3xl border border-black/10 bg-white p-8 shadow-[0_30px_90px_rgba(0,0,0,0.60)]">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00e676] text-black shadow-[0_12px_30px_rgba(0,230,118,0.30)]">
              <span className="text-lg font-extrabold tracking-wide">SVN</span>
            </div>
            <div className="text-xl font-semibold text-neutral-900">
              Quản trị hệ thống
            </div>
            <div className="mt-1 text-sm text-neutral-500">
              SVN Automation Admin Panel
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-800">
                Username
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
                  <UserIcon className="h-5 w-5" />
                </span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Nhập username"
                  autoComplete="username"
                  className="h-11 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-300 focus:ring-4 focus:ring-[#00e676]/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-800">
                Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
                  <LockIcon className="h-5 w-5" />
                </span>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={onKeyDown}
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  className="h-11 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-11 text-sm text-neutral-900 outline-none transition focus:border-neutral-300 focus:ring-4 focus:ring-[#00e676]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-2 inline-flex items-center justify-center rounded-lg px-2 text-neutral-500 hover:bg-neutral-100"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
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
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#00e676] px-4 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(0,230,118,0.25)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Spinner /> : null}
              <span>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</span>
            </button>

            <div className="pt-2 text-center text-xs text-neutral-500">
              Token sẽ được lưu tại{" "}
              <span className="font-medium">localStorage</span> với key{" "}
              <span className="font-mono">svn_token</span>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
