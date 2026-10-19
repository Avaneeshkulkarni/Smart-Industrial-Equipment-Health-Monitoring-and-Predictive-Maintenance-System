import { create } from 'zustand';
import type { EquipmentType, EquipmentStatus } from '../types';

// =============================================================================
// App-level client state — selected plant, sidebar, filters
// NOT for server/API data (that lives in TanStack Query).
// =============================================================================

interface EquipmentFilters {
  type?: EquipmentType;
  status?: EquipmentStatus;
  search: string;
  sortBy: 'healthScore' | 'rul' | 'name' | 'id';
  sortDir: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
  categoryFilter?: EquipmentType;
}

interface AppState {
  selectedPlant: string;
  sidebarOpen: boolean;
  simulationEnabled: boolean;
  filters: EquipmentFilters;

  // Actions
  setSelectedPlant: (plantId: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSimulation: () => void;
  setFilter: (key: keyof EquipmentFilters, value: unknown) => void;
  resetFilters: () => void;
}

const defaultFilters: EquipmentFilters = {
  search: '',
  sortBy: 'healthScore',
  sortDir: 'asc',
  viewMode: 'grid',
};

export const useAppStore = create<AppState>((set) => ({
  selectedPlant: 'plant-1',
  sidebarOpen: true,
  simulationEnabled: true,
  filters: defaultFilters,

  setSelectedPlant: (plantId) => set({ selectedPlant: plantId }),
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSimulation: () => set(state => ({ simulationEnabled: !state.simulationEnabled })),
  setFilter: (key, value) =>
    set(state => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
