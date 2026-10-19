"""
PredictX — Robotic Arm Multi-Signal Predictive Maintenance Training Pipeline.

Faithfully implements the Colab model architecture:
1. Signal 1: XGBoost Classifier (24h failure risk probability with F1-optimized threshold)
2. Signal 2: Isolation Forest (Unsupervised anomaly scoring normalized 0-100 on normal baseline)
3. Signal 3: Temporal Bi-LSTM (20-step sequence degradation warning)
4. Multi-Signal Fusion Engine (100 - 0.60*xgb - 0.40*iso, with failure decision gating)

Exports all artifacts to ml/models/ and backend/app/ml_artifacts/.
"""

import os
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import joblib

from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
)
from xgboost import XGBClassifier

import torch
import torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader

torch.set_num_threads(1)

# Set seeds for reproducibility
np.random.seed(42)
torch.manual_seed(42)

BASE_FEATURES = [
    "vibration_rms",
    "temperature_motor",
    "current_phase_avg",
    "pressure_level",
    "rpm",
    "ambient_temp",
    "hours_since_maintenance"
]

SEQUENCE_LENGTH = 20


def generate_synthetic_robotic_arm_data(n_samples=4500):
    """
    Generates realistic 6-axis robotic arm operational telemetry with:
    - Normal operating cycles (pick & place, welding, payload variation)
    - Gradual bearing/gearbox wear
    - Motor joint overheating
    - Pneumatic pressure drops
    - Imminent failure runs within 24 hours
    """
    records = []
    start_time = datetime(2026, 8, 1, 8, 0, 0)
    machines = ["ARM-001", "ARM-002", "ARM-003"]
    
    samples_per_machine = n_samples // len(machines)
    
    for m_id in machines:
        t = start_time
        hours_maint = np.random.uniform(50, 400)
        degrading = False
        degradation_step = 0
        failure_countdown = -1
        
        for i in range(samples_per_machine):
            t += timedelta(minutes=15)
            hours_maint += 0.25
            
            # Periodically initiate degradation sequence
            if not degrading and i > 200 and np.random.rand() < 0.015:
                degrading = True
                degradation_step = 0
                failure_countdown = np.random.randint(60, 100) # steps until failure
            
            # Ambient temp with daily cycle
            hour_of_day = t.hour + t.minute / 60.0
            ambient_temp = 22.0 + 6.0 * np.sin((hour_of_day - 8) * np.pi / 12) + np.random.normal(0, 0.4)
            
            if not degrading:
                # Normal baseline
                vibration_rms = 1.4 + np.random.normal(0, 0.18)
                temperature_motor = 48.0 + (ambient_temp - 22.0) * 0.5 + np.random.normal(0, 1.2)
                current_phase_avg = 14.5 + np.random.normal(0, 0.8)
                pressure_level = 6.2 + np.random.normal(0, 0.15)
                rpm = 1600.0 + np.random.normal(0, 25.0)
                failure_within_24h = 0
                failure_type = "none"
            else:
                # Degrading sequence
                degradation_step += 1
                progress = min(1.0, degradation_step / max(1, failure_countdown))
                
                # Parameters drift into anomaly/failure zones
                vibration_rms = 1.4 + (progress ** 1.8) * 4.8 + np.random.normal(0, 0.3)
                temperature_motor = 48.0 + (progress ** 1.5) * 36.0 + np.random.normal(0, 1.8)
                current_phase_avg = 14.5 + (progress ** 1.6) * 16.0 + np.random.normal(0, 1.1)
                pressure_level = 6.2 - (progress ** 1.4) * 2.8 + np.random.normal(0, 0.25)
                rpm = 1600.0 - (progress ** 1.3) * 320.0 + np.random.normal(0, 45.0)
                
                # Flag failure_within_24h when failure is within ~96 steps (24 hours at 15m intervals)
                remaining_steps = failure_countdown - degradation_step
                if remaining_steps <= 96:
                    failure_within_24h = 1
                    failure_type = "gearbox_wear" if m_id == "ARM-001" else ("motor_overheat" if m_id == "ARM-002" else "joint_play")
                else:
                    failure_within_24h = 0
                    failure_type = "none"
                
                # Once reached end of countdown, simulate maintenance / reset
                if remaining_steps <= 0:
                    degrading = False
                    degradation_step = 0
                    failure_countdown = -1
                    hours_maint = 0.0 # reset after repair
            
            records.append({
                "timestamp": t.isoformat(),
                "machine_id": m_id,
                "vibration_rms": max(0.2, vibration_rms),
                "temperature_motor": max(20.0, temperature_motor),
                "current_phase_avg": max(1.0, current_phase_avg),
                "pressure_level": max(0.5, pressure_level),
                "rpm": max(0.0, rpm),
                "ambient_temp": ambient_temp,
                "hours_since_maintenance": hours_maint,
                "failure_within_24h": failure_within_24h,
                "failure_type": failure_type,
            })
            
    df = pd.DataFrame(records)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values(["machine_id", "timestamp"]).reset_index(drop=True)
    return df


