import os
import pandas as pd

# =========================================================
# BASE DIRECTORY
# =========================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# =========================================================
# LOAD RAW DATA (AUTO FORMAT DETECTION)
# =========================================================
def load_raw_data(file_path):
    """
    Supports:
    1. UCI household_power_consumption.txt
    2. Clean CSV with datetime + appliance kWh columns
    """

    # ---------- CASE 1: UCI DATASET (.txt) ----------
    if file_path.endswith(".txt"):
        df = pd.read_csv(
            file_path,
            sep=";",
            low_memory=False,
            na_values=["?"]
        )

        df["datetime"] = pd.to_datetime(
            df["Date"] + " " + df["Time"],
            dayfirst=True,
            errors="coerce"
        )

        df.drop(["Date", "Time"], axis=1, inplace=True)

        numeric_cols = [
            "Global_active_power",
            "Sub_metering_1",
            "Sub_metering_2",
            "Sub_metering_3"
        ]

        for col in numeric_cols:
            df[col] = pd.to_numeric(df[col], errors="coerce")

        df.dropna(inplace=True)
        return df

    # ---------- CASE 2: CLEAN CSV ----------
    else:
        df = pd.read_csv(file_path)
        df["datetime"] = pd.to_datetime(df["datetime"], errors="coerce")
        df.dropna(inplace=True)
        return df


# =========================================================
# AGGREGATE HOURLY USAGE
# =========================================================
def aggregate_hourly(df):
    if "datetime" in df.columns:
        df = df.set_index("datetime")

    df.index = pd.to_datetime(df.index)
    df = df.sort_index()

    # ---------- UCI DATA ----------
    if "Global_active_power" in df.columns:
        hourly = df.resample("h").sum()[[
            "Global_active_power",
            "Sub_metering_1",
            "Sub_metering_2",
            "Sub_metering_3"
        ]]

        hourly.rename(columns={
            "Global_active_power": "total_kwh",
            "Sub_metering_1": "kitchen_kwh",
            "Sub_metering_2": "laundry_kwh",
            "Sub_metering_3": "HVAC_lights_kwh"
        }, inplace=True)

        hourly["other_kwh"] = (
            hourly["total_kwh"]
            - hourly[["kitchen_kwh", "laundry_kwh", "HVAC_lights_kwh"]].sum(axis=1)
        ).clip(lower=0)

        return hourly

    # ---------- CLEAN CSV ----------
    else:
        hourly = df.resample("h").sum()

        hourly["total_kwh"] = (
            hourly["kitchen_kwh"]
            + hourly["laundry_kwh"]
            + hourly["HVAC_lights_kwh"]
            + hourly["other_kwh"]
        )

        return hourly


# =========================================================
# COST CALCULATION
# =========================================================
def calculate_cost(hourly, cost_per_kwh=8.0):
    for col in ["kitchen_kwh", "laundry_kwh", "HVAC_lights_kwh", "other_kwh"]:
        hourly[f"{col}_cost"] = hourly[col] * cost_per_kwh

    hourly["total_cost"] = hourly[
        [
            "kitchen_kwh_cost",
            "laundry_kwh_cost",
            "HVAC_lights_kwh_cost",
            "other_kwh_cost"
        ]
    ].sum(axis=1)

    return hourly


# =========================================================
# DAILY USAGE HOURS
# =========================================================
def daily_usage_hours(hourly):
    temp = hourly.copy()

    for col in ["kitchen_kwh", "laundry_kwh", "HVAC_lights_kwh", "other_kwh"]:
        temp[col.replace("_kwh", "_hours")] = (temp[col] > 0).astype(int)

    daily = temp.resample("h").sum()[[
        "kitchen_hours",
        "laundry_hours",
        "HVAC_lights_hours",
        "other_hours"
    ]]

    return daily


