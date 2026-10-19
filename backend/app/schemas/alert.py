"""
Pydantic schema for Alert.
"""

from pydantic import BaseModel, ConfigDict
from typing import Optional


class AlertSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    equipmentId: str
    equipmentName: str
    severity: str
    status: str
    title: str
    message: str
    parameterKey: Optional[str] = None
    parameterValue: Optional[float] = None
    threshold: Optional[float] = None
    triggeredAt: str
    acknowledgedAt: Optional[str] = None
    resolvedAt: Optional[str] = None
    acknowledgedBy: Optional[str] = None
