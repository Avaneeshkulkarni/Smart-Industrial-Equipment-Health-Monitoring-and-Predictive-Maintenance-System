"""
SensorReading SQLAlchemy model.
Uses JSONB for the `values` column — keeps the flexible {paramKey: number}
shape that the frontend relies on.
"""

from sqlalchemy import Column, String, Integer, JSON
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(String, nullable=False)         # ISO datetime
    equipment_id = Column(String, nullable=False)      # FK to equipment.id
    values = Column(JSONB().with_variant(JSON(), "sqlite"), nullable=False)             # {parameterKey: number}
