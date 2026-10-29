import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import type { SensorParameter } from '../../types';
import { getSensorStatus } from '../../utils/health';
import { getSparklineDataFromReadings } from '../../utils/chartData';
import { fetchHistoricalReadings } from '../../services/sensorApi';
import { clsx } from 'clsx';

interface SensorCardProps {
  parameter: SensorParameter;
  value: number;
  equipmentId: string;
  showSparkline?: boolean;
  className?: string;
}

const SENSOR_STATUS_COLORS = {
  healthy:  { text: 'text-emerald-400', bg: 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700', badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  warning:  { text: 'text-amber-400',   bg: 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/40', badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  critical: { text: 'text-red-400',     bg: 'bg-red-950/20 border-red-500/30 hover:border-red-500/40', badge: 'text-red-400 bg-red-500/10 border-red-500/20' },
};

/**
 * Enterprise SensorCard
 * Precision industrial telemetry display with sparklines and threshold metrics.
 */
export function SensorCard({
  parameter,
  value,
  equipmentId,
  showSparkline = true,
  className,
}: SensorCardProps): React.ReactElement {
  const status = getSensorStatus(value, {
    warning: parameter.warningThreshold,
    critical: parameter.criticalThreshold,
  });

  const colors = SENSOR_STATUS_COLORS[status];

  const { data: historicalReadings = [] } = useQuery({
    queryKey: ['sparklineReadings', equipmentId, parameter.key],
    queryFn: () => fetchHistoricalReadings(equipmentId, parameter.key, '1H'),
    staleTime: 30_000,
    enabled: showSparkline,
  });

  const sparklineData = useMemo(() => {
    if (!showSparkline || historicalReadings.length === 0) return [];
    return getSparklineDataFromReadings(historicalReadings, parameter.key).map(v => ({ v }));
  }, [historicalReadings, parameter.key, showSparkline]);

  // Simple trend: compare last 5 points vs previous 5
  const trend = useMemo<'up' | 'down' | 'stable'>(() => {
    const data = sparklineData.map(d => d.v);
    if (data.length < 10) return 'stable';
    const prev = data.slice(-10, -5).reduce((a, b) => a + b, 0) / 5;
    const curr = data.slice(-5).reduce((a, b) => a + b, 0) / 5;
    if (curr > prev * 1.02) return 'up';
    if (curr < prev * 0.98) return 'down';
    return 'stable';
  }, [sparklineData]);

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  const formattedValue = parameter.decimalPlaces !== undefined
    ? value.toFixed(parameter.decimalPlaces)
    : value.toFixed(1);

  const sparkColor = status === 'healthy' ? '#10b981' : status === 'warning' ? '#f59e0b' : '#ef4444';

  return (
    <div
      className={clsx(
        'industrial-card rounded-xl border p-4 flex flex-col justify-between transition-all duration-200 shadow-md',
        colors.bg,
        className,
      )}
      role="region"
      aria-label={`${parameter.label} sensor reading`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider truncate">
            {parameter.label}
          </span>
          <div className="flex items-center gap-1.5">
            <TrendIcon
              size={13}
              className={clsx(
                trend === 'up'   ? (status === 'healthy' ? 'text-emerald-400' : 'text-red-400') :
                trend === 'down' ? 'text-emerald-400' :
                'text-slate-500'
              )}
              aria-label={`Trend: ${trend}`}
            />
          </div>
        </div>

        {/* Current Value */}
        <div className="flex items-baseline gap-1.5 my-1">
          <span className={clsx('text-2xl font-black font-mono tracking-tight tabular-nums', colors.text)}>
            {formattedValue}
          </span>
          {parameter.unit && (
            <span className="text-xs font-mono text-slate-400 font-semibold">{parameter.unit}</span>
          )}
        </div>

        {/* Threshold limits */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-1">
          <span>Warn: {parameter.warningThreshold}</span>
          <span className="text-slate-700">|</span>
          <span>Crit: {parameter.criticalThreshold}</span>
        </div>
      </div>

      <div>
        {/* Sparkline mini-graph */}
        {showSparkline && sparklineData.length > 0 && (
          <div className="h-8 -mx-1 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={sparkColor}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Status indicator bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
          <span className={clsx('flex items-center gap-1 font-semibold uppercase font-mono', colors.text)}>
            <span className={clsx('w-1.5 h-1.5 rounded-full', {
              'bg-emerald-400': status === 'healthy',
              'bg-amber-400': status === 'warning',
              'bg-red-400': status === 'critical',
            })} />
            {status}
          </span>
          <span className="text-slate-400 font-mono">Live</span>
        </div>
      </div>
    </div>
  );
}
