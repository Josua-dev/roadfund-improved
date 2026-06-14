import { Severity, ReportStatus, IssueType, TaskStatus, TaskPriority } from '../types';

// ── Date Formatting ───────────────────────────────────────────
export const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-NA', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

export const formatDateTime = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString('en-NA', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const timeAgo = (dateStr: string) => {
  const now  = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return formatDate(dateStr);
};

// ── Currency (Namibian Dollar) ────────────────────────────────
export const formatCurrency = (amount: number | null | undefined) => {
  if (amount == null) return 'N/A';
  return `N$ ${Number(amount).toLocaleString('en-NA', { minimumFractionDigits: 2 })}`;
};

// ── File size ─────────────────────────────────────────────────
export const formatFileSize = (bytes: number) => {
  if (bytes < 1024)    return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

// ── Severity  (RFA green palette + gold for medium) ──────────
export const severityConfig: Record<Severity, { label: string; color: string; dot: string }> = {
  low:      { label: 'Low',      color: 'bg-brand-500/10 text-brand-400 border border-brand-500/25',        dot: 'bg-brand-400' },
  medium:   { label: 'Medium',   color: 'bg-gold-500/10 text-yellow-400 border border-yellow-500/25',        dot: 'bg-yellow-400' },
  high:     { label: 'High',     color: 'bg-orange-500/10 text-orange-400 border border-orange-500/25',     dot: 'bg-orange-400' },
  critical: { label: 'Critical', color: 'bg-red-500/10 text-red-400 border border-red-500/25',              dot: 'bg-red-400' },
};

// ── Report Status ─────────────────────────────────────────────
export const statusConfig: Record<ReportStatus, { label: string; color: string; icon: string }> = {
  reported:     { label: 'Reported',     color: 'bg-surface-700 text-surface-300 border border-surface-600',          icon: '📋' },
  under_review: { label: 'Under Review', color: 'bg-brand-500/10 text-brand-400 border border-brand-500/20',          icon: '🔍' },
  verified:     { label: 'Verified',     color: 'bg-gold-500/10 text-yellow-400 border border-yellow-500/20',         icon: '✅' },
  assigned:     { label: 'Assigned',     color: 'bg-brand-700/20 text-brand-300 border border-brand-700/30',          icon: '👷' },
  in_progress:  { label: 'In Progress',  color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',          icon: '🔧' },
  completed:    { label: 'Completed',    color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',    icon: '🎉' },
  rejected:     { label: 'Rejected',     color: 'bg-red-500/10 text-red-400 border border-red-500/20',               icon: '❌' },
};

// ── Issue Type ────────────────────────────────────────────────
export const issueTypeConfig: Record<IssueType, { label: string; icon: string; mapColor: string }> = {
  pothole:              { label: 'Pothole',       icon: '🕳️', mapColor: '#ef4444' },
  damaged_sign:         { label: 'Damaged Sign',  icon: '⚠️', mapColor: '#f97316' },
  broken_traffic_light: { label: 'Traffic Light', icon: '🚦', mapColor: '#eab308' },
  flooded_road:         { label: 'Flooded Road',  icon: '🌊', mapColor: '#3b82f6' },
  cracked_road:         { label: 'Cracked Road',  icon: '⚡', mapColor: '#8b5cf6' },
  road_blockage:        { label: 'Road Blockage', icon: '🚧', mapColor: '#10b981' },
  other:                { label: 'Other',         icon: '📌', mapColor: '#6b7280' },
};

// ── Task Status ───────────────────────────────────────────────
export const taskStatusConfig: Record<TaskStatus, { label: string; color: string }> = {
  pending:     { label: 'Pending',     color: 'bg-surface-700 text-surface-300 border border-surface-600' },
  in_progress: { label: 'In Progress', color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
  completed:   { label: 'Completed',   color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
  paused:      { label: 'Paused',      color: 'bg-brand-500/10 text-brand-400 border border-brand-500/20' },
};

// ── Task Priority ─────────────────────────────────────────────
export const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  low:    { label: 'Low',    color: 'bg-surface-700 text-surface-300' },
  normal: { label: 'Normal', color: 'bg-brand-500/10 text-brand-400' },
  high:   { label: 'High',   color: 'bg-orange-500/10 text-orange-400' },
  urgent: { label: 'Urgent', color: 'bg-red-500/10 text-red-400' },
};

// ── Role ──────────────────────────────────────────────────────
export const roleConfig = {
  citizen:             { label: 'Citizen',             color: 'bg-brand-500/10 text-brand-400' },
  inspector:           { label: 'Inspector',           color: 'bg-gold-500/10 text-yellow-400' },
  maintenance_officer: { label: 'Maintenance Officer', color: 'bg-brand-700/20 text-brand-300' },
  admin:               { label: 'Administrator',       color: 'bg-gold-600/10 text-yellow-300' },
};

// ── Progress colour ───────────────────────────────────────────
export const progressColor = (pct: number) => {
  if (pct === 100) return 'bg-emerald-500';
  if (pct >= 60)   return 'bg-brand-500';
  if (pct >= 30)   return 'bg-amber-500';
  return 'bg-red-500';
};

// ── Truncate ──────────────────────────────────────────────────
export const truncate = (str: string, n: number) =>
  str.length > n ? str.slice(0, n) + '…' : str;
