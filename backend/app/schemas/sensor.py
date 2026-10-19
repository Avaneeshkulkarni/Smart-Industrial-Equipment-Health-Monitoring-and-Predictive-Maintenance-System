"""
Pydantic schema for SensorReading.
"""

from pydantic import BaseModel, ConfigDict


class SensorReadingSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    timestamp: str
    equipmentId: str
    values: dict[str, float]
