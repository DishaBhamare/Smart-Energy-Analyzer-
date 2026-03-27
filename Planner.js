import React, { useState, useEffect } from 'react';
import './Planner.css';

const EnergyPlanning = () => {
  const [billAmount, setBillAmount] = useState('');
  const [appliances, setAppliances] = useState({ fans: 0, lights: 0, ac: 0, tv: 0 });
  const [results, setResults] = useState({
    units: 0,
    fanHrs: 0,
    lightHrs: 0,
    acHrs: 0
  });

  const COST_PER_UNIT = 6.67; // Adjust based on your local tariff

  useEffect(() => {
    const amount = parseFloat(billAmount);
    
    if (amount > 0) {
      const totalUnits = Math.floor(amount / COST_PER_UNIT);
      
      // Math logic: Distributing units across appliances
      // Fans (75W), Lights (20W), AC (1500W)
      const fHrs = appliances.fans > 0 ? Math.floor((totalUnits * 0.3) / (appliances.fans * 0.075) / 30) : 0;
      const lHrs = appliances.lights > 0 ? Math.floor((totalUnits * 0.1) / (appliances.lights * 0.02) / 30) : 0;
      const aHrs = appliances.ac > 0 ? Math.floor((totalUnits * 0.6) / (appliances.ac * 1.5) / 30) : 0;

      setResults({
        units: totalUnits,
        fanHrs: fHrs,
        lightHrs: lHrs,
        acHrs: aHrs
      });
    } else {
      // Default Zero State
      setResults({ units: 0, fanHrs: 0, lightHrs: 0, acHrs: 0 });
    }
  }, [billAmount, appliances]);

  return (
    <div className="planning-container">
      <h2 className="page-title">🎯 Goal-Based Energy Planning</h2>

      {/* Section 1: Set Your Goal */}
      <div className="glass-card goal-card">
        <h3>Set Your Goal</h3>
        <div className="toggle-buttons">
          <button className="active-btn">Target Bill (₹)</button>
          <button className="inactive-btn">Target Units (kWh)</button>
        </div>
        <input 
          type="number" 
          placeholder="Enter bill amount (₹)" 
          value={billAmount}
          onChange={(e) => setBillAmount(e.target.value)}
          className="main-input"
        />
      </div>

      {/* Section 2: Appliance Count */}
      <div className="glass-card">
        <h3>Appliance Count</h3>
        <div className="appliance-row">
          <div className="app-item">
            <span className="icon">🌀</span>
            <label>Fans</label>
            <input type="number" placeholder="0" onChange={(e) => setAppliances({...appliances, fans: e.target.value})} />
          </div>
          <div className="app-item">
            <span className="icon">💡</span>
            <label>Lights</label>
            <input type="number" placeholder="0" onChange={(e) => setAppliances({...appliances, lights: e.target.value})} />
          </div>
          <div className="app-item">
            <span className="icon">❄️</span>
            <label>AC</label>
            <input type="number" placeholder="0" onChange={(e) => setAppliances({...appliances, ac: e.target.value})} />
          </div>
          <div className="app-item">
            <span className="icon">📺</span>
            <label>TV</label>
            <input type="number" placeholder="0" onChange={(e) => setAppliances({...appliances, tv: e.target.value})} />
          </div>
        </div>
      </div>

      {/* Section 3: Suggested Usage Pills */}
      <div className="glass-card">
        <h3>Suggested Usage</h3>
        <div className="pill-row">
          <div className="usage-pill">Fan → {results.fanHrs} hrs/day</div>
          <div className="usage-pill">Light → {results.lightHrs} hrs/day</div>
          <div className="usage-pill">AC → {results.acHrs} hrs/day</div>
        </div>
      </div>

      {/* Section 4: Summary Footer */}
      <div className="glass-card summary-card">
        <h3>Summary</h3>
        <p className="summary-label">Total Units Allowed:</p>
        <h2 className="summary-value">{results.units} kWh</h2>
        <p className="summary-label">Estimated Bill:</p>
        <h2 className="summary-value">₹{billAmount || 0}</h2>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: billAmount > 0 ? '65%' : '0%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default EnergyPlanning;