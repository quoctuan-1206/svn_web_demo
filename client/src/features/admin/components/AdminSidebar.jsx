import React from "react";
import { NavLink } from "react-router-dom";
import {
  Inbox,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Package,
} from "lucide-react";
import useAuth from "../hooks/useAuth";

const navItems = [
  { label: "Dashboard", to: "/admin/dashboard", Icon: LayoutDashboard },
  { label: "Products", to: "/admin/products", Icon: Package },
  { label: "News", to: "/admin/news", Icon: Newspaper },
  { label: "Liên hệ", to: "/admin/contacts", Icon: Inbox },
];

function SidebarLink({ to, label, Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "admin-nav-item group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
          isActive ? "active" : "",
        ].join(" ")
      }
    >
      <Icon className="h-5 w-5 opacity-80" />
      <span>{label}</span>
    </NavLink>
  );
}

export default function AdminSidebar() {
  const { logout } = useAuth();

  return (
    <aside className="admin-sidebar sticky top-0 flex h-screen w-64 flex-col">
      <div className="px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="admin-logo flex h-11 w-11 items-center justify-center rounded-2xl shadow-[0_10px_24px_rgba(14,165,164,0.25)]">
              <span className="text-sm font-extrabold tracking-wide">SVN</span>
            </div>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900">
              SVN Automation
            </div>
            <div className="text-xs text-slate-500">Admin Panel</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 pb-4">
        {navItems.map((item) => (
          <SidebarLink key={item.to} {...item} />
        ))}
      </nav>

      <div className="p-4">
        <div className="admin-card admin-card-muted mb-3 flex items-center gap-3 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-800 ring-1 ring-slate-200">
            <span className="text-sm font-bold">A</span>
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900">
              admin
            </div>
            <div className="text-xs text-slate-500">Quản trị viên</div>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="admin-button-outline inline-flex h-10 w-full items-center justify-center gap-2 text-sm font-semibold transition hover:border-slate-300"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
