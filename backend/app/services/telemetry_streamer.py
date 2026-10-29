"""
Telemetry Streamer Service.
Generates continuous, realistic real-time telemetry micro-drift for the active ML equipment:
- CNC Machines (CNC-001, CNC-002, CNC-003)
- Compressors (CMP-001, CMP-002, CMP-003)
- Centrifugal Pumps (PMP-001, PMP-002, PMP-003)

This ensures live sensor readings and ML model inference update continuously in real-time.
"""

import asyncio
import random
from datetime import datetime
from typing import Dict, Any

from app.database import SessionLocal
from app.models.sensor import SensorReading as SensorReadingModel
from app.models.equipment import Equipment as EquipmentModel
from app.services.ml_inference import ml_registry

# Initial physical state baselines for the 9 active equipment
EQUIPMENT_PROFILES: Dict[str, Dict[str, Any]] = {
    "CNC-001": {
        "type": "cnc_machine",
        "vibration_rms": 1.42,
        "temperature_motor": 48.1,
        "current_phase_avg": 14.5,
        "pressure_level": 6.2,
        "rpm": 1600.0,
        "ambient_temp": 22.0,
        "power": 18.2,
        "toolWear": 0.22,
        "ranges": {"vibration_rms": (1.1, 1.8), "temperature_motor": (45.0, 52.0), "rpm": (1580, 1620), "current_phase_avg": (13.5, 15.5)},
    },
    "CNC-002": {
        "type": "cnc_machine",
        "vibration_rms": 2.15,
        "temperature_motor": 54.3,
        "current_phase_avg": 16.8,
        "pressure_level": 6.0,
        "rpm": 1720.0,
        "ambient_temp": 23.0,
        "power": 21.0,
        "toolWear": 0.54,
        "ranges": {"vibration_rms": (1.8, 2.6), "temperature_motor": (51.0, 58.0), "rpm": (1700, 1750), "current_phase_avg": (15.5, 18.0)},
    },
    "CNC-003": {
        "type": "cnc_machine",
        "vibration_rms": 1.55,
        "temperature_motor": 49.5,
        "current_phase_avg": 15.1,
        "pressure_level": 6.3,
        "rpm": 1610.0,
        "ambient_temp": 22.5,
        "power": 19.0,
        "toolWear": 0.28,
        "ranges": {"vibration_rms": (1.2, 1.9), "temperature_motor": (46.0, 53.0), "rpm": (1590, 1630), "current_phase_avg": (14.0, 16.0)},
    },
    "CMP-001": {
        "type": "compressor",
        "vibration_rms": 2.10,
        "temperature_motor": 62.4,
        "current_phase_avg": 18.2,
        "pressure_level": 7.45,
        "rpm": 2950.0,
        "ambient_temp": 24.0,
        "power": 46.0,
        "ranges": {"vibration_rms": (1.7, 2.5), "temperature_motor": (58.0, 66.0), "pressure_level": (7.1, 7.8), "rpm": (2920, 2980)},
    },
    "CMP-002": {
        "type": "compressor",
        "vibration_rms": 3.35,
        "temperature_motor": 73.8,
        "current_phase_avg": 22.6,
        "pressure_level": 8.15,
        "rpm": 2910.0,
        "ambient_temp": 25.5,
        "power": 54.0,
        "ranges": {"vibration_rms": (2.9, 3.8), "temperature_motor": (70.0, 78.0), "pressure_level": (7.8, 8.5), "rpm": (2880, 2940)},
    },
    "CMP-003": {
        "type": "compressor",
        "vibration_rms": 1.95,
        "temperature_motor": 60.1,
        "current_phase_avg": 17.5,
        "pressure_level": 7.20,
        "rpm": 2960.0,
        "ambient_temp": 23.5,
        "power": 44.5,
        "ranges": {"vibration_rms": (1.6, 2.3), "temperature_motor": (57.0, 64.0), "pressure_level": (6.9, 7.5), "rpm": (2930, 2990)},
    },
    "PMP-001": {
        "type": "pump",
        "vibration_rms": 1.58,
        "temperature_motor": 51.2,
        "current_phase_avg": 12.4,
        "pressure_level": 5.25,
        "flowRate": 95.4,
        "rpm": 1480.0,
        "ambient_temp": 21.0,
        "ranges": {"vibration_rms": (1.2, 1.9), "temperature_motor": (48.0, 55.0), "pressure_level": (4.9, 5.6), "flowRate": (90.0, 100.0)},
    },
    "PMP-002": {
        "type": "pump",
        "vibration_rms": 1.72,
        "temperature_motor": 53.0,
        "current_phase_avg": 13.1,
        "pressure_level": 5.10,
        "flowRate": 92.1,
        "rpm": 1475.0,
        "ambient_temp": 21.5,
        "ranges": {"vibration_rms": (1.3, 2.1), "temperature_motor": (49.0, 57.0), "pressure_level": (4.8, 5.4), "flowRate": (88.0, 96.0)},
    },
    "PMP-003": {
        "type": "pump",
        "vibration_rms": 2.75,
        "temperature_motor": 64.8,
        "current_phase_avg": 15.8,
        "pressure_level": 4.65,
        "flowRate": 82.5,
        "rpm": 1460.0,
        "ambient_temp": 23.0,
        "ranges": {"vibration_rms": (2.3, 3.2), "temperature_motor": (61.0, 69.0), "pressure_level": (4.3, 5.0), "flowRate": (78.0, 87.0)},
    },
}

