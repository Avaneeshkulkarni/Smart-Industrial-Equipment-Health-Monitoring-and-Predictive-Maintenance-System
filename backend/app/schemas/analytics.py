"""
Pydantic schemas for Analytics — computed on the backend, not stored directly.
"""

from pydantic import BaseModel


class AnalyticsSummarySchema(BaseModel):
    totalEquipment: int
    healthyCount: int
    warningCount: int
    criticalCount: int
    offlineCount: int
    avgHealthScore: float
    activeAlerts: int
    pendingWorkOrders: int
    anomaliesDetected: int


class EquipmentTypeMetricSchema(BaseModel):
    type: str
    displayName: str
    avgHealth: float
    count: int
    criticalCount: int
    warningCount: int


class HealthDistributionPointSchema(BaseModel):
    range: str
    count: int
