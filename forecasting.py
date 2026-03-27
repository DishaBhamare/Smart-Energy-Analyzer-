# app/forecasting.py
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression

# =========================================================
# ENERGY FORECASTING
# =========================================================
def forecast_energy(hourly: pd.DataFrame, hours_ahead: int = 24) -> pd.DataFrame:
    """
    Predict next N hours of total energy consumption using linear regression.
    """
    df = hourly.copy().reset_index()
    df["hour_index"] = np.arange(len(df))

    X = df[["hour_index"]]
    y = df["total_kwh"]

    model = LinearRegression()
    model.fit(X, y)

    future_index = np.arange(len(df), len(df) + hours_ahead).reshape(-1, 1)
    predictions = model.predict(future_index)

    forecast_df = pd.DataFrame({
        "hour_index": future_index.flatten(),
        "predicted_kwh": predictions
    })

    # return forecast_df
    return forecast_df.to_dict(orient="records")
