import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, Filter, ExternalLink, ChevronDown } from 'lucide-react';
import api from '../../utils/api';
import { Report } from '../../types';
import {
  StatusBadge, SeverityBadge, PageHeader, LoadingSkeleton,
  EmptyState, Pagination, Table, Tr, Td
} from '../../components/common';
import { timeAgo, issueTypeConfig, statusConfig } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { FileText } from 'lucide-react';

export default function AdminReports() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [severity, setSeverity] = useState('');
  const [region, setRegion] = useState('');
  const [changingStatus, setChangingStatus] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports', page, search, status, severity, region],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page), limit: '15',
        ...(search && { search }),
        ...(status && { status }),
        ...(severity && { severity }),
        ...(region && { region_id: region }),
      });
      const { data } = await api.get(`/reports?${params}`);
      return data;
    },
  });

  const { data: regions } = useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      const { data } = await api.get('/regions');
      return data.data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await api.patch(`/reports/${id}/status`, { status });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
      toast.success('Status updated');
      setChangingStatus(null);
    },
    onError: () => toast.error('Update failed'),
  });

  const reports: Report[] = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-5 animate-in">
      <PageHeader title="All Reports" subtitle={`${pagination?.total || 0} total reports in system`} />

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-9 py-2 text-sm" placeholder="Search reports…" />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="select-field w-auto py-2 text-sm">
          <option value="">All Statuses</option>
          {Object.entries(statusConfig).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select value={severity} onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
          className="select-field w-auto py-2 text-sm">
          <option value="">All Severities</option>
          {['low','medium','high','critical'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={region} onChange={(e) => { setRegion(e.target.value); setPage(1); }}
          className="select-field w-auto py-2 text-sm">
          <option value="">All Regions</option>
          {(regions || []).map((r: any) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-5"><LoadingSkeleton rows={8} /></div>
        ) : !reports.length ? (
          <EmptyState icon={FileText} title="No reports found" description="Try adjusting filters" />
        ) : (
          <Table headers={['Report', 'Type', 'Severity', 'Region', 'Reporter', 'Date', 'Status', 'Actions']}>
            {reports.map((r) => (
              <Tr key={r.id}>
                <Td>
                  <div>
                    <p className="font-medium text-white text-sm">{r.title.length > 30 ? r.title.slice(0, 30) + '…' : r.title}</p>
                    <p className="text-surface-500 text-xs font-mono">{r.report_number}</p>
                  </div>
                </Td>
                <Td>
                  <span className="text-lg">{issueTypeConfig[r.issue_type]?.icon}</span>
                </Td>
                <Td><SeverityBadge severity={r.severity} /></Td>
                <Td><span className="text-surface-300 text-sm">{r.region_name}</span></Td>
                <Td><span className="text-surface-300 text-sm">{r.reporter_name}</span></Td>
                <Td><span className="text-surface-500 text-xs">{timeAgo(r.created_at)}</span></Td>
                <Td>
                  {changingStatus === r.id ? (
                    <select
                      defaultValue={r.status}
                      onChange={(e) => statusMutation.mutate({ id: r.id, status: e.target.value })}
                      onBlur={() => setChangingStatus(null)}
                      autoFocus
                      className="select-field py-1 text-xs w-36">
                      {Object.entries(statusConfig).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  ) : (
                    <button onClick={() => setChangingStatus(r.id)}
                      className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                      <StatusBadge status={r.status} />
                      <ChevronDown className="w-3 h-3 text-surface-500" />
                    </button>
                  )}
                </Td>
                <Td>
                  <Link to={`/dashboard/reports/${r.id}`}
                    className="p-1.5 hover:bg-surface-700 rounded-lg transition-colors inline-flex text-surface-400 hover:text-white">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </div>

      <Pagination page={page} pages={pagination?.pages || 1} onPage={setPage} />
    </div>
  );
}
