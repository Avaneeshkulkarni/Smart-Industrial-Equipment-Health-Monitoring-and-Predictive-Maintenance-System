import type { Prediction } from '../types';

const API = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

export async function fetchPredictions(equipmentId: string): Promise<Prediction | null> {
  const res = await fetch(`${API}/equipment/${equipmentId}/predictions`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch predictions for ${equipmentId}: ${res.status}`);
  return res.json();
}

export async function fetchAllPredictions(): Promise<Record<string, Prediction>> {
  // Fetch all equipment first, then fetch predictions for each
  const equipRes = await fetch(`${API}/equipment`);
  if (!equipRes.ok) throw new Error(`Failed to fetch equipment: ${equipRes.status}`);
  const equipment: { id: string }[] = await equipRes.json();

  const results: Record<string, Prediction> = {};
  await Promise.all(
    equipment.map(async (e) => {
      const res = await fetch(`${API}/equipment/${e.id}/predictions`);
      if (res.ok) {
        results[e.id] = await res.json();
      }
    })
  );
  return results;
}
