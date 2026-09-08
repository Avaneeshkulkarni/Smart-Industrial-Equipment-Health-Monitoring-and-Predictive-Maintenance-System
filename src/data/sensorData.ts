import type { SensorReading } from '../types';

/**
 * Mock sensor data — current readings per equipment.
 * Values are logically consistent with health scores and alert conditions:
 *   PMP-002 (critical 61%): high vibration → cavitation risk
 *   CMP-001 (warning 76%):  rising temperature
 *   CMP-003 (critical 59%): very high temp + pressure abnormality
 *   MTR-002 (warning 78%):  elevated temperature + vibration
 *   CNC-002 (warning 82%):  high tool wear index
 *
 * TODO: Replace with GET /api/equipment/:id/readings when backend is available.
 */

const now = new Date().toISOString();

export const mockCurrentReadings: Record<string, SensorReading> = {
  'MTR-001': {
    timestamp: now,
    equipmentId: 'MTR-001',
    values: {
      temperature: 62.4,
      vibration: 1.82,
      current: 87.3,
      voltage: 400,
      rpm: 2985,
      power: 34.8,
    },
  },
  'MTR-002': {
    timestamp: now,
    equipmentId: 'MTR-002',
    values: {
      temperature: 83.7,   // above warning threshold (80°C)
      vibration: 4.51,     // above warning threshold (4 mm/s)
      current: 138.2,
      voltage: 398,
      rpm: 2920,
      power: 54.8,
    },
  },
  'MTR-003': {
    timestamp: now,
    equipmentId: 'MTR-003',
    values: {
      temperature: 55.1,
      vibration: 1.12,
      current: 72.4,
      voltage: 401,
      rpm: 2990,
      power: 29.0,
    },
  },
  'PMP-001': {
    timestamp: now,
    equipmentId: 'PMP-001',
    values: {
      temperature: 48.3,
      vibration: 2.14,
      pressure: 8.2,
      flowRate: 95.4,
      current: 68.1,
      rpm: 1480,
    },
  },
  'PMP-002': {
    timestamp: now,
    equipmentId: 'PMP-002',
    values: {
      temperature: 71.8,   // above warning threshold (70°C)
      vibration: 6.87,     // CRITICAL — above critical threshold (6 mm/s)
      pressure: 5.1,       // low pressure → consistent with cavitation
      flowRate: 14.3,      // low flow — cavitation signature
      current: 128.4,
      rpm: 1390,
    },
  },
  'PMP-003': {
    timestamp: now,
    equipmentId: 'PMP-003',
    values: {
      temperature: 41.2,
      vibration: 1.38,
      pressure: 10.4,
      flowRate: 118.7,
      current: 52.3,
      rpm: 1490,
    },
  },
  'CMP-001': {
    timestamp: now,
    equipmentId: 'CMP-001',
    values: {
      temperature: 87.4,   // above warning threshold (85°C) — rising trend
      pressure: 14.2,
      vibration: 3.12,
      current: 178.9,
      rpm: 3450,
      power: 62.4,
    },
  },
  'CMP-002': {
    timestamp: now,
    equipmentId: 'CMP-002',
    values: {
      temperature: 71.3,
      pressure: 12.8,
      vibration: 1.87,
      current: 142.1,
      rpm: 3380,
      power: 50.7,
    },
  },
  'CMP-003': {
    timestamp: now,
    equipmentId: 'CMP-003',
    values: {
      temperature: 103.2,  // CRITICAL — above critical threshold (100°C)
      pressure: 24.8,      // above warning threshold (22 bar)
      vibration: 5.94,     // near critical threshold (6 mm/s)
      current: 218.7,
      rpm: 3820,
      power: 78.3,
    },
  },
  'CNC-001': {
    timestamp: now,
    equipmentId: 'CNC-001',
    values: {
      spindleTemperature: 51.2,
      vibration: 1.44,
      spindleSpeed: 8200,
      power: 14.7,
      toolWear: 0.22,
      motorCurrent: 42.1,
    },
  },
  'CNC-002': {
    timestamp: now,
    equipmentId: 'CNC-002',
    values: {
      spindleTemperature: 64.8,
      vibration: 3.21,
      spindleSpeed: 7800,
      power: 18.3,
      toolWear: 0.74,     // above warning threshold (0.7) — primary issue
      motorCurrent: 61.4,
    },
  },
  'CNC-003': {
    timestamp: now,
    equipmentId: 'CNC-003',
    values: {
      spindleTemperature: 43.7,
      vibration: 0.98,
      spindleSpeed: 9400,
      power: 11.2,
      toolWear: 0.11,
      motorCurrent: 34.8,
    },
  },
};

// ─── Historical Data Generator ─────────────────────────────────────────────
/**
 * Generates realistic-looking historical time-series data for charts.
 * Pattern depends on equipment health state:
 *   healthy  → small random fluctuation around nominal
 *   warning  → gradual drift upward toward threshold
 *   critical → sharp deviation, crossing thresholds
 */
