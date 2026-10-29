"""
Equipment API router.
  GET /api/equipment          — list all (with live ML model health scores)
  GET /api/equipment/{id}     — single equipment by ID
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.equipment import Equipment as EquipmentModel, Plant as PlantModel
from app.models.sensor import SensorReading as SensorReadingModel
from app.schemas.equipment import EquipmentSchema, PlantSchema
from app.services.ml_inference import ml_registry

router = APIRouter(prefix="/api/equipment", tags=["equipment"])


def _get_live_health_for_equipment(r: EquipmentModel, db: Session) -> tuple[float, str]:
    """Computes genuine model health score and status if model is active."""
    norm_type = ml_registry.normalize_type(r.type)
    if ml_registry.is_available(norm_type):
        try:
            reading = (
                db.query(SensorReadingModel)
                .filter(SensorReadingModel.equipment_id == r.id)
                .order_by(SensorReadingModel.timestamp.desc())
                .first()
            )
            if reading and isinstance(reading.values, dict):
                telemetry = {
                    "vibration_rms": float(reading.values.get("vibration_rms", reading.values.get("vibration", 1.4))),
                    "temperature_motor": float(reading.values.get("temperature_motor", reading.values.get("temperature", reading.values.get("spindleTemperature", 48.0)))),
                    "current_phase_avg": float(reading.values.get("current_phase_avg", reading.values.get("current", reading.values.get("motorCurrent", 14.5)))),
                    "pressure_level": float(reading.values.get("pressure_level", reading.values.get("pressure", 6.2))),
                    "rpm": float(reading.values.get("rpm", reading.values.get("spindleSpeed", reading.values.get("speed", 1600.0)))),
                    "ambient_temp": float(reading.values.get("ambient_temp", 22.0)),
                    "hours_since_maintenance": float(reading.values.get("hours_since_maintenance", float(r.operating_hours))),
                }
                res = ml_registry.predict(norm_type, telemetry)
                return res["healthScore"], res["healthStatus"].lower()
        except Exception:
            pass
    return r.health_score, r.status


@router.get("", response_model=list[EquipmentSchema])
def list_equipment(
    type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    plant: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(EquipmentModel)

    if type:
        query = query.filter(EquipmentModel.type == type)
    if status:
        query = query.filter(EquipmentModel.status == status)
    if plant:
        query = query.filter(EquipmentModel.plant == plant)
    if search:
        q = f"%{search.lower()}%"
        query = query.filter(
            EquipmentModel.name.ilike(q)
            | EquipmentModel.id.ilike(q)
            | EquipmentModel.location.ilike(q)
        )

    rows = query.all()
    # Only keep equipment that have active real-time ML models (CNC, Compressor, Pump)
    rows = [r for r in rows if ml_registry.is_available(ml_registry.normalize_type(r.type))]

    results = []
    for r in rows:
        live_health, live_status = _get_live_health_for_equipment(r, db)
        results.append(
            EquipmentSchema(
                id=r.id,
                name=r.name,
                type=r.type,
                status=live_status,
                healthScore=live_health,
                plant=r.plant,
                location=r.location,
                installDate=r.install_date,
                lastMaintenanceDate=r.last_maintenance_date,
                nextMaintenanceDate=r.next_maintenance_date,
                model=r.model,
                manufacturer=r.manufacturer,
                serialNumber=r.serial_number,
                ratedPower=r.rated_power,
                operatingHours=r.operating_hours,
                tags=r.tags or [],
            )
        )
    return results


@router.get("/{equipment_id}", response_model=EquipmentSchema)
def get_equipment(equipment_id: str, db: Session = Depends(get_db)):
    row = db.query(EquipmentModel).filter(EquipmentModel.id == equipment_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Equipment not found")

    norm_type = ml_registry.normalize_type(row.type)
    if not ml_registry.is_available(norm_type):
        raise HTTPException(
            status_code=400,
            detail=f"Equipment '{equipment_id}' ({row.type}) is inactive. Only machines with real-time ML models (CNC Machine, Compressor, Centrifugal Pump) are active."
        )

    live_health, live_status = _get_live_health_for_equipment(row, db)
    return EquipmentSchema(
        id=row.id,
        name=row.name,
        type=row.type,
        status=live_status,
        healthScore=live_health,
        plant=row.plant,
        location=row.location,
        installDate=row.install_date,
        lastMaintenanceDate=row.last_maintenance_date,
        nextMaintenanceDate=row.next_maintenance_date,
        model=row.model,
        manufacturer=row.manufacturer,
        serialNumber=row.serial_number,
        ratedPower=row.rated_power,
        operatingHours=row.operating_hours,
        tags=row.tags or [],
    )
