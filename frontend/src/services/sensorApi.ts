import type { SensorReading } from '../types';
import type { TimeWindow } from '../utils/chartData';

const API = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

export async function fetchCurrentReadings(equipmentId: string): Promise<SensorReading | null> {
  const res = await fetch(`${API}/equipment/${equipmentId}/readings?latest=true`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch readings for ${equipmentId}: ${res.status}`);
  const readings: SensorReading[] = await res.json();
  return readings.length > 0 ? readings[0] : null;
}

export async function fetchHistoricalReadings(
  equipmentId: string,
  paramKey: string,
  window: TimeWindow,
): Promise<SensorReading[]> {
  const res = await fetch(
    `${API}/equipment/${equipmentId}/readings?param=${paramKey}&window=${window}`
  );
  if (!res.ok) throw new Error(`Failed to fetch historical readings: ${res.status}`);
  return res.json();
}
