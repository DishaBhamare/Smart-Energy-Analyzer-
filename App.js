import React, { useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import Upload from './components/Upload';
import Analysis from './components/Analysis';
import Forecast from './components/Forecast';
import Planner from './components/Planner';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Disclaimer from './components/Disclaimer';


function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [energyData, setEnergyData] = useState(null);
  const [forecastData, setForecastData] = useState(null); // ✅ Added forecast state
  const [reportData, setReportData] = useState([]);


  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'upload', label: 'Upload Data', icon: '📤' },
    { id: 'analysis', label: 'Analysis', icon: '📊' },
    { id: 'forecast', label: 'Forecast', icon: '🔮' },
    { id: 'planner', label: 'Smart Planner', icon: '📅' },
    { id: 'reports', label: 'Reports', icon: '📑' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="logo">⚡ EnergyAI 95+</div>
        <ul>
          {menuItems.map(item => (
            <li 
              key={item.id} 
              className={activePage === item.id ? 'active' : ''} 
              onClick={() => setActivePage(item.id)}
            >
              {item.icon} {item.label}
            </li>
          ))}
        </ul>
      </nav>

      <main className="main-content">
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>{activePage.charAt(0).toUpperCase() + activePage.slice(1)}</h1>
          <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>Welcome, <b>Disha</b></span>
            <div style={{ width: '40px', height: '40px', background: '#38bdf8', borderRadius: '50%' }}></div>
          </div>
        </header>
        
        {/* Components with updated props */}
        {activePage === 'dashboard' && <Dashboard data={energyData} />}
        {activePage === 'upload' && (
          <Upload
            setData={setEnergyData}
            setForecastData={setForecastData} 
            setReportData={setReportData} // ✅ Pass forecast setter
            setPage={setActivePage}
          />
        )}
        {activePage === 'analysis' && <Analysis data={energyData} />}
        {activePage === 'forecast' && <Forecast data={forecastData} />} {/* ✅ Pass correct forecast data */}
        {activePage === 'planner' && <Planner data={energyData} />}
        {activePage === 'reports' && <Reports data={reportData} />}
        {activePage === 'settings' && <Settings />}
      </main>
       {/* Global Disclaimer – visible on every page */}
      <Disclaimer />
    </div>
  );
}

export default App;
