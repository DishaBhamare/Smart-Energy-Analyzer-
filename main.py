import os
import shutil
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from app.preprocess import (
    load_raw_data,
    aggregate_hourly,
    calculate_cost,
    generate_insights,
)
from app.anomaly import detect_anomalies
from app.forecasting import forecast_energy
from app.planner import smart_planner

app = FastAPI(title="Smart Energy Consumption Analyzer 95+")

# ---------------------- CORS ----------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------- Uploads ----------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.state.hourly = None

# ---------------------- Upload Endpoint ----------------------
@app.post("/upload")
async def upload_energy_data(file: UploadFile = File(...)):
    path = os.path.join(UPLOAD_DIR, file.filename)

    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    raw_df = load_raw_data(path)
    hourly = aggregate_hourly(raw_df)
    hourly = calculate_cost(hourly)
    hourly = detect_anomalies(hourly)

    app.state.hourly = hourly
    insights = generate_insights(hourly)

    anomaly_summary = hourly["anomaly"].sum()

    return {
        "status": "success",
        "rows_processed": len(hourly),
        "anomalies_detected": int(anomaly_summary),
        "summary": insights["summary"],
        "problems": insights["problems"],
        "recommendations": insights["recommendations"],
        "sample": hourly.tail(5).reset_index().to_dict("records"),
    }

# ---------------------- Forecast Endpoint ----------------------
@app.get("/forecast")
def forecast():
    if app.state.hourly is None:
        return {"error": "Upload data first"}

    forecast_data = forecast_energy(app.state.hourly, hours_ahead=24)
    return forecast_data

# ---------------------- Planner Endpoint ----------------------
@app.get("/planner")
def planner(clusters: int = 3):
    if app.state.hourly is None:
        return {"error": "Upload data first"}

    try:
        # Clean the DataFrame first
        hourly_clean = app.state.hourly.dropna()

        # Call smart_planner
        plan_df = smart_planner(hourly_clean, clusters)

        # Convert DataFrame to JSON-safe dict
        plan_json = plan_df.reset_index().to_dict("records")

        return {
            "clusters": clusters,
            "recommended_usage": plan_json
        }

    except Exception as e:
        # Catch any error and return it as JSON
        return {"error": str(e)}
