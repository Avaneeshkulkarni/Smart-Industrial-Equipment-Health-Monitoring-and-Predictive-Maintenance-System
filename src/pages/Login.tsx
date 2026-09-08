import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, ShieldCheck, Lock, User } from 'lucide-react';
import type { UserRole } from '../types';
import { clsx } from 'clsx';

const ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: 'plant-manager', label: 'Plant Manager', description: 'Full visibility, KPIs, reporting' },
  { value: 'maintenance',   label: 'Maintenance',   description: 'Work orders, fault diagnosis' },
  { value: 'operator',      label: 'Operator',       description: 'Equipment status, alerts' },
  { value: 'admin',         label: 'Administrator',  description: 'System config, user management' },
];

const DEMO_CREDENTIALS = [
  { email: 'manager@predictx.io',  password: 'demo123', role: 'plant-manager' as UserRole },
  { email: 'tech@predictx.io',     password: 'demo123', role: 'maintenance' as UserRole  },
  { email: 'operator@predictx.io', password: 'demo123', role: 'operator' as UserRole     },
  { email: 'admin@predictx.io',    password: 'demo123', role: 'admin' as UserRole        },
];

/**
 * Login page — professional mock auth, redirects to /dashboard.
 * In production: replace handleLogin with POST /api/auth/login → JWT token.
 */
export function Login(): React.ReactElement {
  const navigate = useNavigate();
  const [email, setEmail] = useState('manager@predictx.io');
  const [password, setPassword] = useState('demo123');
  const [role, setRole] = useState<UserRole>('plant-manager');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Mock authentication — accept any demo credentials or matching role/email
    await new Promise(r => setTimeout(r, 800));
    const match = DEMO_CREDENTIALS.find(c => c.email === email && c.password === password);

    if (match || password === 'demo123') {
      localStorage.setItem('predictx_auth', JSON.stringify({ email, role, name: 'Alex Morgan' }));
      navigate('/dashboard');
    } else {
      setError('Invalid credentials. Use demo credentials below.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background grid pattern */}
      <div
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">

        {/* ─── Left: Brand ─────────────────────────────────────── */}
        <div className="hidden lg:block">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap size={24} className="text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">
                Predict<span className="text-blue-400">X</span>
              </h1>
              <p className="text-sm text-slate-400">Predictive Maintenance Platform</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">
            Industrial Equipment<br />
            <span className="text-blue-400">Health Intelligence</span>
          </h2>

          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Real-time sensor monitoring, anomaly detection, fault diagnosis, and remaining useful
            life estimation for your manufacturing plant's critical equipment.
          </p>

          <div className="space-y-3">
            {[
              { icon: ShieldCheck, text: 'Fault detection across 12 machines, 4 equipment types' },
              { icon: Zap,         text: 'Live sensor data with 2–5s refresh simulation' },
              { icon: Lock,        text: 'Role-based access: Manager, Maintenance, Operator, Admin' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3 text-sm text-slate-400">
                <Icon size={16} className="text-blue-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Right: Login form ────────────────────────────────── */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Zap size={16} className="text-white" aria-hidden="true" />
            </div>
            <span className="font-bold text-slate-100">Predict<span className="text-blue-400">X</span></span>
          </div>

          <h2 className="text-xl font-bold text-slate-100 mb-1">Sign in</h2>
          <p className="text-sm text-slate-400 mb-6">Access the maintenance platform</p>

          <form onSubmit={handleLogin} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-400 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="you@predictx.io"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label htmlFor="role" className="block text-xs font-medium text-slate-400 mb-1.5">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                aria-label="Select your role"
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                {ROLES.find(r => r.value === role)?.description}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-sm text-red-400" role="alert">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={clsx(
                'w-full py-2.5 rounded-lg text-sm font-semibold transition-all',
                loading
                  ? 'bg-blue-700 text-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20',
              )}
              aria-busy={loading}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <p className="text-xs font-semibold text-slate-400 mb-2">Demo Credentials</p>
            <div className="space-y-1">
              {DEMO_CREDENTIALS.map(c => (
                <button
                  key={c.email}
                  onClick={() => { setEmail(c.email); setPassword(c.password); setRole(c.role); }}
                  className="w-full text-left text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-2 py-1 rounded hover:bg-slate-700/50 px-1"
                  aria-label={`Use ${c.role} credentials`}
                >
                  <span className="text-blue-400 font-mono">{c.email}</span>
                  <span className="text-slate-600">·</span>
                  <span>demo123</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
