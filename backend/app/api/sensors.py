"""
Sensor / Readings API router.
  GET /api/equipment/{id}/readings  — current + historical sensor readings
  GET /api/equipment/{id}/health    — health snapshot
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional

from app.database import get_db
from app.models.sensor import SensorReading as SensorReadingModel
from app.models.equipment import Equipment as EquipmentModel
from app.schemas.sensor import SensorReadingSchema

router = APIRouter(prefix="/api/equipment", tags=["sensors"])


@router.get("/{equipment_id}/readings", response_model=list[SensorReadingSchema])
def get_readings(
    equipment_id: str,
    param: Optional[str] = Query(None, description="Filter by parameter key"),
    window: Optional[str] = Query(None, description="Time window: 1H, 6H, 24H, 7D, 30D"),
    latest: bool = Query(False, description="Return only the latest reading"),
    db: Session = Depends(get_db),
):
    """
    Returns sensor readings for an equipment.
    - No query params → returns all readings (ordered by timestamp desc).
    - latest=true → returns only the most recent reading.
    - window=24H → returns readings within that time window.
    - param=temperature → returns only readings relevant to that parameter.
    """
    # Verify equipment exists
    equip = db.query(EquipmentModel).filter(EquipmentModel.id == equipment_id).first()
    if not equip:
        raise HTTPException(status_code=404, detail="Equipment not found")

    query = db.query(SensorReadingModel).filter(
        SensorReadingModel.equipment_id == equipment_id
    )

    # Time window filtering
    if window:
        from datetime import datetime, timedelta
        window_hours = {"1H": 1, "6H": 6, "24H": 24, "7D": 168, "30D": 720}
        hours = window_hours.get(window, 24)
        cutoff = (datetime.utcnow() - timedelta(hours=hours)).isoformat()
        query = query.filter(SensorReadingModel.timestamp >= cutoff)

    query = query.order_by(desc(SensorReadingModel.timestamp))

    if latest:
        if param:
            # Find the most recent reading containing the parameter
            recent_candidates = query.limit(100).all()
            for r in recent_candidates:
                if isinstance(r.values, dict) and param in r.values:
                    return [SensorReadingSchema(
                        timestamp=r.timestamp,
                        equipmentId=r.equipment_id,
                        values=r.values,
                    )]
            return []

        # If fetching latest reading without parameter filter, merge across recent readings so all parameters are present
        recent_rows = query.limit(60).all()
        if not recent_rows:
            return []

        merged_values = {}
        latest_ts = recent_rows[0].timestamp
        for r in recent_rows:
            if isinstance(r.values, dict):
                for k, v in r.values.items():
                    if k not in merged_values:
                        merged_values[k] = v

        return [SensorReadingSchema(
            timestamp=latest_ts,
            equipmentId=equipment_id,
            values=merged_values,
        )]

    rows = query.limit(500).all()
    if param:
        rows = [r for r in rows if isinstance(r.values, dict) and param in r.values]

    return [
        SensorReadingSchema(
            timestamp=r.timestamp,
            equipmentId=r.equipment_id,
            values=r.values,
        )
        for r in rows
    ]


@router.get("/{equipment_id}/health")
def get_health(equipment_id: str, db: Session = Depends(get_db)):
    """
    Returns a health snapshot derived from equipment status + latest prediction.
    """
    from app.models.prediction import Prediction as PredictionModel

    equip = db.query(EquipmentModel).filter(EquipmentModel.id == equipment_id).first()
    if not equip:
        raise HTTPException(status_code=404, detail="Equipment not found")

    pred = db.query(PredictionModel).filter(
        PredictionModel.equipment_id == equipment_id
    ).first()

    # Derive trend from anomaly score
    anomaly_score = pred.anomaly_score if pred else 0.0
    if anomaly_score > 0.5:
        trend = "degrading"
    elif anomaly_score > 0.2:
        trend = "stable"
    else:
        trend = "improving"

    status_map = {"healthy": "healthy", "warning": "warning", "critical": "critical", "offline": "critical"}

    return {
        "equipmentId": equip.id,
        "timestamp": pred.timestamp if pred else "",
        "score": equip.health_score,
        "status": status_map.get(equip.status, "healthy"),
        "anomalyScore": anomaly_score,
        "trend": trend,
    }
