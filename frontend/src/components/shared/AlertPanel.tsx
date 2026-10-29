import React from 'react';
import { AlertTriangle, XCircle, CheckCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Alert } from '../../types';
import { StatusBadge } from './StatusBadge';
import { getRelativeTime } from '../../utils/chartData';
import { clsx } from 'clsx';

interface AlertPanelProps {
  alerts: Alert[];
  equipmentId?: string;
  onAcknowledge?: (id: string) => void;
  onResolve?: (id: string) => void;
  maxItems?: number;
  showActions?: boolean;
  className?: string;
}

const SEVERITY_ICONS = {
  critical: XCircle,
  warning:  AlertTriangle,
  info:     CheckCircle,
};

/**
 * AlertPanel — filterable alert list with acknowledge/resolve actions.
 * Can be used inline on equipment detail page or as full page list.
 */
export function AlertPanel({
  alerts,
  equipmentId,
  onAcknowledge,
  onResolve,
  maxItems,
  showActions = true,
  className,
}: AlertPanelProps): React.ReactElement {
  const displayed = maxItems ? alerts.slice(0, maxItems) : alerts;

  if (displayed.length === 0) {
    return (
      <div className={clsx('industrial-card rounded-2xl border border-slate-800/80 p-8 text-center', className)}>
        <CheckCircle size={32} className="text-emerald-400 mx-auto mb-2 opacity-90" />
        <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">NO ACTIVE ALARMS DETECTED</p>
        <p className="text-xs font-mono text-slate-500 mt-1">All monitored subsystem telemetry channels within nominal operating thresholds.</p>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-2.5', className)}>
      {displayed.map(alert => {
        const Icon = SEVERITY_ICONS[alert.severity] ?? AlertTriangle;
        return (
          <div
            key={alert.id}
            className={clsx(
              'rounded-xl border border-slate-800/90 border-l-4 p-4 transition-all shadow-md',
              alert.severity === 'critical' ? 'border-l-rose-500 bg-rose-950/10' :
              alert.severity === 'warning'  ? 'border-l-amber-500 bg-amber-950/10' :
              'border-l-cyan-500 bg-cyan-950/10',
              alert.status !== 'active' && 'opacity-60',
            )}
          >
            <div className="flex items-start gap-3">
              <Icon
                size={17}
                className={clsx(
                  'flex-shrink-0 mt-0.5',
                  alert.severity === 'critical' ? 'text-rose-400' :
                  alert.severity === 'warning'  ? 'text-amber-400' : 'text-cyan-400',
                )}
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-slate-500">[{alert.id.slice(0, 8)}]</span>
                  <span className="text-sm font-semibold text-slate-100">{alert.title}</span>
                  <StatusBadge status={alert.severity} size="sm" />
                  {alert.status !== 'active' && (
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded uppercase">
                      {alert.status}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-2 font-sans">{alert.message}</p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-500">
                  <span>TIME: <span className="text-slate-300">{getRelativeTime(alert.triggeredAt)}</span></span>
                  {alert.parameterKey && (
                    <span>
                      {alert.parameterKey.toUpperCase()}: <span className="text-slate-200 font-semibold">{alert.parameterValue?.toFixed(2)}</span>
                      {' '}(LIMIT: <span className="text-amber-400">{alert.threshold}</span>)
                    </span>
                  )}
                  {!equipmentId && (
                    <Link
                      to={`/equipment/${alert.equipmentId}`}
                      className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors uppercase"
                    >
                      {alert.equipmentName}
                      <ChevronRight size={10} />
                    </Link>
                  )}
                </div>
              </div>

              {/* Actions */}
              {showActions && alert.status === 'active' && (
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  {onAcknowledge && (
                    <button
                      onClick={() => onAcknowledge(alert.id)}
                      className="text-[11px] font-mono font-semibold px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded transition-colors"
                      aria-label={`Acknowledge alert: ${alert.title}`}
                    >
                      ACK
                    </button>
                  )}
                  {onResolve && (
                    <button
                      onClick={() => onResolve(alert.id)}
                      className="text-[11px] font-mono font-semibold px-2.5 py-1 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 rounded transition-colors"
                      aria-label={`Resolve alert: ${alert.title}`}
                    >
                      RESOLVE
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
