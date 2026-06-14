import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ClipboardCheck, AlertTriangle, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import api from '../../utils/api';
import { Report } from '../../types';
import { StatCard, PageHeader, LoadingSkeleton, StatusBadge, SeverityBadge } from '../../components/common';
import { timeAgo, issueTypeConfig } from '../../utils/helpers';

export default function InspectorDashboard() {
  const { data: pendingReports, isLoading } = useQuery({
    queryKey: ['inspector-pending'],
    queryFn: async () => {
      const { data } = await api.get('/reports?status=reported&limit=8');
      return data.data as Report[];
    },
  });

  const { data: reviewReports } = useQuery({
    queryKey: ['inspector-review'],
    queryFn: async () => {
      const { data } = await api.get('/reports?status=under_review&limit=8');
      return data.data as Report[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['analytics-status'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/by-status');
      return data.data as { status: string; count: number }[];
    },
  });

  const getCount = (s: string) => stats?.find((x) => x.status === s)?.count || 0;

  return (
    <div className="space-y-6 animate-in">
      <PageHeader title="Inspector Dashboard" subtitle="Verify and assess road condition reports.">
        <Link to="/dashboard/admin/reports" className="btn-primary">View All Reports</Link>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="New Reports"  value={getCount('reported')}     icon={ClipboardCheck} color="brand" />
        <StatCard label="Under Review" value={getCount('under_review')} icon={Clock}          color="amber" />
        <StatCard label="Verified"     value={getCount('verified')}     icon={CheckCircle}    color="emerald" />
        <StatCard label="Critical"     value={getCount('critical') || (pendingReports?.filter(r => r.severity === 'critical').length || 0)} icon={AlertTriangle} color="red" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* New reports needing inspection */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-surface-800">
            <div>
              <h3 className="font-display font-bold text-white">Awaiting Inspection</h3>
              <p className="text-surface-400 text-xs mt-0.5">New reports to review</p>
            </div>
            <span className="bg-red-500/10 text-red-400 text-xs px-2.5 py-1 rounded-full border border-red-500/20 font-medium">
              {pendingReports?.length || 0} pending
            </span>
          </div>
          <div className="divide-y divide-surface-800/50">
            {isLoading ? (
              <div className="p-4"><LoadingSkeleton rows={4} /></div>
            ) : (pendingReports || []).map((r) => (
              <Link key={r.id} to={`/dashboard/reports/${r.id}`}
                className="flex items-start gap-3 p-4 hover:bg-surface-800/20 transition-colors group">
                <span className="text-lg">{issueTypeConfig[r.issue_type]?.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-brand-300">{r.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <SeverityBadge severity={r.severity} />
                    <span className="text-surface-500 text-xs">{r.region_name}</span>
                    <span className="text-surface-500 text-xs">· {timeAgo(r.created_at)}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-surface-600 group-hover:text-brand-400 shrink-0" />
              </Link>
            ))}
            {!isLoading && !pendingReports?.length && (
              <div className="p-6 text-center text-surface-400 text-sm">No new reports to inspect</div>
            )}
          </div>
        </div>

        {/* Under review */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-surface-800">
            <div>
              <h3 className="font-display font-bold text-white">Under Review</h3>
              <p className="text-surface-400 text-xs mt-0.5">In your inspection queue</p>
            </div>
            <span className="bg-amber-500/10 text-amber-400 text-xs px-2.5 py-1 rounded-full border border-amber-500/20 font-medium">
              {reviewReports?.length || 0} active
            </span>
          </div>
          <div className="divide-y divide-surface-800/50">
            {(reviewReports || []).map((r) => (
              <Link key={r.id} to={`/dashboard/reports/${r.id}`}
                className="flex items-start gap-3 p-4 hover:bg-surface-800/20 transition-colors group">
                <span className="text-lg">{issueTypeConfig[r.issue_type]?.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-brand-300">{r.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <SeverityBadge severity={r.severity} />
                    <span className="text-surface-500 text-xs">{r.region_name}</span>
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </Link>
            ))}
            {!reviewReports?.length && (
              <div className="p-6 text-center text-surface-400 text-sm">No reports under review</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
