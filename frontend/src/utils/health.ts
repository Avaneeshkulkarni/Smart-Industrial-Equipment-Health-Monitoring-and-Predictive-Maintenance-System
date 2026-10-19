import type { HealthStatus, EquipmentStatus, AlertSeverity } from '../types';
import type { ParameterThresholds } from '../types';

// =============================================================================
// Health & Sensor Utilities
// Centralized logic — no repeated conditionals in components.
// =============================================================================

/**
 * Map a health score (0–100) to a status.
 * Thresholds: 90–100 = healthy, 70–89 = warning, 0–69 = critical.
 * These are prototype thresholds — not engineering standards.
 */
export function getHealthStatus(score: number): HealthStatus {
  if (score >= 90) return 'healthy';
  if (score >= 70) return 'warning';
  return 'critical';
}

/** Map HealthStatus to EquipmentStatus */
export function healthStatusToEquipmentStatus(status: HealthStatus): EquipmentStatus {
  return status; // They share the same values (minus 'offline')
}

/**
 * Determine sensor status based on current value and thresholds.
 * Returns 'critical', 'warning', or 'healthy'.
 * Handles both "high is bad" (most params) and "low is bad" (flow rate, voltage).
 */
export function getSensorStatus(
  value: number,
  thresholds: ParameterThresholds,
  lowIsBad: boolean = false,
): 'healthy' | 'warning' | 'critical' {
  if (lowIsBad) {
    if (value <= thresholds.critical) return 'critical';
    if (value <= thresholds.warning) return 'warning';
    return 'healthy';
  }
  if (value >= thresholds.critical) return 'critical';
  if (value >= thresholds.warning) return 'warning';
  return 'healthy';
}

/** Map an anomaly score (0–1) to alert severity */
export function getAlertSeverity(anomalyScore: number): AlertSeverity {
  if (anomalyScore >= 0.7) return 'critical';
  if (anomalyScore >= 0.4) return 'warning';
  return 'info';
}

/** Get a human-readable label for a health score */
export function getHealthLabel(score: number): string {
  const status = getHealthStatus(score);
  if (status === 'healthy') return 'Healthy';
  if (status === 'warning') return 'Warning';
  return 'Critical';
}

/** Get color class for health status */
export function getStatusColorClass(status: HealthStatus | EquipmentStatus | 'offline'): string {
  switch (status) {
    case 'healthy':  return 'text-emerald-400';
    case 'warning':  return 'text-amber-400';
    case 'critical': return 'text-red-400';
    case 'offline':  return 'text-slate-400';
    default:         return 'text-slate-400';
  }
}

/** Get background color class for health status badges */
export function getStatusBgClass(status: HealthStatus | EquipmentStatus | 'offline'): string {
  switch (status) {
    case 'healthy':  return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'warning':  return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    case 'critical': return 'bg-red-500/15 text-red-400 border-red-500/30';
    case 'offline':  return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    default:         return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  }
}

/** Get color for Recharts (hex values for chart elements) */
export function getStatusColor(status: HealthStatus | EquipmentStatus | 'offline'): string {
  switch (status) {
    case 'healthy':  return '#34d399'; // emerald-400
    case 'warning':  return '#fbbf24'; // amber-400
    case 'critical': return '#f87171'; // red-400
    case 'offline':  return '#94a3b8'; // slate-400
    default:         return '#94a3b8';
  }
}

/** Format a health score for display */
export function formatHealthScore(score: number): string {
  return `${Math.round(score)}%`;
}

/** Compute trend from array of recent health scores */
export function computeHealthTrend(scores: number[]): 'improving' | 'stable' | 'degrading' {
  if (scores.length < 2) return 'stable';
  const first = scores.slice(0, Math.floor(scores.length / 2));
  const second = scores.slice(Math.floor(scores.length / 2));
  const firstAvg = first.reduce((a, b) => a + b, 0) / first.length;
  const secondAvg = second.reduce((a, b) => a + b, 0) / second.length;
  const diff = secondAvg - firstAvg;
  if (diff > 2) return 'improving';
  if (diff < -2) return 'degrading';
  return 'stable';
}

/** Severity order for sorting */
export const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

/** Work order priority order */
export const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};
