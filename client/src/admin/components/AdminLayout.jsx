import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

function getTitleFromPath(pathname) {
  if (pathname.startsWith('/admin/products')) return 'Products';
  if (pathname.startsWith('/admin/news')) return 'News';
  if (pathname.startsWith('/admin/dashboard')) return 'Dashboard';
  return 'Admin';
}

function PrivateRoute({ children }) {
  let token = null;
  try {
    token = localStorage.getItem('svn_token');
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
      <div className="min-h-screen bg-[#070707] text-white">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(900px_circle_at_20%_-10%,rgba(0,230,118,0.10),transparent_60%),radial-gradient(900px_circle_at_100%_0%,rgba(168,85,247,0.08),transparent_55%)]" />

        <div className="relative flex min-h-screen">
        <AdminSidebar />

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/10 bg-[#0b0b0b]/80 px-6 backdrop-blur">
            <div className="text-base font-semibold text-white">{title}</div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-neutral-300">admin</div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/10">
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

