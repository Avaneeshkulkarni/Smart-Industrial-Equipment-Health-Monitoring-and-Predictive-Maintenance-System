# PredictX schemas package
from app.schemas.equipment import EquipmentSchema, PlantSchema
from app.schemas.sensor import SensorReadingSchema
from app.schemas.alert import AlertSchema
from app.schemas.prediction import (
    FaultPredictionSchema, RULPredictionSchema, PredictionSchema
)
from app.schemas.maintenance import (
    MaintenanceRecommendationSchema, WorkOrderSchema, MaintenanceRecordSchema
)
from app.schemas.analytics import (
    AnalyticsSummarySchema, EquipmentTypeMetricSchema, HealthDistributionPointSchema
)

__all__ = [
    "EquipmentSchema", "PlantSchema",
    "SensorReadingSchema",
    "AlertSchema",
    "FaultPredictionSchema", "RULPredictionSchema", "PredictionSchema",
    "MaintenanceRecommendationSchema", "WorkOrderSchema", "MaintenanceRecordSchema",
    "AnalyticsSummarySchema", "EquipmentTypeMetricSchema", "HealthDistributionPointSchema",
]
