import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { fetchAlerts, acknowledgeAlert, resolveAlert } from '../services/alertApi';
import { AlertPanel } from '../components/shared/AlertPanel';
import { SkeletonCard, ErrorState, ConfirmDialog, Toast } from '../components/shared/Feedback';
import type { AlertSeverity, AlertStatus } from '../types';
import { clsx } from 'clsx';

type FilterTab = 'all' | AlertSeverity | AlertStatus;

const TABS: { value: FilterTab; label: string }[] = [
  { value: 'all',          label: 'All' },
  { value: 'critical',     label: 'Critical' },
  { value: 'warning',      label: 'Warning' },
  { value: 'info',         label: 'Info' },
  { value: 'active',       label: 'Active' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'resolved',     label: 'Resolved' },
];

export function Alerts(): React.ReactElement {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<FilterTab>('all');
  const [confirmAction, setConfirmAction] = useState<{ type: 'ack' | 'resolve'; alertId: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { data: alerts = [], isLoading, error, refetch } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => fetchAlerts(),
    refetchInterval: 15000,
  });

  const ackMutation = useMutation({
    mutationFn: (alertId: string) => acknowledgeAlert(alertId, 'Current User'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setToast({ message: 'Alert acknowledged.', type: 'success' });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (alertId: string) => resolveAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setToast({ message: 'Alert resolved.', type: 'success' });
    },
  });

  const filtered = alerts.filter(a => {
    if (tab === 'all') return true;
    if (tab === 'critical' || tab === 'warning' || tab === 'info') return a.severity === tab;
    if (tab === 'active' || tab === 'acknowledged' || tab === 'resolved') return a.status === tab;
    return true;
  });

  const counts = {
    all: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    info: alerts.filter(a => a.severity === 'info').length,
    active: alerts.filter(a => a.status === 'active').length,
    acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Bell size={20} className="text-slate-400" aria-hidden="true" />
          Alerts
        </h1>
        <span className="text-xs text-slate-500">{counts.active} active · {alerts.length} total</span>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-slate-900/50 rounded-xl p-1" role="tablist" aria-label="Alert filters">
        {TABS.map(t => (
          <button
            key={t.value}
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => setTab(t.value)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              tab === t.value
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800',
            )}
          >
            {t.label}
            <span className={clsx(
              'text-xs rounded-full px-1.5 py-0.5 font-bold',
              tab === t.value ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400',
            )}>
              {counts[t.value as keyof typeof counts] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Alert list */}
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <AlertPanel
          alerts={filtered}
          onAcknowledge={(id) => setConfirmAction({ type: 'ack', alertId: id })}
          onResolve={(id) => setConfirmAction({ type: 'resolve', alertId: id })}
        />
      )}

      {/* Confirm dialog for destructive actions */}
      <ConfirmDialog
        open={!!confirmAction}
        title={confirmAction?.type === 'ack' ? 'Acknowledge Alert' : 'Resolve Alert'}
        description={
          confirmAction?.type === 'ack'
            ? 'Mark this alert as acknowledged? This confirms you have reviewed it.'
            : 'Mark this alert as resolved? This indicates the issue has been addressed.'
        }
        confirmLabel={confirmAction?.type === 'ack' ? 'Acknowledge' : 'Resolve'}
        onConfirm={() => {
          if (!confirmAction) return;
          if (confirmAction.type === 'ack') ackMutation.mutate(confirmAction.alertId);
          else resolveMutation.mutate(confirmAction.alertId);
          setConfirmAction(null);
        }}
        onCancel={() => setConfirmAction(null)}
      />

      {/* Toast notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
