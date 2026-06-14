import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FileText, Search, Filter } from 'lucide-react';
import api from '../../utils/api';
import { Report } from '../../types';
import {
  StatusBadge, SeverityBadge, PageHeader, EmptyState,
  LoadingSkeleton, Pagination, ProgressBar
} from '../../components/common';
import { timeAgo, issueTypeConfig } from '../../utils/helpers';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MyReports() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [severity, setSeverity] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['my-reports', page, search, status, severity],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page), limit: '10',
        ...(search && { search }),
        ...(status && { status }),
        ...(severity && { severity }),
      });
      const { data } = await api.get(`/reports?${params}`);
      return data;
    },
  });

  const reports: Report[] = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-5 animate-in">
      <PageHeader title="My Reports" subtitle={`${pagination?.total || 0} total submissions`}>
        <Link to="/dashboard/submit-report" className="btn-primary">
          <Plus className="w-4 h-4" /> New Report
        </Link>
      </PageHeader>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 py-2 text-sm" placeholder="Search by title or number…" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="select-field w-auto py-2 text-sm">
          <option value="">All Statuses</option>
          {['reported','under_review','verified','assigned','in_progress','completed','rejected'].map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
        <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="select-field w-auto py-2 text-sm">
          <option value="">All Severities</option>
          {['low','medium','high','critical'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Report list */}
      <div className="card">
        {isLoading ? (
          <div className="p-5"><LoadingSkeleton rows={5} /></div>
        ) : !reports.length ? (
          <EmptyState icon={FileText} title="No reports found" description="Try adjusting your filters or submit a new report"
            action={{ label: 'Report Issue', onClick: () => navigate('/dashboard/submit-report') }} />
        ) : (
          <div className="divide-y divide-surface-800/50">
            {reports.map((report) => (
              <Link key={report.id} to={`/dashboard/reports/${report.id}`}
                className="flex items-start gap-4 p-5 hover:bg-surface-800/20 transition-colors group">
                <div className="text-2xl pt-0.5">{issueTypeConfig[report.issue_type]?.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-white text-sm group-hover:text-brand-300 transition-colors truncate">
                      {report.title}
                    </h3>
                    <StatusBadge status={report.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-surface-500">{report.report_number}</span>
                    <span className="text-surface-700">·</span>
                    <SeverityBadge severity={report.severity} />
                    <span className="text-surface-700">·</span>
                    <span className="text-surface-500 text-xs">{report.region_name}</span>
                    <span className="text-surface-700">·</span>
                    <span className="text-surface-500 text-xs">{timeAgo(report.created_at)}</span>
                  </div>
                  {report.progress_percent > 0 && (
                    <div className="max-w-xs">
                      <ProgressBar value={report.progress_percent} size="sm" />
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Pagination page={page} pages={pagination?.pages || 1} onPage={setPage} />
    </div>
  );
}
