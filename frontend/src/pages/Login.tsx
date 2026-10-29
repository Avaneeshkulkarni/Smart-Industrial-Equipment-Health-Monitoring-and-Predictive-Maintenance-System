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
    <div className="min-h-screen bg-[#050811] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden industrial-grid-bg">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center z-10">

        {/* ─── Left: Brand & Telemetry Mission Control ───────────── */}
        <div className="hidden lg:block space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
              <Zap size={24} className="text-white" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
                  PREDICT<span className="text-cyan-400">X</span>
                </h1>
                <span className="text-[10px] font-mono uppercase bg-cyan-950/60 text-cyan-400 border border-cyan-800/80 rounded px-1.5 py-0.5">
                  SCADA v2.4
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400">ENTERPRISE IIoT MONITORING & PREDICTIVE MAINTENANCE</p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
              Subsystem Telemetry &<br />
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                Continuous ML Inference
              </span>
            </h2>
            <p className="text-slate-400 text-xs font-mono leading-relaxed">
              Real-time Brownian sensor telemetry, 2.5s streaming inference loop, and automated remaining useful life (RUL) estimation across critical manufacturing machinery.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            {[
              { icon: ShieldCheck, text: 'Continuous Multi-Signal Model Inference (XGBoost + IsoForest + LSTM)' },
              { icon: Zap,         text: 'Live 2.5s Brownian Telemetry Drift Simulation' },
              { icon: Lock,        text: 'Role-Gated Plant Operations: Manager, Maintenance, Operator, Admin' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-xs font-mono text-slate-300 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60">
                <Icon size={15} className="text-cyan-400 flex-shrink-0" aria-hidden="true" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>CENTRAL SCADA INFERENCE NODE: ONLINE</span>
          </div>
        </div>

        {/* ─── Right: Industrial Login form ─────────────────────── */}
        <div className="industrial-card rounded-2xl border border-slate-800/90 p-8 shadow-2xl backdrop-blur-xl">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center">
              <Zap size={16} className="text-white" aria-hidden="true" />
            </div>
            <span className="font-bold text-white font-mono">PREDICT<span className="text-cyan-400">X</span></span>
          </div>

          <div className="border-b border-slate-800/80 pb-4 mb-5">
            <h2 className="text-lg font-bold font-mono text-white tracking-wide">OPERATOR ACCESS GATEWAY</h2>
            <p className="text-xs font-mono text-slate-400 mt-0.5">Authenticate credentials to access plant supervisory node</p>
          </div>

          <form onSubmit={handleLogin} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Operator Identifier / Email
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800 text-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="operator@predictx.io"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Passcode / Access Key
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800 text-slate-200 rounded-lg pl-9 pr-9 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500 transition-colors"
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
              <label htmlFor="role" className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Security Authorization Role
              </label>
              <select
                id="role"
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="w-full bg-slate-950/70 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                aria-label="Select your role"
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value} className="bg-slate-900 text-slate-200">{r.label} — {r.description}</option>
                ))}
              </select>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-rose-950/30 border border-rose-500/40 rounded-lg px-3 py-2 text-xs font-mono text-rose-400" role="alert">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={clsx(
                'w-full py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-lg',
                loading
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20 active:translate-y-0.5',
              )}
              aria-busy={loading}
            >
              {loading ? 'AUTHENTICATING TOKEN…' : 'INITIALIZE SESSION →'}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-5 bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
              Quick Preset Operator Profiles
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {DEMO_CREDENTIALS.map(c => (
                <button
                  key={c.email}
                  onClick={() => { setEmail(c.email); setPassword(c.password); setRole(c.role); }}
                  className={clsx(
                    'text-left text-[11px] font-mono px-2 py-1.5 rounded border transition-colors flex flex-col',
                    email === c.email
                      ? 'border-cyan-500/50 bg-cyan-950/30 text-cyan-300'
                      : 'border-slate-800/80 bg-slate-900/40 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  )}
                  aria-label={`Use ${c.role} credentials`}
                >
                  <span className="font-semibold text-slate-200 uppercase text-[10px]">{c.role}</span>
                  <span className="truncate text-slate-400">{c.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
