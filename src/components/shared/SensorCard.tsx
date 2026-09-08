import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import type { SensorParameter } from '../../types';
import { getSensorStatus } from '../../utils/health';
import { getSparklineData } from '../../utils/chartData';
import { clsx } from 'clsx';

interface SensorCardProps {
  parameter: SensorParameter;
  value: number;
  equipmentId: string;
  showSparkline?: boolean;
  className?: string;
}

const SENSOR_STATUS_COLORS = {
  healthy:  { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  warning:  { text: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20'   },
  critical: { text: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20'       },
};

/**
 * SensorCard — shows parameter name, current value + unit, status, trend, optional sparkline.
 * Only renders parameters that belong to the equipment type (caller is responsible for filtering).
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

  const sparklineData = useMemo(() => {
    if (!showSparkline) return [];
    return getSparklineData(equipmentId, parameter.key).map(v => ({ v }));
  }, [equipmentId, parameter.key, showSparkline]);

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

  const sparkColor = status === 'healthy' ? '#34d399' : status === 'warning' ? '#fbbf24' : '#f87171';

  return (
    <div
      className={clsx(
        'rounded-xl border p-4 flex flex-col gap-2 transition-all hover:border-slate-600',
        colors.bg,
        className,
      )}
      role="region"
      aria-label={`${parameter.label} sensor reading`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
          {parameter.label}
        </span>
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

      {/* Value */}
      <div className="flex items-baseline gap-1.5">
        <span className={clsx('text-2xl font-bold tabular-nums', colors.text)}>
          {formattedValue}
        </span>
        {parameter.unit && (
          <span className="text-sm text-slate-400">{parameter.unit}</span>
        )}
      </div>

      {/* Thresholds */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>Warn: {parameter.warningThreshold}</span>
        <span className="text-slate-600">|</span>
        <span>Crit: {parameter.criticalThreshold}</span>
      </div>

      {/* Sparkline */}
      {showSparkline && sparklineData.length > 0 && (
        <div className="h-10 -mx-1">
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

      {/* Status */}
      <div className="flex items-center gap-1.5">
        <span
          className={clsx('w-1.5 h-1.5 rounded-full', {
            'bg-emerald-400': status === 'healthy',
            'bg-amber-400': status === 'warning',
            'bg-red-400': status === 'critical',
          })}
          aria-hidden="true"
        />
        <span className={clsx('text-xs font-medium capitalize', colors.text)}>
          {status}
        </span>
      </div>
    </div>
  );
}
