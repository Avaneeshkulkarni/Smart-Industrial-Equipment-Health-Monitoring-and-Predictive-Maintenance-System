"""
Maintenance API router.
  GET /api/maintenance                 — returns recommendations, work orders, history
  GET /api/maintenance/recommendations — list maintenance recommendations
  GET /api/maintenance/work-orders     — list work orders
  GET /api/maintenance/history         — list maintenance history records
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.maintenance import (
    MaintenanceRecommendation as RecModel,
    WorkOrder as WOModel,
    MaintenanceRecord as MRModel,
)
from app.schemas.maintenance import (
    MaintenanceRecommendationSchema,
    WorkOrderSchema,
    MaintenanceRecordSchema,
)

router = APIRouter(prefix="/api/maintenance", tags=["maintenance"])


@router.get("")
def get_maintenance(
    equipmentId: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    Returns all maintenance data in one response — recommendations, work orders, history.
    This is what the frontend's fetchMaintenance() calls.
    """
    rec_query = db.query(RecModel)
    wo_query = db.query(WOModel)
    mr_query = db.query(MRModel)

    if equipmentId:
        rec_query = rec_query.filter(RecModel.equipment_id == equipmentId)
        wo_query = wo_query.filter(WOModel.equipment_id == equipmentId)
        mr_query = mr_query.filter(MRModel.equipment_id == equipmentId)

    recommendations = [
        MaintenanceRecommendationSchema(
            id=r.id,
            equipmentId=r.equipment_id,
            title=r.title,
            description=r.description,
            priority=r.priority,
            estimatedCost=r.estimated_cost,
            estimatedDowntime=r.estimated_downtime,
            basedOn=r.based_on or [],
            createdAt=r.created_at,
        )
        for r in rec_query.all()
    ]

    work_orders = [
        WorkOrderSchema(
            id=r.id,
            equipmentId=r.equipment_id,
            equipmentName=r.equipment_name,
            issue=r.issue,
            priority=r.priority,
            status=r.status,
            technician=r.technician,
            createdDate=r.created_date,
            scheduledDate=r.scheduled_date,
            completedDate=r.completed_date,
            estimatedDuration=r.estimated_duration,
            notes=r.notes,
        )
        for r in wo_query.all()
    ]

    history = [
        MaintenanceRecordSchema(
            id=r.id,
            equipmentId=r.equipment_id,
            type=r.type,
            description=r.description,
            performedBy=r.performed_by,
            date=r.date,
            duration=r.duration,
            cost=r.cost,
            findings=r.findings,
            partsReplaced=r.parts_replaced,
        )
        for r in mr_query.all()
    ]

    return {
        "recommendations": [r.model_dump() for r in recommendations],
        "workOrders": [wo.model_dump() for wo in work_orders],
        "history": [h.model_dump() for h in history],
    }


@router.get("/recommendations", response_model=list[MaintenanceRecommendationSchema])
def list_recommendations(
    equipmentId: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(RecModel)
    if equipmentId:
        query = query.filter(RecModel.equipment_id == equipmentId)
    rows = query.all()
    return [
        MaintenanceRecommendationSchema(
            id=r.id,
            equipmentId=r.equipment_id,
            title=r.title,
            description=r.description,
            priority=r.priority,
            estimatedCost=r.estimated_cost,
            estimatedDowntime=r.estimated_downtime,
            basedOn=r.based_on or [],
            createdAt=r.created_at,
        )
        for r in rows
    ]


@router.get("/work-orders", response_model=list[WorkOrderSchema])
def list_work_orders(
    equipmentId: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(WOModel)
    if equipmentId:
        query = query.filter(WOModel.equipment_id == equipmentId)
    rows = query.all()
    return [
        WorkOrderSchema(
            id=r.id,
            equipmentId=r.equipment_id,
            equipmentName=r.equipment_name,
            issue=r.issue,
            priority=r.priority,
            status=r.status,
            technician=r.technician,
            createdDate=r.created_date,
            scheduledDate=r.scheduled_date,
            completedDate=r.completed_date,
            estimatedDuration=r.estimated_duration,
            notes=r.notes,
        )
        for r in rows
    ]


@router.get("/history", response_model=list[MaintenanceRecordSchema])
def list_maintenance_history(
    equipmentId: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(MRModel)
    if equipmentId:
        query = query.filter(MRModel.equipment_id == equipmentId)
    rows = query.all()
    return [
        MaintenanceRecordSchema(
            id=r.id,
            equipmentId=r.equipment_id,
            type=r.type,
            description=r.description,
            performedBy=r.performed_by,
            date=r.date,
            duration=r.duration,
            cost=r.cost,
            findings=r.findings,
            partsReplaced=r.parts_replaced,
        )
        for r in rows
    ]
