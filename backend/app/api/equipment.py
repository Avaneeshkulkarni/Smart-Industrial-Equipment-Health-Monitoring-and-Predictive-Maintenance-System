"""
Equipment API router.
  GET /api/equipment          — list all (with optional filters)
  GET /api/equipment/{id}     — single equipment by ID
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.equipment import Equipment as EquipmentModel, Plant as PlantModel
from app.schemas.equipment import EquipmentSchema, PlantSchema

router = APIRouter(prefix="/api/equipment", tags=["equipment"])


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
    return [
        EquipmentSchema(
            id=r.id,
            name=r.name,
            type=r.type,
            status=r.status,
            healthScore=r.health_score,
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
        for r in rows
    ]


@router.get("/{equipment_id}", response_model=EquipmentSchema)
def get_equipment(equipment_id: str, db: Session = Depends(get_db)):
    row = db.query(EquipmentModel).filter(EquipmentModel.id == equipment_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return EquipmentSchema(
        id=row.id,
        name=row.name,
        type=row.type,
        status=row.status,
        healthScore=row.health_score,
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
