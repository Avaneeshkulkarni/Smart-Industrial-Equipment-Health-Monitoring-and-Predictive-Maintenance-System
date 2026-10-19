import React from 'react';
import { Info, BarChart2 } from 'lucide-react';
import type { Prediction } from '../../types';
import { clsx } from 'clsx';

interface PredictionPanelProps {
  prediction: Prediction;
  className?: string;
}

/**
 * PredictionPanel — Anomaly score + fault probabilities.
 *
 * IMPORTANT: This is a DEMO PREDICTION / MOCK ML OUTPUT.
 * It is NOT output from a trained machine learning model.
 * Labels and disclaimers are shown prominently to avoid misleading users.
 */
export function PredictionPanel({ prediction, className }: PredictionPanelProps): React.ReactElement {
  const anomalyPct = Math.round(prediction.anomalyScore * 100);
  const riskPct = prediction.riskScore;
  const confPct = Math.round(prediction.predictionConfidence * 100);

  const anomalyColor = anomalyPct >= 70 ? '#f87171' : anomalyPct >= 40 ? '#fbbf24' : '#34d399';
  const riskColor    = riskPct >= 70    ? '#f87171' : riskPct >= 40    ? '#fbbf24' : '#34d399';

  const sortedFaults = [...prediction.faultPredictions].sort((a, b) => b.probability - a.probability);

  return (
    <div className={clsx('bg-slate-800/50 rounded-xl border border-slate-700/50 p-5', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart2 size={16} className="text-slate-400" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-slate-200">Anomaly & Fault Analysis</h3>
        </div>
        <span className="flex items-center gap-1 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-0.5">
          <Info size={10} aria-hidden="true" />
          Mock ML Output
        </span>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-slate-500 bg-slate-900/50 rounded-lg px-3 py-2 mb-4">
        <strong className="text-slate-400">Demo Prediction</strong> — These values are prototype outputs
        for demonstration only. They are not from a trained machine learning model and should not be
        used for operational decisions.
      </p>

      {/* Score row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Anomaly Score', value: anomalyPct, color: anomalyColor, suffix: '%' },
          { label: 'Risk Score',    value: riskPct,    color: riskColor,    suffix: '/100' },
          { label: 'Prediction Confidence', value: confPct, color: '#60a5fa', suffix: '%' },
        ].map(({ label, value, color, suffix }) => (
          <div key={label} className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className="text-xl font-bold tabular-nums" style={{ color }}>
              {value}<span className="text-xs font-normal text-slate-400">{suffix}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Fault probabilities */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Fault Probability Ranking
        </h4>
        <div className="space-y-2">
          {sortedFaults.map((fault, i) => {
            const pct = Math.round(fault.probability * 100);
            const barColor = pct >= 60 ? '#f87171' : pct >= 30 ? '#fbbf24' : '#60a5fa';
            return (
              <div key={fault.failureMode}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 w-4">{i + 1}.</span>
                    <span className="text-slate-300">{fault.failureMode}</span>
                  </div>
                  <span className="font-semibold tabular-nums" style={{ color: barColor }}>
                    {pct}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: barColor }}
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${fault.failureMode}: ${pct}%`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
