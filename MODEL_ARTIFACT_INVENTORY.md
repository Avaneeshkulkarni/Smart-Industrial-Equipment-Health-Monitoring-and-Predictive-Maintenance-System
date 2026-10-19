# PredictX — Model Artifact Inventory (Phase 2)

**Generated:** October 19, 2026  
**Auditor:** PredictX ML Integration Engineer  
**Status:** 3 Models Ready (`robotic_arm`, `cnc_machine`, `compressor`), 2 Models Blocked (`electric_motor`, `pump`)

---

## Executive Summary

Per the strict non-negotiable rules:
1. **Zero mock, dummy, or fabricated predictions.**
2. **Explicit "Model not yet available" states** for any equipment without verified trained model artifacts on disk.
3. **No fabricated RUL or synthetic confidence metrics** unless produced by a genuine trained model.
4. **No retraining, fine-tuning, or regenerating** within Antigravity; models are ingested as delivered.

| Equipment Type | Identifier | Architecture / Models | Artifact Files | Status | Notes |
|---|---|---|---|---|---|
| **Robotic Arm** | `robotic_arm` | XGBoost (Signal 1) + Isolation Forest (Signal 2) + PyTorch / Keras 2-Layer LSTM (Signal 3) | Present in `backend/app/ml_models/robotic_arm/` & `ml/models/` | **READY ✅** | All model files, scalers, imputers, and metadata verified and loadable. |
| **CNC Machine** | `cnc_machine` | XGBoost (Signal 1) + Isolation Forest (Signal 2) + Reconstructed Keras 2-Layer LSTM (Signal 3) | `cnc_complete_system.pkl` in `backend/app/ml_models/cnc_machine/` | **READY ✅** | Single self-contained bundle with imputer, scalers, thresholds, and weights verified and loadable. |
| **Compressor** | `compressor` | XGBoost (60%) + Keras Sequential LSTM (30%) + Isolation Forest (10%) | `compressor_predictive_maintenance_model.pkl` in `backend/app/ml_models/compressor/` | **READY ✅** | Weighted tri-signal model bundle with scalers, threshold (0.56), and imputer verified and loadable. |
| **Electric Motor** | `electric_motor` | Tri-Signal Architecture (TBD) | **None found on disk** | **BLOCKED 🛑** | Awaiting Colab training artifacts. Model status: explicitly unavailable. |
| **Centrifugal Pump** | `pump` | Tri-Signal Architecture (TBD) | **None found on disk** | **BLOCKED 🛑** | Awaiting Colab training artifacts. Model status: explicitly unavailable. |

---

## Detailed Equipment Model Breakdown

### 1. 6-Axis Robotic Arm (`robotic_arm`) — READY ✅

#### Artifacts Verified on Disk
Location: `/Users/adi/Desktop/predictx/backend/app/ml_models/robotic_arm/` and `/Users/adi/Desktop/predictx/ml/models/`

| Filename | Format | Purpose | Library & Version |
|---|---|---|---|
| `imputer.pkl` / `imputer.joblib` | Joblib / Pickle | SimpleImputer (strategy='mean') for missing base telemetry | scikit-learn >= 1.4 |
| `iso_scaler.pkl` / `iso_scaler.joblib` | Joblib / Pickle | StandardScaler for Isolation Forest feature scaling | scikit-learn >= 1.4 |
| `iso_model.pkl` / `iso_model.joblib` | Joblib / Pickle | IsolationForest (n_estimators=100, contamination=0.08) | scikit-learn >= 1.4 |
| `xgb_model.pkl` / `xgb_model.joblib` | Joblib / Pickle | XGBClassifier for 24h failure risk probability | xgboost >= 2.0 |
| `lstm_scaler.pkl` / `lstm_scaler.joblib` | Joblib / Pickle | StandardScaler for temporal sequence feature scaling | scikit-learn >= 1.4 |
| `lstm_model.keras` / `lstm_model.pt` | Keras / PyTorch | 2-Layer Temporal LSTM for sequence degradation risk | Keras 3.x / PyTorch 2.x |
| `model_metadata.json` | JSON | Feature orders, thresholds, min/max normalization, metrics | Standard JSON |

#### Prediction Targets & Fusion
- **Signal 1 (XGBoost):** 24-hour failure risk probability (`xgb_prob` $\in [0, 1]$, threshold: 0.32).
- **Signal 2 (Isolation Forest):** Unsupervised anomaly risk percentage (`anomaly_risk` $\in [0, 100]\%$) normalized between baseline `score_min` (-0.0974) and `score_max` (0.3105), threshold: 70%.
- **Signal 3 (Temporal LSTM):** 20-step temporal sequence degradation warning probability (`lstm_prob` $\in [0, 1]$, threshold: 0.74).
- **Composite Health Score:** $100 - (0.60 \times \text{xgb\_risk}) - (0.40 \times \text{anomaly\_risk})$.
- **Decision Gating Rule:** Direct failure at `xgb_prob >= 0.45` or gated failure at `xgb_prob >= 0.32` AND (`anomaly_risk >= 50%` OR `temporal_warning`).

