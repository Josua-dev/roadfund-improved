import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Calendar, User, Paperclip,
  CheckCircle, Clock, AlertTriangle, Edit3, Download
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Report, ReportStatus } from '../types';
import {
  StatusBadge, SeverityBadge, ProgressBar, PageHeader,
  LoadingSkeleton, Alert
} from '../components/common';
import { formatDateTime, timeAgo, issueTypeConfig, statusConfig } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useState } from 'react';

const STATUS_FLOW: ReportStatus[] = [
  'reported', 'under_review', 'verified', 'assigned', 'in_progress', 'completed'
];

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isStaff, isAdmin, isInspector } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['report', id],
    queryFn: async () => {
      const { data } = await api.get(`/reports/${id}`);
      return data.data as Report & {
        attachments: any[]; history: any[]; maintenance_task: any;
      };
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ status, notes }: { status: string; notes: string }) => {
      await api.patch(`/reports/${id}/status`, { status, notes });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['report', id] });
      toast.success('Status updated');
      setUpdatingStatus('');
    },
    onError: () => toast.error('Update failed'),
  });

  if (isLoading) return <div className="p-5"><LoadingSkeleton rows={6} height="h-20" /></div>;
  if (error || !data) return <Alert type="error" message="Report not found or access denied." />;

  const currentStatusIdx = STATUS_FLOW.indexOf(data.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-surface-800 text-surface-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-display font-bold text-white text-xl">{data.title}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-surface-400 text-sm">{data.report_number}</span>
            <span className="text-surface-700">·</span>
            <span className="text-surface-400 text-sm">{timeAgo(data.created_at)}</span>
          </div>
        </div>
        <StatusBadge status={data.status} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">

          {/* Details card */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{issueTypeConfig[data.issue_type]?.icon}</span>
              <div>
                <h2 className="font-display font-bold text-white">{issueTypeConfig[data.issue_type]?.label}</h2>
                <SeverityBadge severity={data.severity} />
              </div>
            </div>
            <p className="text-surface-300 text-sm leading-relaxed">{data.description}</p>

            {data.progress_percent > 0 && (
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-surface-400 text-sm">Repair Progress</span>
                  <span className="text-white font-bold text-sm">{data.progress_percent}%</span>
                </div>
                <ProgressBar value={data.progress_percent} size="lg" showLabel={false} />
              </div>
            )}
          </div>

          {/* Status Timeline */}
          <div className="card p-6">
            <h3 className="font-display font-bold text-white mb-5">Status Timeline</h3>

            {/* Progress steps */}
            <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
              {STATUS_FLOW.map((s, i) => {
                const past = i <= currentStatusIdx;
                const current = i === currentStatusIdx;
                const cfg = statusConfig[s];
                return (
                  <div key={s} className="flex items-center gap-1 shrink-0">
                    <div className={`flex flex-col items-center gap-1.5 min-w-[60px]`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border-2 transition-all ${
                        current ? 'border-brand-500 bg-brand-500/20 text-brand-400' :
                        past    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' :
                                  'border-surface-700 bg-surface-800 text-surface-600'
                      }`}>
                        {past && !current ? '✓' : cfg.icon}
                      </div>
                      <span className={`text-xs text-center leading-tight ${
                        current ? 'text-brand-400 font-medium' : past ? 'text-emerald-400' : 'text-surface-600'
                      }`}>{cfg.label}</span>
                    </div>
                    {i < STATUS_FLOW.length - 1 && (
                      <div className={`h-0.5 w-6 mb-4 ${i < currentStatusIdx ? 'bg-emerald-500' : 'bg-surface-700'}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* History log */}
            <div className="space-y-3">
              {data.history?.map((h: any, i: number) => (
                <motion.div key={h.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3 text-sm">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                    {i < data.history.length - 1 && <div className="w-px flex-1 bg-surface-800 my-1" />}
                  </div>
                  <div className="pb-3">
                    <span className="text-white font-medium capitalize">{h.new_status?.replace(/_/g, ' ')}</span>
                    {h.notes && <span className="text-surface-400"> — {h.notes}</span>}
                    <div className="text-surface-500 text-xs mt-0.5">
                      by {h.changed_by_name} · {formatDateTime(h.created_at)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Attachments */}
          {data.attachments?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <Paperclip className="w-4 h-4" /> Attachments ({data.attachments.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {data.attachments.map((att: any) => (
                  <a key={att.id} href={att.file_path} target="_blank" rel="noreferrer"
                    className="group relative block rounded-xl overflow-hidden border border-surface-700 hover:border-brand-500 transition-all">
                    {att.mime_type?.startsWith('image/') ? (
                      <>
                        <img src={att.file_path} alt={att.file_name}
                          className="w-full aspect-video object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Download className="w-5 h-5 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="p-4 bg-surface-800 flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-surface-400" />
                        <span className="text-sm text-surface-300 truncate">{att.file_name}</span>
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Maintenance Task */}
          {data.maintenance_task && (
            <div className="card p-6">
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                🔧 Maintenance Task
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {[
                  { label: 'Assigned Team',    value: data.maintenance_task.assigned_team },
                  { label: 'Officer',          value: data.maintenance_task.officer_name },
                  { label: 'Inspector',        value: data.maintenance_task.inspector_name },
                  { label: 'Priority',         value: data.maintenance_task.priority },
                  { label: 'Start Date',       value: data.maintenance_task.start_date },
                  { label: 'Est. Completion',  value: data.maintenance_task.estimated_completion },
                  { label: 'Cost Estimate',    value: data.maintenance_task.cost_estimate ? `N$ ${Number(data.maintenance_task.cost_estimate).toLocaleString()}` : null },
                ].filter((r) => r.value).map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-2 py-2 border-b border-surface-800 last:border-0">
                    <span className="text-surface-400">{label}</span>
                    <span className="text-white text-right capitalize">{String(value)}</span>
                  </div>
                ))}
              </div>
              {data.maintenance_task.notes && (
                <div className="mt-3 p-3 bg-surface-800 rounded-xl text-sm text-surface-300">
                  {data.maintenance_task.notes}
                </div>
              )}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-surface-400">Progress</span>
                  <span className="text-white font-bold">{data.maintenance_task.progress_percent}%</span>
                </div>
                <ProgressBar value={data.maintenance_task.progress_percent} size="md" showLabel={false} />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Reporter info */}
          <div className="card p-5">
            <h3 className="font-medium text-white text-sm mb-4">Report Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-surface-500 mt-0.5 shrink-0" />
                <div>
                  <div className="text-surface-400 text-xs">Reported by</div>
                  <div className="text-white">{data.reporter_name}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-surface-500 mt-0.5 shrink-0" />
                <div>
                  <div className="text-surface-400 text-xs">Location</div>
                  <div className="text-white">{data.region_name}</div>
                  {data.address && <div className="text-surface-400 text-xs mt-0.5">{data.address}</div>}
                  {data.latitude && data.longitude && (
                    <a href={`https://maps.google.com/?q=${data.latitude},${data.longitude}`}
                      target="_blank" rel="noreferrer"
                      className="text-brand-400 text-xs hover:underline">
                      View on Google Maps ↗
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-surface-500 mt-0.5 shrink-0" />
                <div>
                  <div className="text-surface-400 text-xs">Submitted</div>
                  <div className="text-white">{formatDateTime(data.created_at)}</div>
                </div>
              </div>
              {data.resolved_at && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-surface-400 text-xs">Resolved</div>
                    <div className="text-white">{formatDateTime(data.resolved_at)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Staff: update status */}
          {isStaff && data.status !== 'completed' && data.status !== 'rejected' && (
            <div className="card p-5">
              <h3 className="font-medium text-white text-sm mb-4 flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> Update Status
              </h3>
              <div className="space-y-3">
                <textarea value={statusNote} onChange={(e) => setStatusNote(e.target.value)}
                  rows={2} className="input-field text-sm resize-none"
                  placeholder="Add a note (optional)…" />
                <div className="grid grid-cols-1 gap-2">
                  {STATUS_FLOW.filter((_, i) => i > currentStatusIdx).map((s) => (
                    <button key={s} onClick={() => statusMutation.mutate({ status: s, notes: statusNote })}
                      disabled={statusMutation.isPending}
                      className="btn-secondary text-xs py-2 justify-between">
                      <span>→ {statusConfig[s].label}</span>
                      <span>{statusConfig[s].icon}</span>
                    </button>
                  ))}
                  {isAdmin && data.status !== 'rejected' && (
                    <button onClick={() => statusMutation.mutate({ status: 'rejected', notes: statusNote })}
                      className="btn-danger text-xs py-2">
                      Reject Report
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
