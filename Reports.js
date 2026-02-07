import React, { useMemo } from 'react';
import './Reports.css';

const Reports = ({ data = [] }) => {
  const handlePrint = () => window.print();

  const reportData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.filter(
      item =>
        item &&
        typeof item.predicted_next_day_kwh === 'number' &&
        !isNaN(item.predicted_next_day_kwh)
    );
  }, [data]);

  const totalPredictedKwh = useMemo(() => {
    return reportData.length === 0
      ? '0'
      : reportData
          .reduce((sum, item) => sum + item.predicted_next_day_kwh, 0)
          .toFixed(1);
  }, [reportData]);

  const totalCost = useMemo(() => {
    return reportData.length === 0
      ? '0'
      : reportData
          .reduce((sum, item) => sum + (item.cost || 0), 0)
          .toFixed(0);
  }, [reportData]);

  const potentialSavings = useMemo(() => {
    return (Number(totalCost) * 0.15).toFixed(2);
  }, [totalCost]);

  return (
    <div className="reports-container">

      {/* HEADER */}
      <div className="reports-header">
        <div>
          <h2>Energy Forecasting Report</h2>
          <p className="subtitle">AI-driven predictions based on uploaded data</p>
        </div>
        <button className="print-btn" onClick={handlePrint}>🖨️ Print</button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="report-summary-card responsive-summary">
        <div className="summary-item">
          <span className="label">Predicted Next 24h Usage:</span>
          <span className="value">{totalPredictedKwh} kWh</span>
        </div>

        <div className="summary-item">
          <span className="label">Estimated Cost:</span>
          <span className="value">₹{totalCost}</span>
        </div>

        <div className="summary-item">
          <span className="label">Potential Savings:</span>
          <span className="value savings">₹{potentialSavings}</span>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-wrapper responsive-table">
        <table className="report-table">
          <thead>
            <tr>
              <th>APPLIANCE</th>
              <th>PREDICTED kWh</th>
              <th>CO₂ (kg)</th>
              <th>USAGE TYPE</th>
              <th>ECO SCORE</th>
              <th>COST (₹)</th>
              <th>RECOMMENDATION</th>
            </tr>
          </thead>
          <tbody>
            {reportData.length > 0 ? (
              reportData.map((item, index) => (
                <tr key={index}>
                  <td>{item.appliance}</td>
                  <td>{item.predicted_next_day_kwh}</td>
                  <td>{item.predicted_co2_kg}</td>
                  <td>{item.usage_cluster}</td>
                  <td>{item.eco_score}</td>
                  <td>₹{item.cost}</td>
                  <td>{item.recommendation}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                  ⚠️ Upload CSV & generate report first
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
