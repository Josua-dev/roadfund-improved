import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Lock, Save, Shield } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader, Alert } from '../components/common';
import { formatDateTime, roleConfig } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<'profile' | 'security'>('profile');
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    region_id: user?.region_id ? String(user.region_id) : '',
  });
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [pwError, setPwError] = useState('');

  const { data: regions } = useQuery({
    queryKey: ['regions'],
    queryFn: async () => { const { data } = await api.get('/regions'); return data.data; },
  });

  const profileMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.put('/auth/profile', profileForm);
      return data.user;
    },
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      toast.success('Profile updated successfully');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const passwordMutation = useMutation({
    mutationFn: async () => {
      await api.put('/auth/change-password', {
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      });
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Password change failed'),
  });

  const handlePasswordSubmit = () => {
    setPwError('');
    if (pwForm.new_password.length < 6) {
      setPwError('New password must be at least 6 characters');
      return;
    }
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwError('Passwords do not match');
      return;
    }
    passwordMutation.mutate();
  };

  const roleInfo = roleConfig[user?.role as keyof typeof roleConfig];
  const roleGradients: Record<string, string> = {
    citizen: 'from-brand-500 to-brand-800',
    inspector: 'from-purple-500 to-purple-800',
    maintenance_officer: 'from-emerald-500 to-emerald-800',
    admin: 'from-amber-500 to-amber-800',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in">
      <PageHeader title="My Profile" subtitle="Manage your account settings." />

      {/* Profile hero */}
      <div className="card p-6 flex items-start gap-5">
        <div className={`w-16 h-16 bg-gradient-to-br ${roleGradients[user?.role || 'citizen']} rounded-2xl flex items-center justify-center text-white font-display font-bold text-2xl shrink-0`}>
          {user?.full_name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="font-display font-bold text-white text-xl">{user?.full_name}</h2>
          <p className="text-surface-400 text-sm">{user?.email}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`badge ${roleInfo?.color}`}>
              <Shield className="w-3 h-3" /> {roleInfo?.label}
            </span>
            <span className="text-surface-500 text-xs">
              Member since {formatDateTime(user?.created_at || '')}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-900 border border-surface-800 rounded-xl">
        {(['profile', 'security'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? 'bg-surface-700 text-white' : 'text-surface-400 hover:text-white'
            }`}>
            {t === 'profile' ? '👤 Profile' : '🔐 Security'}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 space-y-5">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input type="text" value={profileForm.full_name}
                onChange={(e) => setProfileForm(f => ({ ...f, full_name: e.target.value }))}
                className="input-field pl-10" />
            </div>
          </div>

          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input type="email" value={user?.email} disabled
                className="input-field pl-10 opacity-50 cursor-not-allowed" />
            </div>
            <p className="text-surface-500 text-xs mt-1">Email cannot be changed. Contact admin if needed.</p>
          </div>

          <div>
            <label className="label">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input type="tel" value={profileForm.phone}
                onChange={(e) => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                className="input-field pl-10" placeholder="+264 81 000 0000" />
            </div>
          </div>

          <div>
            <label className="label">Region</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <select value={profileForm.region_id}
                onChange={(e) => setProfileForm(f => ({ ...f, region_id: e.target.value }))}
                className="select-field pl-10">
                <option value="">Select region…</option>
                {(regions || []).map((r: any) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button onClick={() => profileMutation.mutate()} disabled={profileMutation.isPending}
            className="btn-primary w-full justify-center py-3">
            {profileMutation.isPending ? 'Saving…' : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </motion.div>
      )}

      {/* Security tab */}
      {tab === 'security' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 space-y-5">
          <div>
            <h3 className="font-display font-bold text-white mb-1">Change Password</h3>
            <p className="text-surface-400 text-sm mb-5">Use a strong password with at least 6 characters.</p>

            {pwError && <Alert type="error" message={pwError} onClose={() => setPwError('')} />}

            <div className="space-y-4 mt-4">
              {[
                { label: 'Current Password', key: 'current_password', placeholder: '••••••••' },
                { label: 'New Password', key: 'new_password', placeholder: 'Min. 6 characters' },
                { label: 'Confirm New Password', key: 'confirm_password', placeholder: 'Repeat new password' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                    <input type="password"
                      value={(pwForm as any)[key]}
                      onChange={(e) => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                      className="input-field pl-10" placeholder={placeholder} />
                  </div>
                </div>
              ))}

              <button onClick={handlePasswordSubmit} disabled={passwordMutation.isPending}
                className="btn-primary w-full justify-center py-3">
                {passwordMutation.isPending ? 'Changing…' : <><Lock className="w-4 h-4" /> Change Password</>}
              </button>
            </div>
          </div>

          <div className="border-t border-surface-800 pt-5">
            <h3 className="font-display font-bold text-white mb-3">Account Information</h3>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Role', value: roleInfo?.label },
                { label: 'Account Status', value: user?.is_active ? 'Active' : 'Inactive' },
                { label: 'Last Login', value: user?.last_login ? formatDateTime(user.last_login) : 'N/A' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-surface-800 last:border-0">
                  <span className="text-surface-400">{label}</span>
                  <span className="text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
