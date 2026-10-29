import { Activity, Gauge, Wind, Cpu, Bot } from 'lucide-react';
import type { EquipmentType, SensorParameter } from '../types';

/**
 * Equipment configuration keyed by EquipmentType.
 *
 * IMPORTANT: To add a new equipment type in the future (e.g. Gearbox, Conveyor,
 * Generator, Transformer), add ONE entry here. No new page/dashboard components needed.
 *
 * Active equipment types: robotic_arm | electric_motor | pump | compressor | cnc_machine
 */

export interface EquipmentConfigEntry {
  type: EquipmentType;
  displayName: string;
  description: string;
  icon: typeof Activity;       // Lucide icon component
  idPrefix: string;            // e.g. "MTR", "PMP"
  parameters: SensorParameter[];
  failureModes: string[];
}

export type EquipmentConfig = Record<EquipmentType, EquipmentConfigEntry>;

// =============================================================================
// PROTOTYPE THRESHOLDS — NOT ENGINEERING STANDARDS
// These are demo values for UI purposes only. Real operational limits must be
// established by equipment manufacturers and process engineers.
// All thresholds are editable from the Settings page (stored in central config).
// =============================================================================

const equipmentConfig: EquipmentConfig = {
  // ---------------------------------------------------------------------------
  // PUMP
  // ---------------------------------------------------------------------------
  pump: {
    type: 'pump',
    displayName: 'Pump',
    description: 'Centrifugal pump for fluid transfer and process circulation.',
    icon: Gauge,
    idPrefix: 'PMP',
    parameters: [
      {
        key: 'temperature',
        label: 'Temperature',
        unit: '°C',
        category: 'thermal',
        min: 0,
        max: 120,
        warningThreshold: 70,   // PROTOTYPE — see note above
        criticalThreshold: 85,  // PROTOTYPE — see note above
        decimalPlaces: 1,
      },
      {
        key: 'vibration',
        label: 'Vibration',
        unit: 'mm/s',
        category: 'mechanical',
        min: 0,
        max: 20,
        warningThreshold: 4,    // PROTOTYPE — see note above
        criticalThreshold: 6,   // PROTOTYPE — see note above
        decimalPlaces: 2,
      },
      {
        key: 'pressure',
        label: 'Pressure',
        unit: 'bar',
        category: 'process',
        min: 0,
        max: 20,
        warningThreshold: 15,
        criticalThreshold: 18,
        decimalPlaces: 2,
      },
      {
        key: 'flowRate',
        label: 'Flow Rate',
        unit: 'm³/h',
        category: 'process',
        min: 0,
        max: 200,
        warningThreshold: 20,   // low flow warning
        criticalThreshold: 10,  // very low flow (cavitation risk)
        decimalPlaces: 1,
      },
      {
        key: 'current',
        label: 'Current',
        unit: 'A',
        category: 'electrical',
        min: 0,
        max: 150,
        warningThreshold: 120,
        criticalThreshold: 140,
        decimalPlaces: 1,
      },
      {
        key: 'rpm',
        label: 'RPM',
        unit: 'RPM',
        category: 'mechanical',
        min: 0,
        max: 3000,
        warningThreshold: 2800,
        criticalThreshold: 2950,
        decimalPlaces: 0,
      },
    ],
    failureModes: [
      'Cavitation',
      'Bearing Failure',
      'Seal Leakage',
      'Impeller Damage',
      'Blockage',
      'Shaft Misalignment',
      'Overheating',
    ],
  },

  // ---------------------------------------------------------------------------
  // COMPRESSOR
  // ---------------------------------------------------------------------------
  compressor: {
    type: 'compressor',
    displayName: 'Compressor',
    description: 'Industrial air/gas compressor for process and utility applications.',
    icon: Wind,
    idPrefix: 'CMP',
    parameters: [
      {
        key: 'temperature',
        label: 'Temperature',
        unit: '°C',
        category: 'thermal',
        min: 0,
        max: 160,
        warningThreshold: 85,   // PROTOTYPE — see note above
        criticalThreshold: 100, // PROTOTYPE — see note above
        decimalPlaces: 1,
      },
      {
        key: 'pressure',
        label: 'Pressure',
        unit: 'bar',
        category: 'process',
        min: 0,
        max: 30,
        warningThreshold: 22,
        criticalThreshold: 26,
        decimalPlaces: 2,
      },
      {
        key: 'vibration',
        label: 'Vibration',
        unit: 'mm/s',
        category: 'mechanical',
        min: 0,
        max: 20,
        warningThreshold: 4,    // PROTOTYPE — see note above
        criticalThreshold: 6,   // PROTOTYPE — see note above
        decimalPlaces: 2,
      },
      {
        key: 'current',
        label: 'Current',
        unit: 'A',
        category: 'electrical',
        min: 0,
        max: 250,
        warningThreshold: 200,
        criticalThreshold: 230,
        decimalPlaces: 1,
      },
      {
        key: 'rpm',
        label: 'RPM',
        unit: 'RPM',
        category: 'mechanical',
        min: 0,
        max: 5000,
        warningThreshold: 4600,
        criticalThreshold: 4800,
        decimalPlaces: 0,
      },
      {
        key: 'power',
        label: 'Power',
        unit: 'kW',
        category: 'electrical',
        min: 0,
        max: 750,
        warningThreshold: 650,
        criticalThreshold: 700,
        decimalPlaces: 1,
      },
    ],
    failureModes: [
      'Overheating',
      'Bearing Failure',
      'Air Leakage',
      'Excessive Vibration',
      'Pressure Abnormality',
      'Lubrication Failure',
      'Motor Failure',
    ],
  },

  // ---------------------------------------------------------------------------
  // CNC MACHINE
  // ---------------------------------------------------------------------------
  cnc_machine: {
    type: 'cnc_machine',
    displayName: 'CNC Machine',
    description: 'Computer numerically controlled precision machining center.',
    icon: Cpu,
    idPrefix: 'CNC',
    parameters: [
      {
        key: 'spindleTemperature',
        label: 'Spindle Temperature',
        unit: '°C',
        category: 'thermal',
        min: 0,
        max: 120,
        warningThreshold: 70,   // PROTOTYPE — see note above
        criticalThreshold: 85,  // PROTOTYPE — see note above
        decimalPlaces: 1,
      },
      {
        key: 'vibration',
        label: 'Vibration',
        unit: 'mm/s',
        category: 'mechanical',
        min: 0,
        max: 20,
        warningThreshold: 4,    // PROTOTYPE — see note above
        criticalThreshold: 6,   // PROTOTYPE — see note above
        decimalPlaces: 2,
      },
      {
        key: 'spindleSpeed',
        label: 'Spindle Speed',
        unit: 'RPM',
        category: 'mechanical',
        min: 0,
        max: 15000,
        warningThreshold: 13000,
        criticalThreshold: 14000,
        decimalPlaces: 0,
      },
      {
        key: 'power',
        label: 'Power',
        unit: 'kW',
        category: 'electrical',
        min: 0,
        max: 50,
        warningThreshold: 40,
        criticalThreshold: 45,
        decimalPlaces: 1,
      },
      {
        key: 'toolWear',
        label: 'Tool Wear Index',
        unit: '',
        category: 'quality',
        min: 0,
        max: 1,
        warningThreshold: 0.7,
        criticalThreshold: 0.85,
        decimalPlaces: 2,
      },
      {
        key: 'motorCurrent',
        label: 'Motor Current',
        unit: 'A',
        category: 'electrical',
        min: 0,
        max: 100,
        warningThreshold: 80,
        criticalThreshold: 90,
        decimalPlaces: 1,
      },
    ],
    failureModes: [
      'Tool Wear',
      'Spindle Failure',
      'Misalignment',
      'Excessive Vibration',
      'Overheating',
      'Motor Fault',
    ],
  },

  // ---------------------------------------------------------------------------
  // 6-AXIS ROBOTIC ARM (Multi-Signal ML Model)
  // ---------------------------------------------------------------------------
  robotic_arm: {
    type: 'robotic_arm',
    displayName: 'Robotic Arm',
    description: '6-Axis articulated industrial robot monitored via XGBoost + Isolation Forest + Bi-LSTM.',
    icon: Bot,
    idPrefix: 'ARM',
    parameters: [
      {
        key: 'vibration_rms',
        label: 'Vibration RMS',
        unit: 'mm/s',
        category: 'mechanical',
        min: 0,
        max: 10,
        warningThreshold: 4.0,
        criticalThreshold: 6.0,
        decimalPlaces: 2,
      },
      {
        key: 'temperature_motor',
        label: 'Joint Motor Temp',
        unit: '°C',
        category: 'thermal',
        min: 20,
        max: 120,
        warningThreshold: 75,
        criticalThreshold: 85,
        decimalPlaces: 1,
      },
      {
        key: 'current_phase_avg',
        label: 'Phase Current',
        unit: 'A',
        category: 'electrical',
        min: 0,
        max: 40,
        warningThreshold: 24,
        criticalThreshold: 30,
        decimalPlaces: 1,
      },
      {
        key: 'pressure_level',
        label: 'Pneumatic Pressure',
        unit: 'bar',
        category: 'process',
        min: 0,
        max: 10,
        warningThreshold: 4.5,
        criticalThreshold: 3.5,
        decimalPlaces: 2,
      },
      {
        key: 'rpm',
        label: 'Axis Speed',
        unit: 'RPM',
        category: 'mechanical',
        min: 0,
        max: 2500,
        warningThreshold: 1200,
        criticalThreshold: 800,
        decimalPlaces: 0,
      },
      {
        key: 'ambient_temp',
        label: 'Ambient Temp',
        unit: '°C',
        category: 'thermal',
        min: 10,
        max: 50,
        warningThreshold: 35,
        criticalThreshold: 42,
        decimalPlaces: 1,
      },
      {
        key: 'hours_since_maintenance',
        label: 'Operating Hours',
        unit: 'hrs',
        category: 'process',
        min: 0,
        max: 2000,
        warningThreshold: 600,
        criticalThreshold: 900,
        decimalPlaces: 0,
      },
    ],
    failureModes: [
      'Gearbox Wear & Backlash',
      'Joint Motor Overheat',
      'Pneumatic Gripper Leak',
      'Axis Bearing Fatigue',
      'Payload Resonance',
    ],
  },
};

export default equipmentConfig;

/** Helper: get config entry for a given type */
export function getEquipmentConfig(type: EquipmentType): EquipmentConfigEntry {
  return equipmentConfig[type];
}

/** Helper: get a specific parameter config for a type */
export function getParameterConfig(type: EquipmentType, paramKey: string): SensorParameter | undefined {
  return equipmentConfig[type].parameters.find(p => p.key === paramKey);
}

/** Helper: get all parameter keys for a type */
export function getParameterKeys(type: EquipmentType): string[] {
  return equipmentConfig[type].parameters.map(p => p.key);
}
