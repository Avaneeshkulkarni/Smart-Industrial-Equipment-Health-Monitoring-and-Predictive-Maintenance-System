import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, LayoutGrid, List, ArrowUpDown, ChevronRight, Cpu } from 'lucide-react';
import { fetchEquipment } from '../services/equipmentApi';
import { StatusBadge } from '../components/shared/StatusBadge';
import { SkeletonCard, EmptyState, ErrorState } from '../components/shared/Feedback';
import equipmentConfig from '../config/equipmentConfig';
import type { EquipmentType, EquipmentStatus } from '../types';
import { clsx } from 'clsx';

type SortBy = 'healthScore' | 'name' | 'id' | 'operatingHours';
type ViewMode = 'grid' | 'list';

const TYPE_FILTERS: { value: EquipmentType | ''; label: string }[] = [
  { value: '', label: 'All Active ML Equipment' },
  { value: 'cnc_machine',    label: 'CNC Machining Centers' },
  { value: 'compressor',     label: 'Industrial Compressors' },
  { value: 'pump',           label: 'Centrifugal Pumps' },
];

const STATUS_FILTERS: { value: EquipmentStatus | ''; label: string }[] = [
  { value: '', label: 'All Operational States' },
  { value: 'healthy',  label: 'Optimal (Healthy)' },
  { value: 'warning',  label: 'Warning (Degradation)' },
  { value: 'critical', label: 'Critical Risk' },
  { value: 'offline',  label: 'Offline (Standby)' },
];

/**
 * Enterprise Equipment List page
 * Provides mission-control asset search, type/status multi-filters,
 * sorting, and grid/table list view toggles.
 */
export function EquipmentList(): React.ReactElement {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<EquipmentType | ''>('');
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | ''>('');
  const [sortBy, setSortBy] = useState<SortBy>('healthScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const { data: equipment = [], isLoading, error, refetch } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => fetchEquipment(),
    refetchInterval: 2500, // Real-time 2.5s polling
  });

  // Client-side filter + sort
  const filtered = equipment
    .filter(e => {
      if (typeFilter && e.type !== typeFilter) return false;
      if (statusFilter && e.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q) || e.location.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'healthScore') cmp = a.healthScore - b.healthScore;
      else if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'id') cmp = a.id.localeCompare(b.id);
      else if (sortBy === 'operatingHours') cmp = a.operatingHours - b.operatingHours;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  function toggleSort(field: SortBy) {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('asc'); }
  }

  return (
    <div className="space-y-6">
      {/* ─── Header & Telemetry Status ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold text-slate-100 tracking-tight">
              Production Equipment Fleet
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 rounded">
              SCADA ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-signal ML predictions and health scores for active assets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">
            Showing <strong className="text-slate-200">{filtered.length}</strong> of {equipment.length} assets
          </span>
        </div>
      </div>

      {/* ─── Filter Bar ────────────────────────────────────────────────────── */}
      <div className="industrial-card rounded-xl p-3 md:p-3.5 border border-slate-800/80 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-56">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            id="equipment-search"
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by asset name, serial, ID, bay location…"
            className="w-full bg-slate-900/90 border border-slate-700/80 text-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs font-medium focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500"
            aria-label="Search equipment"
          />
        </div>

        {/* Type Filter */}
        <div className="relative">
          <select
            id="type-filter"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as EquipmentType | '')}
            className="appearance-none bg-slate-900 border border-slate-700/80 text-slate-200 text-xs font-medium rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
            aria-label="Filter by equipment type"
          >
            {TYPE_FILTERS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            id="status-filter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as EquipmentStatus | '')}
            className="appearance-none bg-slate-900 border border-slate-700/80 text-slate-200 text-xs font-medium rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
            aria-label="Filter by status"
          >
            {STATUS_FILTERS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* Sort by Health */}
        <button
          onClick={() => toggleSort('healthScore')}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer',
            sortBy === 'healthScore'
              ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
              : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:text-slate-200',
          )}
          aria-label="Sort by health score"
        >
          <ArrowUpDown size={12} />
          Sort by Health
        </button>

        {/* View Mode Toggle */}
        <div className="flex bg-slate-900 border border-slate-700/80 rounded-lg overflow-hidden ml-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={clsx(
              'p-1.5 transition-colors cursor-pointer',
              viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200',
            )}
            aria-pressed={viewMode === 'grid'}
            aria-label="Grid view"
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={clsx(
              'p-1.5 transition-colors cursor-pointer',
              viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200',
            )}
            aria-pressed={viewMode === 'list'}
            aria-label="List view"
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* ─── Fleet Content ─────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4'
          : 'space-y-2.5'
        }>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} className="h-44" />)}
        </div>
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching equipment found"
          description="Try broadening your search term or clearing active filters."
          action={
            <button
              onClick={() => { setSearch(''); setTypeFilter(''); setStatusFilter(''); }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {filtered.map(eq => {
            const cfg = equipmentConfig[eq.type];
            const Icon = cfg?.icon ?? Cpu;

            return (
              <Link
                key={eq.id}
                to={`/equipment/${eq.id}`}
                className="industrial-card rounded-xl p-4.5 border border-slate-800/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-600/90 group relative block"
                aria-label={`${eq.name}, ${eq.status}, health ${eq.healthScore}%`}
              >
                <div className="flex items-start justify-between mb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                      <Icon size={19} aria-hidden="true" />
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
      ) : (
        /* List View */
        <div className="space-y-2">
          {filtered.map(eq => {
            const cfg = equipmentConfig[eq.type];
            const Icon = cfg?.icon ?? Cpu;

            return (
              <Link
                key={eq.id}
                to={`/equipment/${eq.id}`}
                className="industrial-card rounded-xl p-3.5 border border-slate-800/80 flex items-center justify-between gap-4 hover:border-slate-600/90 transition-all group"
                aria-label={`${eq.name}, ${eq.status}`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-blue-400 flex-shrink-0">
                    <Icon size={17} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors truncate">
                      {eq.name}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">{eq.id} · {eq.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden sm:block text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Run Time</span>
                    <span className="text-xs font-mono text-slate-300">{eq.operatingHours.toLocaleString()} hrs</span>
                  </div>
                  <div className="text-right min-w-20">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Health</span>
                    <span className={clsx(
                      'text-sm font-bold font-mono',
                      eq.healthScore >= 80 ? 'text-emerald-400' : eq.healthScore >= 60 ? 'text-amber-400' : 'text-red-400'
                    )}>
                      {eq.healthScore.toFixed(1)}%
                    </span>
                  </div>
                  <StatusBadge status={eq.status} size="sm" />
                  <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-300 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
