import React, { useState, useEffect, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Cpu,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Sparkles,
  Zap,
  ShieldCheck,
  Bot,
  AlertCircle,
  FileQuestion
} from 'lucide-react';
import {
  runEquipmentInference,
  type MLTelemetryInput,
  type MLPredictionResponse
} from '../../services/mlApi';

interface MLModelPlaygroundProps {
  equipmentType?: string;
  equipmentName?: string;
  initialValues?: Partial<MLTelemetryInput>;
  onInferenceChange?: (result: MLPredictionResponse) => void;
}

interface EquipmentPresets {
  title: string;
  subtitle: string;
  badge: string;
  accuracy: string;
  f1: string;
  presets: Record<string, { name: string; desc: string; icon: string; values: MLTelemetryInput }>;
}

const EQUIPMENT_CONFIGS: Record<string, EquipmentPresets> = {
  robotic_arm: {
    title: 'Robotic Arm Multi-Signal Engine',
    subtitle: 'Fusing XGBoost (24h Risk) + Isolation Forest (Anomaly) + Temporal Bi-LSTM (Sequence)',
    badge: 'XGBoost + IsoForest + Bi-LSTM',
    accuracy: '93.9%',
    f1: '0.956',
    presets: {
      nominal: {
        name: 'Nominal Baseline',
        desc: 'Normal factory pick-and-place operating cycle',
        icon: '🟢',
        values: {
          vibration_rms: 1.35,
          temperature_motor: 48.0,
          current_phase_avg: 14.5,
          pressure_level: 6.2,
          rpm: 1600,
          ambient_temp: 22.0,
          hours_since_maintenance: 80,
        },
      },
      bearingWear: {
        name: 'Joint Bearing Wear',
        desc: 'Mild acoustic/mechanical friction in joint bearings',
        icon: '🟡',
        values: {
          vibration_rms: 3.6,
          temperature_motor: 68.0,
          current_phase_avg: 21.0,
          pressure_level: 5.8,
          rpm: 1520,
          ambient_temp: 24.5,
          hours_since_maintenance: 450,
        },
      },
      pressureLeak: {
        name: 'Pneumatic Leak & Drag',
        desc: 'Drop in pneumatic line pressure with actuator compensation',
        icon: '🟠',
        values: {
          vibration_rms: 4.8,
          temperature_motor: 76.0,
          current_phase_avg: 26.5,
          pressure_level: 3.8,
          rpm: 1380,
          ambient_temp: 28.0,
          hours_since_maintenance: 720,
        },
      },
      criticalSpike: {
        name: 'Imminent Breakdown',
        desc: 'Severe joint friction, overheating and vibration runaway',
        icon: '🔴',
        values: {
          vibration_rms: 6.8,
          temperature_motor: 89.0,
          current_phase_avg: 33.0,
          pressure_level: 2.9,
          rpm: 1150,
          ambient_temp: 31.0,
          hours_since_maintenance: 950,
        },
      },
    },
  },
  cnc_machine: {
    title: 'CNC Machine Multi-Signal Engine',
    subtitle: 'Trained model bundle: XGBoost (threshold 0.15) + Isolation Forest + Keras 2-Layer LSTM',
    badge: 'cnc_complete_system.pkl',
    accuracy: '94.2%',
    f1: '0.948',
    presets: {
      nominal: {
        name: 'High-Precision Milling',
        desc: 'Normal cutting load and nominal spindle rotation',
        icon: '🟢',
        values: {
          vibration_rms: 1.4,
          temperature_motor: 48.0,
          current_phase_avg: 14.5,
          pressure_level: 6.2,
          rpm: 1600,
          ambient_temp: 22.0,
          hours_since_maintenance: 120,
        },
      },
      toolDegradation: {
        name: 'Progressive Tool Wear',
        desc: 'Flank wear causing elevated spindle chatter and torque drag',
        icon: '🟡',
        values: {
          vibration_rms: 3.4,
          temperature_motor: 64.0,
          current_phase_avg: 20.5,
          pressure_level: 5.6,
          rpm: 1540,
          ambient_temp: 23.5,
          hours_since_maintenance: 480,
        },
      },
      chatterResonance: {
        name: 'Severe Spindle Resonance',
        desc: 'Harmonic vibration spikes threatening workpiece surface finish',
        icon: '🟠',
        values: {
          vibration_rms: 5.2,
          temperature_motor: 78.5,
          current_phase_avg: 28.0,
          pressure_level: 4.2,
          rpm: 1420,
          ambient_temp: 27.0,
          hours_since_maintenance: 780,
        },
      },
      catastrophicBreak: {
        name: 'Spindle Bearing Seizure',
        desc: 'Critical thermal runaway and mechanical overload',
        icon: '🔴',
        values: {
          vibration_rms: 7.2,
          temperature_motor: 94.0,
          current_phase_avg: 35.0,
          pressure_level: 2.4,
          rpm: 980,
          ambient_temp: 32.0,
          hours_since_maintenance: 1100,
        },
      },
    },
  },
  compressor: {
    title: 'Industrial Compressor Tri-Signal Engine',
    subtitle: 'Weighted multi-signal model: 60% XGBoost + 30% Keras LSTM + 10% Isolation Forest (threshold 0.56)',
    badge: 'compressor_predictive_maintenance_model.pkl',
    accuracy: '95.1%',
    f1: '0.962',
    presets: {
      nominal: {
        name: 'Continuous Compression',
        desc: 'Balanced suction/discharge pressures and stable oil temperature',
        icon: '🟢',
        values: {
          vibration_rms: 1.45,
          temperature_motor: 48.0,
          current_phase_avg: 14.5,
          pressure_level: 6.2,
          rpm: 1600,
          ambient_temp: 22.0,
          hours_since_maintenance: 90,
        },
      },
      valveLeak: {
        name: 'Discharge Valve Leak',
        desc: 'Subtle pressure bleedback causing cyclic motor heating',
        icon: '🟡',
        values: {
          vibration_rms: 3.8,
          temperature_motor: 70.0,
          current_phase_avg: 22.5,
          pressure_level: 5.1,
          rpm: 1510,
          ambient_temp: 25.0,
          hours_since_maintenance: 520,
        },
      },
      intercoolerFouling: {
        name: 'Intercooler Fouling',
        desc: 'Thermal buildup and airflow restriction with pressure drop',
        icon: '🟠',
        values: {
          vibration_rms: 4.9,
          temperature_motor: 82.0,
          current_phase_avg: 27.8,
          pressure_level: 3.9,
          rpm: 1390,
          ambient_temp: 29.5,
          hours_since_maintenance: 810,
        },
      },
      criticalOverheat: {
        name: 'Piston / Rotor Surge Overheat',
        desc: 'Vibration runaway and hazardous casing temperature',
        icon: '🔴',
        values: {
          vibration_rms: 6.9,
          temperature_motor: 96.0,
          current_phase_avg: 34.5,
          pressure_level: 2.3,
          rpm: 1100,
          ambient_temp: 33.0,
          hours_since_maintenance: 1050,
        },
      },
    },
  },
  pump: {
    title: 'Centrifugal Pump Tri-Signal Engine',
    subtitle: 'Trained model bundle: 75% XGBoost + 15% Keras LSTM + 10% Isolation Forest (threshold 0.57)',
    badge: 'pump_predictive_maintenance.pkl',
    accuracy: '95.0%',
    f1: '0.960',
    presets: {
      nominal: {
        name: 'Rated Hydrodynamic Flow',
        desc: 'Nominal discharge pressure and vibration baseline',
        icon: '🟢',
        values: {
          vibration_rms: 1.4,
          temperature_motor: 48.0,
          current_phase_avg: 14.5,
          pressure_level: 6.2,
          rpm: 1600,
          ambient_temp: 22.0,
          hours_since_maintenance: 120,
        },
      },
      cavitation: {
        name: 'Impeller Cavitation Drag',
        desc: 'Vapor bubble collapse inducing high-frequency casing vibration',
        icon: '🟡',
        values: {
          vibration_rms: 3.5,
          temperature_motor: 62.0,
          current_phase_avg: 19.5,
          pressure_level: 4.8,
          rpm: 1520,
          ambient_temp: 24.0,
          hours_since_maintenance: 420,
        },
      },
      sealLeak: {
        name: 'Mechanical Seal Friction',
        desc: 'Frictional thermal rise with localized pressure loss',
        icon: '🟠',
        values: {
          vibration_rms: 4.6,
          temperature_motor: 74.0,
          current_phase_avg: 24.0,
          pressure_level: 3.6,
          rpm: 1410,
          ambient_temp: 27.5,
          hours_since_maintenance: 750,
        },
      },
      bearingSeizure: {
        name: 'Critical Pump Failure',
        desc: 'Severe hydraulic instability and bearing thermal runaway',
        icon: '🔴',
        values: {
          vibration_rms: 6.8,
          temperature_motor: 92.0,
          current_phase_avg: 32.5,
          pressure_level: 2.1,
          rpm: 1050,
          ambient_temp: 31.0,
          hours_since_maintenance: 1020,
        },
      },
    },
  },
};

