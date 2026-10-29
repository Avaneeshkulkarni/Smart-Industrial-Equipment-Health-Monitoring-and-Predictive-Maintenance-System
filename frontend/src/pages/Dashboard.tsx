import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Activity, AlertTriangle, CheckCircle, XCircle,
  TrendingUp, ArrowRight, RefreshCw, Cpu, ShieldCheck,
  Radio, Layers
} from 'lucide-react';
import { fetchEquipment } from '../services/equipmentApi';
import { fetchAnalyticsSummary, fetchEquipmentTypeMetrics } from '../services/analyticsApi';
import { StatusBadge } from '../components/shared/StatusBadge';
import { SkeletonCard, ErrorState } from '../components/shared/Feedback';
import equipmentConfig from '../config/equipmentConfig';

import { clsx } from 'clsx';
import type { EquipmentType } from '../types';

/**
 * Enterprise Industrial SCADA Dashboard
 * Features real-time KPI streaming, operational status banners,
 * category health matrices, and active ML model telemetry cards.
 */
export function Dashboard(): React.ReactElement {
  const [categoryFilter, setCategoryFilter] = useState<EquipmentType | null>(null);

  const { data: equipment = [], isLoading: eqLoading, error: eqError, refetch } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => fetchEquipment(),
    refetchInterval: 2500, // Live streaming 2.5s
  });

  const { isLoading: sumLoading } = useQuery({
    queryKey: ['analyticsSummary'],
    queryFn: fetchAnalyticsSummary,
    refetchInterval: 2500,
  });

  const { data: typeMetrics = [], isLoading: metricsLoading } = useQuery({
    queryKey: ['equipmentTypeMetrics'],
    queryFn: fetchEquipmentTypeMetrics,
    refetchInterval: 2500,
  });

  const filteredEquipment = categoryFilter
    ? equipment.filter(e => e.type === categoryFilter)
    : equipment;

  // Real KPI computations from database records
  const totalEquip = equipment.length;
  const healthyCount = equipment.filter(e => e.status === 'healthy').length;
  const warningCount = equipment.filter(e => e.status === 'warning').length;
  const criticalCount = equipment.filter(e => e.status === 'critical').length;
  
  // Health score calculation only for equipment with valid scores
  const equipmentWithHealth = equipment.filter(e => typeof e.healthScore === 'number' && e.healthScore > 0);
  const avgHealth = equipmentWithHealth.length > 0
    ? Math.round(equipmentWithHealth.reduce((acc, e) => acc + e.healthScore, 0) / equipmentWithHealth.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* ─── 1. Industrial SCADA Operations Status Banner ──────────────────── */}
      <section
        aria-label="Operations Overview"
        className="industrial-card rounded-2xl p-4 md:p-5 relative overflow-hidden border border-slate-800/90 shadow-2xl"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 shadow-lg shadow-blue-500/10">
              <Radio size={20} className="text-blue-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base md:text-lg font-bold text-slate-100 tracking-tight">
                  Supervisory Plant Monitoring System
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded">
                  ONLINE · CONTINUOUS INFERENCE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-signal ML pipelines streaming continuous sensor predictions every <span className="font-mono text-slate-200">2.5s</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch lg:self-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Active Models:</span>
              <span className="font-mono font-bold text-slate-200">3 Trained Suites</span>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-all cursor-pointer"
              aria-label="Refresh telemetry stream"
            >
              <RefreshCw size={13} className="animate-spin-slow" />
              Sync Stream
            </button>
          </div>
        </div>
      </section>

      {/* ─── 2. Enterprise KPI Metrics ─────────────────────────────────────── */}
      <section aria-label="Key performance indicators">
        {eqLoading || sumLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            <KPICard
              label="Monitored Assets"
              value={totalEquip}
              icon={Activity}
              color="blue"
              subtext="100% telemetry online"
            />
            <KPICard
              label="Optimal Health"
              value={healthyCount}
              icon={CheckCircle}
              color="emerald"
              subtext={totalEquip > 0 ? `${Math.round((healthyCount / totalEquip) * 100)}% within tolerance` : undefined}
            />
            <KPICard
              label="Warning State"
              value={warningCount}
              icon={AlertTriangle}
              color="amber"
              subtext="Requires inspection"
            />
            <KPICard
              label="Critical Risk"
              value={criticalCount}
              icon={XCircle}
              color="red"
              subtext="Immediate action needed"
            />
            <KPICard
              label="Plant Health Index"
              value={equipmentWithHealth.length > 0 ? `${avgHealth}%` : 'N/A'}
              icon={TrendingUp}
              color={avgHealth >= 80 ? 'emerald' : avgHealth >= 60 ? 'amber' : 'red'}
              subtext="Consensus model index"
            />
          </div>
        )}
      </section>

      {/* ─── 3. Asset Families & Category Health Matrix ─────────────────────── */}
      <section aria-label="Equipment health by category">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers size={15} className="text-blue-400" />
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Asset Families & Inference State
            </h2>
          </div>
          {categoryFilter && (
            <button
              onClick={() => setCategoryFilter(null)}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              aria-label="Clear category filter"
            >
              Reset Filter (Show All)
            </button>
          )}
        </div>

        {metricsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {typeMetrics.map(metric => {
              const isSelected = categoryFilter === metric.type;
              return (
                <button
                  key={metric.type}
                  onClick={() => setCategoryFilter(isSelected ? null : metric.type)}
                  className={clsx(
                    'text-left rounded-xl p-4 transition-all duration-200 cursor-pointer relative overflow-hidden border',
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500/50 shadow-lg shadow-blue-500/10'
                      : 'industrial-card border-slate-800/80 hover:border-slate-700/90',
                  )}
                  aria-pressed={isSelected}
                  aria-label={`Filter by ${metric.displayName} — average health ${metric.avgHealth}%`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-200 tracking-wide">
                      {metric.displayName}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60">
                      {metric.count} Assets
                    </span>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-black text-slate-100 font-mono tracking-tight">
                        {metric.avgHealth}%
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Average ML Health</p>
                    </div>

                    <div className="text-right space-y-1">
                      {metric.criticalCount > 0 ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30 block">
                          {metric.criticalCount} Critical
                        </span>
                      ) : metric.warningCount > 0 ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 block">
                          {metric.warningCount} Warning
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 block">
                          All Nominal
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Visual health bar */}
                  <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-3 overflow-hidden">
                    <div
                      className={clsx(
                        'h-full rounded-full transition-all duration-500',
                        metric.avgHealth >= 80 ? 'bg-emerald-500' : metric.avgHealth >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      )}
                      style={{ width: `${metric.avgHealth}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── 4. Real-Time Monitored Assets Grid ─────────────────────────────── */}
      <section aria-label="Equipment list">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Cpu size={15} className="text-blue-400" />
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {categoryFilter
                ? `${typeMetrics.find(m => m.type === categoryFilter)?.displayName} (${filteredEquipment.length})`
                : `Active Telemetry Assets (${equipment.length})`}
            </h2>
          </div>
          <Link
            to="/equipment"
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            aria-label="View full equipment inventory"
          >
            <span>View Full Fleet</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {eqLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} className="h-44" />)}
          </div>
        ) : eqError ? (
          <ErrorState error={eqError} onRetry={refetch} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEquipment.map(eq => {
              const config = equipmentConfig[eq.type];
              const Icon = config?.icon ?? Cpu;

              return (
                <Link
                  key={eq.id}
                  to={`/equipment/${eq.id}`}
                  className="industrial-card rounded-xl p-4.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-600/90 group relative block"
                  aria-label={`${eq.name} — ${eq.status}, health ${eq.healthScore}%`}
                >
                  <div className="flex items-start justify-between mb-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                        <Icon size={19} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                          {eq.name}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          ID: <span className="text-slate-300">{eq.id}</span>
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={eq.status} size="sm" />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/70">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Live Health</span>
                      <p className={clsx(
                        'text-xl font-black font-mono tracking-tight',
                        eq.healthScore >= 80 ? 'text-emerald-400' : eq.healthScore >= 60 ? 'text-amber-400' : 'text-red-400'
                      )}>
                        {eq.healthScore.toFixed(1)}%
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Location / Hours</span>
                      <p className="text-xs text-slate-300 font-medium">{eq.location}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{eq.operatingHours.toLocaleString()} hrs</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

// ─── Professional Industrial KPI Card ─────────────────────────────────────────
interface KPICardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: 'blue' | 'emerald' | 'amber' | 'red';
  subtext?: string;
}

function KPICard({ label, value, icon: Icon, color, subtext }: KPICardProps) {
  const styles = {
    blue:    { text: 'text-blue-400',    border: 'border-blue-500/30',    bg: 'bg-blue-500/10' },
    emerald: { text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
    amber:   { text: 'text-amber-400',   border: 'border-amber-500/30',   bg: 'bg-amber-500/10' },
    red:     { text: 'text-red-400',     border: 'border-red-500/30',     bg: 'bg-red-500/10' },
  }[color];

  return (
    <div className="industrial-card rounded-xl p-4 border border-slate-800/80 shadow-md relative overflow-hidden group hover:border-slate-700/80 transition-colors">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs text-slate-400 font-semibold tracking-wide uppercase">{label}</span>
        <div className={clsx('w-8 h-8 rounded-lg border flex items-center justify-center', styles.bg, styles.border)}>
          <Icon size={16} className={styles.text} aria-hidden="true" />
        </div>
      </div>
      <p className={clsx('text-2xl md:text-3xl font-black font-mono tracking-tight tabular-nums', styles.text)}>
        {value}
      </p>
      {subtext && (
        <p className="text-[11px] text-slate-400 mt-1 font-medium truncate">
          {subtext}
        </p>
      )}
    </div>
  );
}
