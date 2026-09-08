import equipmentConfig from '../config/equipmentConfig';
import type { EquipmentType, SensorParameter, ParameterThresholds } from '../types';

// =============================================================================
// Threshold Utilities
// Always reads from equipmentConfig — never hardcoded.
// =============================================================================

/**
 * Get thresholds for a specific parameter of an equipment type.
 * Returns { warning, critical } or null if parameter not found.
 */
export function getParameterThresholds(
  type: EquipmentType,
  paramKey: string,
): ParameterThresholds | null {
  const config = equipmentConfig[type];
  if (!config) return null;
  const param = config.parameters.find(p => p.key === paramKey);
  if (!param) return null;
  return {
    warning: param.warningThreshold,
    critical: param.criticalThreshold,
  };
}

/**
 * Get full parameter config for a specific param key in a type.
 */
export function getParameter(type: EquipmentType, paramKey: string): SensorParameter | null {
  const config = equipmentConfig[type];
  if (!config) return null;
  return config.parameters.find(p => p.key === paramKey) ?? null;
}

/**
 * Get all parameters for an equipment type.
 */
export function getParametersForType(type: EquipmentType): SensorParameter[] {
  return equipmentConfig[type]?.parameters ?? [];
}

/**
 * Update thresholds in place (for Settings page editing).
 * NOTE: This mutates the config object in memory only.
 * In production, this would PATCH /api/config/thresholds/:type/:param.
 */
export function updateThreshold(
  type: EquipmentType,
  paramKey: string,
  field: 'warningThreshold' | 'criticalThreshold',
  value: number,
): void {
  const param = equipmentConfig[type]?.parameters.find(p => p.key === paramKey);
  if (param) {
    param[field] = value;
  }
}

/**
 * Format a sensor value for display (respects decimalPlaces config).
 */
export function formatSensorValue(value: number, param: SensorParameter): string {
  const decimals = param.decimalPlaces ?? 1;
  const formatted = value.toFixed(decimals);
  return param.unit ? `${formatted} ${param.unit}` : formatted;
}

/**
 * Compute % of range a value occupies (for progress-bar type visualizations).
 * Clamped to [0, 1].
 */
export function normalizeToRange(value: number, param: SensorParameter): number {
  return Math.max(0, Math.min(1, (value - param.min) / (param.max - param.min)));
}
