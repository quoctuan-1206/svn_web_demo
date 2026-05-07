import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LogOut, Newspaper, Package } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const navItems = [
  { label: 'Dashboard', to: '/admin/dashboard', Icon: LayoutDashboard },
  { label: 'Products', to: '/admin/products', Icon: Package },
  { label: 'News', to: '/admin/news', Icon: Newspaper },
];

function SidebarLink({ to, label, Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition',
          'border-l-4',
          isActive
            ? 'border-l-[#00e676] bg-[#00e676]/10 text-[#00e676] shadow-[0_0_0_1px_rgba(0,230,118,0.18)_inset]'
            : 'border-l-transparent text-neutral-300 hover:bg-white/5 hover:text-white',
        ].join(' ')
      }
    >
      <Icon className="h-5 w-5 opacity-90" />
      <span>{label}</span>
    </NavLink>
  );
}

export default function AdminSidebar() {
  const { logout } = useAuth();

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col border-r border-white/10 bg-[#0b0b0b]">
      <div className="px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00e676] text-black shadow-[0_10px_30px_rgba(0,230,118,0.25)]">
              <span className="text-sm font-extrabold tracking-wide">SVN</span>
            </div>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">SVN Automation</div>
            <div className="text-xs text-neutral-400">Admin Panel</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 pb-4">
        {navItems.map((item) => (
          <SidebarLink key={item.to} {...item} />
        ))}
      </nav>

      <div className="p-4">
        <div className="mb-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/10">
            <span className="text-sm font-bold">A</span>
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">admin</div>
            <div className="text-xs text-neutral-400">Quản trị viên</div>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

