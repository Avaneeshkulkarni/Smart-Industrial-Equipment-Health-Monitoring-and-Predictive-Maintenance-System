import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wrench } from 'lucide-react';
import { fetchRecommendations } from '../services/maintenanceApi';
import { MaintenancePanel } from '../components/shared/MaintenancePanel';
import { SkeletonCard, ErrorState, Toast } from '../components/shared/Feedback';
import { useWorkOrderStore } from '../store/workOrderStore';
import type { WorkOrderStatus, WorkOrderPriority } from '../types';
import { PRIORITY_ORDER } from '../utils/health';
import { clsx } from 'clsx';

type WOFilter = 'all' | WorkOrderStatus;

const WO_TABS: { value: WOFilter; label: string }[] = [
  { value: 'all',         label: 'All' },
  { value: 'pending',     label: 'Pending' },
  { value: 'scheduled',   label: 'Scheduled' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed',   label: 'Completed' },
];

const STATUS_COLORS: Record<WorkOrderStatus, string> = {
  'pending':     'text-slate-400 bg-slate-700/50',
  'scheduled':   'text-blue-400 bg-blue-500/10',
  'in-progress': 'text-amber-400 bg-amber-500/10',
  'completed':   'text-emerald-400 bg-emerald-500/10',
};

const PRIORITY_COLORS: Record<WorkOrderPriority, string> = {
  critical: 'text-red-400',
  high:     'text-orange-400',
  medium:   'text-amber-400',
  low:      'text-blue-400',
};

export function Maintenance(): React.ReactElement {
  const [woTab, setWoTab] = useState<WOFilter>('all');
  const [toast, setToast] = useState<string | null>(null);
  const { workOrders, updateStatus } = useWorkOrderStore();

  const { data: recommendations = [], isLoading: recLoading, error: recError, refetch } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => fetchRecommendations(),
  });

  const filteredWOs = workOrders.filter(wo =>
    woTab === 'all' || wo.status === woTab
  ).sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Wrench size={20} className="text-slate-400" aria-hidden="true" />
          Maintenance
        </h1>
        <div className="text-xs text-slate-500">
          {workOrders.filter(w => w.status === 'pending' || w.status === 'in-progress').length} active work orders
        </div>
      </div>

      {/* ─── Recommendations ─────────────────────────────────────────────── */}
      <section aria-label="Maintenance recommendations">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Active Recommendations
        </h2>
        {recLoading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : recError ? (
          <ErrorState error={recError} onRetry={refetch} />
        ) : (
          <MaintenancePanel
            recommendations={recommendations}
            workOrders={[]}
          />
        )}
      </section>

      {/* ─── Work Orders ─────────────────────────────────────────────────── */}
      <section aria-label="Work orders">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Work Orders</h2>
        </div>

        {/* Status tabs */}
        <div className="flex flex-wrap gap-1 bg-slate-900/50 rounded-xl p-1 mb-4" role="tablist" aria-label="Work order status filter">
          {WO_TABS.map(t => {
            const count = t.value === 'all'
              ? workOrders.length
              : workOrders.filter(w => w.status === t.value).length;
            return (
              <button
                key={t.value}
                role="tab"
                aria-selected={woTab === t.value}
                onClick={() => setWoTab(t.value)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  woTab === t.value ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800',
                )}
              >
                {t.label}
                <span className={clsx('text-xs rounded-full px-1.5 min-w-[18px] text-center', woTab === t.value ? 'bg-white/20' : 'bg-slate-700')}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Work order table */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          {filteredWOs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">No work orders for this filter.</div>
          ) : (
            <table className="w-full" role="grid" aria-label="Work orders table">
              <thead>
                <tr className="border-b border-slate-700 text-xs text-slate-400 uppercase tracking-wide">
                  <th className="text-left px-4 py-3 font-semibold">ID</th>
                  <th className="text-left px-4 py-3 font-semibold">Equipment</th>
                  <th className="text-left px-4 py-3 font-semibold">Issue</th>
                  <th className="text-left px-4 py-3 font-semibold">Priority</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Technician</th>
                  <th className="text-left px-4 py-3 font-semibold">Scheduled</th>
                  <th className="px-4 py-3" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {filteredWOs.map(wo => {
                  const nextStatusMap: Record<WorkOrderStatus, WorkOrderStatus | null> = {
                    'pending': 'scheduled', 'scheduled': 'in-progress', 'in-progress': 'completed', 'completed': null,
                  };
                  const nextStatus = nextStatusMap[wo.status];
                  return (
                    <tr key={wo.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-slate-500">{wo.id}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{wo.equipmentName}</td>
                      <td className="px-4 py-3 text-xs text-slate-400 max-w-xs truncate">{wo.issue}</td>
                      <td className="px-4 py-3">
                        <span className={clsx('text-xs font-semibold capitalize', PRIORITY_COLORS[wo.priority])}>
                          {wo.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium capitalize', STATUS_COLORS[wo.status])}>
                          {wo.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">{wo.technician ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{wo.scheduledDate ?? '—'}</td>
                      <td className="px-4 py-3">
                        {nextStatus && (
                          <button
                            onClick={() => {
                              updateStatus(wo.id, nextStatus);
                              setToast(`Work order ${wo.id} advanced to ${nextStatus.replace('-', ' ')}.`);
                            }}
                            className="text-xs px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-600/30 text-blue-400 rounded transition-colors whitespace-nowrap"
                            aria-label={`Advance ${wo.id} to ${nextStatus}`}
                          >
                            → {nextStatus.replace('-', ' ')}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {toast && <Toast message={toast} type="success" onClose={() => setToast(null)} />}
    </div>
  );
}
