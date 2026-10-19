"""
PredictX Database Seed Script.
Faithfully ports all mock data from the frontend's src/data/*.ts files.

Usage:
    cd backend
    python -m app.seed
"""

import math
import random
from datetime import datetime, timedelta

from app.database import engine, SessionLocal, Base
from app.models.equipment import Equipment, Plant
from app.models.sensor import SensorReading
from app.models.alert import Alert
from app.models.prediction import Prediction
from app.models.maintenance import MaintenanceRecommendation, WorkOrder, MaintenanceRecord


def d(days_offset: int) -> str:
    """Helper matching the frontend's d() function — returns ISO date string."""
    return (datetime.utcnow() + timedelta(days=days_offset)).strftime("%Y-%m-%d")


def iso_ago(hours: float = 0, minutes: float = 0, days: float = 0) -> str:
    """Return ISO datetime string for a past moment."""
    return (datetime.utcnow() - timedelta(hours=hours, minutes=minutes, days=days)).isoformat()


now = datetime.utcnow().isoformat()


# =============================================================================
# Plants
# =============================================================================
PLANTS = [
    Plant(id="plant-1", name="Alpha Manufacturing Plant", location="Detroit, MI", timezone="America/Detroit"),
    Plant(id="plant-2", name="Beta Assembly Facility", location="Cleveland, OH", timezone="America/New_York"),
]


# =============================================================================
# Equipment — 12 machines, 3 per type (identical to frontend src/data/equipment.ts)
# =============================================================================
EQUIPMENT = [
    # ─── Electric Motors ─────────────────────────────────────────────
    Equipment(id="MTR-001", name="Motor Alpha", type="electric_motor", status="healthy", health_score=92,
              plant="plant-1", location="Bay A, Line 1", install_date="2021-03-15",
              last_maintenance_date="2026-06-10", next_maintenance_date="2026-12-10",
              model="ABB M3BP 315", manufacturer="ABB", serial_number="SN-MTR-001-A",
              rated_power=110, operating_hours=14820, tags=["production", "line-1", "critical-asset"]),
    Equipment(id="MTR-002", name="Motor Beta", type="electric_motor", status="warning", health_score=78,
              plant="plant-1", location="Bay A, Line 2", install_date="2020-08-22",
              last_maintenance_date="2026-01-15", next_maintenance_date="2026-07-15",
              model="Siemens 1LE1 315", manufacturer="Siemens", serial_number="SN-MTR-002-B",
              rated_power=90, operating_hours=22450, tags=["production", "line-2", "overdue-maintenance"]),
    Equipment(id="MTR-003", name="Motor Gamma", type="electric_motor", status="healthy", health_score=95,
              plant="plant-1", location="Bay B, Line 1", install_date="2023-01-10",
              last_maintenance_date="2026-08-01", next_maintenance_date="2027-02-01",
              model="WEG W22 355", manufacturer="WEG", serial_number="SN-MTR-003-C",
              rated_power=132, operating_hours=6210, tags=["production", "line-1"]),

    # ─── Pumps ───────────────────────────────────────────────────────
    Equipment(id="PMP-001", name="Pump Alpha", type="pump", status="healthy", health_score=88,
              plant="plant-1", location="Utility Room, Bay C", install_date="2022-05-20",
              last_maintenance_date="2026-05-20", next_maintenance_date="2026-11-20",
              model="Grundfos CR 64-4", manufacturer="Grundfos", serial_number="SN-PMP-001-A",
              rated_power=22, operating_hours=11340, tags=["utility", "coolant-circuit"]),
    Equipment(id="PMP-002", name="Pump Beta", type="pump", status="critical", health_score=61,
              plant="plant-1", location="Utility Room, Bay C", install_date="2019-11-30",
              last_maintenance_date="2025-11-30", next_maintenance_date="2026-05-30",
              model="KSB Multitec 150", manufacturer="KSB", serial_number="SN-PMP-002-B",
              rated_power=37, operating_hours=31200, tags=["utility", "coolant-circuit", "high-priority"]),
    Equipment(id="PMP-003", name="Pump Gamma", type="pump", status="healthy", health_score=94,
              plant="plant-1", location="Bay D, Process Line", install_date="2023-07-14",
              last_maintenance_date="2026-07-14", next_maintenance_date="2027-01-14",
              model="Flowserve PVXM 100", manufacturer="Flowserve", serial_number="SN-PMP-003-C",
              rated_power=18.5, operating_hours=4890, tags=["process", "line-3"]),

    # ─── Compressors ─────────────────────────────────────────────────
    Equipment(id="CMP-001", name="Compressor Alpha", type="compressor", status="warning", health_score=76,
              plant="plant-1", location="Compressor House, Bay E", install_date="2020-02-18",
              last_maintenance_date="2026-02-18", next_maintenance_date="2026-08-18",
              model="Atlas Copco GA 75", manufacturer="Atlas Copco", serial_number="SN-CMP-001-A",
              rated_power=75, operating_hours=26800, tags=["utility", "compressed-air", "rising-temp"]),
    Equipment(id="CMP-002", name="Compressor Beta", type="compressor", status="healthy", health_score=91,
              plant="plant-1", location="Compressor House, Bay E", install_date="2022-09-05",
              last_maintenance_date="2026-09-05", next_maintenance_date="2027-03-05",
              model="Ingersoll Rand R90", manufacturer="Ingersoll Rand", serial_number="SN-CMP-002-B",
              rated_power=90, operating_hours=9650, tags=["utility", "compressed-air"]),
    Equipment(id="CMP-003", name="Compressor Gamma", type="compressor", status="critical", health_score=59,
              plant="plant-1", location="Compressor House, Bay F", install_date="2018-04-12",
              last_maintenance_date="2025-10-12", next_maintenance_date="2026-04-12",
              model="Kaeser SK 25", manufacturer="Kaeser", serial_number="SN-CMP-003-C",
              rated_power=25, operating_hours=38900, tags=["utility", "compressed-air", "critical-fault"]),

    # ─── CNC Machines ────────────────────────────────────────────────
    Equipment(id="CNC-001", name="CNC Alpha", type="cnc_machine", status="healthy", health_score=94,
              plant="plant-1", location="Machining Bay, Line 4", install_date="2022-11-01",
              last_maintenance_date="2026-08-01", next_maintenance_date="2027-02-01",
              model="Haas VF-4", manufacturer="Haas", serial_number="SN-CNC-001-A",
              rated_power=22.4, operating_hours=7890, tags=["machining", "line-4", "precision"]),
    Equipment(id="CNC-002", name="CNC Beta", type="cnc_machine", status="warning", health_score=82,
              plant="plant-1", location="Machining Bay, Line 4", install_date="2021-06-15",
              last_maintenance_date="2026-03-15", next_maintenance_date="2026-09-15",
              model="Mazak VTC-300", manufacturer="Mazak", serial_number="SN-CNC-002-B",
              rated_power=18.5, operating_hours=16340, tags=["machining", "line-4", "tool-wear-alert"]),
    Equipment(id="CNC-003", name="CNC Gamma", type="cnc_machine", status="healthy", health_score=97,
              plant="plant-1", location="Machining Bay, Line 5", install_date="2024-01-20",
              last_maintenance_date="2026-08-20", next_maintenance_date="2027-02-20",
              model="DMG Mori CMX 50", manufacturer="DMG Mori", serial_number="SN-CNC-003-C",
              rated_power=14, operating_hours=2480, tags=["machining", "line-5", "new-equipment"]),

    # ─── Robotic Arms (AI Multi-Signal Monitored) ───────────────────
    Equipment(id="ARM-001", name="Robotic Arm Alpha", type="robotic_arm", status="healthy", health_score=96,
              plant="plant-1", location="Robotics Cell 1, Line 1", install_date="2023-04-10",
              last_maintenance_date="2026-07-10", next_maintenance_date="2027-01-10",
              model="KUKA KR 210 R2700", manufacturer="KUKA", serial_number="SN-ARM-001-A",
              rated_power=15, operating_hours=1480, tags=["robotics", "6-axis", "welding", "ai-monitored"]),
    Equipment(id="ARM-002", name="Robotic Arm Beta", type="robotic_arm", status="warning", health_score=68,
              plant="plant-1", location="Assembly Bay, Line 2", install_date="2021-08-20",
              last_maintenance_date="2026-02-20", next_maintenance_date="2026-08-20",
              model="FANUC M-20iD/35", manufacturer="FANUC", serial_number="SN-ARM-002-B",
              rated_power=12, operating_hours=8200, tags=["robotics", "6-axis", "assembly", "ai-monitored"]),
]


