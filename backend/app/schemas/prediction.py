"""
Pydantic schemas for Prediction, FaultPrediction, RULPrediction.
Enhanced to carry genuine multi-signal machine learning outputs.
"""

from typing import Optional, Any, Dict, List
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
    model_config = ConfigDict(from_attributes=True, extra="allow")

    equipmentId: str
    timestamp: str
    anomalyScore: float
    riskScore: float
    predictionConfidence: float
    faultPredictions: list[FaultPredictionSchema]
    rul: RULPredictionSchema
    isRealModel: bool = True
    modelArtifact: Optional[str] = None
    healthScore: Optional[float] = None
    healthStatus: Optional[str] = None
    decisionRule: Optional[str] = None
    signals: Optional[Dict[str, Any]] = None
    formula: Optional[str] = None
    available: bool = True
    message: Optional[str] = None
