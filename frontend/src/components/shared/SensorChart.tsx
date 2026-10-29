import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import type { SensorParameter } from '../../types';
import { getChartDataFromReadings, computeSeriesStats, type TimeWindow } from '../../utils/chartData';
import { fetchHistoricalReadings } from '../../services/sensorApi';
import { clsx } from 'clsx';

interface SensorChartProps {
  equipmentId: string;
  parameter: SensorParameter;
  className?: string;
}

const TIME_WINDOWS: TimeWindow[] = ['1H', '6H', '24H', '7D', '30D'];

/**
 * SensorChart — Recharts time-series with 1H/6H/24H/7D/30D toggle.
 * Shows current value, avg, min, max and threshold reference lines.
 * Now fetches data from the backend API.
 */
export function SensorChart({
  equipmentId,
  parameter,
  className,
}: SensorChartProps): React.ReactElement {
  const [window, setWindow] = useState<TimeWindow>('24H');

  const { data: readings = [] } = useQuery({
    queryKey: ['historicalReadings', equipmentId, parameter.key, window],
    queryFn: () => fetchHistoricalReadings(equipmentId, parameter.key, window),
    staleTime: 30_000,
  });

  const data = useMemo(
    () => getChartDataFromReadings(readings, parameter.key, window, parameter.warningThreshold, parameter.criticalThreshold),
    [readings, parameter.key, window, parameter.warningThreshold, parameter.criticalThreshold],
  );

  const stats = useMemo(() => computeSeriesStats(data), [data]);

  const strokeColor = (() => {
    if (stats.current >= parameter.criticalThreshold) return '#f87171';
    if (stats.current >= parameter.warningThreshold) return '#fbbf24';
    return '#60a5fa';
  })();

  return (
    <div className={clsx('industrial-card rounded-2xl border border-slate-800/80 p-5 shadow-lg', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">{parameter.label}</h3>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/50 rounded px-1.5 py-0.2">
              HISTORICAL
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">
            CUR: <span className="text-slate-100 font-semibold">{stats.current} {parameter.unit}</span>
            {' '}· AVG: <span className="text-slate-300">{stats.avg}</span>
            {' '}· MIN: <span className="text-slate-300">{stats.min}</span>
            {' '}· MAX: <span className="text-slate-300">{stats.max}</span>
          </p>
        </div>

        {/* Time window toggle */}
        <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800/80 rounded-lg p-1">
          {TIME_WINDOWS.map(w => (
            <button
              key={w}
              onClick={() => setWindow(w)}
              className={clsx(
                'px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-all',
                window === w
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50',
              )}
              aria-pressed={window === w}
              aria-label={`Show ${w} data`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-44">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="displayTime"
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#1e293b' }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#1e293b' }}
                width={45}
                tickFormatter={v => `${v}${parameter.unit ? ` ${parameter.unit}` : ''}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: 12,
                }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#e2e8f0' }}
                formatter={(v: any) => [`${v} ${parameter.unit}`, parameter.label]}
              />

              {/* Threshold reference lines */}
              <ReferenceLine
                y={parameter.warningThreshold}
                stroke="#fbbf24"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{ value: 'Warn', position: 'insideTopRight', fontSize: 10, fill: '#fbbf24' }}
              />
              <ReferenceLine
                y={parameter.criticalThreshold}
                stroke="#f87171"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{ value: 'Crit', position: 'insideTopRight', fontSize: 10, fill: '#f87171' }}
              />

              <Line
                type="monotone"
                dataKey="value"
                stroke={strokeColor}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: strokeColor }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            No data available for this window
          </div>
        )}
      </div>
    </div>
  );
}
