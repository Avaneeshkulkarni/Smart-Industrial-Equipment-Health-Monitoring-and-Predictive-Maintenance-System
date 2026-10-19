"""
Predictions API router.
  GET /api/equipment/{id}/predictions  — prediction for a specific equipment
  GET /api/equipment/{id}/rul          — RUL prediction for a specific equipment
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.prediction import Prediction as PredictionModel
from app.schemas.prediction import PredictionSchema, RULPredictionSchema

router = APIRouter(prefix="/api/equipment", tags=["predictions"])


@router.get("/{equipment_id}/predictions", response_model=PredictionSchema)
def get_predictions(equipment_id: str, db: Session = Depends(get_db)):
    row = db.query(PredictionModel).filter(
        PredictionModel.equipment_id == equipment_id
    ).first()
    if not row:
        raise HTTPException(status_code=404, detail="Prediction not found")

    return PredictionSchema(
        equipmentId=row.equipment_id,
        timestamp=row.timestamp,
        anomalyScore=row.anomaly_score,
        riskScore=row.risk_score,
        predictionConfidence=row.prediction_confidence,
        faultPredictions=row.fault_predictions,
        rul=row.rul,
    )


@router.get("/{equipment_id}/rul", response_model=RULPredictionSchema)
def get_rul(equipment_id: str, db: Session = Depends(get_db)):
    row = db.query(PredictionModel).filter(
        PredictionModel.equipment_id == equipment_id
    ).first()
    if not row:
        raise HTTPException(status_code=404, detail="RUL prediction not found")

    return RULPredictionSchema(**row.rul)
