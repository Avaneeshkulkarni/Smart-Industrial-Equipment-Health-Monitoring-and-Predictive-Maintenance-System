import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { mockCurrentReadings } from '../data/sensorData';
import { mockEquipment } from '../data/equipment';
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
// =============================================================================

const BASE_INTERVAL_MS = parseInt(import.meta.env.VITE_SIMULATION_INTERVAL_MS ?? '3000', 10);

/** Small realistic drift: base value ±2% per tick, occasional spike */
function drift(value: number, range: number, spikeChance: number = 0.02): number {
  const noise = (Math.random() - 0.5) * range * 0.04;
  const spike = Math.random() < spikeChance ? range * (Math.random() > 0.5 ? 0.1 : -0.1) : 0;
  return Math.max(0, value + noise + spike);
}

export function useLiveSimulation(): void {
  const queryClient = useQueryClient();
  const simulationEnabled = useAppStore(s => s.simulationEnabled);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      const toUpdate = mockEquipment
        .filter(() => Math.random() > 0.5)
        .slice(0, 4);

      toUpdate.forEach(equipment => {
        const reading = mockCurrentReadings[equipment.id];
        if (!reading) return;

        // Drift each parameter slightly
        const newValues = { ...reading.values };
        Object.entries(newValues).forEach(([key, val]) => {
          newValues[key] = drift(val, val);
        });

        const updated = {
          ...reading,
          timestamp: new Date().toISOString(),
          values: newValues,
        };

        // Update in mock data so re-renders pick up the new value
        mockCurrentReadings[equipment.id] = updated;

        // Invalidate TanStack Query cache so components re-fetch
        // TODO: When WebSocket is added, replace setInterval with:
        //   socket.on('sensor_reading', (data) => {
        //     queryClient.setQueryData(['currentReadings', data.equipmentId], data);
        //   });
        queryClient.setQueryData(
          ['currentReadings', equipment.id],
          updated,
        );
      });
    }, BASE_INTERVAL_MS + jitter);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [simulationEnabled, queryClient]);
}