# =============================================================================
# Current Sensor Readings (identical to frontend src/data/sensorData.ts)
# =============================================================================
CURRENT_READINGS = [
    SensorReading(timestamp=now, equipment_id="MTR-001", values={"temperature": 62.4, "vibration": 1.82, "current": 87.3, "voltage": 400, "rpm": 2985, "power": 34.8}),
    SensorReading(timestamp=now, equipment_id="MTR-002", values={"temperature": 83.7, "vibration": 4.51, "current": 138.2, "voltage": 398, "rpm": 2920, "power": 54.8}),
    SensorReading(timestamp=now, equipment_id="MTR-003", values={"temperature": 55.1, "vibration": 1.12, "current": 72.4, "voltage": 401, "rpm": 2990, "power": 29.0}),
    SensorReading(timestamp=now, equipment_id="PMP-001", values={"temperature": 48.3, "vibration": 2.14, "pressure": 8.2, "flowRate": 95.4, "current": 68.1, "rpm": 1480}),
    SensorReading(timestamp=now, equipment_id="PMP-002", values={"temperature": 71.8, "vibration": 6.87, "pressure": 5.1, "flowRate": 14.3, "current": 128.4, "rpm": 1390}),
    SensorReading(timestamp=now, equipment_id="PMP-003", values={"temperature": 41.2, "vibration": 1.38, "pressure": 10.4, "flowRate": 118.7, "current": 52.3, "rpm": 1490}),
    SensorReading(timestamp=now, equipment_id="CMP-001", values={"temperature": 87.4, "pressure": 14.2, "vibration": 3.12, "current": 178.9, "rpm": 3450, "power": 62.4}),
    SensorReading(timestamp=now, equipment_id="CMP-002", values={"temperature": 71.3, "pressure": 12.8, "vibration": 1.87, "current": 142.1, "rpm": 3380, "power": 50.7}),
    SensorReading(timestamp=now, equipment_id="CMP-003", values={"temperature": 103.2, "pressure": 24.8, "vibration": 5.94, "current": 218.7, "rpm": 3820, "power": 78.3}),
    SensorReading(timestamp=now, equipment_id="CNC-001", values={"spindleTemperature": 51.2, "vibration": 1.44, "spindleSpeed": 8200, "power": 14.7, "toolWear": 0.22, "motorCurrent": 42.1}),
    SensorReading(timestamp=now, equipment_id="CNC-002", values={"spindleTemperature": 64.8, "vibration": 3.21, "spindleSpeed": 7800, "power": 18.3, "toolWear": 0.74, "motorCurrent": 61.4}),
    SensorReading(timestamp=now, equipment_id="CNC-003", values={"spindleTemperature": 43.7, "vibration": 0.98, "spindleSpeed": 9400, "power": 11.2, "toolWear": 0.11, "motorCurrent": 34.8}),
    SensorReading(timestamp=now, equipment_id="ARM-001", values={"vibration_rms": 1.35, "temperature_motor": 48.2, "current_phase_avg": 14.5, "pressure_level": 6.25, "rpm": 1600.0, "ambient_temp": 22.0, "hours_since_maintenance": 80.0}),
    SensorReading(timestamp=now, equipment_id="ARM-002", values={"vibration_rms": 3.65, "temperature_motor": 68.4, "current_phase_avg": 21.2, "pressure_level": 5.75, "rpm": 1520.0, "ambient_temp": 24.5, "hours_since_maintenance": 450.0}),
]


