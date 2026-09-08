// =============================================================================
// PredictX Core Types
// =============================================================================

// --------------- Equipment ---------------

export type EquipmentType = 'motor' | 'pump' | 'compressor' | 'cnc';

export type EquipmentStatus = 'healthy' | 'warning' | 'critical' | 'offline';

export interface Plant {
  id: string;
  name: string;
  location: string;
  timezone: string;
}

export interface Equipment {
  id: string;                  // e.g. "MTR-001"
  name: string;
  type: EquipmentType;
  status: EquipmentStatus;
  healthScore: number;         // 0–100
  plant: string;               // plant ID
  location: string;            // e.g. "Bay A, Line 3"
  installDate: string;         // ISO date string
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  ratedPower?: number;         // kW
  operatingHours: number;
  tags: string[];
}

// --------------- Sensor Parameters ---------------

export type ParameterCategory = 'thermal' | 'mechanical' | 'electrical' | 'process' | 'quality';

export interface SensorParameter {
  key: string;                 // e.g. "temperature", "vibration", "toolWear"
  label: string;               // Human-readable: "Temperature", "Vibration"
  unit: string;                // °C, mm/s, A, bar, etc.
  category: ParameterCategory;
  min: number;
  max: number;
  /** PROTOTYPE THRESHOLD — NOT AN ENGINEERING STANDARD. Editable from Settings. */
  warningThreshold: number;
  /** PROTOTYPE THRESHOLD — NOT AN ENGINEERING STANDARD. Editable from Settings. */
  criticalThreshold: number;
  decimalPlaces?: number;
}

export interface ParameterThresholds {
  warning: number;
  critical: number;
}

// --------------- Sensor Readings ---------------

/**
 * Flexible sensor reading — values keyed by parameterKey, not fixed fields.
 * Different equipment types have different parameters; never assume a fixed shape.
 */
export interface SensorReading {
  timestamp: string;           // ISO datetime
  equipmentId: string;
  values: { [parameterKey: string]: number };
}

// --------------- Health ---------------

export type HealthStatus = 'healthy' | 'warning' | 'critical';

export interface HealthSnapshot {
  equipmentId: string;
  timestamp: string;
  score: number;               // 0–100
  status: HealthStatus;
  anomalyScore: number;        // 0–1 (higher = more anomalous)
  trend: 'improving' | 'stable' | 'degrading';
}

// --------------- Alerts ---------------

export type AlertSeverity = 'info' | 'warning' | 'critical';

export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface Alert {
  id: string;
  equipmentId: string;
  equipmentName: string;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  message: string;
  parameterKey?: string;       // Which sensor triggered this
  parameterValue?: number;
  threshold?: number;
  triggeredAt: string;         // ISO datetime
  acknowledgedAt?: string;
  resolvedAt?: string;
  acknowledgedBy?: string;
}

// --------------- Predictions ---------------

/**
 * Fault prediction for a specific failure mode.
 * Labeled as DEMO PREDICTION / MOCK ML OUTPUT — not a real trained model.
 */
export interface FaultPrediction {
  failureMode: string;
  probability: number;         // 0–1
  confidenceInterval: [number, number]; // [lower, upper]
}

/**
 * RUL = Remaining Useful Life estimate.
 * Labeled as DEMO PREDICTION / MOCK ML OUTPUT.
 */
export interface RULPrediction {
  equipmentId: string;
  estimatedDays: number;
  confidenceLevel: number;     // 0–1
  lowerBound: number;          // days
  upperBound: number;          // days
  basisParameters: string[];   // which sensor params drove this estimate
  timestamp: string;
}

export interface Prediction {
  equipmentId: string;
  timestamp: string;
  /**
   * DEMO PREDICTION — MOCK ML OUTPUT.
   * This is prototype data, not output from a trained model.
   */
  anomalyScore: number;        // 0–1
  riskScore: number;           // 0–100
  predictionConfidence: number; // 0–1
  faultPredictions: FaultPrediction[];
  rul: RULPrediction;
}

// --------------- Maintenance ---------------

export type WorkOrderStatus = 'pending' | 'scheduled' | 'in-progress' | 'completed';

export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'critical';

export interface WorkOrder {
  id: string;
  equipmentId: string;
  equipmentName: string;
  issue: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  technician?: string;
  createdDate: string;
  scheduledDate?: string;
  completedDate?: string;
  estimatedDuration?: number;  // hours
  notes?: string;
}

export interface MaintenanceRecommendation {
  id: string;
  equipmentId: string;
  title: string;
  description: string;
  priority: WorkOrderPriority;
  estimatedCost?: number;
  estimatedDowntime?: number;  // hours
  basedOn: string[];           // fault prediction IDs / sensor thresholds
  createdAt: string;
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  type: 'preventive' | 'corrective' | 'predictive' | 'inspection';
  description: string;
  performedBy: string;
  date: string;
  duration: number;            // hours
  cost?: number;
  findings?: string;
  partsReplaced?: string[];
}

// --------------- Users ---------------

export type UserRole = 'plant-manager' | 'maintenance' | 'admin' | 'operator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plant: string;
  avatar?: string;
}

// --------------- Analytics ---------------

export interface HealthDistributionPoint {
  range: string;
  count: number;
}

export interface EquipmentTypeMetric {
  type: EquipmentType;
  displayName: string;
  avgHealth: number;
  count: number;
  criticalCount: number;
  warningCount: number;
}

export interface AnalyticsSummary {
  totalEquipment: number;
  healthyCount: number;
  warningCount: number;
  criticalCount: number;
  offlineCount: number;
  avgHealthScore: number;
  activeAlerts: number;
  pendingWorkOrders: number;
  anomaliesDetected: number;   // last 24h
}
