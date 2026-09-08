import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { fetchEquipmentById } from '../services/equipmentApi';
import { fetchCurrentReadings } from '../services/sensorApi';
import { fetchPredictions } from '../services/predictionApi';
import { fetchAlerts, acknowledgeAlert, resolveAlert } from '../services/alertApi';
import { fetchRecommendations, fetchMaintenanceHistory } from '../services/maintenanceApi';
import { EquipmentHeader } from '../components/shared/EquipmentHeader';
import { HealthScoreCard } from '../components/shared/HealthScoreCard';
import { SensorCard } from '../components/shared/SensorCard';
import { SensorChart } from '../components/shared/SensorChart';
import { PredictionPanel } from '../components/shared/PredictionPanel';
import { RULCard } from '../components/shared/RULCard';
import { AlertPanel } from '../components/shared/AlertPanel';
import { MaintenancePanel } from '../components/shared/MaintenancePanel';
import { LoadingSpinner, SkeletonCard, SkeletonSensorGrid, ErrorState } from '../components/shared/Feedback';
import { useWorkOrderStore } from '../store/workOrderStore';
import equipmentConfig from '../config/equipmentConfig';

import { clsx } from 'clsx';

/**
 * EquipmentDetails — ONE component for ALL four equipment types.
 * Driven by equipmentConfig.ts — adding a future type requires zero changes here.
 *
 * Priority order (per spec):
 *   Status → Health Score → RUL → Active Alerts → Current Sensor Readings →
 *   Historical Charts → Anomaly Detection → Fault Diagnosis → Maintenance
 */