class PyTorchLSTM(nn.Module):
    """
    PyTorch implementation of the 2-Layer LSTM with Dropout & Dense head.
    Architecture matches:
    Input(20, 17) -> LSTM(64) -> Dropout(0.2) -> LSTM(32) -> Dropout(0.2) -> Dense(16, relu) -> Dense(1, sigmoid)
    """
    def __init__(self, input_dim=17, hidden1=64, hidden2=32, dense1=16):
        super().__init__()
        self.lstm1 = nn.LSTM(input_dim, hidden1, batch_first=True)
        self.drop1 = nn.Dropout(0.2)
        self.lstm2 = nn.LSTM(hidden1, hidden2, batch_first=True)
        self.drop2 = nn.Dropout(0.2)
        self.fc1 = nn.Linear(hidden2, dense1)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(dense1, 1)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        out1, _ = self.lstm1(x)
        out1 = self.drop1(out1)
        out2, _ = self.lstm2(out1)
        # Take last time step
        last_step = self.drop2(out2[:, -1, :])
        out = self.fc1(last_step)
        out = self.relu(out)
        out = self.fc2(out)
        return self.sigmoid(out)


def create_sequences(X_data, y_data, sequence_length):
    X_seq = []
    y_seq = []
    for i in range(sequence_length, len(X_data)):
        X_seq.append(X_data[i - sequence_length:i])
        y_seq.append(y_data.iloc[i])
    return np.array(X_seq), np.array(y_seq)


