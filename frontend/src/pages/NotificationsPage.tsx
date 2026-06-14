import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, Info, AlertTriangle, CheckCircle, UserPlus } from 'lucide-react';
import api from '../utils/api';
import { Notification } from '../types';
import { PageHeader, EmptyState, LoadingSkeleton } from '../components/common';
import { timeAgo } from '../utils/helpers';
import toast from 'react-hot-toast';

const notifIcon: Record<string, any> = {
  status_update: CheckCircle,
  assignment: UserPlus,
  alert: AlertTriangle,
  info: Info,
  success: CheckCircle,
};

const notifColors: Record<string, string> = {
  status_update: 'text-brand-400 bg-brand-500/10',
  assignment: 'text-purple-400 bg-purple-500/10',
  alert: 'text-red-400 bg-red-500/10',
  info: 'text-blue-400 bg-blue-500/10',
  success: 'text-emerald-400 bg-emerald-500/10',
};

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications');
      return { notifications: data.data as Notification[], unread: data.unread_count };
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (ids: number[] | 'all') => {
      await api.patch('/notifications/mark-read', { ids });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });

  const notifications = data?.notifications || [];
  const unread = data?.unread || 0;

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-in">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Notifications"
          subtitle={unread > 0 ? `${unread} unread` : 'All caught up!'} />
        {unread > 0 && (
          <button onClick={() => markReadMutation.mutate('all')}
            disabled={markReadMutation.isPending}
            className="btn-secondary text-sm flex items-center gap-2">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-5"><LoadingSkeleton rows={6} /></div>
        ) : !notifications.length ? (
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up! Notifications will appear here." />
        ) : (
          <div className="divide-y divide-surface-800/50">
            {notifications.map((n) => {
              const Icon = notifIcon[n.type] || Info;
              const colors = notifColors[n.type] || 'text-blue-400 bg-blue-500/10';

              return (
                <div key={n.id}
                  className={`flex gap-4 p-4 transition-colors ${!n.is_read ? 'bg-brand-500/5' : 'hover:bg-surface-800/20'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium ${!n.is_read ? 'text-white' : 'text-surface-300'}`}>
                        {n.title}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-surface-500 text-xs">{timeAgo(n.created_at)}</span>
                        {!n.is_read && (
                          <button onClick={() => markReadMutation.mutate([n.id])}
                            className="p-1 hover:bg-surface-700 rounded text-surface-500 hover:text-white"
                            title="Mark as read">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-surface-400 text-sm mt-0.5 leading-relaxed">{n.message}</p>
                    {n.report_id && n.report_number && (
                      <Link to={`/dashboard/reports/${n.report_id}`}
                        className="inline-flex items-center gap-1 text-brand-400 text-xs mt-1.5 hover:text-brand-300">
                        View report {n.report_number} →
                      </Link>
                    )}
                  </div>
                  {!n.is_read && (
                    <div className="w-2 h-2 rounded-full bg-brand-500 mt-2 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