# =============================================================================
# Historical Sensor Data Generator (mirrors frontend's generateHistory)
# =============================================================================
def generate_history(
    equipment_id: str,
    param_key: str,
    base_value: float,
    pattern: str,  # 'stable' | 'drifting' | 'deviating'
    points: int = 288,
    interval_minutes: int = 5,
) -> list[SensorReading]:
    """Generates historical time-series readings matching the frontend's pattern."""
    readings = []
    now_ms = datetime.utcnow()

    random.seed(hash(f"{equipment_id}-{param_key}"))  # Deterministic per equipment+param

    for i in range(points, -1, -1):
        timestamp = (now_ms - timedelta(minutes=i * interval_minutes)).isoformat()

        if pattern == "stable":
            value = base_value + (random.random() - 0.5) * base_value * 0.04
        elif pattern == "drifting":
            drift_fraction = (points - i) / points
            value = base_value * (1 + drift_fraction * 0.15) + (random.random() - 0.5) * base_value * 0.03
        elif pattern == "deviating":
            deviation_start = points * 0.8
            if i < deviation_start:
                deviation_fraction = (deviation_start - i) / (deviation_start * 0.2)
                value = base_value * (1 + min(deviation_fraction, 1) * 0.35) + (random.random() - 0.5) * base_value * 0.05
            else:
                value = base_value + (random.random() - 0.5) * base_value * 0.04
        else:
            value = base_value

        readings.append(SensorReading(
            timestamp=timestamp,
            equipment_id=equipment_id,
            values={param_key: max(0, value)},
        ))

    return readings


# Historical data configuration — matches frontend's mockHistoricalData exactly
HISTORICAL_CONFIG = [
    # Motors
    ("MTR-001", "temperature", 62, "stable"),
    ("MTR-001", "vibration", 1.8, "stable"),
    ("MTR-001", "current", 87, "stable"),
    ("MTR-002", "temperature", 75, "drifting"),
    ("MTR-002", "vibration", 3.8, "drifting"),
    ("MTR-002", "current", 128, "drifting"),
    ("MTR-003", "temperature", 55, "stable"),
    ("MTR-003", "vibration", 1.1, "stable"),
    ("MTR-003", "current", 72, "stable"),
    # Pumps
    ("PMP-001", "vibration", 2.1, "stable"),
    ("PMP-001", "pressure", 8.2, "stable"),
    ("PMP-001", "flowRate", 95, "stable"),
    ("PMP-002", "vibration", 4.5, "deviating"),
    ("PMP-002", "pressure", 6.8, "deviating"),
    ("PMP-002", "flowRate", 60, "deviating"),
    ("PMP-002", "temperature", 62, "drifting"),
    ("PMP-003", "vibration", 1.4, "stable"),
    ("PMP-003", "pressure", 10.4, "stable"),
    ("PMP-003", "flowRate", 118, "stable"),
    # Compressors
    ("CMP-001", "temperature", 80, "drifting"),
    ("CMP-001", "pressure", 13.8, "stable"),
    ("CMP-001", "vibration", 2.8, "drifting"),
    ("CMP-002", "temperature", 71, "stable"),
    ("CMP-002", "pressure", 12.8, "stable"),
    ("CMP-002", "vibration", 1.9, "stable"),
    ("CMP-003", "temperature", 88, "deviating"),
    ("CMP-003", "pressure", 20, "deviating"),
    ("CMP-003", "vibration", 4.2, "deviating"),
    # CNC
    ("CNC-001", "spindleTemperature", 51, "stable"),
    ("CNC-001", "vibration", 1.4, "stable"),
    ("CNC-001", "toolWear", 0.22, "stable"),
    ("CNC-002", "spindleTemperature", 59, "drifting"),
    ("CNC-002", "vibration", 2.8, "drifting"),
    ("CNC-002", "toolWear", 0.55, "drifting"),
    ("CNC-003", "spindleTemperature", 43, "stable"),
    ("CNC-003", "vibration", 1.0, "stable"),
    ("CNC-003", "toolWear", 0.11, "stable"),
    # Robotic Arms
    ("ARM-001", "vibration_rms", 1.35, "stable"),
    ("ARM-001", "temperature_motor", 48.0, "stable"),
    ("ARM-001", "current_phase_avg", 14.5, "stable"),
    ("ARM-001", "pressure_level", 6.2, "stable"),
    ("ARM-002", "vibration_rms", 3.2, "drifting"),
    ("ARM-002", "temperature_motor", 64.0, "drifting"),
    ("ARM-002", "current_phase_avg", 20.0, "drifting"),
    ("ARM-002", "pressure_level", 5.6, "drifting"),
]