function generateHistory(
  equipmentId: string,
  paramKey: string,
  baseValue: number,
  pattern: 'stable' | 'drifting' | 'deviating',
  points: number = 288,       // 288 × 5min = 24h
  intervalMinutes: number = 5,
): SensorReading[] {
  const readings: SensorReading[] = [];
  const nowMs = Date.now();

  for (let i = points; i >= 0; i--) {
    const timestamp = new Date(nowMs - i * intervalMinutes * 60 * 1000).toISOString();
    let value: number;

    switch (pattern) {
      case 'stable':
        value = baseValue + (Math.random() - 0.5) * baseValue * 0.04;
        break;
      case 'drifting': {
        // Gradual upward drift over the full window
        const driftFraction = (points - i) / points;
        value = baseValue * (1 + driftFraction * 0.15) + (Math.random() - 0.5) * baseValue * 0.03;
        break;
      }
      case 'deviating': {
        // Sharp deviation in the last 20% of the window
        const deviationStart = points * 0.8;
        if (i < deviationStart) {
          const deviationFraction = (deviationStart - i) / (deviationStart * 0.2);
          value = baseValue * (1 + Math.min(deviationFraction, 1) * 0.35) + (Math.random() - 0.5) * baseValue * 0.05;
        } else {
          value = baseValue + (Math.random() - 0.5) * baseValue * 0.04;
        }
        break;
      }
    }

    readings.push({
      timestamp,
      equipmentId,
      values: { [paramKey]: Math.max(0, value) },
    });
  }

  return readings;
}

export const mockHistoricalData: Record<string, Record<string, SensorReading[]>> = {
  'MTR-001': {
    temperature: generateHistory('MTR-001', 'temperature', 62, 'stable'),
    vibration:   generateHistory('MTR-001', 'vibration', 1.8, 'stable'),
    current:     generateHistory('MTR-001', 'current', 87, 'stable'),
  },
  'MTR-002': {
    temperature: generateHistory('MTR-002', 'temperature', 75, 'drifting'),
    vibration:   generateHistory('MTR-002', 'vibration', 3.8, 'drifting'),
    current:     generateHistory('MTR-002', 'current', 128, 'drifting'),
  },
  'MTR-003': {
    temperature: generateHistory('MTR-003', 'temperature', 55, 'stable'),
    vibration:   generateHistory('MTR-003', 'vibration', 1.1, 'stable'),
    current:     generateHistory('MTR-003', 'current', 72, 'stable'),
  },
  'PMP-001': {
    vibration:   generateHistory('PMP-001', 'vibration', 2.1, 'stable'),
    pressure:    generateHistory('PMP-001', 'pressure', 8.2, 'stable'),
    flowRate:    generateHistory('PMP-001', 'flowRate', 95, 'stable'),
  },
  'PMP-002': {
    vibration:   generateHistory('PMP-002', 'vibration', 4.5, 'deviating'),
    pressure:    generateHistory('PMP-002', 'pressure', 6.8, 'deviating'),
    flowRate:    generateHistory('PMP-002', 'flowRate', 60, 'deviating'),
    temperature: generateHistory('PMP-002', 'temperature', 62, 'drifting'),
  },
  'PMP-003': {
    vibration:   generateHistory('PMP-003', 'vibration', 1.4, 'stable'),
    pressure:    generateHistory('PMP-003', 'pressure', 10.4, 'stable'),
    flowRate:    generateHistory('PMP-003', 'flowRate', 118, 'stable'),
  },
  'CMP-001': {
    temperature: generateHistory('CMP-001', 'temperature', 80, 'drifting'),
    pressure:    generateHistory('CMP-001', 'pressure', 13.8, 'stable'),
    vibration:   generateHistory('CMP-001', 'vibration', 2.8, 'drifting'),
  },
  'CMP-002': {
    temperature: generateHistory('CMP-002', 'temperature', 71, 'stable'),
    pressure:    generateHistory('CMP-002', 'pressure', 12.8, 'stable'),
    vibration:   generateHistory('CMP-002', 'vibration', 1.9, 'stable'),
  },
  'CMP-003': {
    temperature: generateHistory('CMP-003', 'temperature', 88, 'deviating'),
    pressure:    generateHistory('CMP-003', 'pressure', 20, 'deviating'),
    vibration:   generateHistory('CMP-003', 'vibration', 4.2, 'deviating'),
  },
  'CNC-001': {
    spindleTemperature: generateHistory('CNC-001', 'spindleTemperature', 51, 'stable'),
    vibration:          generateHistory('CNC-001', 'vibration', 1.4, 'stable'),
    toolWear:           generateHistory('CNC-001', 'toolWear', 0.22, 'stable'),
  },
  'CNC-002': {
    spindleTemperature: generateHistory('CNC-002', 'spindleTemperature', 59, 'drifting'),
    vibration:          generateHistory('CNC-002', 'vibration', 2.8, 'drifting'),
    toolWear:           generateHistory('CNC-002', 'toolWear', 0.55, 'drifting'),
  },
  'CNC-003': {
    spindleTemperature: generateHistory('CNC-003', 'spindleTemperature', 43, 'stable'),
    vibration:          generateHistory('CNC-003', 'vibration', 1.0, 'stable'),
    toolWear:           generateHistory('CNC-003', 'toolWear', 0.11, 'stable'),
  },
};
