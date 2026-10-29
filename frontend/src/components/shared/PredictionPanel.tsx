import React from 'react';
import {
  BarChart2,
  Cpu,
  CheckCircle2,
  Zap,
  Activity,
  Layers,
  Info
} from 'lucide-react';
import type { Prediction } from '../../types';
import { clsx } from 'clsx';

interface PredictionPanelProps {
  prediction: Prediction;
  className?: string;
}

export function PredictionPanel({ prediction, className }: PredictionPanelProps): React.ReactElement {
  const isReal = prediction.isRealModel ?? false;
  const anomalyPct = Math.round(prediction.anomalyScore * 100);
  const riskPct = Math.round(prediction.riskScore);
  const confPct = Math.round(prediction.predictionConfidence * 100);

  const anomalyColor = anomalyPct >= 70 ? '#f87171' : anomalyPct >= 40 ? '#fbbf24' : '#34d399';
  const riskColor = riskPct >= 70 ? '#f87171' : riskPct >= 40 ? '#fbbf24' : '#34d399';

  const sortedFaults = [...(prediction.faultPredictions || [])].sort((a, b) => b.probability - a.probability);

  return (
    <div className={clsx('industrial-card rounded-2xl border border-slate-800/90 p-5 md:p-6 space-y-5 shadow-xl', className)}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart2 size={18} className="text-indigo-400" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-slate-100">AI Predictive Maintenance & Fault Diagnostics</h3>
        </div>

        {isReal ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
            <CheckCircle2 size={13} className="text-emerald-400" aria-hidden="true" />
            Trained ML Model Inference
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1">
            <Info size={13} aria-hidden="true" />
            Model Offline / Unavailable
          </span>
        )}
      </div>

      {/* Model status banner */}
      {isReal ? (
        <div className="bg-slate-900/60 rounded-lg p-3.5 border border-slate-700/40 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Cpu size={14} className="text-indigo-400" />
              <span className="text-slate-300 font-medium">Model Architecture:</span>
              <span className="text-slate-100 font-semibold">Tri-Signal (XGBoost + Isolation Forest + Keras LSTM)</span>
            </div>
            {prediction.healthStatus && (
              <span className={clsx(
                'px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider',
                prediction.healthStatus === 'Healthy' && 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
                prediction.healthStatus === 'Warning' && 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
                prediction.healthStatus === 'Degrading' && 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
                prediction.healthStatus === 'Critical' && 'bg-red-500/20 text-red-300 border border-red-500/30'
              )}>
                {prediction.healthStatus}
              </span>
            )}
          </div>

          {prediction.decisionRule && (
            <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-800">
              <span className="text-slate-500">Decision Gating:</span>
              <span className="text-slate-300 font-mono text-[11px]">{prediction.decisionRule}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-xs text-slate-400 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3.5 py-2.5">
          <p className="font-semibold text-amber-300 mb-0.5">Machine Learning Notice</p>
          <p>{prediction.message || 'No trained machine learning model artifact is active for this machine type.'}</p>
        </div>
      )}

      {/* Signals Breakdown Card (When real model output exists) */}
      {isReal && prediction.signals && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Signal 1: XGBoost */}
          <div className="bg-slate-900/40 rounded-lg border border-slate-700/30 p-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Zap size={12} className="text-amber-400" />
                Signal 1: XGBoost
              </span>
              <span className={clsx('text-[10px] font-bold px-1.5 py-0.2 rounded', prediction.signals.xgboost?.triggered ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400')}>
                {prediction.signals.xgboost?.triggered ? 'Triggered' : 'Normal'}
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-bold text-slate-100 tabular-nums">
                {Math.round((prediction.signals.xgboost?.probability ?? 0) * 100)}%
              </span>
              <span className="text-[11px] text-slate-500">
                Thresh: {Math.round((prediction.signals.xgboost?.threshold ?? 0.4) * 100)}%
              </span>
            </div>
            <p className="text-[10px] text-slate-500">24-Hour Failure Risk</p>
          </div>

          {/* Signal 2: Isolation Forest */}
          <div className="bg-slate-900/40 rounded-lg border border-slate-700/30 p-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Activity size={12} className="text-cyan-400" />
                Signal 2: IsoForest
              </span>
              <span className={clsx('text-[10px] font-bold px-1.5 py-0.2 rounded', prediction.signals.isolationForest?.triggered ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400')}>
                {prediction.signals.isolationForest?.triggered ? 'Anomaly' : 'Clean'}
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-bold text-slate-100 tabular-nums">
                {Math.round(prediction.signals.isolationForest?.anomalyRisk ?? 0)}%
              </span>
              <span className="text-[11px] text-slate-500">
                Thresh: {prediction.signals.isolationForest?.threshold ?? 70}%
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Unsupervised Outlier</p>
          </div>

          {/* Signal 3: LSTM */}
          <div className="bg-slate-900/40 rounded-lg border border-slate-700/30 p-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Layers size={12} className="text-purple-400" />
                Signal 3: Temporal LSTM
              </span>
              <span className={clsx('text-[10px] font-bold px-1.5 py-0.2 rounded', prediction.signals.lstm?.triggered ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400')}>
                {prediction.signals.lstm?.triggered ? 'Warning' : 'Stable'}
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-bold text-slate-100 tabular-nums">
                {Math.round((prediction.signals.lstm?.probability ?? 0) * 100)}%
              </span>
              <span className="text-[11px] text-slate-500">
                Thresh: {Math.round((prediction.signals.lstm?.threshold ?? 0.6) * 100)}%
              </span>
            </div>
            <p className="text-[10px] text-slate-500">20-Step Lookback Sequence</p>
          </div>
        </div>
      )}

      {/* Main Score Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Anomaly Risk', value: anomalyPct, color: anomalyColor, suffix: '%' },
          { label: 'Composite Risk', value: riskPct, color: riskColor, suffix: '/100' },
          { label: 'Model Confidence', value: confPct, color: '#60a5fa', suffix: '%' },
        ].map(({ label, value, color, suffix }) => (
          <div key={label} className="bg-slate-900/50 rounded-lg p-3 text-center border border-slate-800">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className="text-xl font-bold tabular-nums" style={{ color }}>
              {value}<span className="text-xs font-normal text-slate-400">{suffix}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Fault probabilities */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 flex items-center justify-between">
          <span>Component Fault Probability Diagnostic</span>
          <span className="text-[11px] font-normal text-slate-500">Multi-Signal Weighted</span>
        </h4>
        <div className="space-y-2.5">
          {sortedFaults.map((fault, i) => {
            const pct = Math.round(fault.probability * 100);
            const barColor = pct >= 60 ? '#f87171' : pct >= 30 ? '#fbbf24' : '#38bdf8';
            return (
              <div key={fault.failureMode} className="bg-slate-900/30 rounded-lg p-2.5 border border-slate-800/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-mono w-4">{i + 1}.</span>
                    <span className="text-slate-200 font-medium">{fault.failureMode}</span>
                  </div>
                  <span className="font-semibold tabular-nums" style={{ color: barColor }}>
                    {pct}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
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
