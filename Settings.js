import React, { useState } from 'react';

const Settings = () => {
  const [threshold, setThreshold] = useState(500);
  const [currency, setCurrency] = useState('INR');

  return (
    <div className="settings-container" style={{ maxWidth: '700px' }}>
      <div className="card">
        <h2>⚙️ App Settings</h2>
        <p style={{ color: '#64748b', marginBottom: '30px' }}>
          Customize the AI analysis parameters for your home.
        </p>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
            Monthly Energy Budget (kWh)
          </label>
          <input 
            type="range" 
            min="100" 
            max="2000" 
            value={threshold} 
            onChange={(e) => setThreshold(e.target.value)}
            style={{ width: '100%', cursor: 'pointer' }}
          />
          <p style={{ marginTop: '10px', color: '#0ea5e9', fontWeight: 'bold' }}>
            Limit: {threshold} kWh
          </p>
          <small style={{ color: '#94a3b8' }}>
            The AI will trigger alerts if your predicted usage exceeds this value.
          </small>
        </div>

        <hr style={{ border: '0', borderTop: '1px solid #e2e8f0', margin: '20px 0' }} />

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
            Preferred Currency
          </label>
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          >
            <option value="INR">Indian Rupee (₹)</option>
            <option value="USD">US Dollar ($)</option>
            <option value="EUR">Euro (€)</option>
          </select>
        </div>

        <button className="btn-primary" onClick={() => alert('Settings Saved Successfully!')}>
          Save Configuration
        </button>
      </div>

      <div className="card" style={{ marginTop: '20px', borderLeft: '5px solid #6366f1' }}>
        <h3>About Energy AI v1.0</h3>
        <p style={{ fontSize: '14px', color: '#64748b' }}>
          This project uses a <b>Random Forest Regressor</b> for forecasting and 
          <b> Isolation Forest</b> for anomaly detection.
        </p>
      </div>
    </div>
  );
};

export default Settings;