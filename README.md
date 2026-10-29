# PredictX — Smart Industrial Equipment Health Monitoring & Predictive Maintenance System

PredictX is an end-to-end industrial IoT monitoring and AI-powered predictive maintenance platform. It ingests high-frequency telemetry (vibration, motor temperature, phase current, pressure, RPM) from factory machinery and runs **genuine multi-signal machine learning models** to predict equipment failures, compute live health scores, and forecast Remaining Useful Life (RUL).

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────┐
│     React 19 Frontend (Vite)    │  ──→ http://localhost:5173
│ TypeScript, TailwindCSS, Charts │
└────────────────┬────────────────┘
                 │ REST API Calls
                 ▼
┌─────────────────────────────────┐
│       FastAPI Backend API       │  ──→ http://localhost:8000
│ SQLAlchemy ORM & SQLite/Postgres│
└────────────────┬────────────────┘
                 │ Live Telemetry Feature Ingestion
                 ▼
┌─────────────────────────────────────────────────────────┐
│           Genuine ML Multi-Signal Inference             │
│  • CNC Machine:    cnc_complete_system.pkl              │
│  • Compressor:     compressor_predictive_model.pkl      │
│  • Centrifugal Pump: pump_predictive_maintenance.pkl    │
│  [XGBoost 24h Risk + IsoForest Anomaly + Keras LSTM]    │
└─────────────────────────────────────────────────────────┘
```

---

## ⚙️ Prerequisites

Before getting started, make sure you have the following installed:

1. **Python** ≥ 3.11 (Python 3.11, 3.12, or 3.13)
2. **Node.js** ≥ 20.x and **npm**
3. **Git** (optional, for version control)

> **Database Note**: The system automatically uses a lightweight local SQLite database (`predictx.db`) by default. PostgreSQL is supported but **not** required for local development.

---

## 🚀 Quick Start Guide

### Step 1: Set Up and Run the Backend Server

Open a terminal (PowerShell or Bash) and navigate to the `backend` folder:

```bash
cd backend
```

#### 1. Create and Activate a Virtual Environment

**Windows (PowerShell):**
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**macOS / Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

#### 2. Install Dependencies

```bash
pip install -r requirements.txt
pip install "xgboost<3.0.0" keras torch --index-url https://download.pytorch.org/whl/cpu
```

#### 3. Initialize & Seed the Database

Run the database seed script to populate factory equipment, sensor telemetry, and historical readings:

**Windows (PowerShell):**
```powershell
$env:PYTHONIOENCODING="utf-8"; python -m app.seed
```

**macOS / Linux:**
```bash
python -m app.seed
```

You should see output ending with:
```
[OK] CNCMachineMLService loaded successfully.
[OK] CompressorMLService loaded successfully.
[OK] PumpMLService loaded successfully.
✅ Seed complete!
```

#### 4. Start the FastAPI Backend

Run the server on port `8000`:

```bash
python -m uvicorn app.main:app --reload --port 8000
```

* **API Base URL**: `http://localhost:8000/api`
* **Interactive Swagger Documentation**: `http://localhost:8000/docs`
* **ML Models Deployment Status**: `http://localhost:8000/api/ml/status`

---

### Step 2: Set Up and Run the Frontend Dashboard

Open a **new terminal tab or window** and navigate to the `frontend` folder:

```bash
cd frontend
```

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Configure Environment (Optional)

The frontend defaults to connecting to `http://localhost:8000/api`. If needed, you can create a local environment file:

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env.local
```

**macOS / Linux:**
```bash
cp .env.example .env.local
```

#### 3. Start the Development Server

```bash
npm run dev
```

The frontend dashboard will be live at:
👉 **`http://localhost:5173`**

---

## 🧪 Verifying Live AI Model Inferences

Once both servers are running, test that real machine learning predictions are active without dummy data:

