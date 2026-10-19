"""
Pydantic schemas for Equipment and Plant.
Field names use camelCase to match the frontend's TypeScript interfaces.
"""

from pydantic import BaseModel, ConfigDict
from typing import Optional


class PlantSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    location: str
    timezone: str


class EquipmentSchema(BaseModel):
    """Matches the frontend Equipment TypeScript interface exactly."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    name: str
    type: str
    status: str
    healthScore: float
    plant: str
    location: str
    installDate: str
    lastMaintenanceDate: str
    nextMaintenanceDate: str
    model: str
    manufacturer: str
    serialNumber: str
    ratedPower: Optional[float] = None
    operatingHours: int
    tags: list[str]