# =============================================================================
# Alerts (identical to frontend src/data/alerts.ts)
# =============================================================================
ALERTS = [
    Alert(id="ALT-001", equipment_id="PMP-002", equipment_name="Pump Beta",
          severity="critical", status="active",
          title="Critical Vibration — Cavitation Risk",
          message="Vibration at 6.87 mm/s exceeds critical threshold (6.0 mm/s). Low pressure (5.1 bar) and reduced flow rate (14.3 m³/h) indicate active cavitation. Immediate inspection required.",
          parameter_key="vibration", parameter_value=6.87, threshold=6.0,
          triggered_at=iso_ago(hours=2)),
    Alert(id="ALT-002", equipment_id="PMP-002", equipment_name="Pump Beta",
          severity="critical", status="active",
          title="Low Flow Rate — Possible Blockage or Cavitation",
          message="Flow rate dropped to 14.3 m³/h, significantly below normal operating range. Combined with high vibration, cavitation or impeller damage is suspected.",
          parameter_key="flowRate", parameter_value=14.3, threshold=20.0,
          triggered_at=iso_ago(hours=2.2)),
    Alert(id="ALT-003", equipment_id="CMP-003", equipment_name="Compressor Gamma",
          severity="critical", status="active",
          title="Critical Temperature — Overheating Detected",
          message="Discharge temperature at 103.2°C exceeds critical threshold (100°C). Risk of thermal shutdown and bearing damage. Check lubrication and cooling system immediately.",
          parameter_key="temperature", parameter_value=103.2, threshold=100,
          triggered_at=iso_ago(minutes=45)),
    Alert(id="ALT-004", equipment_id="CMP-003", equipment_name="Compressor Gamma",
          severity="critical", status="active",
          title="High Discharge Pressure",
          message="Discharge pressure at 24.8 bar exceeds warning threshold (22 bar). Combined with high temperature, pressure relief valve may activate. Inspect pressure regulation.",
          parameter_key="pressure", parameter_value=24.8, threshold=22,
          triggered_at=iso_ago(minutes=50)),
    Alert(id="ALT-005", equipment_id="MTR-002", equipment_name="Motor Beta",
          severity="warning", status="active",
          title="Elevated Temperature — Thermal Drift",
          message="Motor winding temperature at 83.7°C has crossed warning threshold (80°C) and is showing an upward trend over the past 8 hours. Inspect cooling fan and ventilation.",
          parameter_key="temperature", parameter_value=83.7, threshold=80,
          triggered_at=iso_ago(hours=8)),
    Alert(id="ALT-006", equipment_id="MTR-002", equipment_name="Motor Beta",
          severity="warning", status="acknowledged",
          title="Vibration Above Warning Threshold",
          message="Vibration at 4.51 mm/s exceeds warning threshold (4.0 mm/s). Possible bearing wear or rotor imbalance. Schedule vibration analysis.",
          parameter_key="vibration", parameter_value=4.51, threshold=4.0,
          triggered_at=iso_ago(hours=12),
          acknowledged_at=iso_ago(hours=10),
          acknowledged_by="J. Patel"),
    Alert(id="ALT-007", equipment_id="CMP-001", equipment_name="Compressor Alpha",
          severity="warning", status="active",
          title="Rising Temperature — Gradual Drift",
          message="Compressor temperature at 87.4°C and rising. Crossed warning threshold (85°C) 4 hours ago. Trend analysis indicates continued increase. Check intercooler and oil level.",
          parameter_key="temperature", parameter_value=87.4, threshold=85,
          triggered_at=iso_ago(hours=4)),
    Alert(id="ALT-008", equipment_id="CNC-002", equipment_name="CNC Beta",
          severity="warning", status="active",
          title="High Tool Wear Index",
          message="Tool wear index at 0.74 has exceeded warning threshold (0.70). Tool change recommended before next production run to prevent dimensional errors and spindle overloading.",
          parameter_key="toolWear", parameter_value=0.74, threshold=0.70,
          triggered_at=iso_ago(hours=3)),
    Alert(id="ALT-009", equipment_id="MTR-001", equipment_name="Motor Alpha",
          severity="info", status="resolved",
          title="Scheduled Maintenance Completed",
          message="Planned preventive maintenance completed on 2026-06-10. Bearings lubricated, cooling system cleaned, electrical connections inspected.",
          triggered_at=iso_ago(days=90),
          resolved_at=iso_ago(days=89)),
    Alert(id="ALT-010", equipment_id="PMP-001", equipment_name="Pump Alpha",
          severity="warning", status="resolved",
          title="Pressure Fluctuation Detected (Resolved)",
          message="Intermittent pressure fluctuations observed. Root cause identified as partially closed isolation valve — corrected by operator.",
          parameter_key="pressure", parameter_value=16.2, threshold=15,
          triggered_at=iso_ago(days=14),
          resolved_at=iso_ago(days=14, hours=-2)),
]


