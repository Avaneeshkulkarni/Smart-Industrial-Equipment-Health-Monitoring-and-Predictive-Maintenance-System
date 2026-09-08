import { mockEquipment, mockPlants } from '../data/equipment';
import type { Equipment, EquipmentType, EquipmentStatus } from '../types';

// TODO: Replace mock returns with: axios.get(`${import.meta.env.VITE_API_BASE_URL}/equipment`)
// Future endpoint: GET /api/equipment
// Future endpoint: GET /api/equipment/:id

export interface EquipmentFilters {
  type?: EquipmentType;
  status?: EquipmentStatus;
  plant?: string;
  search?: string;
}

export async function fetchEquipment(filters?: EquipmentFilters): Promise<Equipment[]> {
  await new Promise(r => setTimeout(r, 300)); // simulate network
  let result = [...mockEquipment];

  if (filters?.type) result = result.filter(e => e.type === filters.type);
  if (filters?.status) result = result.filter(e => e.status === filters.status);
  if (filters?.plant) result = result.filter(e => e.plant === filters.plant);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q),
    );
  }

  return result;
}

export async function fetchEquipmentById(id: string): Promise<Equipment | null> {
  await new Promise(r => setTimeout(r, 200));
  return mockEquipment.find(e => e.id === id) ?? null;
}

export async function fetchPlants() {
  await new Promise(r => setTimeout(r, 100));
  return mockPlants;
}
