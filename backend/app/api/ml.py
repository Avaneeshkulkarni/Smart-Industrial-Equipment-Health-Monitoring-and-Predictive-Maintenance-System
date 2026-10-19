"""
PredictX — ML API Router for Multi-Model Predictive Maintenance Inference.
Supports real ML inference for Robotic Arm, CNC Machine, and Compressor.
Explicitly gates unavailable equipment types (Electric Motor, Pump).
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.equipment import Equipment as EquipmentModel
from app.models.sensor import SensorReading as SensorModel
from app.services.ml_inference import ml_registry, ml_service

router = APIRouter(prefix="/api/ml", tags=["ml"])


class EquipmentTelemetryInput(BaseModel):
    vibration_rms: float = Field(1.4, description="RMS Vibration in mm/s", ge=0.0)
    temperature_motor: float = Field(48.0, description="Joint/spindle/motor temperature in °C")
    current_phase_avg: float = Field(14.5, description="Average phase current in Amps", ge=0.0)
    pressure_level: float = Field(6.2, description="Pressure in bar", ge=0.0)
    rpm: float = Field(1600.0, description="Operating speed in RPM", ge=0.0)
    ambient_temp: float = Field(22.0, description="Ambient temperature in °C")
    hours_since_maintenance: float = Field(120.0, description="Hours since last service", ge=0.0)
    history: Optional[List[Dict[str, float]]] = None


@router.get("/status")
def get_all_models_status():
    """
    Returns the real-world deployment status for all 5 equipment types.
    Shows which models are active vs blocked.
    """
    return {
        "models": ml_registry.get_status()
    }


@router.post("/predict/{equipment_type}")
def predict_equipment(equipment_type: str, input_data: EquipmentTelemetryInput):
    """
    Runs genuine multi-signal inference for the specified equipment type.
    """
    norm_type = ml_registry.normalize_type(equipment_type)
    if not ml_registry.is_available(norm_type):
        raise HTTPException(
            status_code=404,
            detail=f"No real ML model is available for equipment type '{equipment_type}'. Awaiting model training artifact."
        )

    telemetry = {
        "vibration_rms": input_data.vibration_rms,
        "temperature_motor": input_data.temperature_motor,
        "current_phase_avg": input_data.current_phase_avg,
        "pressure_level": input_data.pressure_level,
        "rpm": input_data.rpm,
        "ambient_temp": input_data.ambient_temp,
        "hours_since_maintenance": input_data.hours_since_maintenance,
    }

    try:
        result = ml_registry.predict(norm_type, telemetry, history=input_data.history)
        result["equipmentType"] = norm_type
        result["available"] = True
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")


@router.post("/predict-robotic-arm")
def predict_robotic_arm(input_data: EquipmentTelemetryInput):
    """Legacy alias for Robotic Arm inference."""
    return predict_equipment("robotic_arm", input_data)


@router.get("/{equipment_type}/metadata")
def get_model_metadata(equipment_type: str):
    """Returns training metadata, thresholds, and test performance metrics."""
    norm_type = ml_registry.normalize_type(equipment_type)
    service = ml_registry.get_service(norm_type)
    if not service or not service.loaded:
        return {
            "loaded": False,
            "equipmentType": norm_type,
            "message": f"Model not available for '{equipment_type}'"
        }

    metadata = getattr(service, "metadata", {})
    if not metadata and hasattr(service, "bundle"):
        bundle = service.bundle
        metadata = {
            "features": bundle.get("features", []),
            "threshold": bundle.get("threshold", bundle.get("xgb_threshold", 0.5)),
            "weights": bundle.get("safety_limits", {}),
        }

    return {
        "loaded": True,
        "equipmentType": norm_type,
        "metadata": metadata
    }


@router.get("/equipment/{equipment_id}/inference")
def get_equipment_live_inference(equipment_id: str, db: Session = Depends(get_db)):
    """
    Runs live ML inference on the latest recorded telemetry from the database
    for the specified equipment.
    If the equipment type has no genuine trained model, explicitly reports unavailability.
    """
    equipment = db.query(EquipmentModel).filter(EquipmentModel.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail=f"Equipment '{equipment_id}' not found")

    norm_type = ml_registry.normalize_type(equipment.type)

    # Honest rule: if no model artifact exists for this type, state so explicitly
    if not ml_registry.is_available(norm_type):
        return {
            "available": False,
            "equipmentId": equipment.id,
            "equipmentName": equipment.name,
            "equipmentType": equipment.type,
            "normalizedType": norm_type,
            "message": f"No real ML model artifact available for {equipment.type}. Telemetry active, AI scoring offline.",
            "healthScore": equipment.health_score,
            "healthStatus": "Healthy" if equipment.health_score >= 80 else "Warning",
        }

    # Fetch recent sensor readings to construct features
    readings = (
        db.query(SensorModel)
        .filter(SensorModel.equipment_id == equipment_id)
        .order_by(SensorModel.timestamp.desc())
        .limit(60)
        .all()
    )

    if not readings:
        raise HTTPException(status_code=404, detail="No sensor readings found for this equipment.")

    # Merge values across recent readings to get current state
    merged = {}
    for r in readings:
        if isinstance(r.values, dict):
            for k, v in r.values.items():
                if k not in merged:
                    merged[k] = v

    telemetry = {
        "vibration_rms": float(merged.get("vibration_rms", merged.get("vibration", 1.4))),
        "temperature_motor": float(merged.get("temperature_motor", merged.get("temperature", merged.get("spindleTemperature", 48.0)))),
        "current_phase_avg": float(merged.get("current_phase_avg", merged.get("current", merged.get("motorCurrent", 14.5)))),
        "pressure_level": float(merged.get("pressure_level", merged.get("pressure", 6.2))),
        "rpm": float(merged.get("rpm", merged.get("spindleSpeed", merged.get("speed", 1600.0)))),
        "ambient_temp": float(merged.get("ambient_temp", 22.0)),
        "hours_since_maintenance": float(merged.get("hours_since_maintenance", float(equipment.operating_hours))),
    }

    try:
        result = ml_registry.predict(norm_type, telemetry)
        result["available"] = True
        result["equipmentId"] = equipment.id
        result["equipmentName"] = equipment.name
        result["equipmentType"] = equipment.type
        result["normalizedType"] = norm_type
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")
