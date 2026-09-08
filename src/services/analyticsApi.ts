import { mockEquipment } from '../data/equipment';
import { mockPredictions } from '../data/predictions';
import { mockAlerts } from '../data/alerts';
import { mockWorkOrders } from '../data/maintenance';
import type { AnalyticsSummary, EquipmentTypeMetric, HealthDistributionPoint } from '../types';

import equipmentConfig from '../config/equipmentConfig';

// TODO: Replace with axios.get(`${import.meta.env.VITE_API_BASE_URL}/analytics`)

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  await new Promise(r => setTimeout(r, 300));

  const healthy  = mockEquipment.filter(e => e.status === 'healthy').length;
  const warning  = mockEquipment.filter(e => e.status === 'warning').length;
  const critical = mockEquipment.filter(e => e.status === 'critical').length;
  const offline  = mockEquipment.filter(e => e.status === 'offline').length;
  const avgHealth = mockEquipment.reduce((s, e) => s + e.healthScore, 0) / mockEquipment.length;
  const activeAlerts = mockAlerts.filter(a => a.status === 'active').length;
  const pendingWO = mockWorkOrders.filter(wo => wo.status === 'pending' || wo.status === 'scheduled').length;
  const anomalies = Object.values(mockPredictions).filter(p => p.anomalyScore > 0.4).length;

  return {
    totalEquipment: mockEquipment.length,
    healthyCount: healthy,
    warningCount: warning,
    criticalCount: critical,
    offlineCount: offline,
    avgHealthScore: Math.round(avgHealth * 10) / 10,
    activeAlerts,
    pendingWorkOrders: pendingWO,
    anomaliesDetected: anomalies,
  };
}

export async function fetchEquipmentTypeMetrics(): Promise<EquipmentTypeMetric[]> {
  await new Promise(r => setTimeout(r, 250));

  const types = ['motor', 'pump', 'compressor', 'cnc'] as const;
  return types.map(type => {
    const equipment = mockEquipment.filter(e => e.type === type);
    const avgHealth = equipment.reduce((s, e) => s + e.healthScore, 0) / equipment.length;
    return {
      type,
      displayName: equipmentConfig[type].displayName,
      avgHealth: Math.round(avgHealth * 10) / 10,
      count: equipment.length,
      criticalCount: equipment.filter(e => e.status === 'critical').length,
      warningCount: equipment.filter(e => e.status === 'warning').length,
    };
  });
}

export async function fetchHealthDistribution(): Promise<HealthDistributionPoint[]> {
  await new Promise(r => setTimeout(r, 200));
  const ranges = [
    { range: '0–49', min: 0, max: 49 },
    { range: '50–69', min: 50, max: 69 },
    { range: '70–79', min: 70, max: 79 },
    { range: '80–89', min: 80, max: 89 },
    { range: '90–100', min: 90, max: 100 },
  ];
  return ranges.map(r => ({
    range: r.range,
    count: mockEquipment.filter(e => e.healthScore >= r.min && e.healthScore <= r.max).length,
  }));
}
