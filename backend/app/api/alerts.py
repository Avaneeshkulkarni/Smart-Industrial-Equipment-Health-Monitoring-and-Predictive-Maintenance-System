"""
Alerts API router.
  GET  /api/alerts                    — list all (with optional filters)
  PATCH /api/alerts/{id}/acknowledge  — acknowledge an alert
  PATCH /api/alerts/{id}/resolve      — resolve an alert
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.database import get_db
from app.models.alert import Alert as AlertModel
from app.schemas.alert import AlertSchema

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.get("", response_model=list[AlertSchema])
def list_alerts(
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    equipmentId: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(AlertModel)

    if severity:
        query = query.filter(AlertModel.severity == severity)
    if status:
        query = query.filter(AlertModel.status == status)
    if equipmentId:
        query = query.filter(AlertModel.equipment_id == equipmentId)

    rows = query.order_by(AlertModel.triggered_at.desc()).all()
    return [
        AlertSchema(
            id=r.id,
            equipmentId=r.equipment_id,
            equipmentName=r.equipment_name,
            severity=r.severity,
            status=r.status,
            title=r.title,
            message=r.message,
            parameterKey=r.parameter_key,
            parameterValue=r.parameter_value,
            threshold=r.threshold,
            triggeredAt=r.triggered_at,
            acknowledgedAt=r.acknowledged_at,
            resolvedAt=r.resolved_at,
            acknowledgedBy=r.acknowledged_by,
        )
        for r in rows
    ]


@router.patch("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(AlertModel).filter(AlertModel.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = "acknowledged"
    alert.acknowledged_at = datetime.utcnow().isoformat()
    db.commit()
    return {"status": "ok"}


@router.patch("/{alert_id}/resolve")
def resolve_alert(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(AlertModel).filter(AlertModel.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = "resolved"
    alert.resolved_at = datetime.utcnow().isoformat()
    db.commit()
    return {"status": "ok"}
