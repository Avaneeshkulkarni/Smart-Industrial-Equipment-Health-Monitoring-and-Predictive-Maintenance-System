import { mockPredictions } from '../data/predictions';
import type { Prediction } from '../types';

// TODO: Replace with:
//   axios.get(`${import.meta.env.VITE_API_BASE_URL}/equipment/${id}/predictions`)
//   axios.get(`${import.meta.env.VITE_API_BASE_URL}/equipment/${id}/rul`)

export async function fetchPredictions(equipmentId: string): Promise<Prediction | null> {
  await new Promise(r => setTimeout(r, 400));
  return mockPredictions[equipmentId] ?? null;
}

export async function fetchAllPredictions(): Promise<Record<string, Prediction>> {
  await new Promise(r => setTimeout(r, 300));
  return mockPredictions;
}
