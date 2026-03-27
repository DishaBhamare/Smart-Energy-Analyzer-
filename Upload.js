import React, { useState } from 'react';
import './Upload.css';

const Upload = ({ setData, setForecastData, setPage }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Mock data for preview
  const previewData = [
    { date: '2024-01-10, 18', usage: '2.4', appliance: 'AC' },
    { date: '2024-01-10, 10', usage: '1.8', appliance: 'AC' },
    { date: '2024-01-10, 10', usage: '1.8', appliance: 'Lights' },
    { date: '2024-01-10, 10', usage: '1.8', appliance: 'Lights' },
  ];

  const displayData = file ? previewData : [];

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('⚠️ Please select a CSV file first.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1️⃣ Upload CSV
      const response = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setMessage('✅ AI Analysis Complete! Fetching Forecast...');

        // 2️⃣ Fetch forecast immediately after upload
        const forecastRes = await fetch('http://127.0.0.1:8000/forecast');
        const forecastJson = await forecastRes.json();

        // 3️⃣ Update states
        setData(result);                 // for dashboard / analysis
        setForecastData(forecastJson);   // for Forecast component

        // 4️⃣ Redirect to Forecast page
        setPage('forecast');
      } else {
        const errorData = await response.json();
        setMessage(`❌ Upload failed: ${errorData.detail || 'Invalid File'}`);
      }
    } catch (error) {
      setMessage('❌ Connection Error: Is your Python server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="widget-card">
      <div className="widget-header">
        <div className="brand-title">🏠 Smart Energy Analyzer</div>
        <div className="header-icons">📊 💬 ⚙️</div>
      </div>

      <div className="widget-body" style={{ padding: '20px' }}>
        <div className="upload-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          
          <div className="upload-controls">
            <h3>Upload Your Energy Data</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
              Select your smart meter CSV file to generate AI insights.
            </p>

            <div className="file-input-wrapper" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange} 
                className="custom-file-input"
              />
              <button 
                className="upload-action-btn"
                onClick={handleUpload}
                disabled={loading || !file}
              >
                {loading ? '...' : 'Upload'}
              </button>
            </div>
            {message && <p style={{ fontSize: '13px', fontWeight: 'bold' }}>{message}</p>}
          </div>

          <div className="data-preview">
            <h3>Data Preview</h3>
            <table className="preview-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Energy_kWh</th>
                  <th>Appliance</th>
                </tr>
              </thead>
              <tbody>
                {displayData.length > 0 ? (
                  displayData.map((row, index) => (
                    <tr key={index}>
                      <td>{row.date}</td>
                      <td>{row.usage}</td>
                      <td>{row.appliance}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                      No data selected
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;