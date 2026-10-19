import type { Alert, AlertSeverity, AlertStatus } from '../types';

const API = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

export interface AlertFilters {
  severity?: AlertSeverity;
  status?: AlertStatus;
  equipmentId?: string;
}

export async function fetchAlerts(filters?: AlertFilters): Promise<Alert[]> {
  const params = new URLSearchParams();
  if (filters?.severity) params.set('severity', filters.severity);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.equipmentId) params.set('equipmentId', filters.equipmentId);

  const qs = params.toString();
  const res = await fetch(`${API}/alerts${qs ? `?${qs}` : ''}`);
  if (!res.ok) throw new Error(`Failed to fetch alerts: ${res.status}`);
  return res.json();
}

export async function acknowledgeAlert(alertId: string, _userId: string): Promise<void> {
  const res = await fetch(`${API}/alerts/${alertId}/acknowledge`, { method: 'PATCH' });
  if (!res.ok) throw new Error(`Failed to acknowledge alert ${alertId}: ${res.status}`);
}

export async function resolveAlert(alertId: string): Promise<void> {
  const res = await fetch(`${API}/alerts/${alertId}/resolve`, { method: 'PATCH' });
  if (!res.ok) throw new Error(`Failed to resolve alert ${alertId}: ${res.status}`);
}
