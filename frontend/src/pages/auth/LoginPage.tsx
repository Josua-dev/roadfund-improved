import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function RFAMark() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="44" height="44" rx="10" fill="#1a7a4a"/>
      <rect x="21" y="6"  width="2.5" height="6"  rx="1.25" fill="#C9A227"/>
      <rect x="21" y="18" width="2.5" height="8"  rx="1.25" fill="#C9A227"/>
      <rect x="21" y="32" width="2.5" height="6"  rx="1.25" fill="#C9A227"/>
      <rect x="10" y="6"  width="2"   height="32" rx="1"    fill="rgba(255,255,255,0.22)"/>
      <rect x="32" y="6"  width="2"   height="32" rx="1"    fill="rgba(255,255,255,0.22)"/>
    </svg>
  );
}

const demoLogins = [
  { label: 'Admin',     email: 'admin@roadfund.na',    color: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400' },
  { label: 'Inspector', email: 'inspector@roadfund.na', color: 'border-brand-500/30 bg-brand-500/5 text-brand-400' },
  { label: 'Officer',   email: 'officer@roadfund.na',   color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' },
  { label: 'Citizen',   email: 'citizen@roadfund.na',   color: 'border-surface-500/30 bg-surface-700/30 text-surface-300' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form,    setForm]   = useState({ email: '', password: '' });
  const [showPw,  setShowPw] = useState(false);
  const [loading, setLoading]= useState(false);
  const [error,   setError]  = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: 'var(--surface-bg)' }}>
      <div className="absolute inset-0 bg-rfa-gradient opacity-80" />
      <div className="absolute inset-0 bg-hero-pattern" />
      {/* Green glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(26,122,74,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md">

        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3 mb-2">
            <RFAMark />
            <div>
              <div className="font-display font-bold text-white text-lg">Road Fund Administration</div>
              <div className="text-xs" style={{ color: 'var(--rfa-gold)' }}>Republic of Namibia</div>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h1 className="font-display font-bold text-xl text-white mb-1 text-center">Welcome Back</h1>
          <p className="text-surface-400 text-sm text-center mb-6">Sign in to your RFA account</p>

          {/* Demo tiles */}
          <div className="mb-6">
            <p className="text-surface-500 text-xs font-semibold uppercase tracking-widest mb-3 text-center">Quick Demo Access</p>
            <div className="grid grid-cols-2 gap-2">
              {demoLogins.map(({ label, email, color }) => (
                <button key={label} type="button"
                  onClick={() => setForm({ email, password: 'Password123!' })}
                  className={`text-xs px-3 py-2 rounded-lg border transition-all hover:scale-105 active:scale-95 font-medium ${color}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="divider-gold mb-6" />

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-10" placeholder="you@example.com" required />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-10 pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign In to RFA'}
            </button>
          </form>
        </div>

        <p className="text-center text-surface-400 text-sm mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">Register here</Link>
        </p>

        <p className="text-center text-surface-600 text-xs mt-3">
          © Road Fund Administration Namibia · <a href="https://rfanam.com.na" className="hover:text-surface-400 transition-colors" target="_blank" rel="noopener noreferrer">rfanam.com.na</a>
        </p>
      </motion.div>
    </div>
  );
}
