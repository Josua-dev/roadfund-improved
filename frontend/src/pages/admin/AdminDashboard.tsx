import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, Users, Wrench, CheckCircle, AlertTriangle,
  TrendingUp, Clock, BarChart3, ArrowRight, Activity
} from 'lucide-react';
import api from '../../utils/api';
import { StatCard, LoadingSkeleton, ProgressBar, PageHeader } from '../../components/common';
import { StatusBadge, SeverityBadge } from '../../components/common';
import { formatDate, timeAgo, issueTypeConfig } from '../../utils/helpers';
import { OverviewStats, Report } from '../../types';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, PieChart, Pie, Cell, CartesianGrid
} from 'recharts';

const COLORS = ['#2f65fc', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const darkTooltipStyle = {
  contentStyle: { background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f8fafc' },
  labelStyle: { color: '#94a3b8' },
};

export default function AdminDashboard() {
  const { data: overview, isLoading: statsLoading } = useQuery<OverviewStats>({
    queryKey: ['admin-overview'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/overview');
      return data.data;
    },
  });

  const { data: monthlyData } = useQuery({
    queryKey: ['monthly-trend'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/monthly-trend');
      return data.data;
    },
  });

  const { data: regionData } = useQuery({
    queryKey: ['by-region'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/by-region');
      return data.data;
    },
  });

  const { data: severityData } = useQuery({
    queryKey: ['by-severity'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/by-severity');
      return data.data;
    },
  });

  const { data: recentReports } = useQuery({
    queryKey: ['recent-reports-admin'],
    queryFn: async () => {
      const { data } = await api.get('/reports?limit=6&sort_by=created_at&sort_dir=DESC');
      return data.data as Report[];
    },
  });

  if (statsLoading) return <div className="space-y-4"><LoadingSkeleton rows={4} height="h-24" /></div>;

  const r = overview?.reports;
  const u = overview?.users;
  const t = overview?.tasks;

  return (
    <div className="space-y-6 animate-in">
      <PageHeader title="Admin Overview" subtitle="Road Fund Administration system at a glance.">
        <Link to="/dashboard/analytics" className="btn-secondary text-sm">
          Full Analytics <BarChart3 className="w-4 h-4" />
        </Link>
      </PageHeader>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Reports"    value={r?.total_reports  || 0}  icon={FileText}    color="brand"   trend={{ value: r?.this_week || 0, label: 'this week' }} />
        <StatCard label="Completed"        value={r?.completed      || 0}  icon={CheckCircle} color="emerald" />
        <StatCard label="Critical Issues"  value={r?.critical_count || 0}  icon={AlertTriangle} color="red"  />
        <StatCard label="Active Tasks"     value={t?.active_tasks   || 0}  icon={Wrench}      color="amber"   />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users"      value={u?.total_users || 0}  icon={Users}    color="purple" />
        <StatCard label="Citizens"         value={u?.citizens    || 0}  icon={Users}    color="brand" />
        <StatCard label="Completion Rate"  value={`${overview?.completion_rate || 0}%`} icon={TrendingUp} color="emerald" />
        <StatCard label="In Progress"      value={r?.in_progress || 0} icon={Clock}    color="amber" />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Monthly trend chart */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-bold text-white">Monthly Reports</h3>
              <p className="text-surface-400 text-xs">Last 12 months</p>
            </div>
            <Activity className="w-5 h-5 text-surface-500" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData || []} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip {...darkTooltipStyle} />
              <Bar dataKey="reported"  name="Reported"  fill="#2f65fc" radius={[4,4,0,0]} />
              <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Severity pie */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-bold text-white">By Severity</h3>
              <p className="text-surface-400 text-xs">Distribution</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={severityData || []} dataKey="count" nameKey="severity" cx="50%" cy="50%" innerRadius={55} outerRadius={85}>
                {(severityData || []).map((_: any, i: number) => (
                  <Cell key={i} fill={['#3b82f6','#eab308','#f97316','#ef4444'][i % 4]} />
                ))}
              </Pie>
              <Tooltip {...darkTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {(severityData || []).map((s: any, i: number) => (
              <div key={s.severity} className="flex items-center gap-1.5 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ background: ['#3b82f6','#eab308','#f97316','#ef4444'][i % 4] }} />
                <span className="text-surface-400 capitalize">{s.severity}</span>
                <span className="text-white font-medium">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Region overview */}
      {regionData && regionData.length > 0 && (
        <div className="card p-5">
          <h3 className="font-display font-bold text-white mb-5">Reports by Region</h3>
          <div className="space-y-3">
            {regionData.slice(0, 6).map((r: any) => (
              <div key={r.region} className="flex items-center gap-4">
                <span className="text-sm text-surface-300 w-32 truncate">{r.region}</span>
                <div className="flex-1">
                  <ProgressBar
                    value={regionData[0].total ? Math.round((r.total / regionData[0].total) * 100) : 0}
                    showLabel={false} size="sm" />
                </div>
                <span className="text-white font-bold text-sm w-10 text-right">{r.total}</span>
                <span className="text-emerald-400 text-xs w-14 text-right">{r.completed} done</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent reports */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-surface-800">
          <h3 className="font-display font-bold text-white">Recent Reports</h3>
          <Link to="/dashboard/admin/reports" className="text-brand-400 text-sm hover:text-brand-300 flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-surface-800/50">
          {(recentReports || []).map((report) => (
            <Link key={report.id} to={`/dashboard/reports/${report.id}`}
              className="flex items-start gap-4 p-4 hover:bg-surface-800/20 transition-colors group">
              <span className="text-xl pt-0.5">{issueTypeConfig[report.issue_type]?.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-white truncate group-hover:text-brand-300">{report.title}</p>
                  <StatusBadge status={report.status} />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-surface-500">{report.reporter_name}</span>
                  <span className="text-surface-700">·</span>
                  <SeverityBadge severity={report.severity} />
                  <span className="text-surface-700">·</span>
                  <span className="text-xs text-surface-500">{report.region_name}</span>
                  <span className="text-surface-700">·</span>
                  <span className="text-xs text-surface-500">{timeAgo(report.created_at)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
