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

const SEVERITY_BORDER = {
  critical: 'border-l-red-500',
  warning:  'border-l-amber-500',
  info:     'border-l-blue-500',
};

const SEVERITY_BG = {
  critical: 'bg-red-500/5',
  warning:  'bg-amber-500/5',
  info:     'bg-blue-500/5',
};

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
      <div className={clsx('bg-slate-800/50 rounded-xl border border-slate-700/50 p-8 text-center', className)}>
        <CheckCircle size={32} className="text-emerald-500 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-300">No active alerts</p>
        <p className="text-xs text-slate-500 mt-1">This equipment is operating normally.</p>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-2', className)}>
      {displayed.map(alert => {
        const Icon = SEVERITY_ICONS[alert.severity] ?? AlertTriangle;
        return (
          <div
            key={alert.id}
            className={clsx(
              'rounded-xl border border-slate-700/50 border-l-2 p-4 transition-all',
              SEVERITY_BORDER[alert.severity],
              SEVERITY_BG[alert.severity],
              alert.status !== 'active' && 'opacity-60',
            )}
          >
            <div className="flex items-start gap-3">
              <Icon
                size={16}
                className={clsx(
                  'flex-shrink-0 mt-0.5',
                  alert.severity === 'critical' ? 'text-red-400' :
                  alert.severity === 'warning'  ? 'text-amber-400' : 'text-blue-400',
                )}
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-200">{alert.title}</span>
                  <StatusBadge status={alert.severity} size="sm" />
                  {alert.status !== 'active' && (
                    <span className="text-xs text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded capitalize">
                      {alert.status}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-2">{alert.message}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>{getRelativeTime(alert.triggeredAt)}</span>
                  {alert.parameterKey && (
                    <span>
                      {alert.parameterKey}: <span className="text-slate-300">{alert.parameterValue?.toFixed(2)}</span>
                      {' '}(threshold: {alert.threshold})
                    </span>
                  )}
                  {!equipmentId && (
                    <Link
                      to={`/equipment/${alert.equipmentId}`}
                      className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {alert.equipmentName}
                      <ChevronRight size={10} />
                    </Link>
                  )}
                </div>
              </div>

              {/* Actions */}
              {showActions && alert.status === 'active' && (
                <div className="flex flex-col gap-1 flex-shrink-0">
                  {onAcknowledge && (
                    <button
                      onClick={() => onAcknowledge(alert.id)}
                      className="text-xs px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors"
                      aria-label={`Acknowledge alert: ${alert.title}`}
                    >
                      Acknowledge
                    </button>
                  )}
                  {onResolve && (
                    <button
                      onClick={() => onResolve(alert.id)}
                      className="text-xs px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors"
                      aria-label={`Resolve alert: ${alert.title}`}
                    >
                      Resolve
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
