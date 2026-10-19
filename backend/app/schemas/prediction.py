"""
Pydantic schemas for Prediction, FaultPrediction, RULPrediction.
"""

from pydantic import BaseModel, ConfigDict


class FaultPredictionSchema(BaseModel):
    failureMode: str
    probability: float
    confidenceInterval: list[float]


class RULPredictionSchema(BaseModel):
    equipmentId: str
    estimatedDays: int
    confidenceLevel: float
    lowerBound: int
    upperBound: int
    basisParameters: list[str]
    timestamp: str


class PredictionSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    equipmentId: str
    timestamp: str
    anomalyScore: float
    riskScore: float
    predictionConfidence: float
    faultPredictions: list[FaultPredictionSchema]
    rul: RULPredictionSchema
