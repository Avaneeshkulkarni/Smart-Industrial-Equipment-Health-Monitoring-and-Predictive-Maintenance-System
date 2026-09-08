import { Activity, Gauge, Wind, Cpu } from 'lucide-react';
import type { EquipmentType, SensorParameter } from '../types';

/**
 * Equipment configuration keyed by EquipmentType.
 *
 * IMPORTANT: To add a new equipment type in the future (e.g. Gearbox, Conveyor,
 * Generator, Transformer), add ONE entry here. No new page/dashboard components needed.
 *
 * Active equipment types: motor | pump | compressor | cnc
 * (No Chiller, no HVAC — those are NOT active equipment types in PredictX.)
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
  // ELECTRIC MOTOR
  // ---------------------------------------------------------------------------
  motor: {
    type: 'motor',
    displayName: 'Electric Motor',
    description: 'Rotary electrical machine converting electrical energy to mechanical energy.',
    icon: Activity,
    idPrefix: 'MTR',
    parameters: [
      {
        key: 'temperature',
        label: 'Temperature',
        unit: '°C',
        category: 'thermal',
        min: 0,
        max: 150,
        warningThreshold: 80,   // PROTOTYPE — see note above
        criticalThreshold: 95,  // PROTOTYPE — see note above
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
        key: 'current',
        label: 'Current',
        unit: 'A',
        category: 'electrical',
        min: 0,
        max: 200,
        warningThreshold: 150,
        criticalThreshold: 180,
        decimalPlaces: 1,
      },
      {
        key: 'voltage',
        label: 'Voltage',
        unit: 'V',
        category: 'electrical',
        min: 360,
        max: 440,
        warningThreshold: 380,
        criticalThreshold: 370,
        decimalPlaces: 0,
      },
      {
        key: 'rpm',
        label: 'RPM',
        unit: 'RPM',
        category: 'mechanical',
        min: 0,
        max: 3600,
        warningThreshold: 3400,
        criticalThreshold: 3550,
        decimalPlaces: 0,
      },
      {
        key: 'power',
        label: 'Power',
        unit: 'kW',
        category: 'electrical',
        min: 0,
        max: 500,
        warningThreshold: 420,
        criticalThreshold: 460,
        decimalPlaces: 1,
      },
    ],
    failureModes: [
      'Bearing Wear',
      'Overheating',
      'Rotor Imbalance',
      'Shaft Misalignment',
      'Electrical Fault',
      'Excessive Vibration',
    ],
  },

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
  cnc: {
    type: 'cnc',
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
