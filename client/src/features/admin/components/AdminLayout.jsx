import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "../admin.css";

function getTitleFromPath(pathname) {
  if (pathname.startsWith("/admin/products")) return "Sản phẩm";
  if (pathname.startsWith("/admin/solutions")) return "Giải pháp";
  if (pathname.startsWith("/admin/news")) return "News";
  if (pathname.startsWith("/admin/contacts")) return "Liên hệ";
  if (pathname.startsWith("/admin/dashboard")) return "Dashboard";
  return "Admin";
}

function PrivateRoute({ children }) {
  let token = null;
  try {
    token = localStorage.getItem("svn_token");
  } catch {
    token = null;
  }

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default function AdminLayout() {
  const location = useLocation();
  const title = getTitleFromPath(location.pathname);

  return (
    <PrivateRoute>
      <div className="admin-shell">
        <div className="admin-shell__bg" />

        <div className="admin-shell__content flex min-h-screen">
          <AdminSidebar />

          <div className="flex min-h-screen flex-1 flex-col">
            <header className="admin-header sticky top-0 z-10 flex h-16 items-center justify-between px-6">
              <div className="text-base font-semibold text-slate-900">
                {title}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-slate-600">admin</div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-800 ring-1 ring-slate-200">
                  <span className="text-sm font-bold">A</span>
                </div>
              </div>
            </header>

            <main className="flex-1 px-6 py-6">
              <div className="mx-auto w-full max-w-7xl">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>
    </PrivateRoute>
  );
}
