import React, { useMemo } from "react";
import "./Analysis.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Analysis = ({ data }) => {
  /* ===============================
     PIE CHART (DATASET DRIVEN)
  =============================== */
  const pieData = useMemo(() => {
    if (!data || !data.sample) {
      return [{ name: "No Data", value: 1 }];
    }

    const totals = data.sample.reduce(
      (acc, row) => {
        acc.kitchen += row.kitchen_kwh || 0;
        acc.laundry += row.laundry_kwh || 0;
        acc.hvac += row.HVAC_lights_kwh || 0;
        acc.other += row.other_kwh || 0;
        return acc;
      },
      { kitchen: 0, laundry: 0, hvac: 0, other: 0 }
    );

    return [
      { name: "Kitchen Appliances", value: +totals.kitchen.toFixed(2) },
      { name: "Laundry", value: +totals.laundry.toFixed(2) },
      { name: "HVAC & Lighting", value: +totals.hvac.toFixed(2) },
      { name: "Other", value: +totals.other.toFixed(2) },
    ];
  }, [data]);

  /* ===============================
     ANOMALY DETAILS (WHERE & WHEN)
  =============================== */
  const anomalyDetails = data
    ? data.sample.filter((row) => row.anomaly === true)
    : [];

  /* ===============================
     RECOMMENDATIONS
  =============================== */
  const recommendations = data?.recommendations || [];

  /* ===============================
     STATS
  =============================== */
  const efficiencyScore = data
    ? Math.max(100 - anomalyDetails.length * 10, 60)
    : 0;

  const vampireLoad = data
    ? data.sample
        .filter(
          (row) =>
            row.datetime.includes("T23") ||
            row.datetime.includes("T00") ||
            row.datetime.includes("T01")
        )
        .reduce((sum, row) => sum + row.total_kwh, 0)
        .toFixed(2)
    : "0.00";

  return (
    <div className="widget-card">
      {/* ================= Header ================= */}
      <div className="widget-header">
        <div className="brand-title">🏠 Smart Energy Analyzer</div>
        <div className="header-icons">📊 💬 ⚙️</div>
      </div>

      {/* ================= Body ================= */}
      <div className="widget-body" style={{ padding: "20px" }}>
        <h3>Energy Consumption Analysis</h3>
        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "15px" }}>
          {data
            ? "AI-driven insights based on uploaded energy dataset"
            : "Upload a dataset to begin analysis"}
        </p>

        {/* ================= Pie Chart ================= */}
        <div style={{ height: "260px", width: "100%", marginBottom: "25px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      data ? COLORS[index % COLORS.length] : "#e2e8f0"
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* ================= Alerts ================= */}
        <div
          className="alert-section"
          style={{ marginBottom: "20px", opacity: data ? 1 : 0.5 }}
        >
          <h4
            style={{
              color: "#856404",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            ⚠️ Anomaly Alerts
          </h4>

          {!data && (
            <div className="alert-item">
              Upload data to detect abnormal energy usage.
            </div>
          )}

          {data && anomalyDetails.length === 0 && (
            <div className="alert-item">
              ✅ No abnormal energy consumption detected.
            </div>
          )}

          {data &&
            anomalyDetails.map((row, index) => (
              <div key={index} className="alert-item">
                🚨 <strong>Anomaly detected</strong> at{" "}
                <strong>
                  {new Date(row.datetime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </strong>{" "}
                — Total usage: <strong>{row.total_kwh} kWh</strong>
                {row.HVAC_lights_kwh >
                  row.kitchen_kwh + row.laundry_kwh &&
                  " (HVAC-heavy usage)"}
              </div>
            ))}
        </div>

        {/* ================= Recommendations ================= */}
        <div className="rec-section" style={{ opacity: data ? 1 : 0.5 }}>
          <h4
            style={{
              color: "#22543d",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            🌱 Energy Recommendations
          </h4>

          {data ? (
            recommendations.map((rec, index) => (
              <div key={index} className="rec-item">
                💡 {rec}
              </div>
            ))
          ) : (
            <div className="rec-item">
              Upload data to receive optimization tips.
            </div>
          )}
        </div>

        {/* ================= Stats ================= */}
        <div
          className="stats-grid"
          style={{
            marginTop: "25px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px",
          }}
        >
          <div
            className="stat-box"
            style={{
              background: "#f8fafc",
              textAlign: "center",
              padding: "15px",
              borderRadius: "12px",
            }}
          >
            <p
              className="stat-label"
              style={{ color: "#64748b", fontSize: "12px" }}
            >
              Efficiency Score
            </p>
            <p
              className="stat-value"
              style={{
                color: data ? "#27ae60" : "#cbd5e1",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            >
              {data ? `${efficiencyScore}/100` : "0/100"}
            </p>
          </div>

          <div
            className="stat-box"
            style={{
              background: "#f8fafc",
              textAlign: "center",
              padding: "15px",
              borderRadius: "12px",
            }}
          >
            <p
              className="stat-label"
              style={{ color: "#64748b", fontSize: "12px" }}
            >
              Vampire Load
            </p>
            <p
              className="stat-value"
              style={{
                color: data ? "#f39c12" : "#cbd5e1",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            >
              {data ? vampireLoad : "0.00"}{" "}
              <small style={{ fontSize: "12px" }}>kWh</small>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
