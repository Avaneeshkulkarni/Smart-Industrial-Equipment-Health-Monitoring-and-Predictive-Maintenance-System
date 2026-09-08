import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, RotateCcw, AlertTriangle } from 'lucide-react';
import equipmentConfig, { getEquipmentConfig } from '../config/equipmentConfig';
import { updateThreshold } from '../utils/thresholds';
import { Toast, ConfirmDialog } from '../components/shared/Feedback';
import { useAppStore } from '../store/appStore';
import type { EquipmentType } from '../types';
import { clsx } from 'clsx';

const ACTIVE_TYPES: EquipmentType[] = ['motor', 'pump', 'compressor', 'cnc'];

/**
 * Settings page — editable thresholds per equipment type (reads from central config),
 * plant settings, simulation toggle.
 *
 * Thresholds are PROTOTYPE values — not engineering standards.
 * Edits take effect in-memory immediately and persist for the session.
 * TODO: Wire to PATCH /api/config/thresholds/:type/:param for persistent storage.
 */
export function Settings(): React.ReactElement {
  const { simulationEnabled, toggleSimulation } = useAppStore();
  const [activeType, setActiveType] = useState<EquipmentType>('motor');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // Local editable copy of thresholds (seeded from config)
  const [thresholds, setThresholds] = useState<
    Record<EquipmentType, Record<string, { warning: number; critical: number }>>
  >(() => {
    const result = {} as Record<EquipmentType, Record<string, { warning: number; critical: number }>>;
    ACTIVE_TYPES.forEach(type => {
      result[type] = {};
      equipmentConfig[type].parameters.forEach(p => {
        result[type][p.key] = {
          warning: p.warningThreshold,
          critical: p.criticalThreshold,
        };
      });
    });
    return result;
  });

  function handleThresholdChange(
    type: EquipmentType,
    paramKey: string,
    field: 'warning' | 'critical',
    value: string,
  ) {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    setThresholds(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [paramKey]: { ...prev[type][paramKey], [field]: num },
      },
    }));
  }

  function handleSave() {
    // Apply to central config (in-memory)
    ACTIVE_TYPES.forEach(type => {
      Object.entries(thresholds[type]).forEach(([paramKey, vals]) => {
        updateThreshold(type, paramKey, 'warningThreshold', vals.warning);
        updateThreshold(type, paramKey, 'criticalThreshold', vals.critical);
      });
    });
    setToast({ msg: 'Thresholds saved (session only). Wire to API for persistence.', type: 'success' });
  }

  function handleReset() {
    // Re-read from original config values
    const fresh = {} as Record<EquipmentType, Record<string, { warning: number; critical: number }>>;
    ACTIVE_TYPES.forEach(type => {
      fresh[type] = {};
      equipmentConfig[type].parameters.forEach(p => {
        fresh[type][p.key] = { warning: p.warningThreshold, critical: p.criticalThreshold };
      });
    });
    setThresholds(fresh);
    setConfirmReset(false);
    setToast({ msg: 'Thresholds reset to defaults.', type: 'success' });
  }

  const config = getEquipmentConfig(activeType);

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
        <SettingsIcon size={20} className="text-slate-400" aria-hidden="true" />
        Settings
      </h1>

      {/* ─── Prototype disclaimer ──────────────────────────────────────────── */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm">
          <p className="font-semibold text-amber-400">Prototype Thresholds — Not Engineering Standards</p>
          <p className="text-amber-400/70 mt-1 text-xs">
            These are demo values for UI visualization purposes only. Actual operational limits must be
            established by equipment manufacturers, process engineers, and applicable safety standards.
            Do not use these values for real operational decisions.
          </p>
        </div>
      </div>

      {/* ─── Threshold editor ─────────────────────────────────────────────── */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="border-b border-slate-700 p-4">
          <h2 className="text-sm font-semibold text-slate-200">Sensor Thresholds</h2>
          <p className="text-xs text-slate-500 mt-1">
            Editable per equipment type. Changes apply to the current session only.
          </p>
        </div>

        {/* Type tabs */}
        <div className="flex border-b border-slate-700" role="tablist" aria-label="Equipment type threshold tabs">
          {ACTIVE_TYPES.map(type => {
            const cfg = equipmentConfig[type];
            return (
              <button
                key={type}
                role="tab"
                aria-selected={activeType === type}
                onClick={() => setActiveType(type)}
                className={clsx(
                  'flex-1 py-2.5 text-xs font-medium transition-colors',
                  activeType === type
                    ? 'border-b-2 border-blue-500 text-blue-400 bg-blue-500/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30',
                )}
              >
                {cfg.displayName}
              </button>
            );
          })}
        </div>

        {/* Threshold rows */}
        <div className="p-4 space-y-3" role="tabpanel" aria-label={`${config.displayName} thresholds`}>
          {config.parameters.map(param => {
            const current = thresholds[activeType]?.[param.key];
            if (!current) return null;
            return (
              <div key={param.key} className="grid grid-cols-[1fr_auto_auto] gap-4 items-center py-2 border-b border-slate-700/30 last:border-0">
                <div>
                  <p className="text-sm text-slate-200">{param.label}</p>
                  <p className="text-xs text-slate-500">{param.unit} · {param.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor={`${activeType}-${param.key}-warn`} className="text-xs text-amber-400 whitespace-nowrap">
                    Warning
                  </label>
                  <input
                    id={`${activeType}-${param.key}-warn`}
                    type="number"
                    value={current.warning}
                    onChange={e => handleThresholdChange(activeType, param.key, 'warning', e.target.value)}
                    className="w-24 bg-slate-700 border border-amber-500/30 text-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-amber-500"
                    step={param.decimalPlaces ? Math.pow(10, -param.decimalPlaces) : 1}
                    aria-label={`Warning threshold for ${param.label}`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor={`${activeType}-${param.key}-crit`} className="text-xs text-red-400 whitespace-nowrap">
                    Critical
                  </label>
                  <input
                    id={`${activeType}-${param.key}-crit`}
                    type="number"
                    value={current.critical}
                    onChange={e => handleThresholdChange(activeType, param.key, 'critical', e.target.value)}
                    className="w-24 bg-slate-700 border border-red-500/30 text-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-red-500"
                    step={param.decimalPlaces ? Math.pow(10, -param.decimalPlaces) : 1}
                    aria-label={`Critical threshold for ${param.label}`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-700 p-4 flex items-center gap-3 justify-end">
          <button
            onClick={() => setConfirmReset(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors"
            aria-label="Reset thresholds to defaults"
          >
            <RotateCcw size={13} />
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
            aria-label="Save threshold changes"
          >
            <Save size={13} />
            Save Changes
          </button>
        </div>
      </div>

      {/* ─── Simulation settings ───────────────────────────────────────────── */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-200 mb-1">Live Simulation</h2>
        <p className="text-xs text-slate-500 mb-4">
          Mock sensor data updates every 2–5 seconds to simulate live equipment readings.
          This is swappable for a WebSocket feed without touching UI components.
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-300">Enable Live Simulation</p>
            <p className="text-xs text-slate-500">Simulate periodic sensor value changes</p>
          </div>
          <button
            onClick={toggleSimulation}
            className={clsx(
              'relative w-12 h-6 rounded-full transition-colors',
              simulationEnabled ? 'bg-blue-600' : 'bg-slate-600',
            )}
            role="switch"
            aria-checked={simulationEnabled}
            aria-label="Toggle live simulation"
          >
            <span
              className={clsx(
                'absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform',
                simulationEnabled ? 'translate-x-6' : 'translate-x-0',
              )}
            />
          </button>
        </div>
      </div>

      {/* ─── Plant settings ────────────────────────────────────────────────── */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-200 mb-4">Plant Configuration</h2>
        <div className="space-y-3">
          <div>
            <label htmlFor="plant-name" className="block text-xs text-slate-400 mb-1.5">Plant Name</label>
            <input
              id="plant-name"
              type="text"
              defaultValue="Alpha Manufacturing Plant"
              className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="plant-location" className="block text-xs text-slate-400 mb-1.5">Location</label>
            <input
              id="plant-location"
              type="text"
              defaultValue="Detroit, MI"
              className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Confirm reset */}
      <ConfirmDialog
        open={confirmReset}
        title="Reset Thresholds"
        description="Reset all threshold values to their prototype defaults? Your current edits will be lost."
        confirmLabel="Reset"
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
        destructive
      />

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
