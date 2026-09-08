import React from 'react';
import { TrendingDown, Info } from 'lucide-react';
import type { RULPrediction } from '../../types';
import { clsx } from 'clsx';

interface RULCardProps {
  rul: RULPrediction;
  className?: string;
}

function getRULColor(days: number): string {
  if (days <= 14)  return 'text-red-400';
  if (days <= 60)  return 'text-amber-400';
  return 'text-emerald-400';
}

function getRULBarColor(days: number): string {
  if (days <= 14)  return 'bg-red-500';
  if (days <= 60)  return 'bg-amber-500';
  return 'bg-emerald-500';
}

function getRULLabel(days: number): string {
  if (days <= 7)   return 'Replace Immediately';
  if (days <= 14)  return 'Replace Soon';
  if (days <= 60)  return 'Schedule Maintenance';
  return 'Good';
}

/**
 * RULCard — Remaining Useful Life estimate.
 * DEMO PREDICTION — MOCK ML OUTPUT.
 * Displays days, confidence interval, and basis parameters.
 */
export function RULCard({ rul, className }: RULCardProps): React.ReactElement {
  const maxDays = 365;
  const barPct = Math.min(100, (rul.estimatedDays / maxDays) * 100);
  const color = getRULColor(rul.estimatedDays);
  const barColor = getRULBarColor(rul.estimatedDays);

  return (
    <div className={clsx('bg-slate-800/50 rounded-xl border border-slate-700/50 p-5', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingDown size={16} className="text-slate-400" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-slate-200">Remaining Useful Life</h3>
        </div>
        <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-900/50 rounded px-2 py-0.5">
          <Info size={10} aria-hidden="true" />
          Demo Prediction
        </span>
      </div>

      {/* Days estimate */}
      <div className="flex items-baseline gap-2 mb-1">
        <span className={clsx('text-4xl font-bold tabular-nums', color)}>
          {rul.estimatedDays}
        </span>
        <span className="text-slate-400 text-sm">days</span>
        <span className={clsx('text-xs font-medium ml-auto', color)}>
          {getRULLabel(rul.estimatedDays)}
        </span>
      </div>

      {/* Timeline bar */}
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
        <div
          className={clsx('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${barPct}%` }}
          role="progressbar"
          aria-valuenow={rul.estimatedDays}
          aria-valuemin={0}
          aria-valuemax={maxDays}
          aria-label={`${rul.estimatedDays} days remaining`}
        />
      </div>

      {/* Confidence interval */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
        <span>
          Range: <span className="text-slate-300">{rul.lowerBound}–{rul.upperBound} days</span>
        </span>
        <span>
          Confidence: <span className="text-slate-300">{Math.round(rul.confidenceLevel * 100)}%</span>
        </span>
      </div>

      {/* Basis parameters */}
      <div className="flex flex-wrap gap-1">
        <span className="text-xs text-slate-500">Based on:</span>
        {rul.basisParameters.map(p => (
          <span key={p} className="text-xs bg-slate-700/50 text-slate-300 rounded px-2 py-0.5">
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}
