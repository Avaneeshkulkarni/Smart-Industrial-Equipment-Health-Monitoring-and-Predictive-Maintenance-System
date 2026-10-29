import React from 'react';
import { Wrench, Clock, User, Calendar } from 'lucide-react';
import type { MaintenanceRecommendation, WorkOrder, WorkOrderStatus } from '../../types';
import { PRIORITY_ORDER } from '../../utils/health';
import { clsx } from 'clsx';

interface MaintenancePanelProps {
  recommendations: MaintenanceRecommendation[];
  workOrders: WorkOrder[];
  onUpdateStatus?: (id: string, status: WorkOrderStatus) => void;
  className?: string;
}

const PRIORITY_COLORS = {
  critical: 'text-red-400 bg-red-500/10 border-red-500/20',
  high:     'text-orange-400 bg-orange-500/10 border-orange-500/20',
  medium:   'text-amber-400 bg-amber-500/10 border-amber-500/20',
  low:      'text-blue-400 bg-blue-500/10 border-blue-500/20',
};

const STATUS_COLORS: Record<WorkOrderStatus, string> = {
  'pending':     'text-slate-400 bg-slate-700/50',
  'scheduled':   'text-blue-400 bg-blue-500/10',
  'in-progress': 'text-amber-400 bg-amber-500/10',
  'completed':   'text-emerald-400 bg-emerald-500/10',
};

const STATUS_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus | null> = {
  'pending':     'scheduled',
  'scheduled':   'in-progress',
  'in-progress': 'completed',
  'completed':   null,
};

/**
 * MaintenancePanel — recommendations and work orders for an equipment.
 */
export function MaintenancePanel({
  recommendations,
  workOrders,
  onUpdateStatus,
  className,
}: MaintenancePanelProps): React.ReactElement {
  const sortedRecs = [...recommendations].sort((a, b) =>
    (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99)
  );

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Recommendations */}
      {sortedRecs.length > 0 && (
        <div>
          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
            Predictive Maintenance Recommendations
          </h4>
          <div className="space-y-3">
            {sortedRecs.map(rec => (
              <div
                key={rec.id}
                className="industrial-card rounded-2xl border border-slate-800/80 p-5 shadow-lg"
              >
                <div className="flex flex-wrap items-start gap-2 mb-2">
                  <span className="flex-1 text-sm font-semibold text-slate-100">{rec.title}</span>
                  <span className={clsx('text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase', PRIORITY_COLORS[rec.priority])}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3 font-sans">{rec.description}</p>
                <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                  {rec.estimatedCost && (
                    <span>EST. COST: <span className="text-emerald-400 font-semibold">${rec.estimatedCost.toLocaleString()}</span></span>
                  )}
                  {rec.estimatedDowntime && (
                    <span>EST. DOWNTIME: <span className="text-amber-400 font-semibold">{rec.estimatedDowntime}h</span></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Work Orders */}
      {workOrders.length > 0 && (
        <div>
          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
            Active Work Orders & Dispatch
          </h4>
          <div className="space-y-3">
            {workOrders.map(wo => {
              const nextStatus = STATUS_TRANSITIONS[wo.status];
              return (
                <div
                  key={wo.id}
                  className="industrial-card rounded-2xl border border-slate-800/80 p-5 shadow-lg"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[11px] text-cyan-400 font-mono font-bold">[{wo.id}]</span>
                      <p className="text-sm font-semibold text-slate-100 mt-0.5">{wo.issue}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={clsx('text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase', PRIORITY_COLORS[wo.priority])}>
                        {wo.priority}
                      </span>
                      <span className={clsx('text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase', STATUS_COLORS[wo.status])}>
                        {wo.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs font-mono text-slate-400 mb-3">
                    {wo.technician && (
                      <span className="flex items-center gap-1.5">
                        <User size={11} className="text-slate-500" aria-hidden="true" />
                        TECH: <span className="text-slate-200">{wo.technician}</span>
                      </span>
                    )}
                    {wo.scheduledDate && (
                      <span className="flex items-center gap-1.5">
                        <Calendar size={11} className="text-slate-500" aria-hidden="true" />
                        DATE: <span className="text-slate-200">{wo.scheduledDate}</span>
                      </span>
                    )}
                    {wo.estimatedDuration && (
                      <span className="flex items-center gap-1.5">
                        <Clock size={11} className="text-slate-500" aria-hidden="true" />
                        DURATION: <span className="text-slate-200">{wo.estimatedDuration}h</span>
                      </span>
                    )}
                  </div>

                  {wo.notes && (
                    <p className="text-xs font-sans text-slate-400 bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 mb-3">
                      {wo.notes}
                    </p>
                  )}

                  {onUpdateStatus && nextStatus && (
                    <button
                      onClick={() => onUpdateStatus(wo.id, nextStatus)}
                      className="text-xs font-mono font-semibold px-3 py-1.5 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 rounded-lg transition-colors uppercase tracking-wider"
                      aria-label={`Advance work order ${wo.id} to ${nextStatus}`}
                    >
                      Advance → {nextStatus.replace('-', ' ')}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {sortedRecs.length === 0 && workOrders.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <Wrench size={24} className="mx-auto mb-2 text-slate-600" />
          <p className="text-sm">No maintenance items for this equipment.</p>
        </div>
      )}
    </div>
  );
}