# =============================================================================
# Predictions (identical to frontend src/data/predictions.ts)
# =============================================================================
PREDICTIONS = [
    Prediction(equipment_id="MTR-001", timestamp=now, anomaly_score=0.08, risk_score=12, prediction_confidence=0.87,
               fault_predictions=[
                   {"failureMode": "Bearing Wear", "probability": 0.05, "confidenceInterval": [0.02, 0.09]},
                   {"failureMode": "Overheating", "probability": 0.04, "confidenceInterval": [0.01, 0.08]},
                   {"failureMode": "Rotor Imbalance", "probability": 0.03, "confidenceInterval": [0.01, 0.06]},
                   {"failureMode": "Shaft Misalignment", "probability": 0.02, "confidenceInterval": [0.00, 0.05]},
                   {"failureMode": "Electrical Fault", "probability": 0.02, "confidenceInterval": [0.00, 0.04]},
                   {"failureMode": "Excessive Vibration", "probability": 0.02, "confidenceInterval": [0.00, 0.04]},
               ],
               rul={"equipmentId": "MTR-001", "estimatedDays": 210, "confidenceLevel": 0.84,
                    "lowerBound": 185, "upperBound": 240, "basisParameters": ["temperature", "vibration", "current"], "timestamp": now}),

    Prediction(equipment_id="MTR-002", timestamp=now, anomaly_score=0.42, risk_score=51, prediction_confidence=0.76,
               fault_predictions=[
                   {"failureMode": "Bearing Wear", "probability": 0.38, "confidenceInterval": [0.28, 0.49]},
                   {"failureMode": "Excessive Vibration", "probability": 0.34, "confidenceInterval": [0.24, 0.45]},
                   {"failureMode": "Overheating", "probability": 0.28, "confidenceInterval": [0.19, 0.38]},
                   {"failureMode": "Shaft Misalignment", "probability": 0.18, "confidenceInterval": [0.10, 0.27]},
                   {"failureMode": "Rotor Imbalance", "probability": 0.12, "confidenceInterval": [0.06, 0.20]},
                   {"failureMode": "Electrical Fault", "probability": 0.07, "confidenceInterval": [0.02, 0.14]},
               ],
               rul={"equipmentId": "MTR-002", "estimatedDays": 62, "confidenceLevel": 0.71,
                    "lowerBound": 45, "upperBound": 85, "basisParameters": ["temperature", "vibration"], "timestamp": now}),

    Prediction(equipment_id="MTR-003", timestamp=now, anomaly_score=0.05, risk_score=7, prediction_confidence=0.91,
               fault_predictions=[
                   {"failureMode": "Bearing Wear", "probability": 0.03, "confidenceInterval": [0.01, 0.06]},
                   {"failureMode": "Overheating", "probability": 0.02, "confidenceInterval": [0.00, 0.05]},
                   {"failureMode": "Rotor Imbalance", "probability": 0.02, "confidenceInterval": [0.00, 0.04]},
                   {"failureMode": "Shaft Misalignment", "probability": 0.01, "confidenceInterval": [0.00, 0.03]},
                   {"failureMode": "Electrical Fault", "probability": 0.01, "confidenceInterval": [0.00, 0.03]},
                   {"failureMode": "Excessive Vibration", "probability": 0.01, "confidenceInterval": [0.00, 0.02]},
               ],
               rul={"equipmentId": "MTR-003", "estimatedDays": 285, "confidenceLevel": 0.91,
                    "lowerBound": 260, "upperBound": 315, "basisParameters": ["temperature", "vibration", "current"], "timestamp": now}),

    Prediction(equipment_id="PMP-001", timestamp=now, anomaly_score=0.15, risk_score=22, prediction_confidence=0.83,
               fault_predictions=[
                   {"failureMode": "Cavitation", "probability": 0.08, "confidenceInterval": [0.03, 0.15]},
                   {"failureMode": "Bearing Failure", "probability": 0.06, "confidenceInterval": [0.02, 0.12]},
                   {"failureMode": "Seal Leakage", "probability": 0.05, "confidenceInterval": [0.01, 0.10]},
                   {"failureMode": "Impeller Damage", "probability": 0.04, "confidenceInterval": [0.01, 0.09]},
                   {"failureMode": "Blockage", "probability": 0.03, "confidenceInterval": [0.01, 0.07]},
                   {"failureMode": "Shaft Misalignment", "probability": 0.03, "confidenceInterval": [0.00, 0.07]},
                   {"failureMode": "Overheating", "probability": 0.02, "confidenceInterval": [0.00, 0.05]},
               ],
               rul={"equipmentId": "PMP-001", "estimatedDays": 165, "confidenceLevel": 0.81,
                    "lowerBound": 145, "upperBound": 190, "basisParameters": ["vibration", "pressure", "flowRate"], "timestamp": now}),

    Prediction(equipment_id="PMP-002", timestamp=now, anomaly_score=0.79, risk_score=84, prediction_confidence=0.74,
               fault_predictions=[
                   {"failureMode": "Cavitation", "probability": 0.72, "confidenceInterval": [0.61, 0.82]},
                   {"failureMode": "Bearing Failure", "probability": 0.58, "confidenceInterval": [0.46, 0.69]},
                   {"failureMode": "Impeller Damage", "probability": 0.41, "confidenceInterval": [0.29, 0.53]},
                   {"failureMode": "Shaft Misalignment", "probability": 0.22, "confidenceInterval": [0.13, 0.33]},
                   {"failureMode": "Seal Leakage", "probability": 0.19, "confidenceInterval": [0.10, 0.29]},
                   {"failureMode": "Blockage", "probability": 0.14, "confidenceInterval": [0.06, 0.23]},
                   {"failureMode": "Overheating", "probability": 0.11, "confidenceInterval": [0.04, 0.20]},
               ],
               rul={"equipmentId": "PMP-002", "estimatedDays": 18, "confidenceLevel": 0.66,
                    "lowerBound": 8, "upperBound": 32, "basisParameters": ["vibration", "pressure", "flowRate", "temperature"], "timestamp": now}),

    Prediction(equipment_id="PMP-003", timestamp=now, anomaly_score=0.06, risk_score=9, prediction_confidence=0.90,
               fault_predictions=[
                   {"failureMode": "Cavitation", "probability": 0.03, "confidenceInterval": [0.01, 0.07]},
                   {"failureMode": "Bearing Failure", "probability": 0.02, "confidenceInterval": [0.00, 0.06]},
                   {"failureMode": "Seal Leakage", "probability": 0.02, "confidenceInterval": [0.00, 0.05]},
                   {"failureMode": "Impeller Damage", "probability": 0.02, "confidenceInterval": [0.00, 0.05]},
                   {"failureMode": "Blockage", "probability": 0.01, "confidenceInterval": [0.00, 0.04]},
                   {"failureMode": "Shaft Misalignment", "probability": 0.01, "confidenceInterval": [0.00, 0.03]},
                   {"failureMode": "Overheating", "probability": 0.01, "confidenceInterval": [0.00, 0.03]},
               ],
               rul={"equipmentId": "PMP-003", "estimatedDays": 298, "confidenceLevel": 0.92,
                    "lowerBound": 270, "upperBound": 330, "basisParameters": ["vibration", "pressure", "flowRate"], "timestamp": now}),

    Prediction(equipment_id="CMP-001", timestamp=now, anomaly_score=0.38, risk_score=47, prediction_confidence=0.78,
               fault_predictions=[
                   {"failureMode": "Overheating", "probability": 0.44, "confidenceInterval": [0.33, 0.56]},
                   {"failureMode": "Lubrication Failure", "probability": 0.31, "confidenceInterval": [0.21, 0.42]},
                   {"failureMode": "Bearing Failure", "probability": 0.24, "confidenceInterval": [0.15, 0.35]},
                   {"failureMode": "Air Leakage", "probability": 0.12, "confidenceInterval": [0.05, 0.21]},
                   {"failureMode": "Excessive Vibration", "probability": 0.10, "confidenceInterval": [0.04, 0.18]},
                   {"failureMode": "Pressure Abnormality", "probability": 0.08, "confidenceInterval": [0.02, 0.16]},
                   {"failureMode": "Motor Failure", "probability": 0.05, "confidenceInterval": [0.01, 0.12]},
               ],
               rul={"equipmentId": "CMP-001", "estimatedDays": 74, "confidenceLevel": 0.73,
                    "lowerBound": 55, "upperBound": 98, "basisParameters": ["temperature", "vibration"], "timestamp": now}),

    Prediction(equipment_id="CMP-002", timestamp=now, anomaly_score=0.09, risk_score=14, prediction_confidence=0.88,
               fault_predictions=[
                   {"failureMode": "Overheating", "probability": 0.05, "confidenceInterval": [0.01, 0.10]},
                   {"failureMode": "Bearing Failure", "probability": 0.04, "confidenceInterval": [0.01, 0.09]},
                   {"failureMode": "Air Leakage", "probability": 0.04, "confidenceInterval": [0.01, 0.09]},
                   {"failureMode": "Excessive Vibration", "probability": 0.03, "confidenceInterval": [0.01, 0.07]},
                   {"failureMode": "Pressure Abnormality", "probability": 0.03, "confidenceInterval": [0.01, 0.07]},
                   {"failureMode": "Lubrication Failure", "probability": 0.02, "confidenceInterval": [0.00, 0.05]},
                   {"failureMode": "Motor Failure", "probability": 0.01, "confidenceInterval": [0.00, 0.04]},
               ],
               rul={"equipmentId": "CMP-002", "estimatedDays": 230, "confidenceLevel": 0.87,
                    "lowerBound": 205, "upperBound": 260, "basisParameters": ["temperature", "vibration", "current"], "timestamp": now}),

    Prediction(equipment_id="CMP-003", timestamp=now, anomaly_score=0.83, risk_score=91, prediction_confidence=0.71,
               fault_predictions=[
                   {"failureMode": "Overheating", "probability": 0.81, "confidenceInterval": [0.70, 0.90]},
                   {"failureMode": "Pressure Abnormality", "probability": 0.65, "confidenceInterval": [0.53, 0.76]},
                   {"failureMode": "Lubrication Failure", "probability": 0.52, "confidenceInterval": [0.40, 0.64]},
                   {"failureMode": "Bearing Failure", "probability": 0.45, "confidenceInterval": [0.33, 0.57]},
                   {"failureMode": "Excessive Vibration", "probability": 0.38, "confidenceInterval": [0.27, 0.50]},
                   {"failureMode": "Motor Failure", "probability": 0.21, "confidenceInterval": [0.12, 0.32]},
                   {"failureMode": "Air Leakage", "probability": 0.14, "confidenceInterval": [0.06, 0.24]},
               ],
               rul={"equipmentId": "CMP-003", "estimatedDays": 9, "confidenceLevel": 0.61,
                    "lowerBound": 3, "upperBound": 20, "basisParameters": ["temperature", "pressure", "vibration"], "timestamp": now}),

    Prediction(equipment_id="CNC-001", timestamp=now, anomaly_score=0.07, risk_score=10, prediction_confidence=0.90,
               fault_predictions=[
                   {"failureMode": "Tool Wear", "probability": 0.04, "confidenceInterval": [0.01, 0.09]},
                   {"failureMode": "Spindle Failure", "probability": 0.03, "confidenceInterval": [0.01, 0.07]},
                   {"failureMode": "Misalignment", "probability": 0.02, "confidenceInterval": [0.00, 0.06]},
                   {"failureMode": "Excessive Vibration", "probability": 0.02, "confidenceInterval": [0.00, 0.05]},
                   {"failureMode": "Overheating", "probability": 0.02, "confidenceInterval": [0.00, 0.05]},
                   {"failureMode": "Motor Fault", "probability": 0.01, "confidenceInterval": [0.00, 0.04]},
               ],
               rul={"equipmentId": "CNC-001", "estimatedDays": 245, "confidenceLevel": 0.89,
                    "lowerBound": 220, "upperBound": 275, "basisParameters": ["spindleTemperature", "vibration", "toolWear"], "timestamp": now}),

    Prediction(equipment_id="CNC-002", timestamp=now, anomaly_score=0.31, risk_score=38, prediction_confidence=0.79,
               fault_predictions=[
                   {"failureMode": "Tool Wear", "probability": 0.68, "confidenceInterval": [0.56, 0.79]},
                   {"failureMode": "Spindle Failure", "probability": 0.22, "confidenceInterval": [0.13, 0.32]},
                   {"failureMode": "Overheating", "probability": 0.17, "confidenceInterval": [0.09, 0.27]},
                   {"failureMode": "Misalignment", "probability": 0.12, "confidenceInterval": [0.05, 0.21]},
                   {"failureMode": "Excessive Vibration", "probability": 0.11, "confidenceInterval": [0.04, 0.20]},
                   {"failureMode": "Motor Fault", "probability": 0.07, "confidenceInterval": [0.02, 0.14]},
               ],
               rul={"equipmentId": "CNC-002", "estimatedDays": 42, "confidenceLevel": 0.74,
                    "lowerBound": 28, "upperBound": 60, "basisParameters": ["toolWear", "spindleTemperature", "vibration"], "timestamp": now}),

    Prediction(equipment_id="CNC-003", timestamp=now, anomaly_score=0.04, risk_score=5, prediction_confidence=0.94,
               fault_predictions=[
                   {"failureMode": "Tool Wear", "probability": 0.02, "confidenceInterval": [0.00, 0.05]},
                   {"failureMode": "Spindle Failure", "probability": 0.02, "confidenceInterval": [0.00, 0.05]},
                   {"failureMode": "Misalignment", "probability": 0.01, "confidenceInterval": [0.00, 0.04]},
                   {"failureMode": "Excessive Vibration", "probability": 0.01, "confidenceInterval": [0.00, 0.03]},
                   {"failureMode": "Overheating", "probability": 0.01, "confidenceInterval": [0.00, 0.03]},
                   {"failureMode": "Motor Fault", "probability": 0.01, "confidenceInterval": [0.00, 0.02]},
               ],
               rul={"equipmentId": "CNC-003", "estimatedDays": 320, "confidenceLevel": 0.95,
                    "lowerBound": 295, "upperBound": 350, "basisParameters": ["spindleTemperature", "vibration", "toolWear"], "timestamp": now}),

    Prediction(equipment_id="ARM-001", timestamp=now, anomaly_score=0.03, risk_score=4, prediction_confidence=0.96,
               fault_predictions=[
                   {"failureMode": "Gearbox Backlash", "probability": 0.02, "confidenceInterval": [0.00, 0.04]},
                   {"failureMode": "Joint Motor Overheat", "probability": 0.01, "confidenceInterval": [0.00, 0.03]},
                   {"failureMode": "Pneumatic Gripper Leak", "probability": 0.01, "confidenceInterval": [0.00, 0.02]},
               ],
               rul={"equipmentId": "ARM-001", "estimatedDays": 310, "confidenceLevel": 0.94,
                    "lowerBound": 280, "upperBound": 340, "basisParameters": ["vibration_rms", "temperature_motor", "pressure_level"], "timestamp": now}),

    Prediction(equipment_id="ARM-002", timestamp=now, anomaly_score=0.34, risk_score=32, prediction_confidence=0.88,
               fault_predictions=[
                   {"failureMode": "Gearbox Backlash & Wear", "probability": 0.42, "confidenceInterval": [0.31, 0.53]},
                   {"failureMode": "Joint Motor Overheat", "probability": 0.28, "confidenceInterval": [0.18, 0.39]},
                   {"failureMode": "Pneumatic Gripper Leak", "probability": 0.16, "confidenceInterval": [0.08, 0.25]},
               ],
               rul={"equipmentId": "ARM-002", "estimatedDays": 58, "confidenceLevel": 0.81,
                    "lowerBound": 42, "upperBound": 78, "basisParameters": ["vibration_rms", "temperature_motor", "pressure_level"], "timestamp": now}),
]


