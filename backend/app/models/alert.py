"""
Alert SQLAlchemy model.
Mirrors the frontend's Alert TypeScript interface.
"""

from sqlalchemy import Column, String, Float, Integer
from app.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True)              # e.g. "ALT-001"
    equipment_id = Column(String, nullable=False)
    equipment_name = Column(String, nullable=False)
    severity = Column(String, nullable=False)          # info | warning | critical
    status = Column(String, nullable=False)            # active | acknowledged | resolved
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    parameter_key = Column(String, nullable=True)
    parameter_value = Column(Float, nullable=True)
    threshold = Column(Float, nullable=True)
    triggered_at = Column(String, nullable=False)      # ISO datetime
    acknowledged_at = Column(String, nullable=True)
    resolved_at = Column(String, nullable=True)
    acknowledged_by = Column(String, nullable=True)
