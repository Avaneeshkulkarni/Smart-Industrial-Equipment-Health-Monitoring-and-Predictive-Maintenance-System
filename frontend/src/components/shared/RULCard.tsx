import React from 'react';
import { TrendingDown, Info } from 'lucide-react';
import type { RULPrediction } from '../../types';
import { clsx } from 'clsx';

interface RULCardProps {
  rul: RULPrediction;
  isRealModel?: boolean;
  className?: string;
}

function getRULColor(days: number): string {
  if (days <= 14)  return 'text-rose-400';
  if (days <= 60)  return 'text-amber-400';
  return 'text-emerald-400';
}

function getRULBarColor(days: number): string {
  if (days <= 14)  return 'bg-gradient-to-r from-rose-500 to-rose-600';
  if (days <= 60)  return 'bg-gradient-to-r from-amber-500 to-amber-600';
  return 'bg-gradient-to-r from-emerald-500 to-teal-500';
}

function getRULLabel(days: number): string {
  if (days <= 7)   return 'CRITICAL REPLACE';
  if (days <= 14)  return 'SCHEDULE REPLACEMENT';
  if (days <= 60)  return 'INSPECT IN INTERVAL';
  return 'OPTIMAL RUNTIME';
}

/**
 * RULCard — Remaining Useful Life estimate.
 * Displays days, confidence interval, and basis parameters.
 */
export function RULCard({ rul, isRealModel = true, className }: RULCardProps): React.ReactElement {
  const maxDays = 365;
  const barPct = Math.min(100, (rul.estimatedDays / maxDays) * 100);
  const color = getRULColor(rul.estimatedDays);
  const barColor = getRULBarColor(rul.estimatedDays);

  return (
    <div className={clsx('industrial-card rounded-2xl border border-slate-800/80 p-5 flex flex-col justify-between shadow-lg', className)}>
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingDown size={15} className="text-cyan-400" aria-hidden="true" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Remaining Useful Life (RUL)</h3>
          </div>
          {isRealModel ? (
            <span className="flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-1.5 py-0.5">
              EST. REGRESSION
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-900/60 rounded px-1.5 py-0.5 border border-slate-800">
              <Info size={10} aria-hidden="true" />
              Simulated
            </span>
          )}
        </div>

        {/* Days estimate */}
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-2">
            <span className={clsx('text-4xl font-extrabold font-mono tracking-tight tabular-nums', color)}>
              {rul.estimatedDays}
            </span>
            <span className="text-slate-400 text-xs font-mono uppercase">DAYS REMAINING</span>
          </div>
          <span className={clsx('text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-slate-700/50 uppercase', color)}>
            {getRULLabel(rul.estimatedDays)}
          </span>
        </div>

        {/* Timeline bar */}
        <div className="h-2 bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-slate-800/80 mb-3">
          <div
            className={clsx('h-full rounded-full transition-all duration-500 shadow-sm', barColor)}
            style={{ width: `${barPct}%` }}
            role="progressbar"
            aria-valuenow={rul.estimatedDays}
            aria-valuemin={0}
            aria-valuemax={maxDays}
            aria-label={`${rul.estimatedDays} days remaining`}
          />
        </div>

        {/* Confidence interval */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-3 bg-slate-950/40 px-2.5 py-1.5 rounded-lg border border-slate-800/60">
          <span>
            RANGE: <span className="text-slate-200 font-semibold">{rul.lowerBound} – {rul.upperBound} d</span>
          </span>
          <span>
            CONF: <span className="text-cyan-400 font-semibold">{Math.round(rul.confidenceLevel * 100)}%</span>
          </span>
        </div>
      </div>

      {/* Basis parameters */}
      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/60">
        <span className="text-[10px] font-mono text-slate-500 uppercase">SIGNALS:</span>
        {rul.basisParameters.map(p => (
          <span key={p} className="text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800 rounded px-1.5 py-0.2">
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}
