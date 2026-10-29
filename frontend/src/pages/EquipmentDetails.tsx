import React, { useEffect } from 'react';
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
import { MLModelPlayground } from '../components/shared/MLModelPlayground';
import { RealTimeHealthMonitor } from '../components/shared/RealTimeHealthMonitor';
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
  const { workOrders, updateStatus, initialize } = useWorkOrderStore();

  useEffect(() => { initialize(); }, [initialize]);

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
    refetchInterval: 2500,
  });

  const { data: prediction, isLoading: predLoading } = useQuery({
    queryKey: ['predictions', id],
    queryFn: () => fetchPredictions(id!),
    enabled: !!id,
    refetchInterval: 2500,
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
      {/* Supervisory Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors -mt-1"
          aria-label="Go back"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
          <span>PLANT SUPERVISORY</span>
          <span className="text-slate-600">/</span>
          <span>FLEET ASSETS</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-200 font-semibold">{equipment.name}</span>
          <span className="text-cyan-400 font-mono">[{equipment.id}]</span>
        </button>

        <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          POLLING INTERVAL: 2.5s ACTIVE
        </span>
      </div>

      {/* ── 1. Equipment Header (status visible) ──────────────────────────── */}
      <EquipmentHeader equipment={equipment} />

      {/* ── Real-Time Streaming Visual Monitor & Continuous ML Graph ───── */}
      <RealTimeHealthMonitor
        equipment={equipment}
        prediction={prediction ?? null}
        isLoading={predLoading}
      />

      {/* ── 2. Health Score + 3. RUL + alerts count ──────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Health Score */}
        <div className="industrial-card rounded-2xl border border-slate-800/80 p-5 flex flex-col items-center justify-center text-center shadow-lg">
          <div className="flex items-center gap-1.5 mb-3">
            <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Telemetry Health Index
            </p>
            {prediction?.isRealModel && (
              <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded px-1.5 py-0.5">
                AI MODEL
              </span>
            )}
          </div>
          <HealthScoreCard score={prediction?.healthScore ?? equipment.healthScore} size="lg" />
          <div className="mt-4 pt-3 border-t border-slate-800/80 w-full flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">OPERATIONAL STATE:</span>
            <span className={clsx(
              (prediction?.healthScore ?? equipment.healthScore) >= 80 ? 'text-emerald-400' :
              (prediction?.healthScore ?? equipment.healthScore) >= 60 ? 'text-amber-400' : 'text-rose-400',
              'font-bold uppercase tracking-wider'
            )}>
              {prediction?.healthStatus ?? (
                (prediction?.healthScore ?? equipment.healthScore) >= 80 ? 'Optimal' :
                (prediction?.healthScore ?? equipment.healthScore) >= 60 ? 'Warning' : 'Critical'
              )}
            </span>
          </div>
        </div>

        {/* RUL */}
        {predLoading ? (
          <SkeletonCard />
        ) : prediction ? (
          <RULCard rul={prediction.rul} isRealModel={prediction.isRealModel} />
        ) : (
          <div className="industrial-card rounded-2xl border border-slate-800/80 p-5 flex items-center justify-center text-slate-500 text-xs font-mono">
            RUL TELEMETRY STREAM OFFLINE
          </div>
        )}

        {/* Quick stats */}
        <div className="industrial-card rounded-2xl border border-slate-800/80 p-5 space-y-3 shadow-lg flex flex-col justify-between">
          <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 pb-2">
            Operational Telemetry Stats
          </p>
          <div className="space-y-2.5">
            <QuickStat label="Active Alarm Flags" value={activeAlerts.length} danger={activeAlerts.length > 0} />
            <QuickStat label="Dispatched Work Orders" value={equipmentWorkOrders.length} />
            <QuickStat label="Total Operating Runtime" value={`${equipment.operatingHours.toLocaleString()} hrs`} />
            <QuickStat label="Last Service Timestamp" value={equipment.lastMaintenanceDate} />
            <QuickStat label="Next Preventative Target" value={equipment.nextMaintenanceDate} />
          </div>
        </div>
      </div>

      {/* ── 4. Active Alerts ──────────────────────────────────────────────── */}
      <section aria-label="Active alerts">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-400 font-bold">// 01</span>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Active Alerts & Safety Flags
            </h2>
            {activeAlerts.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-rose-500/20 text-rose-400 text-[10px] font-mono font-bold rounded border border-rose-500/30">
                {activeAlerts.length} ACTIVE
              </span>
            )}
          </div>
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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-400 font-bold">// 02</span>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Live Sensor Telemetry Array
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            REFRESH: <span className="text-emerald-400">CONTINUOUS (2.5s)</span>
          </span>
        </div>
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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-400 font-bold">// 03</span>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Historical Sensor Trends & Tolerance Envelopes
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500">PARAM METRIC CHANNELS (TOP 4)</span>
        </div>
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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-400 font-bold">// 04</span>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Real-Time Inference Engine & Fault Diagnostic
            </h2>
          </div>
        </div>
        {predLoading ? (
          <SkeletonCard className="h-64" />
        ) : prediction ? (
          <PredictionPanel prediction={prediction} />
        ) : (
          <p className="text-xs font-mono text-slate-500">Inference service data stream unavailable.</p>
        )}
      </section>

      {/* ── 8b. Multi-Signal ML Model Simulation ───────────────────────── */}
      <section aria-label="Machine Learning Simulation">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-400 font-bold">// 05</span>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Interactive ML Simulation Playground
            </h2>
            <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-indigo-400 border border-indigo-500/30">
              LIVE INFERENCE
            </span>
          </div>
        </div>
        <MLModelPlayground
          equipmentType={equipment.type}
          equipmentName={equipment.name}
          initialValues={{
            vibration_rms: readings?.values?.vibration_rms ?? readings?.values?.vibration ?? 1.4,
            temperature_motor: readings?.values?.temperature_motor ?? readings?.values?.temperature ?? readings?.values?.spindleTemperature ?? 48.0,
            current_phase_avg: readings?.values?.current_phase_avg ?? readings?.values?.current ?? readings?.values?.motorCurrent ?? 14.5,
            pressure_level: readings?.values?.pressure_level ?? readings?.values?.pressure ?? 6.2,
            rpm: readings?.values?.rpm ?? readings?.values?.speed ?? readings?.values?.spindleSpeed ?? 1600,
            ambient_temp: readings?.values?.ambient_temp ?? 22.0,
            hours_since_maintenance: readings?.values?.hours_since_maintenance ?? equipment?.operatingHours ?? 100,
          }}
        />
      </section>

      {/* ── 9. Maintenance Recommendation + 10. History ─────────────────── */}
      <section aria-label="Maintenance">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-400 font-bold">// 06</span>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Maintenance Interventions & Work Orders
            </h2>
          </div>
        </div>
        <MaintenancePanel
          recommendations={recommendations}
          workOrders={equipmentWorkOrders}
          onUpdateStatus={updateStatus}
        />

        {/* Maintenance History */}
        {history.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
              Historical Service & Repair Logs
            </h3>
            <div className="space-y-2.5">
              {history.map(record => (
                <div key={record.id} className="industrial-card rounded-xl border border-slate-800/80 p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
                    <span className="text-sm font-semibold text-slate-200">{record.description}</span>
                    <span className="text-xs font-mono text-cyan-400">{record.date}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs font-mono text-slate-400">
                    <span className="capitalize text-slate-300">TYPE: {record.type}</span>
                    <span className="text-slate-600">·</span>
                    <span>TECH: {record.performedBy}</span>
                    <span className="text-slate-600">·</span>
                    <span>DUR: {record.duration}h</span>
                    {record.cost !== undefined && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="text-emerald-400">COST: ${record.cost}</span>
                      </>
                    )}
                  </div>
                  {record.findings && (
                    <p className="text-xs font-sans text-slate-400 bg-slate-950/40 border border-slate-800/60 rounded p-2 mt-2">
                      {record.findings}
                    </p>
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
    <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/40 last:border-0">
      <span className="font-mono text-slate-400">{label}</span>
      <span className={clsx('font-mono font-bold tabular-nums', danger ? 'text-rose-400' : 'text-slate-200')}>
        {value}
      </span>
    </div>
  );
}
