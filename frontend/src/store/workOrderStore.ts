import { create } from 'zustand';
import type { WorkOrder, WorkOrderStatus } from '../types';
import { fetchWorkOrders } from '../services/maintenanceApi';

// Work order state is client-local (mutations before backend write endpoints are wired)
// Initial data is fetched from the API on first load.
// TODO: Replace mutations with API calls to PATCH /api/maintenance/work-orders/:id

interface WorkOrderState {
  workOrders: WorkOrder[];
  initialized: boolean;

  initialize: () => Promise<void>;
  updateStatus: (id: string, status: WorkOrderStatus) => void;
  assignTechnician: (id: string, technician: string) => void;
  createWorkOrder: (wo: Omit<WorkOrder, 'id' | 'createdDate'>) => void;
}

export const useWorkOrderStore = create<WorkOrderState>((set, get) => ({
  workOrders: [],
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;
    try {
      const orders = await fetchWorkOrders();
      set({ workOrders: orders, initialized: true });
    } catch (e) {
      console.error('Failed to fetch work orders:', e);
    }
  },

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
