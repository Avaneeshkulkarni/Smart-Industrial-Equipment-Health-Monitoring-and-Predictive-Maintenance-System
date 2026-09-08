import { mockCurrentReadings, mockHistoricalData } from '../data/sensorData';
import type { SensorReading } from '../types';
import type { TimeWindow } from '../utils/chartData';

// TODO: Replace with:
//   axios.get(`${import.meta.env.VITE_API_BASE_URL}/equipment/${id}/readings`)
//   axios.get(`${import.meta.env.VITE_API_BASE_URL}/equipment/${id}/health`)

export async function fetchCurrentReadings(equipmentId: string): Promise<SensorReading | null> {
  await new Promise(r => setTimeout(r, 200));
  return mockCurrentReadings[equipmentId] ?? null;
}

export async function fetchHistoricalReadings(
  equipmentId: string,
  paramKey: string,
  window: TimeWindow,
): Promise<SensorReading[]> {
  await new Promise(r => setTimeout(r, 350));
  const history = mockHistoricalData[equipmentId]?.[paramKey] ?? [];

  const windowHours: Record<TimeWindow, number> = {
    '1H': 1, '6H': 6, '24H': 24, '7D': 168, '30D': 720,
  };
  const cutoff = Date.now() - windowHours[window] * 60 * 60 * 1000;
  return history.filter(r => new Date(r.timestamp).getTime() >= cutoff);
}
