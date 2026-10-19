const API = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

export interface MLTelemetryInput {
  vibration_rms: number;
  temperature_motor: number;
  current_phase_avg: number;
  pressure_level: number;
  rpm: number;
  ambient_temp: number;
  hours_since_maintenance: number;
  history?: Array<Record<string, number>>;
}

export interface MLPredictionResponse {
  available?: boolean;
  message?: string;
  healthScore?: number;
  healthStatus?: 'Healthy' | 'Warning' | 'Degrading' | 'Critical';
  predictedFailure?: number;
  decisionRule?: string;
  anomalyWarning?: boolean;
  temporalWarning?: boolean;
  signals?: {
    xgboost: {
      probability: number;
      riskScore: number;
      threshold: number;
      triggered: boolean;
    };
    isolationForest: {
      anomalyRisk: number;
      threshold: number;
      triggered: boolean;
    };
    lstm: {
      probability: number;
      threshold: number;
      triggered: boolean;
    };
  };
  formula?: string;
  modelMetadata?: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1?: number;
    [key: string]: any;
  };
  equipmentId?: string;
  equipmentName?: string;
  equipmentType?: string;
  normalizedType?: string;
}

export interface MLModelStatusItem {
  available: boolean;
  status: 'ready' | 'blocked' | 'unavailable';
  modelType?: string;
  description?: string;
  reason?: string;
}

export async function fetchMLStatus(): Promise<{ models: Record<string, MLModelStatusItem> }> {
  const res = await fetch(`${API}/ml/status`);
  if (!res.ok) {
    throw new Error(`Failed to fetch ML status: ${res.status}`);
  }
  return res.json();
}

export async function runEquipmentInference(
  equipmentType: string,
  telemetry: MLTelemetryInput
): Promise<MLPredictionResponse> {
  const res = await fetch(`${API}/ml/predict/${equipmentType}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(telemetry),
  });
  if (!res.ok) {
    throw new Error(`ML inference failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function runRoboticArmInference(telemetry: MLTelemetryInput): Promise<MLPredictionResponse> {
  return runEquipmentInference('robotic_arm', telemetry);
}

export async function fetchModelMetadata(equipmentType: string = 'robotic_arm'): Promise<{ loaded: boolean; metadata: any }> {
  const res = await fetch(`${API}/ml/${equipmentType}/metadata`);
  if (!res.ok) {
    throw new Error(`Failed to fetch ML metadata: ${res.status}`);
  }
  return res.json();
}

export async function fetchEquipmentMLInference(equipmentId: string): Promise<MLPredictionResponse> {
  const res = await fetch(`${API}/ml/equipment/${equipmentId}/inference`);
  if (!res.ok) {
    throw new Error(`Failed to fetch live ML inference: ${res.status}`);
  }
  return res.json();
}
