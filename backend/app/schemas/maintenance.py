"""
Pydantic schemas for MaintenanceRecommendation, WorkOrder, MaintenanceRecord.
"""

from pydantic import BaseModel, ConfigDict
from typing import Optional


class MaintenanceRecommendationSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    equipmentId: str
    title: str
    description: str
    priority: str
    estimatedCost: Optional[float] = None
    estimatedDowntime: Optional[float] = None
    basedOn: list[str]
    createdAt: str


class WorkOrderSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    equipmentId: str
    equipmentName: str
    issue: str
    priority: str
    status: str
    technician: Optional[str] = None
    createdDate: str
    scheduledDate: Optional[str] = None
    completedDate: Optional[str] = None
    estimatedDuration: Optional[float] = None
    notes: Optional[str] = None


class MaintenanceRecordSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    equipmentId: str
    type: str
    description: str
    performedBy: str
    date: str
    duration: float
    cost: Optional[float] = None
    findings: Optional[str] = None
    partsReplaced: Optional[list[str]] = None
