import { create } from 'zustand';
import { mockWorkOrders } from '../data/maintenance';
import type { WorkOrder, WorkOrderStatus } from '../types';

// Work order state is client-local (mutations before backend is wired)
// TODO: Replace mutations with API calls to PATCH /api/maintenance/work-orders/:id

interface WorkOrderState {
  workOrders: WorkOrder[];

  updateStatus: (id: string, status: WorkOrderStatus) => void;
  assignTechnician: (id: string, technician: string) => void;
  createWorkOrder: (wo: Omit<WorkOrder, 'id' | 'createdDate'>) => void;
}

export const useWorkOrderStore = create<WorkOrderState>((set) => ({
  workOrders: [...mockWorkOrders],

  updateStatus: (id, status) =>
    set(state => ({
      workOrders: state.workOrders.map(wo =>
        wo.id === id
          ? {
              ...wo,
              status,
              completedDate: status === 'completed' ? new Date().toISOString().split('T')[0] : wo.completedDate,
            }
          : wo,
      ),
    })),

  assignTechnician: (id, technician) =>
    set(state => ({
      workOrders: state.workOrders.map(wo =>
        wo.id === id ? { ...wo, technician } : wo,
      ),
    })),

  createWorkOrder: (wo) =>
    set(state => ({
      workOrders: [
        {
          ...wo,
          id: `WO-${String(Date.now()).slice(-5)}`,
          createdDate: new Date().toISOString().split('T')[0],
        },
        ...state.workOrders,
      ],
    })),
}));
