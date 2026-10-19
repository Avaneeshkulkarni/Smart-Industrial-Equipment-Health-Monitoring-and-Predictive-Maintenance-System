import type { AnalyticsSummary, EquipmentTypeMetric, HealthDistributionPoint } from '../types';

const API = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

interface AnalyticsResponse {
  summary: AnalyticsSummary;
  typeMetrics: EquipmentTypeMetric[];
  healthDistribution: HealthDistributionPoint[];
}

let _cachedAnalytics: AnalyticsResponse | null = null;

async function fetchAnalyticsPayload(): Promise<AnalyticsResponse> {
  if (_cachedAnalytics) return _cachedAnalytics;
  const res = await fetch(`${API}/analytics`);
  if (!res.ok) throw new Error(`Failed to fetch analytics: ${res.status}`);
  _cachedAnalytics = await res.json();

  // Auto-expire cache after 5s so subsequent calls get fresh data
  setTimeout(() => { _cachedAnalytics = null; }, 5000);

  return _cachedAnalytics!;
}

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  const data = await fetchAnalyticsPayload();
  return data.summary;
}

export async function fetchEquipmentTypeMetrics(): Promise<EquipmentTypeMetric[]> {
  const data = await fetchAnalyticsPayload();
  return data.typeMetrics;
}

export async function fetchHealthDistribution(): Promise<HealthDistributionPoint[]> {
  const data = await fetchAnalyticsPayload();
  return data.healthDistribution;
}