# =============================================================================
# Maintenance — Recommendations, Work Orders, History
# =============================================================================
RECOMMENDATIONS = [
    MaintenanceRecommendation(
        id="REC-001", equipment_id="PMP-002",
        title="Immediate Inspection — Cavitation & Bearing",
        description="Critical vibration (6.87 mm/s) and low flow rate indicate active cavitation. Bearings at high failure risk. Stop equipment and perform full inspection: check impeller clearance, replace bearings if worn, inspect seals for leakage. Check suction side for air ingestion or blockage.",
        priority="critical", estimated_cost=4800, estimated_downtime=12,
        based_on=["ALT-001", "ALT-002"],
        created_at=iso_ago(hours=1)),
    MaintenanceRecommendation(
        id="REC-002", equipment_id="CMP-003",
        title="Emergency Shutdown — Overheating & Pressure",
        description="Temperature at 103.2°C (critical) and pressure at 24.8 bar exceeding limits. Risk of thermal damage and safety incident. Shut down immediately. Check oil levels, intercooler efficiency, and pressure relief valve. Do not restart until root cause identified.",
        priority="critical", estimated_cost=7200, estimated_downtime=24,
        based_on=["ALT-003", "ALT-004"],
        created_at=iso_ago(minutes=30)),
    MaintenanceRecommendation(
        id="REC-003", equipment_id="MTR-002",
        title="Bearing Inspection & Cooling System Check",
        description="Elevated temperature (83.7°C) with upward trend and vibration above threshold suggest bearing wear and cooling degradation. Schedule vibration analysis and thermal imaging. Check cooling fins and bearing lubrication before next scheduled maintenance window.",
        priority="high", estimated_cost=1200, estimated_downtime=4,
        based_on=["ALT-005", "ALT-006"],
        created_at=iso_ago(hours=6)),
    MaintenanceRecommendation(
        id="REC-004", equipment_id="CMP-001",
        title="Intercooler Inspection & Oil Change",
        description="Temperature rising trend (currently 87.4°C). Lubrication failure is the most probable cause. Perform oil analysis, check oil filter, inspect intercooler for fouling. Change oil if contaminated. Monitor temperature trend for next 24h.",
        priority="high", estimated_cost=800, estimated_downtime=3,
        based_on=["ALT-007"],
        created_at=iso_ago(hours=2)),
    MaintenanceRecommendation(
        id="REC-005", equipment_id="CNC-002",
        title="Tool Change Required",
        description="Tool wear index at 0.74 has exceeded the warning threshold. Replace current tooling before the next production batch to prevent dimensional out-of-tolerance and potential spindle overload. After tool change, verify spindle temperature and vibration normalize.",
        priority="medium", estimated_cost=350, estimated_downtime=1,
        based_on=["ALT-008"],
        created_at=iso_ago(hours=2.5)),
]