_running = False
_task = None


def _drift_value(current: float, min_val: float, max_val: float, max_delta: float) -> float:
    delta = (random.random() - 0.49) * max_delta
    val = current + delta
    return max(min_val, min(max_val, val))


async def run_telemetry_loop(interval_seconds: float = 2.5):
    """Continuous background loop updating sensor readings in DB."""
    global _running
    _running = True
    print(f"[TelemetryStreamer] Started real-time telemetry streaming (interval: {interval_seconds}s)")

    tick_count = 0
    while _running:
        try:
            now_iso = datetime.utcnow().isoformat()
            db = SessionLocal()
            try:
                # Update each active equipment
                for eq_id, profile in EQUIPMENT_PROFILES.items():
                    ranges = profile.get("ranges", {})
                    # Update physical drift
                    if "vibration_rms" in ranges:
                        profile["vibration_rms"] = _drift_value(
                            profile["vibration_rms"], ranges["vibration_rms"][0], ranges["vibration_rms"][1], 0.05
                        )
                    if "temperature_motor" in ranges:
                        profile["temperature_motor"] = _drift_value(
                            profile["temperature_motor"], ranges["temperature_motor"][0], ranges["temperature_motor"][1], 0.25
                        )
                    if "pressure_level" in ranges:
                        profile["pressure_level"] = _drift_value(
                            profile["pressure_level"], ranges["pressure_level"][0], ranges["pressure_level"][1], 0.04
                        )
                    if "rpm" in ranges:
                        profile["rpm"] = _drift_value(
                            profile["rpm"], ranges["rpm"][0], ranges["rpm"][1], 6.0
                        )
                    if "current_phase_avg" in ranges:
                        profile["current_phase_avg"] = _drift_value(
                            profile["current_phase_avg"], ranges["current_phase_avg"][0], ranges["current_phase_avg"][1], 0.15
                        )
                    if "flowRate" in ranges:
                        profile["flowRate"] = _drift_value(
                            profile["flowRate"], ranges["flowRate"][0], ranges["flowRate"][1], 0.4
                        )

                    # Build unified values payload covering both model and UI keys
                    values = {
                        "vibration_rms": round(profile["vibration_rms"], 2),
                        "temperature_motor": round(profile["temperature_motor"], 1),
                        "current_phase_avg": round(profile["current_phase_avg"], 1),
                        "pressure_level": round(profile["pressure_level"], 2),
                        "rpm": round(profile["rpm"], 0),
                        "ambient_temp": round(profile.get("ambient_temp", 22.0), 1),
                        "hours_since_maintenance": profile.get("hours_since_maintenance", 120.0),
                        # UI synonyms
                        "vibration": round(profile["vibration_rms"], 2),
                        "temperature": round(profile["temperature_motor"], 1),
                        "spindleTemperature": round(profile["temperature_motor"], 1),
                        "pressure": round(profile["pressure_level"], 2),
                        "current": round(profile["current_phase_avg"], 1),
                        "motorCurrent": round(profile["current_phase_avg"], 1),
                        "speed": round(profile["rpm"], 0),
                        "spindleSpeed": round(profile["rpm"], 0),
                        "power": round(profile.get("power", 18.0) + (random.random() - 0.5) * 0.4, 1),
                    }
                    if "flowRate" in profile:
                        values["flowRate"] = round(profile["flowRate"], 1)
                    if "toolWear" in profile:
                        values["toolWear"] = round(profile["toolWear"] + (random.random() * 0.0001), 3)

                    # Insert new SensorReading record
                    reading = SensorReadingModel(
                        equipment_id=eq_id,
                        timestamp=now_iso,
                        values=values,
                    )
                    db.add(reading)

                db.commit()

                # Clean up old records periodically (every 40 ticks = ~100s)
                tick_count += 1
                if tick_count % 40 == 0:
                    for eq_id in EQUIPMENT_PROFILES.keys():
                        # Keep latest 100 rows per equipment
                        subquery = (
                            db.query(SensorReadingModel.id)
                            .filter(SensorReadingModel.equipment_id == eq_id)
                            .order_by(SensorReadingModel.timestamp.desc())
                            .offset(100)
                            .all()
                        )
                        old_ids = [row[0] for row in subquery]
                        if old_ids:
                            db.query(SensorReadingModel).filter(SensorReadingModel.id.in_(old_ids)).delete(synchronize_session=False)
                    db.commit()

            except Exception as e:
                db.rollback()
                print(f"[TelemetryStreamer] Error in loop tick: {e}")
            finally:
                db.close()

        except Exception as e:
            print(f"[TelemetryStreamer] Fatal outer error: {e}")

        await asyncio.sleep(interval_seconds)


def start_telemetry_streamer():
    """Starts the telemetry background task in the active asyncio loop."""
    global _task
    if _task is None or _task.done():
        loop = asyncio.get_event_loop()
        _task = loop.create_task(run_telemetry_loop(2.5))


def stop_telemetry_streamer():
    global _running, _task
    _running = False
    if _task and not _task.done():
        _task.cancel()
