import { mockRecommendations, mockWorkOrders, mockMaintenanceHistory } from '../data/maintenance';
import type { WorkOrder, MaintenanceRecommendation, MaintenanceRecord, WorkOrderStatus } from '../types';

// TODO: Replace with axios.get(`${import.meta.env.VITE_API_BASE_URL}/maintenance`)

export async function fetchRecommendations(equipmentId?: string): Promise<MaintenanceRecommendation[]> {
  await new Promise(r => setTimeout(r, 250));
  if (equipmentId) return mockRecommendations.filter(r => r.equipmentId === equipmentId);
  return mockRecommendations;
}

export async function fetchWorkOrders(equipmentId?: string): Promise<WorkOrder[]> {
  await new Promise(r => setTimeout(r, 200));
  if (equipmentId) return mockWorkOrders.filter(wo => wo.equipmentId === equipmentId);
  return mockWorkOrders;
}

export async function fetchMaintenanceHistory(equipmentId?: string): Promise<MaintenanceRecord[]> {
  await new Promise(r => setTimeout(r, 200));
  if (equipmentId) return mockMaintenanceHistory.filter(h => h.equipmentId === equipmentId);
  return mockMaintenanceHistory;
}

export async function updateWorkOrderStatus(_id: string, _status: WorkOrderStatus): Promise<void> {
  // TODO: PATCH /api/maintenance/work-orders/:id
  await new Promise(r => setTimeout(r, 150));
}
