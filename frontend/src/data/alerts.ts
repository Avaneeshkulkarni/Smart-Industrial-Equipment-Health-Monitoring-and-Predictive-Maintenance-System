import type { Alert } from '../types';

/**
 * Mock alerts — tied to actual sensor anomalies.
 * Alert text matches the sensor that triggered it.
 *
 * TODO: Replace with GET /api/alerts when backend is available.
 */
export const mockAlerts: Alert[] = [
  // PMP-002 — critical vibration / cavitation
  {
    id: 'ALT-001',
    equipmentId: 'PMP-002',
    equipmentName: 'Pump Beta',
    severity: 'critical',
    status: 'active',
    title: 'Critical Vibration — Cavitation Risk',
    message: 'Vibration at 6.87 mm/s exceeds critical threshold (6.0 mm/s). Low pressure (5.1 bar) and reduced flow rate (14.3 m³/h) indicate active cavitation. Immediate inspection required.',
    parameterKey: 'vibration',
    parameterValue: 6.87,
    threshold: 6.0,
    triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ALT-002',
    equipmentId: 'PMP-002',
    equipmentName: 'Pump Beta',
    severity: 'critical',
    status: 'active',
    title: 'Low Flow Rate — Possible Blockage or Cavitation',
    message: 'Flow rate dropped to 14.3 m³/h, significantly below normal operating range. Combined with high vibration, cavitation or impeller damage is suspected.',
    parameterKey: 'flowRate',
    parameterValue: 14.3,
    threshold: 20.0,
    triggeredAt: new Date(Date.now() - 2.2 * 60 * 60 * 1000).toISOString(),
  },

  // CMP-003 — critical temperature
  {
    id: 'ALT-003',
    equipmentId: 'CMP-003',
    equipmentName: 'Compressor Gamma',
    severity: 'critical',
    status: 'active',
    title: 'Critical Temperature — Overheating Detected',
    message: 'Discharge temperature at 103.2°C exceeds critical threshold (100°C). Risk of thermal shutdown and bearing damage. Check lubrication and cooling system immediately.',
    parameterKey: 'temperature',
    parameterValue: 103.2,
    threshold: 100,
    triggeredAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'ALT-004',
    equipmentId: 'CMP-003',
    equipmentName: 'Compressor Gamma',
    severity: 'critical',
    status: 'active',
    title: 'High Discharge Pressure',
    message: 'Discharge pressure at 24.8 bar exceeds warning threshold (22 bar). Combined with high temperature, pressure relief valve may activate. Inspect pressure regulation.',
    parameterKey: 'pressure',
    parameterValue: 24.8,
    threshold: 22,
    triggeredAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
  },

  // MTR-002 — warning temperature + vibration
  {
    id: 'ALT-005',
    equipmentId: 'MTR-002',
    equipmentName: 'Motor Beta',
    severity: 'warning',
    status: 'active',
    title: 'Elevated Temperature — Thermal Drift',
    message: 'Motor winding temperature at 83.7°C has crossed warning threshold (80°C) and is showing an upward trend over the past 8 hours. Inspect cooling fan and ventilation.',
    parameterKey: 'temperature',
    parameterValue: 83.7,
    threshold: 80,
    triggeredAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ALT-006',
    equipmentId: 'MTR-002',
    equipmentName: 'Motor Beta',
    severity: 'warning',
    status: 'acknowledged',
    title: 'Vibration Above Warning Threshold',
    message: 'Vibration at 4.51 mm/s exceeds warning threshold (4.0 mm/s). Possible bearing wear or rotor imbalance. Schedule vibration analysis.',
    parameterKey: 'vibration',
    parameterValue: 4.51,
    threshold: 4.0,
    triggeredAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    acknowledgedBy: 'J. Patel',
  },

  // CMP-001 — warning temperature
  {
    id: 'ALT-007',
    equipmentId: 'CMP-001',
    equipmentName: 'Compressor Alpha',
    severity: 'warning',
    status: 'active',
    title: 'Rising Temperature — Gradual Drift',
    message: 'Compressor temperature at 87.4°C and rising. Crossed warning threshold (85°C) 4 hours ago. Trend analysis indicates continued increase. Check intercooler and oil level.',
    parameterKey: 'temperature',
    parameterValue: 87.4,
    threshold: 85,
    triggeredAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },

  // CNC-002 — warning tool wear
  {
    id: 'ALT-008',
    equipmentId: 'CNC-002',
    equipmentName: 'CNC Beta',
    severity: 'warning',
    status: 'active',
    title: 'High Tool Wear Index',
    message: 'Tool wear index at 0.74 has exceeded warning threshold (0.70). Tool change recommended before next production run to prevent dimensional errors and spindle overloading.',
    parameterKey: 'toolWear',
    parameterValue: 0.74,
    threshold: 0.70,
    triggeredAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },

  // Historical resolved alerts
  {
    id: 'ALT-009',
    equipmentId: 'MTR-001',
    equipmentName: 'Motor Alpha',
    severity: 'info',
    status: 'resolved',
    title: 'Scheduled Maintenance Completed',
    message: 'Planned preventive maintenance completed on 2026-06-10. Bearings lubricated, cooling system cleaned, electrical connections inspected.',
    triggeredAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 89 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ALT-010',
    equipmentId: 'PMP-001',
    equipmentName: 'Pump Alpha',
    severity: 'warning',
    status: 'resolved',
    title: 'Pressure Fluctuation Detected (Resolved)',
    message: 'Intermittent pressure fluctuations observed. Root cause identified as partially closed isolation valve — corrected by operator.',
    parameterKey: 'pressure',
    parameterValue: 16.2,
    threshold: 15,
    triggeredAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
  },
];
