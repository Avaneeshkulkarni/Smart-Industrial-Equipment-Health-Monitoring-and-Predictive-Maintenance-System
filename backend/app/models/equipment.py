"""
Equipment & Plant SQLAlchemy models.
Mirrors the frontend's Equipment and Plant TypeScript interfaces.
"""

from sqlalchemy import Column, String, Float, Integer, DateTime, JSON, Enum as SAEnum
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from app.database import Base


class Plant(Base):
    __tablename__ = "plants"

    id = Column(String, primary_key=True)            # e.g. "plant-1"
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    timezone = Column(String, nullable=False)


class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(String, primary_key=True)             # e.g. "MTR-001"
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)              # robotic_arm | electric_motor | pump | compressor | cnc_machine
    status = Column(String, nullable=False)            # healthy | warning | critical | offline
    health_score = Column(Float, nullable=False)       # 0–100
    plant = Column(String, nullable=False)             # FK to plants.id
    location = Column(String, nullable=False)
    install_date = Column(String, nullable=False)      # ISO date string
    last_maintenance_date = Column(String, nullable=False)
    next_maintenance_date = Column(String, nullable=False)
    model = Column(String, nullable=False)
    manufacturer = Column(String, nullable=False)
    serial_number = Column(String, nullable=False)
    rated_power = Column(Float, nullable=True)         # kW, optional
    operating_hours = Column(Integer, nullable=False)
    tags = Column(ARRAY(String).with_variant(JSON(), "sqlite"), nullable=False, default=[])
