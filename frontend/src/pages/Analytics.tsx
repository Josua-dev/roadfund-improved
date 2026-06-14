import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, MapPin, Activity } from 'lucide-react';
import api from '../utils/api';
import { PageHeader, LoadingSkeleton } from '../components/common';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, Legend, RadialBarChart, RadialBar
} from 'recharts';

const darkTooltip = {
  contentStyle: { background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f8fafc', fontSize: '13px' },
  labelStyle: { color: '#94a3b8' },
};

const ISSUE_LABELS: Record<string, string> = {
  pothole: 'Pothole', damaged_sign: 'Damaged Sign',
  broken_traffic_light: 'Traffic Light', flooded_road: 'Flooded Road',
  cracked_road: 'Cracked Road', road_blockage: 'Blockage', other: 'Other',
};

export default function Analytics() {
  const { data: monthly, isLoading: ml } = useQuery({
    queryKey: ['monthly-trend'],
    queryFn: async () => { const { data } = await api.get('/analytics/monthly-trend'); return data.data; },
  });

  const { data: regions, isLoading: rl } = useQuery({
    queryKey: ['by-region'],
    queryFn: async () => { const { data } = await api.get('/analytics/by-region'); return data.data; },
  });

  const { data: severity } = useQuery({
    queryKey: ['by-severity'],
    queryFn: async () => { const { data } = await api.get('/analytics/by-severity'); return data.data; },
  });

  const { data: issueTypes } = useQuery({
    queryKey: ['by-issue-type'],
    queryFn: async () => { const { data } = await api.get('/analytics/by-issue-type'); return data.data; },
  });

  const { data: statusData } = useQuery({
    queryKey: ['by-status'],
    queryFn: async () => { const { data } = await api.get('/analytics/by-status'); return data.data; },
  });

  const COLORS = ['#2f65fc','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316'];

  const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
  const stagger = { show: { transition: { staggerChildren: 0.1 } } };

  return (
    <div className="space-y-6 animate-in">
      <PageHeader title="Analytics & Insights" subtitle="Road maintenance performance across Namibia." />

      <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">

        {/* Monthly Trend */}
        <motion.div variants={fadeUp} className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-white text-lg">Monthly Report Trend</h3>
              <p className="text-surface-400 text-sm">Reports submitted vs completed over 12 months</p>
            </div>
            <Activity className="w-5 h-5 text-surface-500" />
          </div>
          {ml ? <LoadingSkeleton rows={1} height="h-64" /> : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthly || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip {...darkTooltip} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
                <Line type="monotone" dataKey="reported" name="Reported" stroke="#2f65fc" strokeWidth={2.5} dot={{ fill: '#2f65fc', r: 4 }} />
                <Line type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} />
                <Line type="monotone" dataKey="critical" name="Critical" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Row 2: Issue Types + Severity */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Issue type bar */}
          <motion.div variants={fadeUp} className="card p-6">
            <h3 className="font-display font-bold text-white text-lg mb-1">Reports by Issue Type</h3>
            <p className="text-surface-400 text-sm mb-5">Total reports per category</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={(issueTypes || []).map((d: any) => ({ ...d, name: ISSUE_LABELS[d.issue_type] || d.issue_type }))} layout="vertical" barSize={16}>
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} width={100} />
                <Tooltip {...darkTooltip} />
                <Bar dataKey="count" name="Reports" radius={[0, 4, 4, 0]}>
                  {(issueTypes || []).map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Severity pie */}
          <motion.div variants={fadeUp} className="card p-6">
            <h3 className="font-display font-bold text-white text-lg mb-1">Severity Distribution</h3>
            <p className="text-surface-400 text-sm mb-5">All time breakdown</p>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={severity || []} dataKey="count" nameKey="severity"
                  cx="50%" cy="50%" outerRadius={90} innerRadius={55}
                  paddingAngle={3}>
                  {(severity || []).map((_: any, i: number) => (
                    <Cell key={i} fill={['#3b82f6','#eab308','#f97316','#ef4444'][i % 4]} />
                  ))}
                </Pie>
                <Tooltip {...darkTooltip} formatter={(v: any, n: any) => [v, n]} />
                <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'capitalize' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Region performance */}
        <motion.div variants={fadeUp} className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-white text-lg">Regional Performance</h3>
              <p className="text-surface-400 text-sm">Reports per region — total, completed, pending, critical</p>
            </div>
            <MapPin className="w-5 h-5 text-surface-500" />
          </div>
          {rl ? <LoadingSkeleton rows={1} height="h-72" /> : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={(regions || []).slice(0, 10)} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="region" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false}
                  angle={-25} textAnchor="end" height={55} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip {...darkTooltip} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
                <Bar dataKey="total"     name="Total"    fill="#2f65fc" radius={[3,3,0,0]} />
                <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[3,3,0,0]} />
                <Bar dataKey="pending"   name="Pending"  fill="#f59e0b" radius={[3,3,0,0]} />
                <Bar dataKey="critical"  name="Critical" fill="#ef4444" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Status summary */}
        <motion.div variants={fadeUp} className="card p-6">
          <h3 className="font-display font-bold text-white text-lg mb-5">Status Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {(statusData || []).map((s: any, i: number) => (
              <div key={s.status} className="card p-4 text-center">
                <div className="text-2xl font-display font-bold text-white">{s.count}</div>
                <div className="text-xs text-surface-400 mt-1 capitalize">{s.status.replace(/_/g, ' ')}</div>
                <div className="mt-2 h-1 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
              </div>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