---

### 2. CNC Machine (`cnc_machine`) — READY ✅

#### Artifacts Verified on Disk
Location: `/Users/adi/Desktop/predictx/backend/app/ml_models/cnc_machine/cnc_complete_system.pkl`

| Component | Format | Purpose | Key Attributes |
|---|---|---|---|
| `imputer` | SimpleImputer | Missing telemetry imputation across all 17 features | Mean strategy, 17 features |
| `iso_scaler` | StandardScaler | Feature standardizer for Isolation Forest | 17 features |
| `iso_model` | IsolationForest | Unsupervised anomaly detector | Contamination=0.08, threshold=70% |
| `xgb_model` | XGBClassifier | Supervised failure risk predictor | `xgb_threshold` = 0.15 |
| `lstm_scaler` | StandardScaler | Temporal feature standardizer | 17 features |
| `lstm_architecture` + `weights` | JSON + Numpy | 2-Layer Temporal LSTM (64 -> 32 -> 16 -> 1) | Sequence length 20, threshold = 0.61 |

#### Prediction Targets & Fusion
- **Signal 1 (XGBoost):** 24-hour failure risk probability (`xgb_threshold` = 0.15).
- **Signal 2 (Isolation Forest):** Anomaly risk percentage normalized between `score_min` (-0.1024) and `score_max` (0.1939).
- **Signal 3 (Keras LSTM):** Sequence lookback degradation probability (`lstm_threshold` = 0.61).
- **Composite Health Score:** $100 - (0.60 \times \text{xgb\_risk}) - (0.40 \times \text{anomaly\_risk})$.
- **Decision Gating Rule:** Direct failure at `xgb_prob >= 0.45` or gated failure at `xgb_prob >= 0.15` AND (`anomaly_risk >= 50%` OR `lstm_prob >= 0.61`).

---

### 3. Industrial Compressor (`compressor`) — READY ✅

#### Artifacts Verified on Disk
Location: `/Users/adi/Desktop/predictx/backend/app/ml_models/compressor/compressor_predictive_maintenance_model.pkl`

| Component | Format | Purpose | Key Attributes |
|---|---|---|---|
| `imputer` | SimpleImputer | Missing telemetry imputation | 17 features |
| `iso_scaler` | StandardScaler | Feature standardizer for Isolation Forest | 17 features |
| `isolation_forest_model` | IsolationForest | Unsupervised anomaly detector | Weight: 0.10, threshold: 70% |
| `xgboost_model` | XGBClassifier | Supervised failure risk classifier | Weight: 0.60 |
| `lstm_scaler` | StandardScaler | Temporal feature standardizer | 17 features |
| `lstm_model` | Keras Sequential | 2-Layer Temporal LSTM | Weight: 0.30, Sequence length: 20 |

#### Prediction Targets & Fusion
- **Tri-Signal Weighted Risk:** $(0.60 \times \text{xgb\_prob}) + (0.30 \times \text{lstm\_prob}) + (0.10 \times \text{iso\_risk} / 100)$.
- **Threshold Gating:** Failure predicted if composite risk $\ge 0.56$ or `xgb_prob >= 0.45`.
- **Composite Health Score:** $100 - (\text{composite\_risk} \times 100)$.

---

### 4. Electric Motor (`electric_motor`) — BLOCKED 🛑

- **Status:** No model artifact file present on disk.
- **System Behavior:**
  - `GET /api/ml/status` reports `electric_motor: { available: false, status: "blocked", reason: "Awaiting Colab training pipeline." }`.
  - `/equipment/:id` provides live sensor telemetry, but explicitly states `"ML Model Not Yet Available for Electric Motor. Telemetry active, AI scoring offline."`.
  - Zero synthetic numbers fabricated.

---

### 5. Centrifugal Pump (`pump`) — BLOCKED 🛑

- **Status:** No model artifact file present on disk.
- **System Behavior:**
  - `GET /api/ml/status` reports `pump: { available: false, status: "blocked", reason: "Awaiting Colab training pipeline." }`.
  - `/equipment/:id` provides live sensor telemetry, but explicitly states `"ML Model Not Yet Available for Centrifugal Pump. Telemetry active, AI scoring offline."`.
  - Zero synthetic numbers fabricated.
