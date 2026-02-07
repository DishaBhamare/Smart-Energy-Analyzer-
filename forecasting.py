import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error

# -------------------- CONSTANTS --------------------
CO2_FACTOR = 0.82  # kg CO2 per kWh
UNIT_COST = 10     # ₹ per kWh

# ==================================================
# 1️⃣ HOURLY TOTAL ENERGY FORECAST
# ==================================================
def forecast_energy(hourly: pd.DataFrame, hours_ahead: int = 24):
    if hourly is None or len(hourly) < 2:
        return []

    df = hourly.copy().reset_index(drop=True)
    df["hour_index"] = np.arange(len(df))

    X = df[["hour_index"]]
    y = df["total_kwh"]

    model = LinearRegression()
    model.fit(X, y)

    future_index = np.arange(len(df), len(df) + hours_ahead).reshape(-1, 1)
    predictions = model.predict(future_index)

    return pd.DataFrame({
        "hour_index": future_index.flatten(),
        "predicted_kwh": predictions
    }).to_dict(orient="records")


# ==================================================
# 2️⃣ APPLIANCE-WISE REPORT
# app/forecasting.py

def generate_appliance_report(df: pd.DataFrame):
    report = []

    appliance_columns = [col for col in df.columns if "_kwh" in col]

    for col in appliance_columns:
        appliance_name = col.replace("_kwh", "").replace("_", " ").title()
        appliance_data = df[col]

        next_day_kwh = appliance_data.sum()

        usage_cluster = (
            "High Usage" if next_day_kwh > 40 else
            "Medium Usage" if next_day_kwh > 20 else
            "Low Usage"
        )

        eco_score = max(0, round(100 - (next_day_kwh * 2), 1))
        recommendation = (
            "Reduce usage" if usage_cluster == "High Usage" else
            "Optimize hours" if usage_cluster == "Medium Usage" else
            "Keep usage"
        )

        cost = round(next_day_kwh * 10, 2)  # UNIT_COST = 10
        mae = round(mean_absolute_error(appliance_data, np.full_like(appliance_data, appliance_data.mean())), 2)
        rmse = round(np.sqrt(mean_squared_error(appliance_data, np.full_like(appliance_data, appliance_data.mean()))), 2)

        report.append({
            "appliance": appliance_name,
            "predicted_next_day_kwh": round(next_day_kwh, 2),
            "predicted_co2_kg": round(next_day_kwh * 0.82, 2),
            "MAE": mae,
            "RMSE": rmse,
            "usage_cluster": usage_cluster,
            "eco_score": eco_score,
            "cost": cost,
            "recommendation": recommendation,
            "budget_plan": "Reduce usage to meet budget"
        })

    return report
