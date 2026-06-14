import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Plus, UserCheck, UserX, Shield, RefreshCw } from 'lucide-react';
import api from '../../utils/api';
import { User } from '../../types';
import {
  PageHeader, LoadingSkeleton, EmptyState, Pagination,
  Table, Tr, Td, Modal
} from '../../components/common';
import { formatDate, roleConfig } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Users } from 'lucide-react';

const ROLES = ['citizen','inspector','maintenance_officer','admin'];

export default function AdminUsers() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    full_name: '', email: '', password: '', role: 'citizen', phone: '', region_id: ''
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page), limit: '15',
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
      });
      const { data } = await api.get(`/users?${params}`);
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

  const toggleMutation = useMutation({
    mutationFn: async (id: number) => { await api.patch(`/users/${id}/toggle-status`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User status updated'); },
    onError: () => toast.error('Failed to update user'),
  });

  const createMutation = useMutation({
    mutationFn: async () => { await api.post('/users', newUser); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setCreateModal(false);
      setNewUser({ full_name:'', email:'', password:'', role:'citizen', phone:'', region_id:'' });
      toast.success('User created successfully');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create user'),
  });

  const users: User[] = data?.data || [];
  const pagination = data?.pagination;

  const set = (k: string) => (e: any) => setNewUser((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-5 animate-in">
      <PageHeader title="User Management" subtitle={`${pagination?.total || 0} registered users`}>
        <button onClick={() => setCreateModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Create User
        </button>
      </PageHeader>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-9 py-2 text-sm" placeholder="Search by name or email…" />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="select-field w-auto py-2 text-sm">
          <option value="">All Roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{roleConfig[r as keyof typeof roleConfig]?.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-5"><LoadingSkeleton rows={8} /></div>
        ) : !users.length ? (
          <EmptyState icon={Users} title="No users found" description="Try adjusting your filters" />
        ) : (
          <Table headers={['User', 'Role', 'Reports', 'Region', 'Joined', 'Status', 'Actions']}>
            {users.map((u) => (
              <Tr key={u.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                      u.role === 'admin' ? 'from-amber-500 to-amber-700' :
                      u.role === 'inspector' ? 'from-purple-500 to-purple-700' :
                      u.role === 'maintenance_officer' ? 'from-emerald-500 to-emerald-700' :
                      'from-brand-500 to-brand-700'
                    } flex items-center justify-center text-white font-bold text-xs`}>
                      {u.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{u.full_name}</p>
                      <p className="text-surface-500 text-xs">{u.email}</p>
                    </div>
                  </div>
                </Td>
                <Td>
                  <span className={`badge ${roleConfig[u.role as keyof typeof roleConfig]?.color}`}>
                    {roleConfig[u.role as keyof typeof roleConfig]?.label}
                  </span>
                </Td>
                <Td><span className="text-surface-300 text-sm">{u.report_count || 0}</span></Td>
                <Td><span className="text-surface-400 text-sm">{u.region_name || '—'}</span></Td>
                <Td><span className="text-surface-500 text-xs">{formatDate(u.created_at)}</span></Td>
                <Td>
                  <span className={`badge ${u.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </Td>
                <Td>
                  <button onClick={() => toggleMutation.mutate(u.id)}
                    disabled={toggleMutation.isPending}
                    className={`p-1.5 rounded-lg transition-colors ${
                      u.is_active
                        ? 'hover:bg-red-500/10 text-surface-400 hover:text-red-400'
                        : 'hover:bg-emerald-500/10 text-surface-400 hover:text-emerald-400'
                    }`}
                    title={u.is_active ? 'Deactivate' : 'Activate'}>
                    {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </button>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </div>

      <Pagination page={page} pages={pagination?.pages || 1} onPage={setPage} />

      {/* Create User Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create New User">
        <div className="space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input type="text" value={newUser.full_name} onChange={set('full_name')}
              className="input-field" placeholder="Full name" required />
          </div>
          <div>
            <label className="label">Email *</label>
            <input type="email" value={newUser.email} onChange={set('email')}
              className="input-field" placeholder="email@example.com" required />
          </div>
          <div>
            <label className="label">Password *</label>
            <input type="password" value={newUser.password} onChange={set('password')}
              className="input-field" placeholder="Min 6 characters" required />
          </div>
          <div>
            <label className="label">Role</label>
            <select value={newUser.role} onChange={set('role')} className="select-field">
              {ROLES.map((r) => <option key={r} value={r}>{roleConfig[r as keyof typeof roleConfig]?.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Phone</label>
            <input type="tel" value={newUser.phone} onChange={set('phone')}
              className="input-field" placeholder="+264 81 000 0000" />
          </div>
          <div>
            <label className="label">Region</label>
            <select value={newUser.region_id} onChange={set('region_id')} className="select-field">
              <option value="">Select region…</option>
              {(regions || []).map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setCreateModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}
              className="btn-primary flex-1">
              {createMutation.isPending ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