def main():
    print("=" * 60)
    print("PREDICTX — ROBOTIC ARM MULTI-SIGNAL MODEL TRAINING")
    print("=" * 60)
    
    # 1. Generate / Load Telemetry Data
    print("\n[1/6] Generating synthetic robotic arm dataset...")
    df = generate_synthetic_robotic_arm_data(n_samples=4800)
    print(f"Dataset shape: {df.shape}")
    print(f"Machines: {df['machine_id'].unique()}")
    print("Failure distribution:\n", df["failure_within_24h"].value_counts(normalize=True).mul(100).round(2))
    
    # 2. Impute and Feature Engineering
    print("\n[2/6] Running Feature Engineering (rolling means + diffs)...")
    imputer = SimpleImputer(strategy="median")
    df[BASE_FEATURES] = imputer.fit_transform(df[BASE_FEATURES])
    
    engineered = df[["machine_id"] + BASE_FEATURES].copy()
    for col in ["vibration_rms", "temperature_motor", "current_phase_avg", "pressure_level", "rpm"]:
        engineered[f"{col}_rolling_mean"] = (
            engineered.groupby("machine_id")[col]
            .transform(lambda x: x.rolling(window=5, min_periods=1).mean())
        )
        engineered[f"{col}_diff"] = (
            engineered.groupby("machine_id")[col]
            .diff()
            .fillna(0)
        )
        
    FEATURE_COLUMNS = [col for col in engineered.columns if col != "machine_id"]
    print(f"Engineered {len(FEATURE_COLUMNS)} feature columns:")
    for f in FEATURE_COLUMNS:
        print(f"  - {f}")
        
    X = engineered[FEATURE_COLUMNS].copy()
    y = df["failure_within_24h"].astype(int).copy()
    
    # 3. Train / Validation / Test Split (70 / 15 / 15)
    n = len(X)
    train_end = int(n * 0.70)
    val_end = int(n * 0.85)
    
    X_train, y_train = X.iloc[:train_end].copy(), y.iloc[:train_end].copy()
    X_val, y_val = X.iloc[train_end:val_end].copy(), y.iloc[train_end:val_end].copy()
    X_test, y_test = X.iloc[val_end:].copy(), y.iloc[val_end:].copy()
    
    # 4. Signal 1: XGBoost Classifier
    print("\n[3/6] Training Signal 1: XGBoost Classifier...")
    neg_count = (y_train == 0).sum()
    pos_count = max(1, (y_train == 1).sum())
    scale_pos_weight = np.sqrt(neg_count / pos_count)
    
    xgb_model = XGBClassifier(
        n_estimators=300,
        max_depth=4,
        learning_rate=0.03,
        subsample=0.85,
        colsample_bytree=0.80,
        min_child_weight=6,
        gamma=0.2,
        reg_alpha=0.2,
        reg_lambda=2.0,
        objective="binary:logistic",
        eval_metric="auc",
        scale_pos_weight=scale_pos_weight,
        random_state=42,
        n_jobs=-1
    )
    xgb_model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)
    
    # Find best F1 threshold
    xgb_val_prob = xgb_model.predict_proba(X_val)[:, 1]
    thresholds = np.arange(0.10, 0.91, 0.01)
    best_f1, best_threshold = -1.0, 0.40
    for t in thresholds:
        preds = (xgb_val_prob >= t).astype(int)
        score = f1_score(y_val, preds, zero_division=0)
        if score > best_f1:
            best_f1 = score
            best_threshold = float(t)
    print(f"XGBoost optimized Best F1: {best_f1:.4f} at Threshold: {best_threshold:.2f}")
    
    # 5. Signal 2: Isolation Forest Anomaly Detection
    print("\n[4/6] Training Signal 2: Isolation Forest (Normal Baseline)...")
    iso_scaler = StandardScaler()
    X_train_scaled = iso_scaler.fit_transform(X_train)
    X_val_scaled = iso_scaler.transform(X_val)
    X_test_scaled = iso_scaler.transform(X_test)
    
    # Fit strictly on normal (label 0) samples
    normal_mask = (y_train.values == 0)
    X_train_normal = X_train_scaled[normal_mask]
    
    iso_model = IsolationForest(
        n_estimators=250,
        contamination=0.08,
        random_state=42,
        n_jobs=-1
    )
    iso_model.fit(X_train_normal)
    
    train_raw = -iso_model.decision_function(X_train_scaled)
    score_min = float(train_raw.min())
    score_max = float(train_raw.max())
    print(f"Isolation Forest score range: [{score_min:.4f}, {score_max:.4f}]")
    
    # Signal 3: PyTorch LSTM Model
    print("\n[5/6] Training Signal 3: 2-Layer Temporal LSTM...")
    lstm_scaler = StandardScaler()
    X_train_lstm = lstm_scaler.fit_transform(X_train)
    X_val_lstm = lstm_scaler.transform(X_val)
    X_test_lstm = lstm_scaler.transform(X_test)
    
    X_train_seq, y_train_seq = create_sequences(X_train_lstm, y_train.reset_index(drop=True), SEQUENCE_LENGTH)
    X_val_seq, y_val_seq = create_sequences(X_val_lstm, y_val.reset_index(drop=True), SEQUENCE_LENGTH)
    X_test_seq, y_test_seq = create_sequences(X_test_lstm, y_test.reset_index(drop=True), SEQUENCE_LENGTH)
    
    # Fast tensor conversion using from_numpy
    t_train_x = torch.from_numpy(np.ascontiguousarray(X_train_seq, dtype=np.float32))
    t_train_y = torch.from_numpy(np.ascontiguousarray(y_train_seq, dtype=np.float32)).unsqueeze(1)
    
    t_val_x = torch.from_numpy(np.ascontiguousarray(X_val_seq, dtype=np.float32))
    t_test_x = torch.from_numpy(np.ascontiguousarray(X_test_seq, dtype=np.float32))
    
    train_dataset = TensorDataset(t_train_x, t_train_y)
    train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)
    
    lstm_model = PyTorchLSTM(input_dim=len(FEATURE_COLUMNS))
    optimizer = torch.optim.Adam(lstm_model.parameters(), lr=0.005, weight_decay=1e-5)
    loss_fn = nn.BCELoss()
    
    epochs = 10
    lstm_model.train()
    for ep in range(epochs):
        ep_loss = 0.0
        for batch_x, batch_y in train_loader:
            optimizer.zero_grad()
            preds = lstm_model(batch_x)
            loss = loss_fn(preds, batch_y)
            loss.backward()
            optimizer.step()
            ep_loss += loss.item()
        print(f"  Epoch {ep+1}/{epochs} - Loss: {ep_loss / len(train_loader):.4f}")
            
    lstm_model.eval()
    with torch.no_grad():
        lstm_val_prob = lstm_model(t_val_x).numpy().ravel()
        
    # Best threshold for LSTM
    best_lstm_f1, best_lstm_threshold = -1.0, 0.40
    for t in thresholds:
        preds = (lstm_val_prob >= t).astype(int)
        score = f1_score(y_val_seq, preds, zero_division=0)
        if score > best_lstm_f1:
            best_lstm_f1 = score
            best_lstm_threshold = float(t)
    print(f"LSTM optimized Best F1: {best_lstm_f1:.4f} at Threshold: {best_lstm_threshold:.2f}")
    
    # 7. Evaluate on Test Set & Run Multi-Signal Fusion
    print("\n[6/6] Evaluating Multi-Signal Fusion on Test Set...")
    xgb_test_prob = xgb_model.predict_proba(X_test)[:, 1]
    
    test_raw = -iso_model.decision_function(X_test_scaled)
    denom = max(1e-5, score_max - score_min)
    anomaly_test_risk = np.clip(((test_raw - score_min) / denom) * 100.0, 0.0, 100.0)
    
    with torch.no_grad():
        lstm_test_prob = lstm_model(t_test_x).numpy().ravel()
        
    lstm_aligned = np.full(len(X_test), np.nan)
    lstm_aligned[SEQUENCE_LENGTH:] = lstm_test_prob
    
    # Multi-Signal Fusion loop
    ANOMALY_THRESHOLD = 70.0
    system_predictions = []
    health_scores = []
    
    for i in range(len(X_test)):
        xgb_p = xgb_test_prob[i]
        xgb_risk = xgb_p * 100.0
        anom_r = anomaly_test_risk[i]
        lstm_p = lstm_aligned[i]
        
        # Health score: 100 - (0.60 * xgb_risk) - (0.40 * anomaly_risk)
        h_score = np.clip(100.0 - (0.60 * xgb_risk) - (0.40 * anom_r), 0.0, 100.0)
        health_scores.append(h_score)
        
        # Temporal warning
        temporal_warning = False
        if not np.isnan(lstm_p):
            temporal_warning = (lstm_p >= best_lstm_threshold)
            
        # Decision gating
        if xgb_p >= 0.45:
            pred = 1
        elif (xgb_p >= best_threshold) and (anom_r >= 50.0 or temporal_warning):
            pred = 1
        else:
            pred = 0
        system_predictions.append(pred)
        
    test_acc = accuracy_score(y_test, system_predictions)
    test_f1 = f1_score(y_test, system_predictions, zero_division=0)
    test_rec = recall_score(y_test, system_predictions, zero_division=0)
    test_prec = precision_score(y_test, system_predictions, zero_division=0)
    print(f"Final Multi-Signal Performance -> Acc: {test_acc:.4f}, Prec: {test_prec:.4f}, Recall: {test_rec:.4f}, F1: {test_f1:.4f}")
    
    # 8. Export All Artifacts
    export_dirs = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "../models")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend/app/ml_artifacts")),
    ]
    
    metadata = {
        "model_name": "robotic_arm_multisignal",
        "created_at": datetime.now().isoformat(),
        "base_features": BASE_FEATURES,
        "feature_columns": FEATURE_COLUMNS,
        "sequence_length": SEQUENCE_LENGTH,
        "xgb_threshold": best_threshold,
        "lstm_threshold": best_lstm_threshold,
        "anomaly_threshold": ANOMALY_THRESHOLD,
        "score_min": score_min,
        "score_max": score_max,
        "test_metrics": {
            "accuracy": round(test_acc, 4),
            "precision": round(test_prec, 4),
            "recall": round(test_rec, 4),
            "f1": round(test_f1, 4),
        }
    }
    
    for out_dir in export_dirs:
        os.makedirs(out_dir, exist_ok=True)
        joblib.dump(imputer, os.path.join(out_dir, "imputer.joblib"))
        joblib.dump(iso_scaler, os.path.join(out_dir, "iso_scaler.joblib"))
        joblib.dump(iso_model, os.path.join(out_dir, "iso_model.joblib"))
        joblib.dump(xgb_model, os.path.join(out_dir, "xgb_model.joblib"))
        joblib.dump(lstm_scaler, os.path.join(out_dir, "lstm_scaler.joblib"))
        torch.save(lstm_model.state_dict(), os.path.join(out_dir, "lstm_model.pt"))
        with open(os.path.join(out_dir, "model_metadata.json"), "w") as f:
            json.dump(metadata, f, indent=2)
            
    print(f"\n✅ All model artifacts successfully exported to:")
    for out_dir in export_dirs:
        print(f"   -> {out_dir}")


if __name__ == "__main__":
    main()
