"""
PredictX Backend — FastAPI Application Entry Point.

CORS middleware reads allowed origins from the ALLOWED_ORIGINS environment
variable (comma-separated). Defaults to localhost:5173 for local dev.
"""

import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.equipment import router as equipment_router
from app.api.sensors import router as sensors_router
from app.api.alerts import router as alerts_router
from app.api.predictions import router as predictions_router
from app.api.maintenance import router as maintenance_router
from app.api.analytics import router as analytics_router
from app.api.ml import router as ml_router

load_dotenv()

app = FastAPI(
    title="PredictX API",
    description="Predictive Maintenance Platform — REST API",
    version="0.2.0",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
allowed_origins = [origin.strip() for origin in allowed_origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(equipment_router)
app.include_router(sensors_router)
app.include_router(alerts_router)
app.include_router(predictions_router)
app.include_router(maintenance_router)
app.include_router(analytics_router)
app.include_router(ml_router)


@app.get("/")
def root():
    return {"app": "PredictX API", "version": "0.2.0", "status": "ok"}


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
