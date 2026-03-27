import React from 'react';
import './Forecast.css';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Forecast({ data }) {
  // 1. DATA UNWRAPPER: Converts Pandas 'dict' format to a simple List
  // Your backend sends: { hour_index: {0: 168, 1: 169...}, predicted_kwh: {0: 1.5, 1: 1.6...} }
  const getCleanData = () => {
    if (!data) return [];
    
    // If it's already a clean array, use it
    if (Array.isArray(data)) return data;

    // If it's a Pandas DataFrame dict (this is likely why it's flat right now)
    if (data.predicted_kwh && typeof data.predicted_kwh === 'object') {
      return Object.keys(data.predicted_kwh).map(key => ({
        hour_index: data.hour_index ? data.hour_index[key] : key,
        predicted_kwh: data.predicted_kwh[key]
      }));
    }

    return [];
  };

  const cleanData = getCleanData();

  // 2. MAPPING FOR THE GRAPH
  const chartData = cleanData.length > 0 
    ? cleanData.map(item => ({
        day: `H${item.hour_index}`, // Hour label for X-Axis
        cost: item.predicted_kwh    // Value for the Wave
      }))
    : [
        { day: 'Mon', cost: 0 }, { day: 'Tue', cost: 0 }, { day: 'Wed', cost: 0 },
        { day: 'Thu', cost: 0 }, { day: 'Fri', cost: 0 }, { day: 'Sat', cost: 0 }, { day: 'Sun', cost: 0 }
      ];

  // 3. TOTAL CALCULATION (This should show your 206.9 value)
  const totalPredicted = cleanData.length > 0 
    ? cleanData.reduce((acc, curr) => acc + (curr.predicted_kwh || 0), 0).toFixed(1)
    : "0";

  return (
    <div className="widget-card">
      <div className="widget-header">
        <div className="brand-title">🏠 Smart Energy Analyzer</div>
        <div className="header-icons">📊 💬 ⚙️</div>
      </div>

      <div className="widget-body" style={{ padding: '20px' }}>
        <h3>Future Energy Prediction</h3>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '15px' }}>Next 24 Hours Forecast</p>

        <div style={{ height: '250px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3182ce" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3182ce" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                interval={Math.floor(chartData.length / 6)} // Keeps X-axis clean
              />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => [`${value.toFixed(2)} kWh`, "Usage"]} />
              <Area 
                type="monotone" 
                dataKey="cost" 
                stroke="#3182ce" 
                fillOpacity={1} 
                fill="url(#colorCost)" 
                strokeWidth={3}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="cost-estimate-bar">
          Estimated Usage: {totalPredicted} kWh (Next 24 Hours)
        </div>

        <div className="forecast-tips-container">
          <div className="forecast-tip">⚠️ Shift heavy loads to off-peak hours</div>
          <div className="forecast-tip">💡 Optimize AC usage in afternoons</div>
        </div>
      </div>
    </div>
  );
}