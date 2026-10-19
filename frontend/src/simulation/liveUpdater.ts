import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../store/appStore';

// =============================================================================
// Live Simulation — Isolated mock update loop
//
// Designed to be fully swappable for a WebSocket feed without touching any
// UI components. Components only consume data via TanStack Query — when the
// WebSocket comes in, replace this hook body with a socket.on('reading', ...)
// listener that calls queryClient.setQueryData() the same way.
//
// VITE_ENABLE_LIVE_SIMULATION controls whether this runs.
//
// Now fetches initial data from the backend API and drifts values in-memory.
// =============================================================================

const BASE_INTERVAL_MS = parseInt(import.meta.env.VITE_SIMULATION_INTERVAL_MS ?? '3000', 10);
const API = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

/** Small realistic drift: base value ±2% per tick, occasional spike */
function drift(value: number, range: number, spikeChance: number = 0.02): number {
  const noise = (Math.random() - 0.5) * range * 0.04;
  const spike = Math.random() < spikeChance ? range * (Math.random() > 0.5 ? 0.1 : -0.1) : 0;
  return Math.max(0, value + noise + spike);
}

interface EquipmentBasic { id: string }
interface SensorReading { timestamp: string; equipmentId: string; values: Record<string, number> }

// In-memory cache of latest readings per equipment (for drift simulation)
const latestReadings: Record<string, SensorReading> = {};

export function useLiveSimulation(): void {
  const queryClient = useQueryClient();
  const simulationEnabled = useAppStore(s => s.simulationEnabled);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initializedRef = useRef(false);

  // Fetch initial equipment list and current readings from the API
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    (async () => {
      try {
        const eqRes = await fetch(`${API}/equipment`);
        if (!eqRes.ok) return;
        const equipment: EquipmentBasic[] = await eqRes.json();

        await Promise.all(
          equipment.map(async (e) => {
            const readingsRes = await fetch(`${API}/equipment/${e.id}/readings?latest=true`);
            if (!readingsRes.ok) return;
            const readings: SensorReading[] = await readingsRes.json();
            if (readings.length > 0) {
              latestReadings[e.id] = readings[0];
            }
          })
        );
      } catch (err) {
        console.warn('Live simulation: failed to fetch initial readings', err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!simulationEnabled) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    if (import.meta.env.VITE_ENABLE_LIVE_SIMULATION === 'false') return;

    // Randomize interval slightly to simulate asynchronous sensor reporting
    const jitter = (Math.random() - 0.5) * 1000;

    intervalRef.current = setInterval(() => {
      // Pick a random subset of equipment to update this tick (not all at once)
      const equipmentIds = Object.keys(latestReadings);
      const toUpdate = equipmentIds
        .filter(() => Math.random() > 0.5)
        .slice(0, 4);

      toUpdate.forEach(equipmentId => {
        const reading = latestReadings[equipmentId];
        if (!reading) return;

        // Drift each parameter slightly
        const newValues = { ...reading.values };
        Object.entries(newValues).forEach(([key, val]) => {
          newValues[key] = drift(val, val);
        });

        const updated: SensorReading = {
          ...reading,
          timestamp: new Date().toISOString(),
          values: newValues,
        };

        // Update in local cache so re-renders pick up the new value
        latestReadings[equipmentId] = updated;

        // Invalidate TanStack Query cache so components re-fetch
        queryClient.setQueryData(
          ['currentReadings', equipmentId],
          updated,
        );
      });
    }, BASE_INTERVAL_MS + jitter);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [simulationEnabled, queryClient]);
}
