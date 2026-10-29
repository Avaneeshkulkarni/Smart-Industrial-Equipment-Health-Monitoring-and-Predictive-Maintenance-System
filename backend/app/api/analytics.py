"""
Analytics API router.
  GET /api/analytics — returns summary, type metrics, and health distribution
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.equipment import Equipment as EquipmentModel
from app.models.alert import Alert as AlertModel
from app.models.maintenance import WorkOrder as WOModel
from app.models.prediction import Prediction as PredictionModel
from app.schemas.analytics import (
    AnalyticsSummarySchema,
    EquipmentTypeMetricSchema,
    HealthDistributionPointSchema,
)

from app.services.ml_inference import ml_registry
from app.api.equipment import _get_live_health_for_equipment

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

# Display names for equipment types — matches frontend equipmentConfig
TYPE_DISPLAY_NAMES = {
    "pump": "Centrifugal Pumps",
    "compressor": "Compressors",
    "cnc_machine": "CNC Machines",
}


@router.get("")
def get_analytics(db: Session = Depends(get_db)):
    """
    Returns the full analytics payload:
    { summary, typeMetrics, healthDistribution }
    Only includes active equipment running real-time ML inference.
    """
    raw_equipment = db.query(EquipmentModel).all()
    # Strictly keep only machines backed by active ML models
    equipment = [e for e in raw_equipment if ml_registry.is_available(ml_registry.normalize_type(e.type))]
    total = len(equipment)
    if total == 0:
        return {
            "summary": AnalyticsSummarySchema(
                totalEquipment=0, healthyCount=0, warningCount=0,
                criticalCount=0, offlineCount=0, avgHealthScore=0,
                activeAlerts=0, pendingWorkOrders=0, anomaliesDetected=0,
            ).model_dump(),
            "typeMetrics": [],
            "healthDistribution": [],
        }

    # Compute live health & status for all active ML machines
    live_data = {e.id: _get_live_health_for_equipment(e, db) for e in equipment}

    healthy = sum(1 for e in equipment if live_data[e.id][1] == "healthy")
    warning = sum(1 for e in equipment if live_data[e.id][1] == "warning")
    critical = sum(1 for e in equipment if live_data[e.id][1] == "critical")
    offline = sum(1 for e in equipment if live_data[e.id][1] == "offline")
    avg_health = round(sum(live_data[e.id][0] for e in equipment) / total, 1)

    active_alerts = db.query(AlertModel).filter(
        AlertModel.status == "active",
        AlertModel.equipment_id.in_([e.id for e in equipment])
    ).count()
    pending_wo = db.query(WOModel).filter(
        WOModel.status.in_(["pending", "scheduled"]),
        WOModel.equipment_id.in_([e.id for e in equipment])
    ).count()

    predictions = db.query(PredictionModel).filter(
        PredictionModel.equipment_id.in_([e.id for e in equipment])
    ).all()
    anomalies = sum(1 for p in predictions if p.anomaly_score > 0.4)

    summary = AnalyticsSummarySchema(
        totalEquipment=total,
        healthyCount=healthy,
        warningCount=warning,
        criticalCount=critical,
        offlineCount=offline,
        avgHealthScore=avg_health,
        activeAlerts=active_alerts,
        pendingWorkOrders=pending_wo,
        anomaliesDetected=anomalies,
    )

    # Type metrics for the 3 active ML models
    types = ["cnc_machine", "compressor", "pump"]
    type_metrics = []
    for t in types:
        equip_of_type = [e for e in equipment if e.type == t]
        count = len(equip_of_type)
        if count == 0:
            continue
        avg_h = round(sum(live_data[e.id][0] for e in equip_of_type) / count, 1)
        type_metrics.append(EquipmentTypeMetricSchema(
            type=t,
            displayName=TYPE_DISPLAY_NAMES.get(t, t.title()),
            avgHealth=avg_h,
            count=count,
            criticalCount=sum(1 for e in equip_of_type if live_data[e.id][1] == "critical"),
            warningCount=sum(1 for e in equip_of_type if live_data[e.id][1] == "warning"),
        ))

    # Health distribution
    ranges = [
        ("0–49", 0, 49),
        ("50–69", 50, 69),
        ("70–79", 70, 79),
        ("80–89", 80, 89),
        ("90–100", 90, 100),
    ]
    health_dist = [
        HealthDistributionPointSchema(
            range=label,
            count=sum(1 for e in equipment if lo <= live_data[e.id][0] <= hi),
        )
        for label, lo, hi in ranges
    ]

    return {
        "summary": summary.model_dump(),
        "typeMetrics": [m.model_dump() for m in type_metrics],
        "healthDistribution": [d.model_dump() for d in health_dist],
    }
