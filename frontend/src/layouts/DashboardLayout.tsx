import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Cpu,
  ChevronLeft, ChevronRight, Menu, User, LogOut,
  ChevronDown, Activity, Clock, ShieldCheck
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Plant Dashboard', badge: 'Live' },
  { to: '/equipment', icon: Cpu,             label: 'Monitored Assets', count: '9' },
];

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Plant Operations & Health Overview',
  '/equipment': 'Asset Management & Real-Time Telemetry',
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps): React.ReactElement {
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Real-time industrial clock
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Collapse sidebar on small screens by default
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    if (mq.matches) setSidebarOpen(false);
  }, [setSidebarOpen]);

  const pageTitle = Object.entries(PAGE_TITLES).find(
    ([path]) => location.pathname.startsWith(path)
  )?.[1] ?? 'PredictX Enterprise';

  // Mock user from session
  const user = { name: 'Alex Morgan', role: 'Chief Reliability Engineer', email: 'alex@predictx.io' };

  function handleLogout() {
    localStorage.removeItem('predictx_auth');
    navigate('/login');
  }

  return (
    <div className="flex h-screen bg-[#070b14] text-slate-100 overflow-hidden font-sans">
      {/* ─── Sidebar ──────────────────────────────────────────────────────── */}
      <aside
        className={clsx(
          'flex flex-col bg-[#0b101d] border-r border-slate-800/80 transition-all duration-300 flex-shrink-0 z-30 shadow-2xl',
          sidebarOpen ? 'w-60' : 'w-16',
        )}
        aria-label="Main navigation"
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-3.5 border-b border-slate-800/70 gap-3 overflow-hidden bg-[#090d18]">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
            <Activity size={18} className="text-white" aria-hidden="true" />
          </div>
          {sidebarOpen && (
            <div className="min-w-0 flex flex-col">
              <span className="font-extrabold text-slate-100 text-sm tracking-wider uppercase flex items-center gap-1.5">
                PREDICT<span className="text-blue-400">X</span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">
                ENTERPRISE IIoT
              </span>
            </div>
          )}
        </div>

        {/* System Health Status in Sidebar */}
        {sidebarOpen && (
          <div className="px-3.5 py-3 border-b border-slate-800/60 bg-slate-900/40">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
              <span>Edge Telemetry</span>
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                Active
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Inference Ticks</span>
              <span className="text-slate-300">2.5s Stream</span>
            </div>
          </div>
        )}

        {/* Navigation links */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto overflow-x-hidden px-2" role="navigation">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative group',
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-inner shadow-blue-500/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent',
                )
              }
              aria-label={item.label}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} className={clsx('flex-shrink-0 transition-transform group-hover:scale-110', isActive ? 'text-blue-400' : 'text-slate-400')} aria-hidden="true" />
                  {sidebarOpen && (
                    <div className="flex items-center justify-between flex-1 truncate">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {item.badge}
                        </span>
                      )}
                      {item.count && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {item.count}
                        </span>
                      )}
                    </div>
                  )}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-r-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section at bottom */}
        <div className="border-t border-slate-800/80 p-2.5 bg-[#090d18]">
          {sidebarOpen ? (
            <div className="px-2 py-1.5">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <User size={15} className="text-blue-400" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-200 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate font-mono">{user.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400 hover:text-red-400 transition-colors w-full py-1.5 rounded-lg hover:bg-slate-800/80 border border-slate-800/50"
                aria-label="Log out"
              >
                <LogOut size={13} aria-hidden="true" />
                End Session
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full h-10 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800"
              aria-label="Log out"
            >
              <LogOut size={16} aria-hidden="true" />
            </button>
          )}

          {/* Toggle sidebar button */}
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-full h-8 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-800 mt-1"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </aside>

      {/* ─── Main Content Canvas ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top SCADA Control Header */}
        <header className="h-16 bg-[#0b101d]/90 backdrop-blur-md border-b border-slate-800/80 flex items-center px-4 md:px-6 gap-4 flex-shrink-0 z-20 justify-between">
          {/* Left section: Breadcrumb / Page Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200"
              aria-label="Toggle sidebar"
            >
              <Menu size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <span>SCADA Supervisory</span>
                <span>/</span>
                <span className="text-blue-400">Production Node Alpha</span>
              </div>
              <h1 className="text-sm md:text-base font-bold text-slate-100 tracking-tight">
                {pageTitle}
              </h1>
            </div>
          </div>

          {/* Right section: System Telemetry Stats, Clock & Controls */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Real-time Telemetry Pulse Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-slate-400 font-mono text-[11px]">TELEMETRY:</span>
              <span className="text-emerald-400 font-bold font-mono text-[11px]">ONLINE (2.5s)</span>
            </div>

            {/* AI Ensemble Status Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/25 text-xs text-blue-300">
              <ShieldCheck size={14} className="text-blue-400" />
              <span className="font-mono text-[11px] font-semibold">3/3 ML ENSEMBLES ACTIVE</span>
            </div>

            {/* Industrial Digital Clock */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs">
              <Clock size={13} className="text-slate-400" />
              <span className="tabular-nums font-semibold tracking-wider text-slate-100">{currentTime}</span>
              <span className="text-[10px] text-slate-400">LCL</span>
            </div>

            {/* Plant Selector */}
            <PlantSelector />
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto bg-[#070b14] industrial-grid-bg">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Plant Selector Component ─────────────────────────────────────────────────
function PlantSelector() {
  const { selectedPlant, setSelectedPlant } = useAppStore();

  const plants = [
    { id: 'plant-1', name: 'Alpha Facility · Detroit', code: 'FAC-DET-01' },
    { id: 'plant-2', name: 'Beta Facility · Cleveland', code: 'FAC-CLE-02' },
  ];

  return (
    <div className="relative">
      <select
        id="plant-selector"
        value={selectedPlant}
        onChange={e => setSelectedPlant(e.target.value)}
        className="appearance-none bg-slate-900 border border-slate-700/80 text-slate-200 text-xs font-medium rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm hover:border-slate-600 transition-colors"
        aria-label="Select production facility"
      >
        {plants.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}
