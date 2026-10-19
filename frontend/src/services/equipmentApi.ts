import type { Equipment, EquipmentType, EquipmentStatus } from '../types';

const API = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

export interface EquipmentFilters {
  type?: EquipmentType;
  status?: EquipmentStatus;
  plant?: string;
  search?: string;
}

export async function fetchEquipment(filters?: EquipmentFilters): Promise<Equipment[]> {
  const params = new URLSearchParams();
  if (filters?.type) params.set('type', filters.type);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.plant) params.set('plant', filters.plant);
  if (filters?.search) params.set('search', filters.search);

  const qs = params.toString();
  const res = await fetch(`${API}/equipment${qs ? `?${qs}` : ''}`);
  if (!res.ok) throw new Error(`Failed to fetch equipment: ${res.status}`);
  return res.json();
}

export async function fetchEquipmentById(id: string): Promise<Equipment | null> {
  const res = await fetch(`${API}/equipment/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch equipment ${id}: ${res.status}`);
  return res.json();
}

export async function fetchPlants() {
  // Plants endpoint not yet implemented on backend — return hardcoded for now.
  // TODO: Add GET /api/plants endpoint when needed.
  return [
    { id: 'plant-1', name: 'Alpha Manufacturing Plant', location: 'Detroit, MI', timezone: 'America/Detroit' },
    { id: 'plant-2', name: 'Beta Assembly Facility', location: 'Cleveland, OH', timezone: 'America/New_York' },
  ];
}
