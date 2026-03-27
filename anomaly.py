# app/anomaly.py
import pandas as pd
from sklearn.ensemble import IsolationForest

# =========================================================
# ANOMALY DETECTION
# =========================================================
def detect_anomalies(hourly: pd.DataFrame, contamination: float = 0.05) -> pd.DataFrame:
    """
    Detect anomalies in energy consumption (total_kwh) using Isolation Forest.
    Marks True for anomalies.
    """
    df = hourly.copy()
    
    if "total_kwh" not in df.columns:
        raise ValueError("Data must contain 'total_kwh' column")

    model = IsolationForest(contamination=contamination, random_state=42)
    df["anomaly"] = model.fit_predict(df[["total_kwh"]])
    df["anomaly"] = df["anomaly"] == -1  # True for anomaly, False for normal
    
    return df
