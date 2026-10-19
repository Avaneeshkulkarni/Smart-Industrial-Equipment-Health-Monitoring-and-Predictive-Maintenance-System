import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getHealthStatus, getStatusColor } from '../../utils/health';
import { clsx } from 'clsx';

interface HealthScoreCardProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showRing?: boolean;
  className?: string;
}

const SIZE_CONFIG = {
  sm: { ring: 72, strokeWidth: 6, textSize: 'text-xl', labelSize: 'text-xs' },
  md: { ring: 120, strokeWidth: 10, textSize: 'text-3xl', labelSize: 'text-sm' },
  lg: { ring: 160, strokeWidth: 12, textSize: 'text-5xl', labelSize: 'text-base' },
};

/**
 * HealthScoreCard — Reusable radial health score gauge.
 * Thresholds from central config: ≥90 healthy, ≥70 warning, <70 critical.
 */
export function HealthScoreCard({
  score,
  size = 'md',
  showLabel = true,
  showRing = true,
  className,
}: HealthScoreCardProps): React.ReactElement {
  const status = getHealthStatus(score);
  const color = getStatusColor(status);
  const config = SIZE_CONFIG[size];

  const data = useMemo(() => [
    { value: score },
    { value: 100 - score },
  ], [score]);

  if (!showRing) {
    return (
      <div className={clsx('text-center', className)}>
        <span className={clsx(config.textSize, 'font-bold tabular-nums')} style={{ color }}>
          {Math.round(score)}
        </span>
        <span className={clsx(config.textSize, 'text-slate-400')}>%</span>
        {showLabel && (
          <p className={clsx(config.labelSize, 'text-slate-400 mt-0.5 capitalize')}>{status}</p>
        )}
      </div>
    );
  }

  return (
    <div className={clsx('relative flex flex-col items-center', className)}>
      <div style={{ width: config.ring, height: config.ring }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={90}
              endAngle={-270}
              innerRadius="72%"
              outerRadius="92%"
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill={color} />
              <Cell fill="#1e293b" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Centered score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={clsx(config.textSize, 'font-bold tabular-nums leading-none')} style={{ color }}>
            {Math.round(score)}
          </span>
          <span className="text-slate-400 text-xs leading-none mt-0.5">/ 100</span>
        </div>
      </div>

      {showLabel && (
        <span
          className={clsx(
            config.labelSize,
            'font-semibold capitalize mt-1',
            status === 'healthy' ? 'text-emerald-400' :
            status === 'warning' ? 'text-amber-400' : 'text-red-400',
          )}
        >
          {status}
        </span>
      )}
    </div>
  );
}
