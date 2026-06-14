import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { severityConfig, statusConfig, taskStatusConfig, priorityConfig } from '../../utils/helpers';
import { Severity, ReportStatus, TaskStatus, TaskPriority } from '../../types';

// ── SeverityBadge ─────────────────────────────────────────────
export const SeverityBadge = ({ severity }: { severity: Severity }) => {
  const cfg = severityConfig[severity];
  return (
    <span className={`badge ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ── StatusBadge ───────────────────────────────────────────────
export const StatusBadge = ({ status }: { status: ReportStatus }) => {
  const cfg = statusConfig[status];
  return <span className={`badge ${cfg.color}`}>{cfg.icon} {cfg.label}</span>;
};

// ── TaskStatusBadge ───────────────────────────────────────────
export const TaskStatusBadge = ({ status }: { status: TaskStatus }) => {
  const cfg = taskStatusConfig[status];
  return <span className={`badge ${cfg.color}`}>{cfg.label}</span>;
};

// ── PriorityBadge ─────────────────────────────────────────────
export const PriorityBadge = ({ priority }: { priority: TaskPriority }) => {
  const cfg = priorityConfig[priority];
  return <span className={`badge ${cfg.color}`}>{cfg.label}</span>;
};

// ── ProgressBar ───────────────────────────────────────────────
export const ProgressBar = ({ value, showLabel = true, size = 'md' }: {
  value: number; showLabel?: boolean; size?: 'sm' | 'md' | 'lg'
}) => {
  const height = size === 'sm' ? 'h-1' : size === 'md' ? 'h-2' : 'h-3';
  const color = value === 100 ? 'bg-emerald-500' : value >= 60 ? 'bg-brand-500' : value >= 30 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="flex items-center gap-3">
      <div className={`flex-1 bg-surface-700 rounded-full ${height} overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`${height} ${color} rounded-full`}
        />
      </div>
      {showLabel && <span className="text-xs text-surface-400 w-9 text-right">{value}%</span>}
    </div>
  );
};

// ── StatCard ──────────────────────────────────────────────────
export const StatCard = ({ label, value, icon: Icon, color = 'brand', trend }: {
  label: string; value: number | string; icon: React.ElementType;
  color?: 'brand' | 'red' | 'emerald' | 'amber' | 'purple';
  trend?: { value: number; label: string };
}) => {
  const colors: Record<string, string> = {
    brand:   'bg-brand-500/10 text-brand-400',
    red:     'bg-red-500/10 text-red-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    amber:   'bg-amber-500/10 text-amber-400',
    gold:     'bg-gold-500/10 text-yellow-400',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="card p-5 hover:border-surface-700 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-surface-400 text-sm font-medium mb-1">{label}</p>
          <p className="text-3xl font-display font-bold text-white">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trend.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend.value >= 0 ? '+' : ''}{trend.value} {trend.label}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};

// ── LoadingSkeleton ───────────────────────────────────────────
export const LoadingSkeleton = ({ rows = 3, height = 'h-16' }: { rows?: number; height?: string }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className={`skeleton ${height} rounded-xl`} />
    ))}
  </div>
);

export const CardSkeleton = () => (
  <div className="card p-5 space-y-3">
    <div className="skeleton h-5 w-1/3 rounded-lg" />
    <div className="skeleton h-4 w-full rounded-lg" />
    <div className="skeleton h-4 w-2/3 rounded-lg" />
  </div>
);

// ── EmptyState ────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description, action }: {
  icon: React.ElementType; title: string; description: string;
  action?: { label: string; onClick: () => void };
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="p-5 bg-surface-800 rounded-2xl mb-4">
      <Icon className="w-10 h-10 text-surface-500" />
    </div>
    <h3 className="font-display font-bold text-white text-lg mb-2">{title}</h3>
    <p className="text-surface-400 text-sm max-w-sm">{description}</p>
    {action && (
      <button onClick={action.onClick} className="btn-primary mt-5">{action.label}</button>
    )}
  </div>
);

// ── PageHeader ────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, children }: {
  title: string; subtitle?: string; children?: React.ReactNode;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
    <div>
      <span className="gold-rule mb-2 block" />
      <h1 className="section-title">{title}</h1>
      {subtitle && <p className="section-subtitle mt-0.5">{subtitle}</p>}
    </div>
    {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
  </div>
);

// ── Alert ─────────────────────────────────────────────────────
export const Alert = ({ type, message, onClose }: {
  type: 'info' | 'success' | 'warning' | 'error'; message: string; onClose?: () => void;
}) => {
  const cfg = {
    info:    { bg: 'bg-blue-500/10 border-blue-500/20',    text: 'text-blue-400',    icon: Info },
    success: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle },
    warning: { bg: 'bg-amber-500/10 border-amber-500/20',  text: 'text-amber-400',   icon: AlertTriangle },
    error:   { bg: 'bg-red-500/10 border-red-500/20',      text: 'text-red-400',     icon: AlertTriangle },
  }[type];
  const Icon = cfg.icon;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${cfg.bg} ${cfg.text}`}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <p className="text-sm flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="hover:opacity-70 shrink-0"><X className="w-4 h-4" /></button>
      )}
    </div>
  );
};

// ── Table ─────────────────────────────────────────────────────
export const Table = ({ headers, children, empty }: {
  headers: string[]; children: React.ReactNode; empty?: boolean;
}) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-surface-800">
          {headers.map((h) => (
            <th key={h} className="text-left px-4 py-3 text-surface-400 font-medium text-xs uppercase tracking-wider">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-surface-800/50">{children}</tbody>
    </table>
  </div>
);

export const Tr = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
  <tr
    onClick={onClick}
    className={`transition-colors ${onClick ? 'cursor-pointer hover:bg-surface-800/30' : ''}`}>
    {children}
  </tr>
);

export const Td = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <td className={`px-4 py-3.5 ${className}`}>{children}</td>
);

// ── Modal ─────────────────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children }: {
  isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) => (
  <AnimatePresenceWrapper show={isOpen}>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative card w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-surface-800">
          <h3 className="font-display font-bold text-white text-lg">{title}</h3>
          <button onClick={onClose} className="p-1.5 text-surface-400 hover:text-white rounded-lg hover:bg-surface-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  </AnimatePresenceWrapper>
);

const AnimatePresenceWrapper = ({ show, children }: { show: boolean; children: React.ReactNode }) => {
  const { AnimatePresence } = require('framer-motion');
  return <AnimatePresence>{show && children}</AnimatePresence>;
};

// ── Pagination ────────────────────────────────────────────────
export const Pagination = ({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) => {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button disabled={page === 1} onClick={() => onPage(page - 1)} className="btn-secondary text-sm py-2 px-3 disabled:opacity-40">Prev</button>
      {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map((p) => (
        <button key={p} onClick={() => onPage(p)}
          className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${p === page ? 'bg-brand-600 text-white' : 'text-surface-400 hover:text-white hover:bg-surface-800'}`}>
          {p}
        </button>
      ))}
      <button disabled={page === pages} onClick={() => onPage(page + 1)} className="btn-secondary text-sm py-2 px-3 disabled:opacity-40">Next</button>
    </div>
  );
};
