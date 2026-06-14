import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, Map, BarChart3, Bell, User, LogOut,
  Plus, Users, Wrench, ClipboardCheck, Menu, X,
} from 'lucide-react';

const getNavLinks = (role: string) => {
  const base = [
    { to: '/dashboard/map',           icon: Map,           label: 'Live Map' },
    { to: '/dashboard/notifications', icon: Bell,          label: 'Notifications' },
    { to: '/dashboard/profile',       icon: User,          label: 'Profile' },
  ];
  const roleLinks: Record<string, typeof base> = {
    citizen: [
      { to: '/dashboard/citizen',       icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/dashboard/submit-report', icon: Plus,            label: 'Report Issue' },
      { to: '/dashboard/my-reports',    icon: FileText,        label: 'My Reports' },
      ...base,
    ],
    inspector: [
      { to: '/dashboard/inspector',     icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/dashboard/admin/reports', icon: ClipboardCheck,  label: 'Inspect Reports' },
      { to: '/dashboard/analytics',     icon: BarChart3,       label: 'Analytics' },
      ...base,
    ],
    maintenance_officer: [
      { to: '/dashboard/maintenance', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/dashboard/analytics',   icon: BarChart3,       label: 'Analytics' },
      ...base,
    ],
    admin: [
      { to: '/dashboard/admin',         icon: LayoutDashboard, label: 'Overview' },
      { to: '/dashboard/admin/reports', icon: FileText,        label: 'All Reports' },
      { to: '/dashboard/admin/users',   icon: Users,           label: 'Users' },
      { to: '/dashboard/maintenance',   icon: Wrench,          label: 'Maintenance' },
      { to: '/dashboard/analytics',     icon: BarChart3,       label: 'Analytics' },
      ...base,
    ],
  };
  return roleLinks[role] || base;
};

// Role pill colours — all stay in the green/gold RFA palette
const roleColors: Record<string, string> = {
  citizen:             'from-brand-600 to-brand-800',
  inspector:           'from-gold-500  to-gold-700',
  maintenance_officer: 'from-brand-500 to-brand-700',
  admin:               'from-brand-700 to-brand-900',
};

const roleLabels: Record<string, string> = {
  citizen:             'Citizen',
  inspector:           'Inspector',
  maintenance_officer: 'Maint. Officer',
  admin:               'Administrator',
};

// ── RFA Logo mark ──────────────────────────────────────────
function RFAMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Road surface */}
      <rect width="36" height="36" rx="9" fill="#1a7a4a"/>
      {/* White road stripe top */}
      <rect x="17" y="5" width="2" height="5" rx="1" fill="#C9A227"/>
      {/* White road stripe mid */}
      <rect x="17" y="15" width="2" height="6" rx="1" fill="#C9A227"/>
      {/* White road stripe bottom */}
      <rect x="17" y="26" width="2" height="5" rx="1" fill="#C9A227"/>
      {/* Road edges */}
      <rect x="8"  y="5"  width="2" height="26" rx="1" fill="rgba(255,255,255,0.25)"/>
      <rect x="26" y="5"  width="2" height="26" rx="1" fill="rgba(255,255,255,0.25)"/>
    </svg>
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navLinks = getNavLinks(user?.role || 'citizen');

  const { data: notifData } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: async () => {
      const { data } = await api.get('/notifications');
      return data.unread_count as number;
    },
    refetchInterval: 30000,
  });

  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile ? 'w-full' : 'w-64'} flex flex-col h-full`}
      style={{ background: 'var(--surface-card)' }}>

      {/* ── Brand header ───────────────────────────────── */}
      <div className="p-5" style={{ borderBottom: '1px solid var(--surface-border)' }}>
        <Link to="/" className="flex items-center gap-3 group">
          <RFAMark size={36} />
          <div>
            <div className="font-display font-bold text-white text-sm leading-tight">Road Fund</div>
            <div className="text-xs leading-tight" style={{ color: 'var(--rfa-gold)' }}>
              Administration Namibia
            </div>
          </div>
        </Link>
      </div>

      {/* ── User chip ─────────────────────────────────── */}
      <div className="p-4" style={{ borderBottom: '1px solid var(--surface-border)' }}>
        <div className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: 'var(--surface-hover)' }}>
          <div className={`w-8 h-8 bg-gradient-to-br ${roleColors[user?.role || 'citizen']} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{user?.full_name}</div>
            <div className="text-xs" style={{ color: 'var(--rfa-gold)' }}>
              {roleLabels[user?.role || '']}
            </div>
          </div>
        </div>
      </div>

      {/* ── Nav links ─────────────────────────────────── */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard/admin' || to === '/dashboard/citizen' || to === '/dashboard/inspector' || to === '/dashboard/maintenance'}
            onClick={() => mobile && setSidebarOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1">{label}</span>
            {label === 'Notifications' && notifData && notifData > 0 && (
              <span style={{ background: 'var(--rfa-red)' }}
                className="text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {notifData > 9 ? '9+' : notifData}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Gold divider + sign out ────────────────────── */}
      <div className="p-3" style={{ borderTop: '1px solid var(--surface-border)' }}>
        {/* Thin gold rule */}
        <div className="divider-gold mb-3" />
        <button
          onClick={logout}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:!bg-red-500/10"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--surface-bg)' }}>

      {/* ── Desktop sidebar ─────────────────────────────── */}
      <div className="hidden md:flex flex-col w-64"
        style={{ borderRight: '1px solid var(--surface-border)' }}>
        <Sidebar />
      </div>

      {/* ── Mobile sidebar ──────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 md:hidden flex flex-col"
              style={{ borderRight: '1px solid var(--surface-border)' }}
            >
              <div className="flex items-center justify-between p-4"
                style={{ borderBottom: '1px solid var(--surface-border)' }}>
                <span className="font-display font-bold text-white">Navigation</span>
                <button onClick={() => setSidebarOpen(false)} className="p-1 text-surface-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Sidebar mobile />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ──────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="px-6 py-3 flex items-center justify-between"
          style={{
            background: 'var(--surface-card)',
            borderBottom: '1px solid var(--surface-border)',
          }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1.5 text-surface-400 hover:text-white rounded-lg hover:bg-surface-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Gold rule breadcrumb accent */}
          <div className="hidden md:flex items-center gap-3">
            <span className="gold-rule" />
            <span className="text-xs text-surface-400 font-medium tracking-widest uppercase">
              Road Fund Administration
            </span>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <NavLink
              to="/dashboard/notifications"
              className="relative p-2 text-surface-400 hover:text-white rounded-lg hover:bg-surface-800 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notifData && notifData > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                  style={{ background: 'var(--rfa-red)' }} />
              )}
            </NavLink>

            <NavLink
              to="/dashboard/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-surface-800 transition-colors"
            >
              <div className={`w-7 h-7 bg-gradient-to-br ${roleColors[user?.role || 'citizen']} rounded-lg flex items-center justify-center text-white font-bold text-xs`}>
                {user?.full_name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-surface-300 hidden sm:block">
                {user?.full_name?.split(' ')[0]}
              </span>
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
