import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';
import { fetchAnalyticsSummary, fetchEquipmentTypeMetrics, fetchHealthDistribution } from '../services/analyticsApi';
import { fetchAlerts } from '../services/alertApi';
import { fetchWorkOrders } from '../services/maintenanceApi';
import { fetchAllPredictions } from '../services/predictionApi';
import { SkeletonCard } from '../components/shared/Feedback';
import { clsx } from 'clsx';

const TYPE_COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6'];
const HEALTH_COLORS = ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#34d399'];

/**
 * Analytics page — health distribution, avg by type, anomaly/fault/maintenance counts,
 * RUL distribution, filterable charts.
 */
export function Analytics(): React.ReactElement {
  const { data: summary, isLoading: sumLoading } = useQuery({
    queryKey: ['analyticsSummary'],
    queryFn: fetchAnalyticsSummary,
  });

  const { data: typeMetrics = [], isLoading: metricsLoading } = useQuery({
    queryKey: ['equipmentTypeMetrics'],
    queryFn: fetchEquipmentTypeMetrics,
  });

  const { data: healthDist = [], isLoading: distLoading } = useQuery({
    queryKey: ['healthDistribution'],
    queryFn: fetchHealthDistribution,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => fetchAlerts(),
  });

  const { data: workOrders = [] } = useQuery({
    queryKey: ['workOrders'],
    queryFn: () => fetchWorkOrders(),
  });

  const { data: predictions = {} } = useQuery({
    queryKey: ['allPredictions'],
    queryFn: fetchAllPredictions,
  });

  // RUL distribution
  const rulData = Object.values(predictions).map(p => ({
    equipment: p.equipmentId,
    rul: p.rul.estimatedDays,
  })).sort((a, b) => a.rul - b.rul);

  // Anomaly scores
  const anomalyData = Object.values(predictions).map(p => ({
    equipment: p.equipmentId,
    score: Math.round(p.anomalyScore * 100),
  })).sort((a, b) => b.score - a.score);

  // Work order counts by status
  const woByStatus = [
    { status: 'Pending',     count: workOrders.filter(w => w.status === 'pending').length },
    { status: 'Scheduled',   count: workOrders.filter(w => w.status === 'scheduled').length },
    { status: 'In Progress', count: workOrders.filter(w => w.status === 'in-progress').length },
    { status: 'Completed',   count: workOrders.filter(w => w.status === 'completed').length },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
        <BarChart2 size={20} className="text-slate-400" aria-hidden="true" />
        Analytics
      </h1>

      {/* ─── Summary KPIs ─────────────────────────────────────────────────── */}
      {sumLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Avg Health Score', value: `${summary.avgHealthScore}%`, color: 'text-blue-400' },
            { label: 'Active Alerts',    value: summary.activeAlerts,          color: 'text-red-400' },
            { label: 'Anomalies (24h)',  value: summary.anomaliesDetected,     color: 'text-amber-400' },
            { label: 'Open Work Orders', value: summary.pendingWorkOrders,     color: 'text-emerald-400' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-2">{kpi.label}</p>
              <p className={clsx('text-2xl font-bold tabular-nums', kpi.color)}>{kpi.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ─── Row 1: Health Dist + Avg by Type ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Health Distribution */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Health Score Distribution</h2>
          {distLoading ? <SkeletonCard className="h-48" /> : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={healthDist} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {healthDist.map((_, i) => (
                      <Cell key={i} fill={HEALTH_COLORS[i] ?? '#60a5fa'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Avg Health by Type */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Average Health by Equipment Type</h2>
          {metricsLoading ? <SkeletonCard className="h-48" /> : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeMetrics} layout="vertical" margin={{ top: 4, right: 20, bottom: 0, left: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis type="category" dataKey="displayName" tick={{ fontSize: 11, fill: '#64748b' }} width={65} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: any) => [`${v}%`, 'Avg Health']}
                  />
                  <Bar dataKey="avgHealth" radius={[0, 4, 4, 0]}>
                    {typeMetrics.map((_, i) => (
                      <Cell key={i} fill={TYPE_COLORS[i] ?? '#60a5fa'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ─── Row 2: RUL + Anomaly Scores ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* RUL Distribution */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-1">RUL — Remaining Useful Life (Days)</h2>
          <p className="text-xs text-amber-500 mb-4">Demo Prediction — Mock ML Output</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rulData} margin={{ top: 4, right: 4, bottom: 40, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="equipment" tick={{ fontSize: 10, fill: '#64748b' }} angle={-45} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: any) => [`${v} days`, 'Est. RUL']}
                />
                <Bar dataKey="rul" radius={[4, 4, 0, 0]}>
                  {rulData.map((d, i) => (
                    <Cell key={i} fill={d.rul <= 14 ? '#f87171' : d.rul <= 60 ? '#fbbf24' : '#34d399'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Anomaly Scores */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-1">Anomaly Scores by Equipment</h2>
          <p className="text-xs text-amber-500 mb-4">Demo Prediction — Mock ML Output</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={anomalyData} margin={{ top: 4, right: 4, bottom: 40, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="equipment" tick={{ fontSize: 10, fill: '#64748b' }} angle={-45} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: any) => [`${v}%`, 'Anomaly Score']}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {anomalyData.map((d, i) => (
                    <Cell key={i} fill={d.score >= 70 ? '#f87171' : d.score >= 40 ? '#fbbf24' : '#34d399'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─── Row 3: Work Orders + Alert Severity ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Work Orders by Status</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={woByStatus} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="#60a5fa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Alert Severity Distribution</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Critical', value: alerts.filter(a => a.severity === 'critical').length, fill: '#f87171' },
                    { name: 'Warning',  value: alerts.filter(a => a.severity === 'warning').length,  fill: '#fbbf24' },
                    { name: 'Info',     value: alerts.filter(a => a.severity === 'info').length,     fill: '#60a5fa' },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
