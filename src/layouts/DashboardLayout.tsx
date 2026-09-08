import React, { useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Cpu, Bell, Wrench, BarChart2, Settings,
  ChevronLeft, ChevronRight, Menu, User, LogOut,
  ChevronDown, Zap,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/equipment',   icon: Cpu,             label: 'Equipment'  },
  { to: '/alerts',      icon: Bell,            label: 'Alerts'     },
  { to: '/maintenance', icon: Wrench,          label: 'Maintenance' },
  { to: '/analytics',  icon: BarChart2,        label: 'Analytics'  },
  { to: '/settings',   icon: Settings,         label: 'Settings'   },
];

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':   'Dashboard',
  '/equipment':   'Equipment',
  '/alerts':      'Alerts',
  '/maintenance': 'Maintenance',
  '/analytics':   'Analytics',
  '/settings':    'Settings',
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps): React.ReactElement {
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Collapse sidebar on small screens by default
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    if (mq.matches) setSidebarOpen(false);
  }, [setSidebarOpen]);

  const pageTitle = Object.entries(PAGE_TITLES).find(
    ([path]) => location.pathname.startsWith(path)
  )?.[1] ?? 'PredictX';

  // Mock user from session
  const user = { name: 'Alex Morgan', role: 'Plant Manager', email: 'alex@predictx.io' };

  function handleLogout() {
    localStorage.removeItem('predictx_auth');
    navigate('/login');
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* ─── Sidebar ──────────────────────────────────────────────────────── */}
      <aside
        className={clsx(
          'flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 flex-shrink-0 z-30',
          sidebarOpen ? 'w-56' : 'w-14',
        )}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-3 border-b border-slate-800 gap-2 overflow-hidden">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Zap size={16} className="text-white" aria-hidden="true" />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-slate-100 text-sm whitespace-nowrap">
              Predict<span className="text-blue-400">X</span>
            </span>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden" role="navigation">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 mx-1.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800',
                )
              }
              aria-label={item.label}
            >
              <item.icon size={17} className="flex-shrink-0" aria-hidden="true" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User section at bottom */}
        <div className="border-t border-slate-800 p-2">
          {sidebarOpen ? (
            <div className="px-2 py-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <User size={13} className="text-blue-400" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs text-slate-400 hover:text-red-400 transition-colors w-full px-1 py-1 rounded hover:bg-slate-800"
                aria-label="Log out"
              >
                <LogOut size={13} aria-hidden="true" />
                Log out
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full h-10 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800"
              aria-label="Log out"
            >
              <LogOut size={16} aria-hidden="true" />
            </button>
          )}

          {/* Toggle button */}
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-full h-8 text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-800 mt-1"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </aside>

      {/* ─── Main area ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 flex items-center px-4 gap-4 flex-shrink-0 z-20">
          {/* Mobile menu toggle */}
          <button
            onClick={toggleSidebar}
            className="md:hidden text-slate-400 hover:text-slate-200"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>

          {/* Page title */}
          <h2 className="text-sm font-semibold text-slate-200">{pageTitle}</h2>

          <div className="flex-1" />

          {/* Plant selector */}
          <PlantSelector />

          {/* Notifications */}
          <button
            className="relative text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Notifications (2 active alerts)"
          >
            <Bell size={18} aria-hidden="true" />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true" />
          </button>

          {/* User avatar */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <User size={13} className="text-blue-400" aria-hidden="true" />
            </div>
            {/* Show name only on larger screens */}
            <span className="hidden sm:block text-xs text-slate-300">{user.name}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          <div className="p-4 md:p-6 max-w-screen-2xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Plant Selector ───────────────────────────────────────────────────────────
function PlantSelector() {
  const { selectedPlant, setSelectedPlant } = useAppStore();

  const plants = [
    { id: 'plant-1', name: 'Alpha Plant — Detroit' },
    { id: 'plant-2', name: 'Beta Plant — Cleveland' },
  ];



  return (
    <div className="relative">
      <select
        id="plant-selector"
        value={selectedPlant}
        onChange={e => setSelectedPlant(e.target.value)}
        className="appearance-none bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 pr-7 focus:outline-none focus:border-blue-500 cursor-pointer"
        aria-label="Select plant"
      >
        {plants.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <ChevronDown
        size={12}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}