WORK_ORDERS = [
    WorkOrder(id="WO-001", equipment_id="PMP-002", equipment_name="Pump Beta",
              issue="Critical vibration and cavitation — immediate full inspection",
              priority="critical", status="in-progress", technician="A. Rodriguez",
              created_date=d(0), scheduled_date=d(0), estimated_duration=12,
              notes="Equipment isolated. Technician on-site performing cavitation check."),
    WorkOrder(id="WO-002", equipment_id="CMP-003", equipment_name="Compressor Gamma",
              issue="Critical overheating and pressure exceedance — emergency shutdown",
              priority="critical", status="pending", technician="B. Singh",
              created_date=d(0), scheduled_date=d(0), estimated_duration=24,
              notes="Equipment shut down. Awaiting safety clearance before entry."),
    WorkOrder(id="WO-003", equipment_id="MTR-002", equipment_name="Motor Beta",
              issue="Bearing inspection and cooling system maintenance",
              priority="high", status="scheduled", technician="J. Patel",
              created_date=d(-1), scheduled_date=d(2), estimated_duration=4,
              notes="Parts ordered. Scheduled for weekend maintenance window."),
    WorkOrder(id="WO-004", equipment_id="CMP-001", equipment_name="Compressor Alpha",
              issue="Intercooler inspection and oil change — rising temperature",
              priority="high", status="scheduled", technician="M. Chen",
              created_date=d(0), scheduled_date=d(3), estimated_duration=3,
              notes="Oil analysis sample sent to lab. Intercooler cleaning scheduled."),
    WorkOrder(id="WO-005", equipment_id="CNC-002", equipment_name="CNC Beta",
              issue="Tool change — wear index exceeded warning threshold",
              priority="medium", status="pending",
              created_date=d(0), scheduled_date=d(1), estimated_duration=1,
              notes="Replacement tooling in stock. Schedule change during next shift break."),
    WorkOrder(id="WO-006", equipment_id="MTR-001", equipment_name="Motor Alpha",
              issue="Scheduled semi-annual preventive maintenance",
              priority="low", status="scheduled", technician="J. Patel",
              created_date=d(-30), scheduled_date=d(30), estimated_duration=6,
              notes="Part of standard PM program. No fault indications."),
    WorkOrder(id="WO-007", equipment_id="PMP-001", equipment_name="Pump Alpha",
              issue="Annual seal inspection and bearing lubrication",
              priority="low", status="completed", technician="A. Rodriguez",
              created_date=d(-45), scheduled_date=d(-14), completed_date=d(-14), estimated_duration=3,
              notes="Completed on schedule. Seals in good condition. Bearings lubricated."),
    WorkOrder(id="WO-008", equipment_id="CNC-001", equipment_name="CNC Alpha",
              issue="Quarterly spindle inspection and calibration",
              priority="low", status="completed", technician="M. Chen",
              created_date=d(-60), scheduled_date=d(-7), completed_date=d(-7), estimated_duration=4,
              notes="Calibration within spec. Spindle runout 0.003mm. All nominal."),
]