export const MLModelPlayground: React.FC<MLModelPlaygroundProps> = ({
  equipmentType = 'cnc_machine',
  equipmentName,
  initialValues,
  onInferenceChange,
}) => {
  // Normalize equipment type
  const normalizedType = useMemo(() => {
    const t = equipmentType.toLowerCase();
    if (t.includes('robotic') || t.includes('arm')) return 'robotic_arm';
    if (t.includes('cnc')) return 'cnc_machine';
    if (t.includes('compressor') || t.includes('cmp')) return 'compressor';
    if (t.includes('motor') || t.includes('mtr')) return 'electric_motor';
    if (t.includes('pump') || t.includes('pmp')) return 'pump';
    return t;
  }, [equipmentType]);

  const isModelAvailable = ['cnc_machine', 'compressor', 'pump'].includes(normalizedType);
  const activeConfig = EQUIPMENT_CONFIGS[normalizedType] || EQUIPMENT_CONFIGS.cnc_machine;

  const [telemetry, setTelemetry] = useState<MLTelemetryInput>({
    vibration_rms: initialValues?.vibration_rms ?? 1.4,
    temperature_motor: initialValues?.temperature_motor ?? 48.0,
    current_phase_avg: initialValues?.current_phase_avg ?? 14.5,
    pressure_level: initialValues?.pressure_level ?? 6.2,
    rpm: initialValues?.rpm ?? 1600,
    ambient_temp: initialValues?.ambient_temp ?? 22.0,
    hours_since_maintenance: initialValues?.hours_since_maintenance ?? 100,
  });

  const [activePreset, setActivePreset] = useState<string>('nominal');

  const { mutate, data: result } = useMutation({
    mutationFn: (data: MLTelemetryInput) => runEquipmentInference(normalizedType, data),
    onSuccess: (data) => {
      if (onInferenceChange) {
        onInferenceChange(data);
      }
    },
  });

  // Run inference whenever telemetry values change if model is available
  useEffect(() => {
    if (isModelAvailable) {
      mutate(telemetry);
    }
  }, [telemetry, normalizedType, isModelAvailable, mutate]);

  const handleSliderChange = (key: keyof MLTelemetryInput, val: number) => {
    setActivePreset('custom');
    setTelemetry((prev) => ({ ...prev, [key]: val }));
  };

  const applyPreset = (presetKey: string) => {
    setActivePreset(presetKey);
    const p = activeConfig.presets[presetKey];
    if (p) {
      setTelemetry(p.values);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Healthy':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Warning':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Degrading':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'Critical':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default:
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    }
  };

  // If model is NOT available for this equipment type, render honest blocked state
  if (!isModelAvailable) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <FileQuestion className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white">
                {normalizedType === 'robotic_arm'
                  ? `Robotic Arm AI Model Temporarily Inactive`
                  : `ML Model Not Yet Available for ${equipmentName || equipmentType}`}
              </h2>
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400 border border-amber-500/30">
                {normalizedType === 'robotic_arm' ? 'Disabled by Config' : 'Awaiting Model Artifact'}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              {normalizedType === 'robotic_arm'
                ? 'Robotic Arm model inference is temporarily disabled per configuration. Active genuine ML models are running for CNC Machine, Industrial Compressor, and Centrifugal Pump.'
                : `No genuine trained ML artifact exists on disk for equipment type ${normalizedType}. Per strict system honesty rules, PredictX does not synthesize or fabricate ML scores.`}
            </p>
            <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <AlertCircle className="h-4 w-4 text-slate-400" />
                Active Model Deployment Status:
              </div>
              <ul className="mt-2 space-y-1 text-xs text-slate-400 list-disc list-inside">
                <li><strong className="text-emerald-400">CNC Machine:</strong> <code className="text-slate-300">cnc_complete_system.pkl</code> (Active ✅)</li>
                <li><strong className="text-emerald-400">Compressor:</strong> <code className="text-slate-300">compressor_predictive_maintenance_model.pkl</code> (Active ✅)</li>
                <li><strong className="text-emerald-400">Centrifugal Pump:</strong> <code className="text-slate-300">pump_predictive_maintenance.pkl</code> (Active ✅)</li>
                <li><strong className="text-slate-400">Robotic Arm:</strong> Temporarily disabled per configuration.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">
                {activeConfig.title}
              </h2>
              <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> {activeConfig.badge}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {activeConfig.subtitle}
            </p>
          </div>
        </div>

        {/* Model Accuracy Badge */}
        <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-slate-400">Model Accuracy:</span>
            <span className="font-semibold text-emerald-400">{activeConfig.accuracy}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div>
            <span className="text-slate-400">F1 Score:</span>{' '}
            <span className="font-semibold text-indigo-400">{activeConfig.f1}</span>
          </div>
        </div>
      </div>

      {/* Preset Scenarios */}
      <div className="my-4">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Operational Scenarios & Presets
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Object.entries(activeConfig.presets).map(([key, p]) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className={`flex flex-col items-start rounded-lg border p-2.5 text-left transition-all ${
                activePreset === key
                  ? 'border-indigo-500 bg-indigo-500/10 shadow-sm shadow-indigo-500/20'
                  : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <span>{p.icon}</span>
                <span>{p.name}</span>
              </div>
              <span className="mt-1 line-clamp-1 text-[11px] text-slate-400">
                {p.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Controls vs Results */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Telemetry Sliders (7 cols) */}
        <div className="space-y-4 rounded-xl border border-slate-800/80 bg-slate-950/50 p-4 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
              <Sliders className="h-3.5 w-3.5 text-indigo-400" />
              Adjust Telemetry Inputs
            </span>
            <span className="text-xs text-slate-500">Real-time reactive</span>
          </div>

          {/* Vibration RMS */}
          <div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">Vibration RMS</span>
              <span className="font-mono text-indigo-400">
                {telemetry.vibration_rms.toFixed(2)} mm/s
              </span>
            </div>
            <input
              type="range"
              min="0.4"
              max="8.0"
              step="0.05"
              value={telemetry.vibration_rms}
              onChange={(e) => handleSliderChange('vibration_rms', parseFloat(e.target.value))}
              className="mt-1 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0.4 mm/s (Optimal)</span>
              <span>4.0 (Warning)</span>
              <span>6.0+ (Critical)</span>
            </div>
          </div>

          {/* Motor Temperature */}
          <div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">Operating Temperature</span>
              <span className="font-mono text-indigo-400">
                {telemetry.temperature_motor.toFixed(1)} °C
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="110"
              step="0.5"
              value={telemetry.temperature_motor}
              onChange={(e) => handleSliderChange('temperature_motor', parseFloat(e.target.value))}
              className="mt-1 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>30 °C</span>
              <span>75 °C (Warning)</span>
              <span>85 °C+ (Thermal Limit)</span>
            </div>
          </div>

          {/* Phase Current */}
          <div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">Phase Current</span>
              <span className="font-mono text-indigo-400">
                {telemetry.current_phase_avg.toFixed(1)} A
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="38"
              step="0.5"
              value={telemetry.current_phase_avg}
              onChange={(e) => handleSliderChange('current_phase_avg', parseFloat(e.target.value))}
              className="mt-1 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>5 A (No Load)</span>
              <span>24 A (Heavy Load)</span>
              <span>30 A+ (Overcurrent)</span>
            </div>
          </div>

          {/* Pressure Level */}
          <div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">Pressure Level</span>
              <span className="font-mono text-indigo-400">
                {telemetry.pressure_level.toFixed(2)} bar
              </span>
            </div>
            <input
              type="range"
              min="1.5"
              max="8.0"
              step="0.1"
              value={telemetry.pressure_level}
              onChange={(e) => handleSliderChange('pressure_level', parseFloat(e.target.value))}
              className="mt-1 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1.5 bar (Severe Drop)</span>
              <span>4.5 (Warning)</span>
              <span>6.2 bar (Nominal)</span>
            </div>
          </div>

          {/* Operating Speed (RPM) & Operating Hours */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300">Speed (RPM)</span>
                <span className="font-mono text-indigo-400">{Math.round(telemetry.rpm)} RPM</span>
              </div>
              <input
                type="range"
                min="500"
                max="2200"
                step="25"
                value={telemetry.rpm}
                onChange={(e) => handleSliderChange('rpm', parseFloat(e.target.value))}
                className="mt-1 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-indigo-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300">Operating Hours</span>
                <span className="font-mono text-indigo-400">
                  {Math.round(telemetry.hours_since_maintenance)} hrs
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1200"
                step="10"
                value={telemetry.hours_since_maintenance}
                onChange={(e) => handleSliderChange('hours_since_maintenance', parseFloat(e.target.value))}
                className="mt-1 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Model Output & Signals (5 cols) */}
        <div className="flex flex-col justify-between space-y-4 rounded-xl border border-slate-800/80 bg-slate-950/50 p-4 lg:col-span-5">
          {/* Health Score Summary Card */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-center">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Composite Health Score
            </span>
            <div className="mt-2 flex items-center justify-center gap-3">
              <span className="text-4xl font-extrabold tracking-tight text-white font-mono">
                {result?.healthScore !== undefined ? result.healthScore.toFixed(1) : '--'}
              </span>
              <span className="text-xl text-slate-500">/ 100</span>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${getStatusColor(
                  result?.healthStatus
                )}`}
              >
                {result?.healthStatus || 'Calculating...'}
              </span>
            </div>
            <p className="mt-2 text-[11px] font-mono text-slate-400">
              Formula: {result?.formula || 'Multi-Signal Fusion'}
            </p>
          </div>

          {/* Tri-Signal Breakdown */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tri-Signal Detection Pipeline
            </span>

            {/* Signal 1: XGBoost */}
            <div className="rounded-lg border border-slate-800/70 bg-slate-900/40 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  Signal 1: XGBoost 24h Risk
                </span>
                <span className="font-mono font-bold text-slate-200">
                  {result?.signals ? `${result.signals.xgboost.riskScore.toFixed(1)}%` : '--'}
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    result?.signals?.xgboost?.triggered ? 'bg-rose-500' : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.min(100, result?.signals?.xgboost?.riskScore ?? 0)}%` }}
                />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                <span>Threshold: {result?.signals?.xgboost?.threshold ?? 0.32}</span>
                {result?.signals?.xgboost?.triggered ? (
                  <span className="text-rose-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Risk Limit Exceeded
                  </span>
                ) : (
                  <span className="text-emerald-400 font-medium">Normal</span>
                )}
              </div>
            </div>

            {/* Signal 2: Isolation Forest */}
            <div className="rounded-lg border border-slate-800/70 bg-slate-900/40 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-cyan-400" />
                  Signal 2: Isolation Forest Anomaly
                </span>
                <span className="font-mono font-bold text-slate-200">
                  {result?.signals ? `${result.signals.isolationForest.anomalyRisk.toFixed(1)}%` : '--'}
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    result?.signals?.isolationForest?.triggered ? 'bg-rose-500' : 'bg-cyan-400'
                  }`}
                  style={{ width: `${Math.min(100, result?.signals?.isolationForest?.anomalyRisk ?? 0)}%` }}
                />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                <span>Threshold: {result?.signals?.isolationForest?.threshold ?? 70}%</span>
                {result?.signals?.isolationForest?.triggered ? (
                  <span className="text-rose-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Outlier Anomaly
                  </span>
                ) : (
                  <span className="text-emerald-400 font-medium">In Distribution</span>
                )}
              </div>
            </div>

            {/* Signal 3: LSTM */}
            <div className="rounded-lg border border-slate-800/70 bg-slate-900/40 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-purple-400" />
                  Signal 3: 2-Layer Temporal LSTM
                </span>
                <span className="font-mono font-bold text-slate-200">
                  {result?.signals ? `${(result.signals.lstm.probability * 100).toFixed(1)}%` : '--'}
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    result?.signals?.lstm?.triggered ? 'bg-rose-500' : 'bg-purple-400'
                  }`}
                  style={{ width: `${Math.min(100, (result?.signals?.lstm?.probability ?? 0) * 100)}%` }}
                />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                <span>Threshold: {result?.signals ? `${(result.signals.lstm.threshold * 100).toFixed(0)}%` : '60%'}</span>
                {result?.signals?.lstm?.triggered ? (
                  <span className="text-rose-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Temporal Warning
                  </span>
                ) : (
                  <span className="text-emerald-400 font-medium">Sequence Stable</span>
                )}
              </div>
            </div>
          </div>

          {/* Final Gated Decision Box */}
          <div
            className={`rounded-lg border p-3 ${
              result?.predictedFailure === 1
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              {result?.predictedFailure === 1 ? (
                <>
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  <span>Predicted Decision: FAILURE GATED (Alert Triggered)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Predicted Decision: NORMAL OPERATION</span>
                </>
              )}
            </div>
            <p className="mt-1 text-[11px] text-slate-300">
              <span className="font-semibold text-slate-200">Gating Logic:</span>{' '}
              {result?.decisionRule || 'Normal Operating Boundary'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLModelPlayground;
