import React from 'react';
import './Reports.css';

const Reports = ({ data }) => {
  const handlePrint = () => window.print();

  // 1. SAFE DATA LOGIC
  // Your backend sends an array of { hour_index: X, predicted_kwh: Y }
  const forecastArray = Array.isArray(data) ? data : [];

  // 2. CALCULATE PREDICTED TOTALS
  // Summing the next 24 hours of predicted energy
  const totalPredictedKwh = forecastArray
    .reduce((acc, curr) => acc + (parseFloat(curr.predicted_kwh) || 0), 0)
    .toFixed(1);

  // Cost calculation based on your ₹8 unit price
  const predictedCost = (totalPredictedKwh * 8).toFixed(0);

  // Mock savings: logic suggesting we can save 15% via optimization
  const potentialSavings = (predictedCost * 0.15).toFixed(2);

  // 3. TABLE ROWS LOGIC
  // We map the Forecast data to the first row (Next 24 Hours)
  const rows = forecastArray.length > 0 ? [
    { 
      period: 'Forecast: Next 24h', 
      usage: `${totalPredictedKwh} kWh`, 
      cost: `₹${predictedCost}`, 
      status: 'AI Forecast' 
    },
    { period: 'Last 7 Days', usage: '---', cost: '---', status: 'Pending' },
    { period: 'Last 30 Days', usage: '---', cost: '---', status: 'Pending' }
  ] : [
    { period: 'Next 24 Hours', usage: '0 kWh', cost: '₹0', status: 'No Data' },
    { period: 'Last 7 Days', usage: '0 kWh', cost: '₹0', status: 'Pending' },
    { period: 'Last 30 Days', usage: '0 kWh', cost: '₹0', status: 'Pending' }
  ];

  return (
    <div className="reports-container">
      {/* HEADER SECTION */}
      <div className="reports-header">
        <div>
          <h2>Energy Forecasting Report</h2>
          <p className="subtitle">AI-driven predictions based on historical usage.</p>
        </div>
        <button className="print-btn" onClick={handlePrint}>🖨️ Print Full Report</button>
      </div>

      {/* SUMMARY SECTION */}
      <div className="report-summary-card">
        <div className="summary-item">
          <span className="label">Predicted Next 24h Usage:</span>
          <span className="value">{totalPredictedKwh} kWh</span>
        </div>
        <div className="summary-item">
          <span className="label">Estimated Potential Savings:</span>
          <span className="value savings">₹{potentialSavings}</span>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="report-table-wrapper">
        <table className="report-table">
          <thead>
            <tr>
              <th>ANALYSIS PERIOD</th>
              <th>PREDICTED USAGE</th>
              <th>ESTIMATED COST</th>
              <th>REPORT STATUS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>{row.period}</td>
                <td>{row.usage}</td>
                <td>{row.cost}</td>
                <td>
                  {/* Logic to apply different colors to the status badge */}
                  <span className={`status-badge ${row.status.replace(/\s+/g, '-').toLowerCase()}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* NOTE FOR THE USER */}
      {forecastArray.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
           ⚠️ No forecasting data found. Please ensure the backend is running Linear Regression.
        </div>
      )}
    </div>
  );
};

export default Reports;