# =========================================================
# 🔍 INSIGHT LOGIC (REAL-WORLD INTELLIGENCE)
# =========================================================
def detect_night_wastage(hourly):
    night = hourly.between_time("00:00", "05:00")

    night_kwh = night["total_kwh"].sum()
    total_kwh = hourly["total_kwh"].sum()

    percent = (night_kwh / total_kwh) * 100 if total_kwh > 0 else 0

    insight = None
    if percent > 20:
        insight = f"High night-time usage detected ({percent:.1f}%). Possible standby power waste."

    return {
        "night_kwh": round(night_kwh, 2),
        "night_percent": round(percent, 1),
        "insight": insight
    }


def appliance_cost_insights(hourly):
    cost_cols = [
        "kitchen_kwh_cost",
        "laundry_kwh_cost",
        "HVAC_lights_kwh_cost",
        "other_kwh_cost"
    ]

    total_costs = hourly[cost_cols].sum()
    highest = total_costs.idxmax()

    readable = highest.replace("_kwh_cost", "").replace("_", " ").title()

    return {
        "highest_cost_appliance": readable,
        "monthly_cost": round(total_costs[highest], 2),
        "message": f"{readable} contributes the highest electricity cost."
    }


def peak_hour_analysis(hourly):
    hourly_avg = hourly.groupby(hourly.index.hour)["total_kwh"].mean()

    peak_hour = hourly_avg.idxmax()
    peak_value = hourly_avg.max()

    return {
        "peak_hour": f"{peak_hour}:00",
        "avg_kwh": round(peak_value, 2),
        "message": f"Highest average usage occurs around {peak_hour}:00 hrs."
    }


def generate_recommendations(night, appliance, peak):
    recs = []

    if night["night_percent"] > 20:
        recs.append("Reduce standby power by switching off unused devices at night.")

    if "Hvac" in appliance["highest_cost_appliance"]:
        recs.append("Maintain HVAC temperature between 24–26°C for efficiency.")

    recs.append(f"Shift heavy appliance usage away from peak hour ({peak['peak_hour']}).")

    return recs


# def generate_insights(hourly):
#     night = detect_night_wastage(hourly)
#     appliance = appliance_cost_insights(hourly)
#     peak = peak_hour_analysis(hourly)

#     return {
#         "summary": {
#             "total_kwh": round(hourly["total_kwh"].sum(), 2),
#             "estimated_bill": round(hourly["total_cost"].sum(), 2)
#         },
#         "problems": list(filter(None, [
#             night["insight"],
#             appliance["message"],
#             peak["message"]
#         ])),
#         "recommendations": generate_recommendations(night, appliance, peak)
#     }
def generate_insights(hourly):
    night = detect_night_wastage(hourly)
    appliance = appliance_cost_insights(hourly)
    peak = peak_hour_analysis(hourly)

    # --- ADD THIS PART ---
    # Convert the hourly index (datetime) to a string so JS can read it
    chart_df = hourly.reset_index()
    chart_df['datetime'] = chart_df['datetime'].dt.strftime('%Y-%m-%d %H:%M')
    sample_data = chart_df.to_dict(orient="records")
    # ----------------------

    return {
        "summary": {
            "total_kwh": round(hourly["total_kwh"].sum(), 2),
            "estimated_bill": round(hourly["total_cost"].sum(), 2)
        },
        "problems": list(filter(None, [
            night["insight"],
            appliance["message"],
            peak["message"]
        ])),
        "recommendations": generate_recommendations(night, appliance, peak),
        "sample": sample_data  # This sends the 37 rows to your graph!
    }

# =========================================================
# SCRIPT MODE (LOCAL TESTING)
# =========================================================
if __name__ == "__main__":
    DATA_FILE = os.path.join(BASE_DIR, "energy_data.csv")

    print("📥 Loading data...")
    df = load_raw_data(DATA_FILE)

    print("⏱ Aggregating hourly usage...")
    hourly = aggregate_hourly(df)

    print("💰 Calculating cost...")
    hourly = calculate_cost(hourly)

    print("🧠 Generating insights...")
    insights = generate_insights(hourly)

    print("\n📊 INSIGHTS:")
    for key, value in insights.items():
        print(f"{key.upper()}: {value}")