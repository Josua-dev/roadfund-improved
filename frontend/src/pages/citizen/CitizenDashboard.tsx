import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, FileText, CheckCircle, Clock, AlertTriangle, ArrowRight, MapPin } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { Report } from '../../types';
import { StatusBadge, SeverityBadge, LoadingSkeleton, PageHeader, StatCard } from '../../components/common';
import { formatDate, timeAgo, issueTypeConfig } from '../../utils/helpers';

export default function CitizenDashboard() {
  const { user } = useAuth();

  const { data: statsData } = useQuery({
    queryKey: ['citizen-stats'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/citizen-stats');
      return data.data;
    },
  });

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['my-reports-recent'],
    queryFn: async () => {
      const { data } = await api.get('/reports?limit=5&sort_by=created_at&sort_dir=DESC');
      return data.data as Report[];
    },
  });

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title={`Welcome, ${user?.full_name?.split(' ')[0]} 👋`}
        subtitle="Track your road reports and help improve Namibia's roads.">
        <Link to="/dashboard/submit-report" className="btn-primary">
          <Plus className="w-4 h-4" /> Report New Issue
        </Link>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Reports"  value={statsData?.total || 0}     icon={FileText}      color="brand" />
        <StatCard label="Completed"      value={statsData?.completed || 0} icon={CheckCircle}   color="emerald" />
        <StatCard label="In Progress"    value={statsData?.in_progress || 0} icon={Clock}       color="amber" />
        <StatCard label="Critical"       value={statsData?.critical || 0}  icon={AlertTriangle} color="red" />
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { to: '/dashboard/submit-report', icon: Plus,     label: 'Report a Road Issue', desc: 'Pothole, sign, blockage…', color: 'from-brand-600 to-brand-800' },
          { to: '/dashboard/my-reports',    icon: FileText, label: 'View My Reports',     desc: 'Track your submissions', color: 'from-purple-600 to-purple-800' },
          { to: '/dashboard/map',           icon: MapPin,   label: 'Live Map',             desc: 'See all reports near you', color: 'from-emerald-600 to-emerald-800' },
        ].map(({ to, icon: Icon, label, desc, color }) => (
          <Link key={to} to={to}>
            <motion.div whileHover={{ y: -2 }}
              className="card-hover p-5 flex items-center gap-4 cursor-pointer">
              <div className={`w-11 h-11 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-medium text-white text-sm">{label}</div>
                <div className="text-surface-400 text-xs">{desc}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-surface-600 ml-auto" />
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Recent Reports */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-surface-800">
          <div>
            <h2 className="font-display font-bold text-white">Recent Reports</h2>
            <p className="text-surface-400 text-xs mt-0.5">Your last 5 submissions</p>
          </div>
          <Link to="/dashboard/my-reports" className="text-brand-400 text-sm hover:text-brand-300 flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-surface-800/50">
          {isLoading ? (
            <div className="p-5"><LoadingSkeleton rows={4} /></div>
          ) : !reportsData?.length ? (
            <div className="p-10 text-center text-surface-400">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium text-white mb-1">No reports yet</p>
              <p className="text-sm">Submit your first road issue report</p>
              <Link to="/dashboard/submit-report" className="btn-primary mt-4 inline-flex">
                <Plus className="w-4 h-4" /> Report Issue
              </Link>
            </div>
          ) : (
            reportsData.map((report) => (
              <Link key={report.id} to={`/dashboard/reports/${report.id}`}
                className="flex items-start gap-4 p-5 hover:bg-surface-800/30 transition-colors group">
                <div className="text-2xl">{issueTypeConfig[report.issue_type]?.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-white text-sm truncate group-hover:text-brand-300 transition-colors">
                      {report.title}
                    </p>
                    <StatusBadge status={report.status} />
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-surface-500 text-xs font-mono">{report.report_number}</span>
                    <span className="text-surface-700">·</span>
                    <SeverityBadge severity={report.severity} />
                    <span className="text-surface-700">·</span>
                    <span className="text-surface-500 text-xs">{timeAgo(report.created_at)}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