1. **Dashboard Overview (`http://localhost:5173`)**:
   - The health scores for CNC Machines, Compressors, and Pumps are computed dynamically from real ML models.
2. **Machine Details (`http://localhost:5173/equipment/CNC-001`)**:
   - Check the **AI Predictive Maintenance & Fault Diagnostics** card.
   - Shows the active **Trained ML Model Inference** badge.
   - View the Tri-Signal Breakdown:
     - **Signal 1 (XGBoost)**: 24-hour failure risk probability.
     - **Signal 2 (Isolation Forest)**: Unsupervised anomaly risk percentage.
     - **Signal 3 (Temporal LSTM)**: 20-step lookback degradation warning.
3. **Interactive Simulation Playground**:
   - Adjust sensor sliders (vibration, motor temperature, pressure, current, RPM) or click preset scenarios (Nominal, Cavitation, Tool Wear, Bearing Seizure) to see real-time model re-scoring.
4. **Direct API Tests**:
   - CNC Machine: `GET http://localhost:8000/api/equipment/CNC-001/predictions`
   - Compressor: `GET http://localhost:8000/api/equipment/CMP-001/predictions`
   - Centrifugal Pump: `GET http://localhost:8000/api/equipment/PMP-001/predictions`

---

## 📁 Repository Structure

```
Smart-Industrial-Equipment-Health-Monitoring-and-Predictive-Maintenance-System/
├── cnc_complete_system.pkl                      # Trained CNC Machine Tri-Signal model bundle
├── compressor_predictive_maintenance_model.pkl  # Trained Compressor Tri-Signal model bundle
├── pump_predictive_maintenance.pkl              # Trained Pump Tri-Signal model bundle
├── MODEL_ARTIFACT_INVENTORY.md                  # Detailed inventory of machine learning models
├── README.md                                    # Project documentation and execution instructions
│
├── backend/                                     # FastAPI Backend Service
│   ├── app/
│   │   ├── api/                                 # Endpoints (equipment, sensors, predictions, ml)
│   │   ├── ml_models/                           # Directory storing serialized models (.pkl)
│   │   ├── models/                              # SQLAlchemy ORM database models
│   │   ├── schemas/                             # Pydantic schemas
│   │   ├── services/
│   │   │   └── ml_inference.py                  # Core inference engine and ModelRegistry
│   │   ├── database.py                          # Database connection and session management
│   │   ├── main.py                              # FastAPI entrypoint and CORS setup
│   │   └── seed.py                              # Database initialization and telemetry generator
│   └── requirements.txt                         # Python dependencies
│
└── frontend/                                    # React 19 + TypeScript + Vite Dashboard
    ├── src/
    │   ├── components/                          # UI components, charts, and alert panels
    │   ├── pages/                               # Views (Dashboard, EquipmentList, EquipmentDetails)
    │   ├── services/                            # API clients (equipmentApi, predictionApi, mlApi)
    │   ├── store/                               # Zustand global client state
    │   └── types/                               # TypeScript domain type contracts
    ├── package.json
    └── vite.config.ts
```

---

## 🛠️ Common Troubleshooting

### 1. `XGBoostError: input stream corrupted`
* **Cause**: XGBoost 3.0+ changed its internal booster serialization format.
* **Fix**: Install `xgboost<3.0.0` using:
  ```bash
  pip install "xgboost<3.0.0"
  ```

### 2. Keras / PyTorch Backend Issues
* **Fix**: The backend automatically sets `KERAS_BACKEND=torch`. Ensure PyTorch CPU is installed:
  ```bash
  pip install torch --index-url https://download.pytorch.org/whl/cpu
  ```

### 3. Windows PowerShell Script Execution Policy
* If `.\.venv\Scripts\Activate.ps1` produces a permissions error:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

### 4. Build Frontend for Production
To test production compilation:
```bash
cd frontend
npm run build
```
This generates an optimized static bundle in `frontend/dist/`.
