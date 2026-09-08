import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts';
import type { SensorParameter } from '../../types';
import { getChartData, computeSeriesStats, type TimeWindow } from '../../utils/chartData';
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
 */
export function SensorChart({
  equipmentId,
  parameter,
  className,
}: SensorChartProps): React.ReactElement {
  const [window, setWindow] = useState<TimeWindow>('24H');

  const data = useMemo(
    () => getChartData(equipmentId, parameter.key, window, parameter.warningThreshold, parameter.criticalThreshold),
    [equipmentId, parameter.key, window, parameter.warningThreshold, parameter.criticalThreshold],
  );

  const stats = useMemo(() => computeSeriesStats(data), [data]);

  const strokeColor = (() => {
    if (stats.current >= parameter.criticalThreshold) return '#f87171';
    if (stats.current >= parameter.warningThreshold) return '#fbbf24';
    return '#60a5fa';
  })();

  return (
    <div className={clsx('bg-slate-800/50 rounded-xl border border-slate-700/50 p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">{parameter.label}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Current: <span className="text-slate-300">{stats.current} {parameter.unit}</span>
            {' '}· Avg: <span className="text-slate-300">{stats.avg}</span>
            {' '}· Min: <span className="text-slate-300">{stats.min}</span>
            {' '}· Max: <span className="text-slate-300">{stats.max}</span>
          </p>
        </div>

        {/* Time window toggle */}
        <div className="flex items-center gap-1 bg-slate-900/50 rounded-lg p-1">
          {TIME_WINDOWS.map(w => (
            <button
              key={w}
              onClick={() => setWindow(w)}
              className={clsx(
                'px-2.5 py-1 rounded text-xs font-medium transition-all',
                window === w
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50',
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
