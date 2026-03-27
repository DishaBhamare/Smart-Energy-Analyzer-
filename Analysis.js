import React from 'react';
import './Analysis.css';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Analysis = ({ data }) => {
  // If no data, set values to 0. If data exists, use your pieData.
  const pieData = data ? [
    { name: 'Kitchen Appliances', value: 400 },
    { name: 'HVAC & Cooling', value: 300 },
    { name: 'Lighting', value: 200 },
    { name: 'Other', value: 100 },
  ] : [
    { name: 'No Data', value: 1 } // Show a gray circle if empty
  ];

  // Gray color for "No Data" state
  const COLORS = data ? ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'] : ['#e2e8f0'];

  return (
    <div className="widget-card">
      <div className="widget-header">
        <div className="brand-title">🏠 Smart Energy Analyzer</div>
        <div className="header-icons">📊 💬 ⚙️</div>
      </div>

      <div className="widget-body" style={{ padding: '20px' }}>
        <h3>Energy Consumption Patterns</h3>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '15px' }}>
          {data ? 'Daily Usage Trends' : 'Awaiting dataset for analysis...'}
        </p>

        {/* Efficiency Chart Section */}
        <div style={{ height: '250px', width: '100%', marginBottom: '20px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip enabled={!!data} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts Section */}
        <div className="alert-section" style={{ marginBottom: '15px', opacity: data ? 1 : 0.5 }}>
          <h4 style={{ color: '#856404', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚠️ Alerts
          </h4>
          <div className="alert-item">
            {data ? '🚨 Excessive usage detected in Room 203 during peak hours.' : 'No active alerts. Upload data to scan for anomalies.'}
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="rec-section" style={{ opacity: data ? 1 : 0.5 }}>
          <h4 style={{ color: '#22543d', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🌱 Recommendations
          </h4>
          <div className="rec-item">
            {data ? '💡 Reduce night lighting to save ₹300/month.' : 'Awaiting data for energy-saving tips.'}
          </div>
        </div>
        
        {/* Efficiency Stats */}
        <div className="stats-grid" style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="stat-box" style={{ background: '#f8fafc', textAlign: 'center', padding: '15px', borderRadius: '12px' }}>
            <p className="stat-label" style={{ color: '#64748b', fontSize: '12px' }}>Efficiency Score</p>
            <p className="stat-value" style={{ color: data ? '#27ae60' : '#cbd5e1', fontSize: '24px', fontWeight: 'bold' }}>
              {data ? '88/100' : '0/100'}
            </p>
          </div>
          <div className="stat-box" style={{ background: '#f8fafc', textAlign: 'center', padding: '15px', borderRadius: '12px' }}>
            <p className="stat-label" style={{ color: '#64748b', fontSize: '12px' }}>Vampire Load</p>
            <p className="stat-value" style={{ color: data ? '#f39c12' : '#cbd5e1', fontSize: '24px', fontWeight: 'bold' }}>
              {data ? '1.2' : '0.0'} <small style={{ fontSize: '12px' }}>kWh</small>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;