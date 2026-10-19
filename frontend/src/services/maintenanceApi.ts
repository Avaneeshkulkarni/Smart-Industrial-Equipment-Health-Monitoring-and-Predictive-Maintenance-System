import type { WorkOrder, MaintenanceRecommendation, MaintenanceRecord, WorkOrderStatus } from '../types';

const API = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

export async function fetchRecommendations(equipmentId?: string): Promise<MaintenanceRecommendation[]> {
  const params = equipmentId ? `?equipmentId=${equipmentId}` : '';
  const res = await fetch(`${API}/maintenance/recommendations${params}`);
  if (!res.ok) throw new Error(`Failed to fetch recommendations: ${res.status}`);
  return res.json();
}

export async function fetchWorkOrders(equipmentId?: string): Promise<WorkOrder[]> {
  const params = equipmentId ? `?equipmentId=${equipmentId}` : '';
  const res = await fetch(`${API}/maintenance/work-orders${params}`);
  if (!res.ok) throw new Error(`Failed to fetch work orders: ${res.status}`);
  return res.json();
}

export async function fetchMaintenanceHistory(equipmentId?: string): Promise<MaintenanceRecord[]> {
  const params = equipmentId ? `?equipmentId=${equipmentId}` : '';
  const res = await fetch(`${API}/maintenance/history${params}`);
  if (!res.ok) throw new Error(`Failed to fetch maintenance history: ${res.status}`);
  return res.json();
}

export async function updateWorkOrderStatus(_id: string, _status: WorkOrderStatus): Promise<void> {
  // TODO: PATCH /api/maintenance/work-orders/:id — not yet implemented on backend
  // For now, this is a no-op; the workOrderStore handles local state
}
