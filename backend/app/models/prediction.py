"""
Prediction, FaultPrediction, and RULPrediction SQLAlchemy models.
Mirrors the frontend's Prediction TypeScript interface.
FaultPredictions and RUL are stored as JSONB on the Prediction row
to match the nested shape the frontend expects.
"""

from sqlalchemy import Column, String, Float, Integer, JSON
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from app.database import Base


class Prediction(Base):
    """
    One prediction per equipment.
    faultPredictions stored as JSONB array, rul stored as JSONB object.
    """
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    equipment_id = Column(String, nullable=False, unique=True)
    timestamp = Column(String, nullable=False)
    anomaly_score = Column(Float, nullable=False)       # 0–1
    risk_score = Column(Float, nullable=False)           # 0–100
    prediction_confidence = Column(Float, nullable=False)  # 0–1
    fault_predictions = Column(JSONB().with_variant(JSON(), "sqlite"), nullable=False)    # [{failureMode, probability, confidenceInterval}]
    rul = Column(JSONB().with_variant(JSON(), "sqlite"), nullable=False)                  # {equipmentId, estimatedDays, ...}


# These are not separate DB tables — they exist as JSONB inside Prediction.
# But we define them here for documentation / reference in the seed script.
class FaultPrediction:
    """Not a DB model — just a typed dict shape for JSONB."""
    def __init__(self, failure_mode: str, probability: float, confidence_interval: list[float]):
        self.failure_mode = failure_mode
        self.probability = probability
        self.confidence_interval = confidence_interval

    def to_dict(self):
        return {
            "failureMode": self.failure_mode,
            "probability": self.probability,
            "confidenceInterval": self.confidence_interval,
        }


class RULPrediction:
    """Not a DB model — just a typed dict shape for JSONB."""
    def __init__(self, equipment_id: str, estimated_days: int, confidence_level: float,
                 lower_bound: int, upper_bound: int, basis_parameters: list[str], timestamp: str):
        self.equipment_id = equipment_id
        self.estimated_days = estimated_days
        self.confidence_level = confidence_level
        self.lower_bound = lower_bound
        self.upper_bound = upper_bound
        self.basis_parameters = basis_parameters
        self.timestamp = timestamp

    def to_dict(self):
        return {
            "equipmentId": self.equipment_id,
            "estimatedDays": self.estimated_days,
            "confidenceLevel": self.confidence_level,
            "lowerBound": self.lower_bound,
            "upperBound": self.upper_bound,
            "basisParameters": self.basis_parameters,
            "timestamp": self.timestamp,
        }
