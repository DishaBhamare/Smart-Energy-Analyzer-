import React from 'react';
import './Forecast.css';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function Forecast({ data }) {
  console.log('FORECAST COMPONENT RECEIVED:', data);

  /* =========================================
     1️⃣ NORMALIZE DATA (READABLE DATETIME)
     ========================================= */

  const normalizeForecast = () => {
    if (!data) return [];

    // ✅ Backend sends Array(24) with datetime/hour info
    if (Array.isArray(data)) {
      return data.map((item, index) => {
        const rawTime = item.datetime || item.timestamp || item.hour || item.hour_index || index;
        const readableTime = item.datetime
          ? new Date(item.datetime).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              hour: 'numeric',
              hour12: true
            })
          : `Hour ${index + 1}`;

        return {
          timeLabel: readableTime,
          predicted_kwh: Number(item.predicted_kwh ?? item.kwh ?? item.usage ?? 0),
          anomaly: item.anomaly ?? false
        };
      });
    }

    // ✅ Pandas dict fallback
    if (data.predicted_kwh && typeof data.predicted_kwh === 'object') {
      return Object.keys(data.predicted_kwh).map((key, index) => ({
        timeLabel: `Hour ${index + 1}`,
        predicted_kwh: Number(data.predicted_kwh[key]),
        anomaly: data.anomaly ? data.anomaly[key] : false
      }));
    }

    return [];
  };

  const forecastData = normalizeForecast();

  /* =========================================
     2️⃣ CHART DATA
     ========================================= */

  const chartData = forecastData.map(item => ({
    time: item.timeLabel,
    usage: item.predicted_kwh
  }));

  /* =========================================
     3️⃣ METRICS
     ========================================= */

  const totalUsage = forecastData
    .reduce((sum, item) => sum + item.predicted_kwh, 0)
    .toFixed(1);

  const totalHours = forecastData.length;
  const anomalyCount = forecastData.filter(d => d.anomaly).length;

  /* =========================================
     4️⃣ UI
     ========================================= */

  return (
    <div className="widget-card">
      <div className="widget-header">
        <div className="brand-title">🏠 Smart Energy Analyzer</div>
        <div className="header-icons">📊 💬 ⚙️</div>
      </div>

      <div className="widget-body" style={{ padding: '20px' }}>
        <h3>Future Energy Prediction</h3>
        <p className="subtext">
          Forecast Duration: <b>{totalHours} hours</b>
        </p>

        {forecastData.length === 0 ? (
          <p className="no-data">No forecast data available</p>
        ) : (
          <>
            <div style={{ height: '280px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="energyFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="time"
                    interval={Math.ceil(chartData.length / 6)}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`${value.toFixed(2)} kWh`, 'Predicted Usage']}
                  />

                  <Area
                    type="monotone"
                    dataKey="usage"
                    stroke="#2563eb"
                    fill="url(#energyFill)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="cost-estimate-bar">
              Estimated Usage: <b>{totalUsage} kWh</b>
            </div>

            {anomalyCount > 0 && (
              <div className="anomaly-warning">
                ⚠️ {anomalyCount} anomaly spike(s) detected in forecast
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