MAINTENANCE_HISTORY = [
    MaintenanceRecord(id="MH-001", equipment_id="MTR-001", type="preventive",
                      description="Semi-annual PM: bearing lubrication, cooling system cleaning, electrical connections checked",
                      performed_by="J. Patel", date="2026-06-10", duration=5, cost=420,
                      findings="All within spec. Slight dust accumulation on cooling fins — cleaned."),
    MaintenanceRecord(id="MH-002", equipment_id="PMP-002", type="corrective",
                      description="Seal replacement after minor leakage detected",
                      performed_by="A. Rodriguez", date="2025-11-30", duration=6, cost=1100,
                      parts_replaced=["Mechanical seal assembly"],
                      findings="Seal worn beyond service life. Replaced with OEM part."),
    MaintenanceRecord(id="MH-003", equipment_id="CMP-001", type="preventive",
                      description="Oil change, filter replacement, belt tension check",
                      performed_by="M. Chen", date="2026-02-18", duration=4, cost=680,
                      parts_replaced=["Oil filter", "5L synthetic compressor oil"],
                      findings="Oil slightly dark but within service limit. Filter replaced as scheduled."),
    MaintenanceRecord(id="MH-004", equipment_id="CNC-001", type="inspection",
                      description="Quarterly spindle inspection, tool changer lubrication, way lube check",
                      performed_by="M. Chen", date="2026-09-01", duration=4, cost=0,
                      findings="Spindle runout within 0.003mm. All lubrication points serviced."),
    MaintenanceRecord(id="MH-005", equipment_id="PMP-001", type="preventive",
                      description="Annual seal inspection and bearing lubrication",
                      performed_by="A. Rodriguez", date=d(-14), duration=3, cost=280,
                      findings="Seals in good condition. Bearings lubricated. No issues found."),
]


# =============================================================================
# Main seed function
# =============================================================================
def seed():
    """Drop all tables, recreate, and insert all seed data."""
    print("🗄️  Dropping existing tables...")
    Base.metadata.drop_all(bind=engine)

    print("🏗️  Creating tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Plants
        print("🌱 Seeding plants...")
        db.add_all(PLANTS)
        db.flush()

        # Equipment
        print("🌱 Seeding equipment (12 machines)...")
        db.add_all(EQUIPMENT)
        db.flush()

        # Current sensor readings
        print("🌱 Seeding current sensor readings...")
        db.add_all(CURRENT_READINGS)
        db.flush()

        # Historical sensor data
        print("🌱 Generating historical sensor data...")
        total_readings = 0
        for equip_id, param_key, base_val, pattern in HISTORICAL_CONFIG:
            history = generate_history(equip_id, param_key, base_val, pattern)
            db.add_all(history)
            total_readings += len(history)
            # Flush in batches to avoid memory issues
            if total_readings % 2000 == 0:
                db.flush()
        db.flush()
        print(f"   → {total_readings} historical readings generated")

        # Alerts
        print("🌱 Seeding alerts...")
        db.add_all(ALERTS)
        db.flush()

        # Predictions
        print("🌱 Seeding predictions...")
        db.add_all(PREDICTIONS)
        db.flush()

        # Maintenance
        print("🌱 Seeding maintenance data...")
        db.add_all(RECOMMENDATIONS)
        db.add_all(WORK_ORDERS)
        db.add_all(MAINTENANCE_HISTORY)
        db.flush()

        db.commit()
        print("✅ Seed complete!")
        print(f"   Plants: {len(PLANTS)}")
        print(f"   Equipment: {len(EQUIPMENT)}")
        print(f"   Current readings: {len(CURRENT_READINGS)}")
        print(f"   Historical readings: {total_readings}")
        print(f"   Alerts: {len(ALERTS)}")
        print(f"   Predictions: {len(PREDICTIONS)}")
        print(f"   Recommendations: {len(RECOMMENDATIONS)}")
        print(f"   Work orders: {len(WORK_ORDERS)}")
        print(f"   Maintenance history: {len(MAINTENANCE_HISTORY)}")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
