import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Wrench, CheckCircle, Clock, AlertTriangle, ArrowRight, Edit3 } from 'lucide-react';
import api from '../../utils/api';
import { MaintenanceTask } from '../../types';
import {
  StatCard, PageHeader, LoadingSkeleton, EmptyState,
  TaskStatusBadge, PriorityBadge, ProgressBar, Modal
} from '../../components/common';
import { SeverityBadge } from '../../components/common';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function MaintenanceDashboard() {
  const qc = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState('');
  const [taskStatus, setTaskStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['maintenance-tasks'],
    queryFn: async () => {
      const { data } = await api.get('/maintenance?limit=20');
      return data.data as MaintenanceTask[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) => {
      await api.patch(`/maintenance/${id}`, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['maintenance-tasks'] });
      toast.success('Task updated');
      setSelectedTask(null);
    },
    onError: () => toast.error('Update failed'),
  });

  const openUpdate = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setProgress(task.progress_percent);
    setNotes(task.notes || '');
    setTaskStatus(task.status);
  };

  const tasks = data || [];
  const activeTasks = tasks.filter((t) => t.status === 'in_progress');
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="space-y-6 animate-in">
      <PageHeader title="Maintenance Dashboard" subtitle="Track and update your repair assignments." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tasks"   value={tasks.length}           icon={Wrench}       color="brand" />
        <StatCard label="In Progress"   value={activeTasks.length}     icon={Clock}        color="amber" />
        <StatCard label="Pending"       value={pendingTasks.length}    icon={AlertTriangle} color="red" />
        <StatCard label="Completed"     value={completedTasks.length}  icon={CheckCircle}  color="emerald" />
      </div>

      {/* Active Tasks */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-surface-800">
          <div>
            <h3 className="font-display font-bold text-white">Active Assignments</h3>
            <p className="text-surface-400 text-xs mt-0.5">{activeTasks.length} tasks in progress</p>
          </div>
        </div>
        {isLoading ? (
          <div className="p-5"><LoadingSkeleton rows={4} height="h-20" /></div>
        ) : !activeTasks.length ? (
          <EmptyState icon={Wrench} title="No active tasks" description="All caught up!" />
        ) : (
          <div className="divide-y divide-surface-800/50">
            {activeTasks.map((task) => (
              <div key={task.id} className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-medium text-white">{task.report_title}</p>
                    <p className="text-surface-500 text-xs font-mono">{task.report_number}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <PriorityBadge priority={task.priority} />
                    {task.severity && <SeverityBadge severity={task.severity} />}
                    <button onClick={() => openUpdate(task)}
                      className="p-1.5 hover:bg-surface-700 rounded-lg transition-colors text-surface-400 hover:text-white">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs mb-3">
                  <div>
                    <span className="text-surface-500">Team</span>
                    <p className="text-white mt-0.5">{task.assigned_team || '—'}</p>
                  </div>
                  <div>
                    <span className="text-surface-500">Region</span>
                    <p className="text-white mt-0.5">{task.region_name || '—'}</p>
                  </div>
                  <div>
                    <span className="text-surface-500">Est. Completion</span>
                    <p className="text-white mt-0.5">{task.estimated_completion ? formatDate(task.estimated_completion) : '—'}</p>
                  </div>
                </div>

                <ProgressBar value={task.progress_percent} size="md" />

                {task.notes && (
                  <p className="text-surface-400 text-xs mt-2 italic">{task.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div className="card">
          <div className="p-5 border-b border-surface-800">
            <h3 className="font-display font-bold text-white">Pending Tasks</h3>
          </div>
          <div className="divide-y divide-surface-800/50">
            {pendingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-white text-sm">{task.report_title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <TaskStatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                    <span className="text-surface-500 text-xs">{task.region_name}</span>
                  </div>
                </div>
                <button onClick={() => openUpdate(task)}
                  className="btn-secondary text-xs py-2">
                  Update
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Update Task Modal */}
      <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} title="Update Task Progress">
        {selectedTask && (
          <div className="space-y-4">
            <div className="bg-surface-800/50 rounded-xl p-3 text-sm">
              <p className="font-medium text-white">{selectedTask.report_title}</p>
              <p className="text-surface-400 text-xs">{selectedTask.assigned_team}</p>
            </div>

            <div>
              <label className="label">Status</label>
              <select value={taskStatus} onChange={(e) => setTaskStatus(e.target.value)} className="select-field">
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="label">Progress: {progress}%</label>
              <input type="range" min="0" max="100" step="5" value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full accent-brand-500" />
              <ProgressBar value={progress} showLabel={false} />
            </div>

            <div>
              <label className="label">Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                rows={3} className="input-field resize-none" placeholder="Add progress notes…" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSelectedTask(null)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={() => updateMutation.mutate({
                  id: selectedTask.id,
                  payload: { progress_percent: progress, status: taskStatus, notes }
                })}
                disabled={updateMutation.isPending}
                className="btn-primary flex-1">
                {updateMutation.isPending ? 'Saving…' : 'Save Update'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