export function EquipmentDetails(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { workOrders, updateStatus } = useWorkOrderStore();

  // ─── Queries ───────────────────────────────────────────────────────────────
  const { data: equipment, isLoading: eqLoading, error: eqError } = useQuery({
    queryKey: ['equipment', id],
    queryFn: () => fetchEquipmentById(id!),
    enabled: !!id,
  });

  const { data: readings, isLoading: readingsLoading } = useQuery({
    queryKey: ['currentReadings', id],
    queryFn: () => fetchCurrentReadings(id!),
    enabled: !!id,
    refetchInterval: 5000,
  });

  const { data: prediction, isLoading: predLoading } = useQuery({
    queryKey: ['predictions', id],
    queryFn: () => fetchPredictions(id!),
    enabled: !!id,
    refetchInterval: 30000,
  });

  const { data: allAlerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => fetchAlerts(),
    refetchInterval: 15000,
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ['recommendations', id],
    queryFn: () => fetchRecommendations(id),
    enabled: !!id,
  });

  const { data: history = [] } = useQuery({
    queryKey: ['maintenanceHistory', id],
    queryFn: () => fetchMaintenanceHistory(id),
    enabled: !!id,
  });

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const ackMutation = useMutation({
    mutationFn: (alertId: string) => acknowledgeAlert(alertId, 'Current User'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });

  const resolveMutation = useMutation({
    mutationFn: (alertId: string) => resolveAlert(alertId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });

  // ─── Loading / Error ───────────────────────────────────────────────────────
  if (eqLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (eqError || !equipment) {
    return (
      <div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-4">
          <ArrowLeft size={16} /> Back
        </button>
        <ErrorState error={eqError ?? new Error('Equipment not found')} onRetry={() => queryClient.invalidateQueries({ queryKey: ['equipment', id] })} />
      </div>
    );
  }

  // ─── Derived data ──────────────────────────────────────────────────────────
  const config = equipmentConfig[equipment.type];
  const activeAlerts = allAlerts.filter(a => a.equipmentId === id && a.status === 'active');
  const equipmentWorkOrders = workOrders.filter(wo => wo.equipmentId === id && wo.status !== 'completed');

  // Sensor cards — only for THIS equipment type's parameters (no cross-contamination)
  const parameters = config.parameters;

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors -mt-1"
        aria-label="Go back"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to Equipment
      </button>

      {/* ── 1. Equipment Header (status visible) ──────────────────────────── */}
      <EquipmentHeader equipment={equipment} />

      {/* ── 2. Health Score + 3. RUL + alerts count ──────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Health Score */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5 flex flex-col items-center justify-center text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">
            Health Score
          </p>
          <HealthScoreCard score={equipment.healthScore} size="lg" />
          <p className="text-xs text-slate-500 mt-4">
            Trend: <span className={clsx(
              equipment.healthScore >= 90 ? 'text-emerald-400' :
              equipment.healthScore >= 70 ? 'text-amber-400' : 'text-red-400',
            )}>
              {equipment.healthScore >= 90 ? 'Stable' : equipment.healthScore >= 70 ? 'Degrading' : 'Declining'}
            </span>
          </p>
        </div>

        {/* RUL */}
        {predLoading ? (
          <SkeletonCard />
        ) : prediction ? (
          <RULCard rul={prediction.rul} />
        ) : (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5 flex items-center justify-center text-slate-500 text-sm">
            RUL data unavailable
          </div>
        )}

        {/* Quick stats */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5 space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Quick Stats</p>
          <QuickStat label="Active Alerts" value={activeAlerts.length} danger={activeAlerts.length > 0} />
          <QuickStat label="Open Work Orders" value={equipmentWorkOrders.length} />
          <QuickStat label="Operating Hours" value={equipment.operatingHours.toLocaleString()} />
          <QuickStat label="Last Maintenance" value={equipment.lastMaintenanceDate} />
          <QuickStat label="Next Scheduled" value={equipment.nextMaintenanceDate} />
        </div>
      </div>

      {/* ── 4. Active Alerts ──────────────────────────────────────────────── */}
      <section aria-label="Active alerts">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-300">
            Active Alerts
            {activeAlerts.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                {activeAlerts.length}
              </span>
            )}
          </h2>
        </div>
        <AlertPanel
          alerts={activeAlerts}
          equipmentId={id}
          onAcknowledge={(alertId) => ackMutation.mutate(alertId)}
          onResolve={(alertId) => resolveMutation.mutate(alertId)}
        />
      </section>

      {/* ── 5. Current Sensor Readings ────────────────────────────────────── */}
      <section aria-label="Current sensor readings">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">
          Current Sensor Readings
          <span className="ml-2 text-xs text-slate-500 font-normal">(live · refreshes every 5s)</span>
        </h2>
        {readingsLoading ? (
          <SkeletonSensorGrid count={parameters.length} />
        ) : readings ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {parameters.map(param => {
              const value = readings.values[param.key];
              if (value === undefined) return null;
              return (
                <SensorCard
                  key={param.key}
                  parameter={param}
                  value={value}
                  equipmentId={id!}
                  showSparkline
                />
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No sensor readings available.</p>
        )}
      </section>

      {/* ── 6. Historical Trend Charts ────────────────────────────────────── */}
      <section aria-label="Historical sensor trends">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">Historical Trends</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {parameters.slice(0, 4).map(param => (
            <SensorChart
              key={param.key}
              equipmentId={id!}
              parameter={param}
            />
          ))}
        </div>
      </section>

      {/* ── 7. Anomaly Detection + 8. Fault Diagnosis ─────────────────────── */}
      <section aria-label="Anomaly detection and fault diagnosis">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">Anomaly Detection & Fault Diagnosis</h2>
        {predLoading ? (
          <SkeletonCard className="h-64" />
        ) : prediction ? (
          <PredictionPanel prediction={prediction} />
        ) : (
          <p className="text-sm text-slate-500">Prediction data unavailable.</p>
        )}
      </section>

      {/* ── 9. Maintenance Recommendation + 10. History ─────────────────── */}
      <section aria-label="Maintenance">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">Maintenance</h2>
        <MaintenancePanel
          recommendations={recommendations}
          workOrders={equipmentWorkOrders}
          onUpdateStatus={updateStatus}
        />

        {/* Maintenance History */}
        {history.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Maintenance History
            </h3>
            <div className="space-y-2">
              {history.map(record => (
                <div key={record.id} className="bg-slate-800/30 rounded-lg border border-slate-700/30 px-4 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                    <span className="text-sm font-medium text-slate-300">{record.description}</span>
                    <span className="text-xs text-slate-500">{record.date}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="capitalize">{record.type}</span>
                    <span>·</span>
                    <span>{record.performedBy}</span>
                    <span>·</span>
                    <span>{record.duration}h</span>
                    {record.cost !== undefined && <span>· ${record.cost}</span>}
                  </div>
                  {record.findings && (
                    <p className="text-xs text-slate-500 mt-1.5">{record.findings}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function QuickStat({ label, value, danger }: { label: string; value: string | number; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={clsx('text-xs font-semibold tabular-nums', danger ? 'text-red-400' : 'text-slate-300')}>
        {value}
      </span>
    </div>
  );
}
