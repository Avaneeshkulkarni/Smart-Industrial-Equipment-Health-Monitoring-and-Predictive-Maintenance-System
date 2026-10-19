import { format } from 'date-fns';
import type { SensorReading } from '../types';

// =============================================================================
// Chart Data Utilities
// Generates properly windowed time-series data for Recharts.
// Now works with data fetched from the API instead of local mock data.
// =============================================================================

export type TimeWindow = '1H' | '6H' | '24H' | '7D' | '30D';

export interface ChartDataPoint {
  timestamp: string;
  displayTime: string;
  value: number;
  avg?: number;
  min?: number;
  max?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
}

/** Number of historical data points (5-min intervals) to include per window */
const WINDOW_POINTS: Record<TimeWindow, number> = {
  '1H':  12,
  '6H':  72,
  '24H': 288,
  '7D':  288,   // aggregated daily
  '30D': 288,   // aggregated weekly
};

/** Format for x-axis labels */
function formatTimestamp(date: Date, window: TimeWindow): string {
  switch (window) {
    case '1H':  return format(date, 'HH:mm');
    case '6H':  return format(date, 'HH:mm');
    case '24H': return format(date, 'HH:mm');
    case '7D':  return format(date, 'MM/dd HH:mm');
    case '30D': return format(date, 'MM/dd');
    default:    return format(date, 'HH:mm');
  }
}

/**
 * Convert raw SensorReading[] (from API) into ChartDataPoint[] for Recharts.
 * This replaces the old getChartData that read from mockHistoricalData.
 */
export function getChartDataFromReadings(
  readings: SensorReading[],
  paramKey: string,
  window: TimeWindow,
  warningThreshold?: number,
  criticalThreshold?: number,
): ChartDataPoint[] {
  const count = Math.min(WINDOW_POINTS[window], readings.length);
  const slice = readings.slice(-count);

  return slice.map(reading => {
    const date = new Date(reading.timestamp);
    const value = reading.values[paramKey] ?? 0;
    return {
      timestamp: reading.timestamp,
      displayTime: formatTimestamp(date, window),
      value: Math.round(value * 100) / 100,
      warningThreshold,
      criticalThreshold,
    };
  });
}

/**
 * Compute rolling statistics (min/max/avg) for a data series.
 */
export function computeSeriesStats(data: ChartDataPoint[]): {
  current: number;
  avg: number;
  min: number;
  max: number;
} {
  if (data.length === 0) return { current: 0, avg: 0, min: 0, max: 0 };
  const values = data.map(d => d.value);
  const current = values[values.length - 1];
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  return {
    current: Math.round(current * 100) / 100,
    avg: Math.round(avg * 100) / 100,
    min: Math.round(min * 100) / 100,
    max: Math.round(max * 100) / 100,
  };
}

/** Get sparkline data from already-fetched readings */
export function getSparklineDataFromReadings(readings: SensorReading[], paramKey: string): number[] {
  return readings.slice(-20).map(r => r.values[paramKey] ?? 0);
}

/** Relative time label */
export function getRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
