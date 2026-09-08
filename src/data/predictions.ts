import type { Prediction } from '../types';

/**
 * DEMO PREDICTIONS — MOCK ML OUTPUT
 * These are prototype values for UI demonstration purposes only.
 * They are NOT output from a trained machine learning model.
 * Fault probabilities are logically consistent with sensor readings and health scores.
 *
 * TODO: Replace with GET /api/equipment/:id/predictions and /:id/rul when backend is available.
 */

const now = new Date().toISOString();

export const mockPredictions: Record<string, Prediction> = {
  'MTR-001': {
    equipmentId: 'MTR-001',
    timestamp: now,
    anomalyScore: 0.08,
    riskScore: 12,
    predictionConfidence: 0.87,
    faultPredictions: [
      { failureMode: 'Bearing Wear',        probability: 0.05, confidenceInterval: [0.02, 0.09] },
      { failureMode: 'Overheating',         probability: 0.04, confidenceInterval: [0.01, 0.08] },
      { failureMode: 'Rotor Imbalance',     probability: 0.03, confidenceInterval: [0.01, 0.06] },
      { failureMode: 'Shaft Misalignment',  probability: 0.02, confidenceInterval: [0.00, 0.05] },
      { failureMode: 'Electrical Fault',    probability: 0.02, confidenceInterval: [0.00, 0.04] },
      { failureMode: 'Excessive Vibration', probability: 0.02, confidenceInterval: [0.00, 0.04] },
    ],
    rul: {
      equipmentId: 'MTR-001',
      estimatedDays: 210,
      confidenceLevel: 0.84,
      lowerBound: 185,
      upperBound: 240,
      basisParameters: ['temperature', 'vibration', 'current'],
      timestamp: now,
    },
  },

  'MTR-002': {
    equipmentId: 'MTR-002',
    timestamp: now,
    anomalyScore: 0.42,
    riskScore: 51,
    predictionConfidence: 0.76,
    faultPredictions: [
      { failureMode: 'Bearing Wear',        probability: 0.38, confidenceInterval: [0.28, 0.49] },
      { failureMode: 'Excessive Vibration', probability: 0.34, confidenceInterval: [0.24, 0.45] },
      { failureMode: 'Overheating',         probability: 0.28, confidenceInterval: [0.19, 0.38] },
      { failureMode: 'Shaft Misalignment',  probability: 0.18, confidenceInterval: [0.10, 0.27] },
      { failureMode: 'Rotor Imbalance',     probability: 0.12, confidenceInterval: [0.06, 0.20] },
      { failureMode: 'Electrical Fault',    probability: 0.07, confidenceInterval: [0.02, 0.14] },
    ],
    rul: {
      equipmentId: 'MTR-002',
      estimatedDays: 62,
      confidenceLevel: 0.71,
      lowerBound: 45,
      upperBound: 85,
      basisParameters: ['temperature', 'vibration'],
      timestamp: now,
    },
  },

  'MTR-003': {
    equipmentId: 'MTR-003',
    timestamp: now,
    anomalyScore: 0.05,
    riskScore: 7,
    predictionConfidence: 0.91,
    faultPredictions: [
      { failureMode: 'Bearing Wear',        probability: 0.03, confidenceInterval: [0.01, 0.06] },
      { failureMode: 'Overheating',         probability: 0.02, confidenceInterval: [0.00, 0.05] },
      { failureMode: 'Rotor Imbalance',     probability: 0.02, confidenceInterval: [0.00, 0.04] },
      { failureMode: 'Shaft Misalignment',  probability: 0.01, confidenceInterval: [0.00, 0.03] },
      { failureMode: 'Electrical Fault',    probability: 0.01, confidenceInterval: [0.00, 0.03] },
      { failureMode: 'Excessive Vibration', probability: 0.01, confidenceInterval: [0.00, 0.02] },
    ],
    rul: {
      equipmentId: 'MTR-003',
      estimatedDays: 285,
      confidenceLevel: 0.91,
      lowerBound: 260,
      upperBound: 315,
      basisParameters: ['temperature', 'vibration', 'current'],
      timestamp: now,
    },
  },

  'PMP-001': {
    equipmentId: 'PMP-001',
    timestamp: now,
    anomalyScore: 0.15,
    riskScore: 22,
    predictionConfidence: 0.83,
    faultPredictions: [
      { failureMode: 'Cavitation',         probability: 0.08, confidenceInterval: [0.03, 0.15] },
      { failureMode: 'Bearing Failure',    probability: 0.06, confidenceInterval: [0.02, 0.12] },
      { failureMode: 'Seal Leakage',       probability: 0.05, confidenceInterval: [0.01, 0.10] },
      { failureMode: 'Impeller Damage',    probability: 0.04, confidenceInterval: [0.01, 0.09] },
      { failureMode: 'Blockage',           probability: 0.03, confidenceInterval: [0.01, 0.07] },
      { failureMode: 'Shaft Misalignment', probability: 0.03, confidenceInterval: [0.00, 0.07] },
      { failureMode: 'Overheating',        probability: 0.02, confidenceInterval: [0.00, 0.05] },
    ],
    rul: {
      equipmentId: 'PMP-001',
      estimatedDays: 165,
      confidenceLevel: 0.81,
      lowerBound: 145,
      upperBound: 190,
      basisParameters: ['vibration', 'pressure', 'flowRate'],
      timestamp: now,
    },
  },

  'PMP-002': {
    equipmentId: 'PMP-002',
    timestamp: now,
    anomalyScore: 0.79,
    riskScore: 84,
    predictionConfidence: 0.74,
    // High cavitation + bearing failure consistent with high vibration, low pressure, low flow
    faultPredictions: [
      { failureMode: 'Cavitation',         probability: 0.72, confidenceInterval: [0.61, 0.82] },
      { failureMode: 'Bearing Failure',    probability: 0.58, confidenceInterval: [0.46, 0.69] },
      { failureMode: 'Impeller Damage',    probability: 0.41, confidenceInterval: [0.29, 0.53] },
      { failureMode: 'Shaft Misalignment', probability: 0.22, confidenceInterval: [0.13, 0.33] },
      { failureMode: 'Seal Leakage',       probability: 0.19, confidenceInterval: [0.10, 0.29] },
      { failureMode: 'Blockage',           probability: 0.14, confidenceInterval: [0.06, 0.23] },
      { failureMode: 'Overheating',        probability: 0.11, confidenceInterval: [0.04, 0.20] },
    ],
    rul: {
      equipmentId: 'PMP-002',
      estimatedDays: 18,
      confidenceLevel: 0.66,
      lowerBound: 8,
      upperBound: 32,
      basisParameters: ['vibration', 'pressure', 'flowRate', 'temperature'],
      timestamp: now,
    },
  },

  'PMP-003': {
    equipmentId: 'PMP-003',
    timestamp: now,
    anomalyScore: 0.06,
    riskScore: 9,
    predictionConfidence: 0.90,
    faultPredictions: [
      { failureMode: 'Cavitation',         probability: 0.03, confidenceInterval: [0.01, 0.07] },
      { failureMode: 'Bearing Failure',    probability: 0.02, confidenceInterval: [0.00, 0.06] },
      { failureMode: 'Seal Leakage',       probability: 0.02, confidenceInterval: [0.00, 0.05] },
      { failureMode: 'Impeller Damage',    probability: 0.02, confidenceInterval: [0.00, 0.05] },
      { failureMode: 'Blockage',           probability: 0.01, confidenceInterval: [0.00, 0.04] },
      { failureMode: 'Shaft Misalignment', probability: 0.01, confidenceInterval: [0.00, 0.03] },
      { failureMode: 'Overheating',        probability: 0.01, confidenceInterval: [0.00, 0.03] },
    ],
    rul: {
      equipmentId: 'PMP-003',
      estimatedDays: 298,
      confidenceLevel: 0.92,
      lowerBound: 270,
      upperBound: 330,
      basisParameters: ['vibration', 'pressure', 'flowRate'],
      timestamp: now,
    },
  },

  'CMP-001': {
    equipmentId: 'CMP-001',
    timestamp: now,
    anomalyScore: 0.38,
    riskScore: 47,
    predictionConfidence: 0.78,
    // Overheating primary, consistent with rising temp
    faultPredictions: [
      { failureMode: 'Overheating',          probability: 0.44, confidenceInterval: [0.33, 0.56] },
      { failureMode: 'Lubrication Failure',  probability: 0.31, confidenceInterval: [0.21, 0.42] },
      { failureMode: 'Bearing Failure',      probability: 0.24, confidenceInterval: [0.15, 0.35] },
      { failureMode: 'Air Leakage',          probability: 0.12, confidenceInterval: [0.05, 0.21] },
      { failureMode: 'Excessive Vibration',  probability: 0.10, confidenceInterval: [0.04, 0.18] },
      { failureMode: 'Pressure Abnormality', probability: 0.08, confidenceInterval: [0.02, 0.16] },
      { failureMode: 'Motor Failure',        probability: 0.05, confidenceInterval: [0.01, 0.12] },
    ],
    rul: {
      equipmentId: 'CMP-001',
      estimatedDays: 74,
      confidenceLevel: 0.73,
      lowerBound: 55,
      upperBound: 98,
      basisParameters: ['temperature', 'vibration'],
      timestamp: now,
    },
  },

  'CMP-002': {
    equipmentId: 'CMP-002',
    timestamp: now,
    anomalyScore: 0.09,
    riskScore: 14,
    predictionConfidence: 0.88,
    faultPredictions: [
      { failureMode: 'Overheating',          probability: 0.05, confidenceInterval: [0.01, 0.10] },
      { failureMode: 'Bearing Failure',      probability: 0.04, confidenceInterval: [0.01, 0.09] },
      { failureMode: 'Air Leakage',          probability: 0.04, confidenceInterval: [0.01, 0.09] },
      { failureMode: 'Excessive Vibration',  probability: 0.03, confidenceInterval: [0.01, 0.07] },
      { failureMode: 'Pressure Abnormality', probability: 0.03, confidenceInterval: [0.01, 0.07] },
      { failureMode: 'Lubrication Failure',  probability: 0.02, confidenceInterval: [0.00, 0.05] },
      { failureMode: 'Motor Failure',        probability: 0.01, confidenceInterval: [0.00, 0.04] },
    ],
    rul: {
      equipmentId: 'CMP-002',
      estimatedDays: 230,
      confidenceLevel: 0.87,
      lowerBound: 205,
      upperBound: 260,
      basisParameters: ['temperature', 'vibration', 'current'],
      timestamp: now,
    },
  },

  'CMP-003': {
    equipmentId: 'CMP-003',
    timestamp: now,
    anomalyScore: 0.83,
    riskScore: 91,
    predictionConfidence: 0.71,
    // Overheating + pressure abnormality + bearing consistent with critical sensor readings
    faultPredictions: [
      { failureMode: 'Overheating',          probability: 0.81, confidenceInterval: [0.70, 0.90] },
      { failureMode: 'Pressure Abnormality', probability: 0.65, confidenceInterval: [0.53, 0.76] },
      { failureMode: 'Lubrication Failure',  probability: 0.52, confidenceInterval: [0.40, 0.64] },
      { failureMode: 'Bearing Failure',      probability: 0.45, confidenceInterval: [0.33, 0.57] },
      { failureMode: 'Excessive Vibration',  probability: 0.38, confidenceInterval: [0.27, 0.50] },
      { failureMode: 'Motor Failure',        probability: 0.21, confidenceInterval: [0.12, 0.32] },
      { failureMode: 'Air Leakage',          probability: 0.14, confidenceInterval: [0.06, 0.24] },
    ],
    rul: {
      equipmentId: 'CMP-003',
      estimatedDays: 9,
      confidenceLevel: 0.61,
      lowerBound: 3,
      upperBound: 20,
      basisParameters: ['temperature', 'pressure', 'vibration'],
      timestamp: now,
    },
  },

  'CNC-001': {
    equipmentId: 'CNC-001',
    timestamp: now,
    anomalyScore: 0.07,
    riskScore: 10,
    predictionConfidence: 0.90,
    faultPredictions: [
      { failureMode: 'Tool Wear',           probability: 0.04, confidenceInterval: [0.01, 0.09] },
      { failureMode: 'Spindle Failure',     probability: 0.03, confidenceInterval: [0.01, 0.07] },
      { failureMode: 'Misalignment',        probability: 0.02, confidenceInterval: [0.00, 0.06] },
      { failureMode: 'Excessive Vibration', probability: 0.02, confidenceInterval: [0.00, 0.05] },
      { failureMode: 'Overheating',         probability: 0.02, confidenceInterval: [0.00, 0.05] },
      { failureMode: 'Motor Fault',         probability: 0.01, confidenceInterval: [0.00, 0.04] },
    ],
    rul: {
      equipmentId: 'CNC-001',
      estimatedDays: 245,
      confidenceLevel: 0.89,
      lowerBound: 220,
      upperBound: 275,
      basisParameters: ['spindleTemperature', 'vibration', 'toolWear'],
      timestamp: now,
    },
  },

  'CNC-002': {
    equipmentId: 'CNC-002',
    timestamp: now,
    anomalyScore: 0.31,
    riskScore: 38,
    predictionConfidence: 0.79,
    // Tool wear primary — consistent with toolWear index at 0.74
    faultPredictions: [
      { failureMode: 'Tool Wear',           probability: 0.68, confidenceInterval: [0.56, 0.79] },
      { failureMode: 'Spindle Failure',     probability: 0.22, confidenceInterval: [0.13, 0.32] },
      { failureMode: 'Overheating',         probability: 0.17, confidenceInterval: [0.09, 0.27] },
      { failureMode: 'Misalignment',        probability: 0.12, confidenceInterval: [0.05, 0.21] },
      { failureMode: 'Excessive Vibration', probability: 0.11, confidenceInterval: [0.04, 0.20] },
      { failureMode: 'Motor Fault',         probability: 0.07, confidenceInterval: [0.02, 0.14] },
    ],
    rul: {
      equipmentId: 'CNC-002',
      estimatedDays: 42,
      confidenceLevel: 0.74,
      lowerBound: 28,
      upperBound: 60,
      basisParameters: ['toolWear', 'spindleTemperature', 'vibration'],
      timestamp: now,
    },
  },

  'CNC-003': {
    equipmentId: 'CNC-003',
    timestamp: now,
    anomalyScore: 0.04,
    riskScore: 5,
    predictionConfidence: 0.94,
    faultPredictions: [
      { failureMode: 'Tool Wear',           probability: 0.02, confidenceInterval: [0.00, 0.05] },
      { failureMode: 'Spindle Failure',     probability: 0.02, confidenceInterval: [0.00, 0.05] },
      { failureMode: 'Misalignment',        probability: 0.01, confidenceInterval: [0.00, 0.04] },
      { failureMode: 'Excessive Vibration', probability: 0.01, confidenceInterval: [0.00, 0.03] },
      { failureMode: 'Overheating',         probability: 0.01, confidenceInterval: [0.00, 0.03] },
      { failureMode: 'Motor Fault',         probability: 0.01, confidenceInterval: [0.00, 0.02] },
    ],
    rul: {
      equipmentId: 'CNC-003',
      estimatedDays: 320,
      confidenceLevel: 0.95,
      lowerBound: 295,
      upperBound: 350,
      basisParameters: ['spindleTemperature', 'vibration', 'toolWear'],
      timestamp: now,
    },
  },
};
