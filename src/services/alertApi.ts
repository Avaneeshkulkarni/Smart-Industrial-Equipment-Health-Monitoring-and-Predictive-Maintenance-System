import { mockAlerts } from '../data/alerts';
import type { Alert, AlertSeverity, AlertStatus } from '../types';

// TODO: Replace with axios.get(`${import.meta.env.VITE_API_BASE_URL}/alerts`)

export interface AlertFilters {
  severity?: AlertSeverity;
  status?: AlertStatus;
  equipmentId?: string;
}

export async function fetchAlerts(filters?: AlertFilters): Promise<Alert[]> {
  await new Promise(r => setTimeout(r, 250));
  let result = [...mockAlerts];

  if (filters?.severity) result = result.filter(a => a.severity === filters.severity);
  if (filters?.status) result = result.filter(a => a.status === filters.status);
  if (filters?.equipmentId) result = result.filter(a => a.equipmentId === filters.equipmentId);

  return result.sort((a, b) =>
    new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()
  );
}

export async function acknowledgeAlert(alertId: string, userId: string): Promise<void> {
  // TODO: PATCH /api/alerts/:id/acknowledge
  await new Promise(r => setTimeout(r, 150));
  const alert = mockAlerts.find(a => a.id === alertId);
  if (alert) {
    alert.status = 'acknowledged';
    alert.acknowledgedAt = new Date().toISOString();
    alert.acknowledgedBy = userId;
  }
}

export async function resolveAlert(alertId: string): Promise<void> {
  // TODO: PATCH /api/alerts/:id/resolve
  await new Promise(r => setTimeout(r, 150));
  const alert = mockAlerts.find(a => a.id === alertId);
  if (alert) {
    alert.status = 'resolved';
    alert.resolvedAt = new Date().toISOString();
  }
}
