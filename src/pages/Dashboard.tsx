import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Activity, AlertTriangle, CheckCircle, XCircle,
  TrendingUp, ArrowRight, RefreshCw,
} from 'lucide-react';
import { fetchEquipment } from '../services/equipmentApi';
import { fetchAnalyticsSummary, fetchEquipmentTypeMetrics } from '../services/analyticsApi';
import { fetchAlerts } from '../services/alertApi';
import { HealthScoreCard } from '../components/shared/HealthScoreCard';
import { StatusBadge } from '../components/shared/StatusBadge';
import { SkeletonCard, ErrorState } from '../components/shared/Feedback';

import { clsx } from 'clsx';
import type { EquipmentType } from '../types';

/**
 * Dashboard — KPI summary, equipment-by-category, equipment grid.
 * All numbers computed from the equipment array — never hardcoded.
 */
export function Dashboard(): React.ReactElement {

  const [categoryFilter, setCategoryFilter] = useState<EquipmentType | null>(null);

  const { data: equipment = [], isLoading: eqLoading, error: eqError, refetch } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => fetchEquipment(),
    refetchInterval: 30000,
  });

  const { data: summary, isLoading: sumLoading } = useQuery({
    queryKey: ['analyticsSummary'],
    queryFn: fetchAnalyticsSummary,
    refetchInterval: 30000,
  });

  const { data: typeMetrics = [], isLoading: metricsLoading } = useQuery({
    queryKey: ['equipmentTypeMetrics'],
    queryFn: fetchEquipmentTypeMetrics,
    refetchInterval: 30000,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => fetchAlerts({ status: 'active' }),
    refetchInterval: 15000,
  });

  const filteredEquipment = categoryFilter
    ? equipment.filter(e => e.type === categoryFilter)
    : equipment;

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');

  return (
    <div className="space-y-6">
      {/* ─── KPI Cards ─────────────────────────────────────────────────────── */}
      <section aria-label="Key performance indicators">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-100">Plant Overview</h2>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Refresh dashboard data"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>

        {sumLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : summary ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <KPICard
              label="Total Equipment"
              value={summary.totalEquipment}
              icon={Activity}
              color="blue"
            />
            <KPICard
              label="Healthy"
              value={summary.healthyCount}
              icon={CheckCircle}
              color="emerald"
              note={`${Math.round((summary.healthyCount / summary.totalEquipment) * 100)}%`}
            />
            <KPICard
              label="Warning"
              value={summary.warningCount}
              icon={AlertTriangle}
              color="amber"
            />
            <KPICard
              label="Critical"
              value={summary.criticalCount}
              icon={XCircle}
              color="red"
            />
            <KPICard
              label="Avg Health"
              value={`${summary.avgHealthScore}%`}
              icon={TrendingUp}
              color="blue"
              note={`${summary.activeAlerts} active alerts`}
            />
          </div>
        ) : null}
      </section>

      {/* ─── Critical Alerts banner ────────────────────────────────────────── */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <XCircle size={18} className="text-red-400 flex-shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-400">
              {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''} Active
            </p>
            <p className="text-xs text-red-400/70 mt-0.5">
              {criticalAlerts.map(a => a.equipmentName).join(', ')} — immediate attention required
            </p>
          </div>
          <Link
            to="/alerts"
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors whitespace-nowrap"
            aria-label="View all critical alerts"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* ─── Equipment by Category ─────────────────────────────────────────── */}
      <section aria-label="Equipment health by category">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Health by Equipment Type
        </h2>
        {metricsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {typeMetrics.map(metric => (
              <button
                key={metric.type}
                onClick={() => setCategoryFilter(categoryFilter === metric.type ? null : metric.type)}
                className={clsx(
                  'text-left rounded-xl border p-4 transition-all cursor-pointer',
                  categoryFilter === metric.type
                    ? 'bg-blue-600/15 border-blue-500/40'
                    : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600',
                )}
                aria-pressed={categoryFilter === metric.type}
                aria-label={`Filter by ${metric.displayName} — avg health ${metric.avgHealth}%`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-400 font-medium">{metric.displayName}</span>
                  <span className="text-xs text-slate-500">{metric.count} units</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-slate-100 tabular-nums">
                      {metric.avgHealth}%
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Avg health</p>
                  </div>
                  <div className="text-right space-y-0.5">
                    {metric.criticalCount > 0 && (
                      <p className="text-xs text-red-400">{metric.criticalCount} critical</p>
                    )}
                    {metric.warningCount > 0 && (
                      <p className="text-xs text-amber-400">{metric.warningCount} warning</p>
                    )}
                    {metric.criticalCount === 0 && metric.warningCount === 0 && (
                      <p className="text-xs text-emerald-400">All healthy</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        {categoryFilter && (
          <p className="text-xs text-slate-500 mt-2">
            Showing {typeMetrics.find(m => m.type === categoryFilter)?.displayName} only.{' '}
            <button
              onClick={() => setCategoryFilter(null)}
              className="text-blue-400 hover:text-blue-300"
              aria-label="Clear category filter"
            >
              Clear filter
            </button>
          </p>
        )}
      </section>

      {/* ─── Equipment Grid ────────────────────────────────────────────────── */}
      <section aria-label="Equipment list">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
            {categoryFilter ? `${typeMetrics.find(m => m.type === categoryFilter)?.displayName} (${filteredEquipment.length})` : `All Equipment (${equipment.length})`}
          </h2>
          <Link
            to="/equipment"
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            aria-label="View full equipment list"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {eqLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} className="h-40" />)}
          </div>
        ) : eqError ? (
          <ErrorState error={eqError} onRetry={refetch} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredEquipment.slice(0, 12).map(eq => (
              <Link
                key={eq.id}
                to={`/equipment/${eq.id}`}
                className="block bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-xl p-4 transition-all group"
                aria-label={`${eq.name} — ${eq.status}, health ${eq.healthScore}%`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {eq.name}
                    </p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{eq.id}</p>
                  </div>
                  <StatusBadge status={eq.status} size="sm" />
                </div>

                <div className="flex items-center gap-4">
                  <HealthScoreCard score={eq.healthScore} size="sm" showRing={false} />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 truncate">{eq.location}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{eq.operatingHours.toLocaleString()} hrs</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
interface KPICardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: 'blue' | 'emerald' | 'amber' | 'red';
  note?: string;
}

function KPICard({ label, value, icon: Icon, color, note }: KPICardProps) {
  const colorClasses = {
    blue:    'text-blue-400 bg-blue-500/10 border-blue-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber:   'text-amber-400 bg-amber-500/10 border-amber-500/20',
    red:     'text-red-400 bg-red-500/10 border-red-500/20',
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400 font-medium">{label}</span>
        <div className={clsx('w-7 h-7 rounded-lg border flex items-center justify-center', colorClasses[color])}>
          <Icon size={14} aria-hidden="true" />
        </div>
      </div>
      <p className={clsx('text-2xl font-bold tabular-nums', colorClasses[color].split(' ')[0])}>
        {value}
      </p>
      {note && <p className="text-xs text-slate-500 mt-1">{note}</p>}
    </div>
  );
}
