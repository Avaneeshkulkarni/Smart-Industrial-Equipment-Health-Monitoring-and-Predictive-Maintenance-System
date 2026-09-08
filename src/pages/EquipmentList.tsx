import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, LayoutGrid, List, ArrowUpDown, ChevronRight } from 'lucide-react';
import { fetchEquipment } from '../services/equipmentApi';
import { HealthScoreCard } from '../components/shared/HealthScoreCard';
import { StatusBadge } from '../components/shared/StatusBadge';
import { SkeletonCard, EmptyState, ErrorState } from '../components/shared/Feedback';
import equipmentConfig from '../config/equipmentConfig';
import type { EquipmentType, EquipmentStatus } from '../types';
import { clsx } from 'clsx';

type SortBy = 'healthScore' | 'name' | 'id' | 'operatingHours';
type ViewMode = 'grid' | 'list';

const TYPE_FILTERS: { value: EquipmentType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'motor',      label: 'Motor' },
  { value: 'pump',       label: 'Pump' },
  { value: 'compressor', label: 'Compressor' },
  { value: 'cnc',        label: 'CNC' },
];

const STATUS_FILTERS: { value: EquipmentStatus | ''; label: string }[] = [
  { value: '', label: 'All Status' },
  { value: 'healthy',  label: 'Healthy' },
  { value: 'warning',  label: 'Warning' },
  { value: 'critical', label: 'Critical' },
  { value: 'offline',  label: 'Offline' },
];

/**
 * Equipment List page — search, filter by type/status, sort, grid/list toggle.
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-100">Equipment</h1>
        <span className="text-xs text-slate-500">{filtered.length} of {equipment.length} machines</span>
      </div>

      {/* ─── Filter bar ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <input
            id="equipment-search"
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, ID, location…"
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            aria-label="Search equipment"
          />
        </div>

        {/* Type filter */}
        <select
          id="type-filter"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as EquipmentType | '')}
          className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          aria-label="Filter by equipment type"
        >
          {TYPE_FILTERS.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          id="status-filter"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as EquipmentStatus | '')}
          className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          aria-label="Filter by status"
        >
          {STATUS_FILTERS.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        {/* Sort */}
        <button
          onClick={() => toggleSort('healthScore')}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-colors',
            sortBy === 'healthScore'
              ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200',
          )}
          aria-label="Sort by health score"
        >
          <ArrowUpDown size={13} />
          Health
        </button>

        {/* View mode */}
        <div className="flex bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={clsx(
              'p-2 transition-colors',
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
              'p-2 transition-colors',
              viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200',
            )}
            aria-pressed={viewMode === 'list'}
            aria-label="List view"
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* ─── Content ───────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'
          : 'space-y-2'
        }>
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No equipment found"
          description="Try adjusting your search or filters."
          action={
            <button
              onClick={() => { setSearch(''); setTypeFilter(''); setStatusFilter(''); }}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm"
            >
              Clear filters
            </button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(eq => {
            const cfg = equipmentConfig[eq.type];
            const Icon = cfg.icon;
            return (
              <Link
                key={eq.id}
                to={`/equipment/${eq.id}`}
                className="block bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-xl p-4 transition-all group"
                aria-label={`${eq.name}, ${eq.status}, health ${eq.healthScore}%`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-slate-400" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200 group-hover:text-white">{eq.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{eq.id}</p>
                    </div>
                  </div>
                  <StatusBadge status={eq.status} size="sm" />
                </div>

                <div className="flex items-center gap-3">
                  <HealthScoreCard score={eq.healthScore} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">{cfg.displayName}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{eq.location}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{eq.operatingHours.toLocaleString()} hrs</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          <table className="w-full" role="grid" aria-label="Equipment list">
            <thead>
              <tr className="border-b border-slate-700 text-xs text-slate-400 uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-semibold">Equipment</th>
                <th className="text-left px-4 py-3 font-semibold">Type</th>
                <th className="text-left px-4 py-3 font-semibold">Location</th>
                <th className="text-left px-4 py-3 font-semibold">
                  <button onClick={() => toggleSort('healthScore')} className="flex items-center gap-1 hover:text-slate-200">
                    Health <ArrowUpDown size={11} />
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">
                  <button onClick={() => toggleSort('operatingHours')} className="flex items-center gap-1 hover:text-slate-200">
                    Op. Hours <ArrowUpDown size={11} />
                  </button>
                </th>
                <th className="px-4 py-3" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(eq => {
                const cfg = equipmentConfig[eq.type];
                return (
                  <tr
                    key={eq.id}
                    className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{eq.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{eq.id}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{cfg.displayName}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{eq.location}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-slate-200 tabular-nums">{eq.healthScore}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={eq.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{eq.operatingHours.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/equipment/${eq.id}`}
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        aria-label={`View details for ${eq.name}`}
                      >
                        Details <ChevronRight size={12} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
