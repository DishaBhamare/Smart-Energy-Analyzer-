import React, { useState, useEffect } from "react";
import "./Planner.css";

const EnergyPlanning = () => {
  const [budget, setBudget] = useState(500);
  const [category, setCategory] = useState("total");
  const [plannerData, setPlannerData] = useState([]);
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  // Fetch /planner data
  const fetchPlanner = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/planner");
      const data = await res.json();
      setPlannerData(data);
    } catch (err) {
      console.error("Error fetching planner data:", err);
    }
  };

  // Fetch /budget-planner data
  const fetchBudget = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/budget-planner?budget=${budget}&category=${category}`);
      const data = await res.json();
      setBudgetData(data);
    } catch (err) {
      console.error("Error fetching budget data:", err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchPlanner(), fetchBudget()]).finally(() => setLoading(false));
  }, [budget, category]);

  if (loading) return <div className="loading">Loading data...</div>;

  return (
    <div className="planner-root">
      <header className="planner-header">
        <h1>Smart Energy Planner</h1>
        <p>Optimize your consumption within ₹{budget} budget</p>
      </header>

      {/* Controls */}
      <div className="controls-grid">
        <div className="control-item">
          <label>Monthly Budget (₹)</label>
          <input
            type="range"
            min="100"
            max="2000"
            step="50"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
          />
          <span className="budget-val">₹{budget}</span>
        </div>

        <div className="control-item">
          <label>Optimization Focus</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="total">Overall House</option>
            <option value="kitchen">Kitchen Only</option>
            <option value="laundry">Laundry Only</option>
            <option value="HVAC_lights">HVAC & Lighting</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      {budgetData && (
        <div className="main-stats">
          <div className="stat-box highlight">
            <h3>₹{budgetData.total_cost.toFixed(2)}</h3>
            <p>Estimated Cost</p>
          </div>
          <div className="stat-box">
            <h3>{budgetData.hours_allowed}</h3>
            <p>Allowed Hours</p>
          </div>
          <div className="stat-box">
            <h3>₹{budgetData.remaining_budget.toFixed(2)}</h3>
            <p>Remaining Budget</p>
          </div>
        </div>
      )}

      {/* Recommended Schedule */}
      {plannerData.length > 0 && (
        <div className="glass-card schedule-dropdown">
          <h3 className="dropdown-header" onClick={() => setScheduleOpen(!scheduleOpen)}>
            Recommended Schedule {scheduleOpen ? "▲" : "▼"}
          </h3>

          {scheduleOpen ? (
            <div className="schedule-list-compact">
              <div className="schedule-row header">
                <span>Time</span>
                <span>Usage Level</span>
                <span>Cost (₹)</span>
              </div>
              {plannerData.map((item, i) => (
                <div key={i} className={`schedule-row ${item.usage_level.toLowerCase()}`}>
                  <span>{new Date(item.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>{item.usage_level}</span>
                  <span>₹{item.total_cost.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="collapsed-text">Click to view schedule</p>
          )}
        </div>
      )}

      {/* Appliance Allocation */}
      {budgetData && (
        <div className="glass-card appliance-card">
          <h3>Appliance Allocation</h3>
          <table className="appliance-table">
            <thead>
              <tr>
                <th>Appliance</th>
                <th>Hours Allowed</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(budgetData.recommended_hours_per_appliance).map(([name, hrs]) => (
                <tr key={name}>
                  <td>{name.replace("_", " ")}</td>
                  <td>
                    <div className="bar-bg">
                      <div className="bar-fill" style={{ width: `${Math.min(hrs * 4, 100)}%` }}></div>
                    </div>
                    <span className="bar-text">{hrs.toFixed(1)} hrs</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EnergyPlanning;
