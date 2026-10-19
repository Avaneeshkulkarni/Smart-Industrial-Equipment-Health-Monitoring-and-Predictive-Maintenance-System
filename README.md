# PredictX — Predictive Maintenance Platform

AI-driven predictive maintenance dashboard for industrial equipment monitoring.

## Repository Structure

```
predictx/
├── frontend/     React + TypeScript + Vite dashboard
├── backend/      FastAPI + PostgreSQL REST API
├── ml/           ML model training & inference (placeholder — Phase 3)
└── README.md
```

## Quick Start — Local Development

### Prerequisites

- **Node.js** ≥ 20 and npm
- **Python** ≥ 3.11
- **PostgreSQL** — local instance or managed (Supabase / Neon / etc.)

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Configure database
cp .env.example .env
# Edit .env → set DATABASE_URL to your PostgreSQL connection string

# Create tables and seed data
python -m app.seed

# Start the API server
uvicorn app.main:app --reload --port 8000
```

The API is now live at `http://localhost:8000/api`.
Interactive docs: `http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install

# Configure API URL (defaults are fine for local dev)
cp .env.example .env.local

npm run dev
```

The dashboard is now live at `http://localhost:5173`.

### 3. Verify

Open `http://localhost:5173` — the dashboard should load with all data served from the backend.
Check the browser Network tab: every request should hit `localhost:8000/api/...`.

## Architecture

```
Browser ──→ Vite dev server (5173)
              │
              └──→ FastAPI (8000) ──→ PostgreSQL
```

- **Frontend**: React 19, TypeScript, TailwindCSS v4, shadcn/ui, Recharts, TanStack Query, Zustand
- **Backend**: FastAPI, SQLAlchemy, Pydantic, psycopg2
- **Database**: PostgreSQL with JSONB columns for flexible sensor data

## ML (Phase 3 — Not Yet Implemented)

The `ml/` directory is a placeholder for future model training and inference:
- `ml/training/` — training scripts and notebooks
- `ml/models/` — serialized model artifacts

Currently, the backend serves curated mock predictions. Phase 3 will replace these with real ML inference.
