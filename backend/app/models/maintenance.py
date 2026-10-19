"""
Maintenance SQLAlchemy models: MaintenanceRecommendation, WorkOrder, MaintenanceRecord.
Mirrors the frontend TypeScript interfaces.
"""

from sqlalchemy import Column, String, Float, Integer, JSON
from sqlalchemy.dialects.postgresql import ARRAY
from app.database import Base


class MaintenanceRecommendation(Base):
    __tablename__ = "maintenance_recommendations"

    id = Column(String, primary_key=True)              # e.g. "REC-001"
    equipment_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    priority = Column(String, nullable=False)          # low | medium | high | critical
    estimated_cost = Column(Float, nullable=True)
    estimated_downtime = Column(Float, nullable=True)  # hours
    based_on = Column(ARRAY(String).with_variant(JSON(), "sqlite"), nullable=False, default=[])
    created_at = Column(String, nullable=False)        # ISO datetime


class WorkOrder(Base):
    __tablename__ = "work_orders"

    id = Column(String, primary_key=True)              # e.g. "WO-001"
    equipment_id = Column(String, nullable=False)
    equipment_name = Column(String, nullable=False)
    issue = Column(String, nullable=False)
    priority = Column(String, nullable=False)          # low | medium | high | critical
    status = Column(String, nullable=False)            # pending | scheduled | in-progress | completed
    technician = Column(String, nullable=True)
    created_date = Column(String, nullable=False)
    scheduled_date = Column(String, nullable=True)
    completed_date = Column(String, nullable=True)
    estimated_duration = Column(Float, nullable=True)  # hours
    notes = Column(String, nullable=True)


class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(String, primary_key=True)              # e.g. "MH-001"
    equipment_id = Column(String, nullable=False)
    type = Column(String, nullable=False)              # preventive | corrective | predictive | inspection
    description = Column(String, nullable=False)
    performed_by = Column(String, nullable=False)
    date = Column(String, nullable=False)
    duration = Column(Float, nullable=False)           # hours
    cost = Column(Float, nullable=True)
    findings = Column(String, nullable=True)
    parts_replaced = Column(ARRAY(String).with_variant(JSON(), "sqlite"), nullable=True)
