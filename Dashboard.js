import React from 'react';
import './Dashboard.css';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';

const Dashboard = ({ data }) => {

  // 1. Handle Empty State
  // Check both 'data.sample' and 'data.chart' just in case the backend key changed
  const sampleData = data?.sample || data?.chart || [];

  if (!data || sampleData.length === 0) {
    return (
      <div className="widget-card">
        <div className="widget-header">
          <div className="brand-title">🏠 Smart Energy Analyzer</div>
        </div>
        <div className="widget-body" style={{ textAlign: 'center', padding: '60px' }}>
          <h3 style={{ color: '#64748b' }}>No Data Available</h3>
          <p style={{ color: '#94a3b8' }}>Dataset received but no hourly rows found.</p>
        </div>
      </div>
    );
  }

  // 2. Map the data safely
  const chartData = sampleData.map((row, index) => {
    // Ensure we are getting a number, even if backend sends a string
    const hourlySum = parseFloat(row.total_kwh || 0);
    
    // Logic: Extract time (HH:mm) from the datetime string
    let timeLabel = `H${index + 1}`;
    if (row.datetime && typeof row.datetime === 'string' && row.datetime.includes(' ')) {
        timeLabel = row.datetime.split(' ')[1];
    }

    return {
      name: timeLabel,
      total_usage: hourlySum,
      fullDate: row.datetime
    };
  });

  // 3. Extract Summary Stats safely
  const totalKwh = parseFloat(data.summary?.total_kwh || 0);
  const totalBill = parseFloat(data.summary?.estimated_bill || (totalKwh * 8));
  const co2 = (totalKwh * 0.92).toFixed(2);

  return (
    <div className="widget-card">
      <div className="widget-header">
        <div className="brand-title">🏠 Smart Energy Analyzer</div>
      </div>

      <div className="widget-body">
        {/* STATS SUMMARY ROW - EXACTLY AS YOU HAD IT */}
        <div className="stats-row">
          <div className="stat-box usage">
            <p>Total Usage</p>
            <h3>{totalKwh.toFixed(2)} kWh</h3>
          </div>
          <div className="stat-box cost">
            <p>Estimated Cost</p>
            <h3>₹{totalBill.toFixed(2)}</h3>
          </div>
          <div className="stat-box co2">
            <p>CO₂ Saved</p>
            <h3>{co2} kg</h3>
          </div>
          <div className="stat-box alert">
            <p>Readings</p>
            <h3>{sampleData.length} Hrs</h3>
          </div>
        </div>

        {/* CHART SECTION - SINGLE BAR PER HOUR */}
        <div className="chart-section" style={{ 
          padding: '30px', 
          background: '#fff', 
          borderRadius: '15px', 
          marginTop: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)' 
        }}>
          <h3 style={{ marginBottom: '25px', color: '#1e293b', fontWeight: 'bold' }}>
            Hourly Consumption (Total Addition)
          </h3>
          
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  interval={Math.ceil(chartData.length / 15)} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}
                  labelFormatter={(value) => `Time: ${value}`}
                />
                <Bar 
                  dataKey="total_usage" 
                  fill="#3b82f6" 
                  name="Usage (kWh)"
                  radius={[4, 4, 0, 0]} 
                  barSize={Math.max(5, 400 / chartData.length)} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECOMMENDATIONS (If provided by your backend) */}
        {data.recommendations && (
            <div style={{ marginTop: '20px', padding: '20px', background: '#f0fdf4', borderRadius: '12px' }}>
                <h4 style={{ color: '#166534', margin: '0 0 10px 0' }}>💡 Recommendations</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#15803d' }}>
                    {data.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;