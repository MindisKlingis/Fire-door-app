import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './DesignTestPage.css';

const DesignTestPage = () => {
  const [activeDesign, setActiveDesign] = useState('design1');
  const [formData, setFormData] = useState({
    doorNumber: '',
    location: '',
    condition: 'good',
    notes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="design-test-page">
      <Link to="/" className="back-button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Home
      </Link>

      <header className="design-test-header">
        <h1>Design Testing Area</h1>
        <p>Experiment with different design variations for the survey form</p>
      </header>

      <div className="design-controls">
        <button
          className={`design-button ${activeDesign === 'design1' ? 'active' : ''}`}
          onClick={() => setActiveDesign('design1')}
        >
          Dark Mode Design
        </button>
        <button
          className={`design-button ${activeDesign === 'design2' ? 'active' : ''}`}
          onClick={() => setActiveDesign('design2')}
        >
          Design 2
        </button>
        <button
          className={`design-button ${activeDesign === 'design3' ? 'active' : ''}`}
          onClick={() => setActiveDesign('design3')}
        >
          Design 3
        </button>
        <button
          className={`design-button ${activeDesign === 'design4' ? 'active' : ''}`}
          onClick={() => setActiveDesign('design4')}
        >
          Glass Design
        </button>
        <button
          className={`design-button ${activeDesign === 'design5' ? 'active' : ''}`}
          onClick={() => setActiveDesign('design5')}
        >
          Command Center
        </button>
      </div>

      <div className="design-preview">
        {activeDesign === 'design1' && (
          <div className="design-container design1">
            <h2>Dark Mode Survey Form</h2>
            <div className="test-form">
              <div className="form-section">
                <h2>Door Information</h2>
                <div className="form-group">
                  <label htmlFor="doorNumber">Door Number</label>
                  <input
                    type="text"
                    id="doorNumber"
                    name="doorNumber"
                    value={formData.doorNumber}
                    onChange={handleInputChange}
                    placeholder="Enter door number"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter door location"
                  />
                </div>
              </div>

              <div className="form-section">
                <h2>Inspection Details</h2>
                <div className="form-group">
                  <label htmlFor="condition">Door Condition</label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                  >
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="notes">Additional Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Enter any additional notes"
                    rows="4"
                  ></textarea>
                </div>
                <button className="action-button">Save Inspection</button>
              </div>
            </div>
          </div>
        )}

        {activeDesign === 'design2' && (
          <div className="design-container design2">
            <div className="test-form">
              <div className="form-header">
                <h2>Fire Door Inspection</h2>
                <p>Complete the inspection details for the current door</p>
                <div className="form-progress">
                  <div className="progress-step active"></div>
                  <div className="progress-step"></div>
                  <div className="progress-step"></div>
                  <div className="progress-step"></div>
                </div>
              </div>

              <div className="form-content">
                <div className="form-section">
                  <h2>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    Location Details
                  </h2>
                  <div className="form-group">
                    <label htmlFor="doorNumber">Door Number</label>
                    <input
                      type="text"
                      id="doorNumber"
                      name="doorNumber"
                      value={formData.doorNumber}
                      onChange={handleInputChange}
                      placeholder="Enter door number"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Enter door location"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="building">Building</label>
                    <select
                      id="building"
                      name="building"
                      defaultValue=""
                    >
                      <option value="" disabled>Select building</option>
                      <option value="main">Main Building</option>
                      <option value="annex">Annex</option>
                      <option value="warehouse">Warehouse</option>
                    </select>
                  </div>
                </div>

                <div className="form-section">
                  <h2>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 11l3 3L22 4"></path>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                    Inspection Details
                  </h2>
                  <div className="form-group">
                    <label htmlFor="condition">Door Condition</label>
                    <select
                      id="condition"
                      name="condition"
                      value={formData.condition}
                      onChange={handleInputChange}
                    >
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="notes">Additional Notes</label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Enter any additional notes"
                      rows="4"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="form-footer">
                <div className="help-text">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  Need help? Contact support
                </div>
                <button className="action-button">
                  Save and Continue
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeDesign === 'design3' && (
          <div className="design-container design3">
            <div className="test-form">
              <div className="form-section">
                <h2>🚪 Door Details</h2>
                <div className="form-group">
                  <label htmlFor="doorNumber">Door ID #</label>
                  <input
                    type="text"
                    id="doorNumber"
                    name="doorNumber"
                    value={formData.doorNumber}
                    onChange={handleInputChange}
                    placeholder="Enter door number"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Where's this door at?"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="floor">Floor Level</label>
                  <select
                    id="floor"
                    name="floor"
                    defaultValue=""
                  >
                    <option value="" disabled>Pick a floor</option>
                    <option value="basement">Basement</option>
                    <option value="ground">Ground Floor</option>
                    <option value="first">First Floor</option>
                    <option value="second">Second Floor</option>
                    <option value="third">Third Floor</option>
                  </select>
                </div>
              </div>

              <div className="form-section">
                <h2>🔍 Quick Check</h2>
                <div className="form-group">
                  <label>Door Condition Rating</label>
                  <div className="emoji-rating">
                    <span role="button" title="Critical">💀</span>
                    <span role="button" title="Bad">😫</span>
                    <span role="button" title="Okay">😐</span>
                    <span role="button" title="Good">😊</span>
                    <span role="button" title="Perfect">🌟</span>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="notes">Quick Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Drop your thoughts here..."
                    rows="4"
                  ></textarea>
                </div>
                <button className="action-button">
                  Save & Continue 🚀
                </button>
              </div>
            </div>
          </div>
        )}

        {activeDesign === 'design4' && (
          <div className="design-container design4">
            <div className="test-form">
              <div className="form-section">
                <h2>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <path d="M9 22V12h6v10"/>
                  </svg>
                  Survey Details
                </h2>
                <div className="metrics-grid">
                  <div className="metric-card">
                    <div className="metric-title">Surveys Completed</div>
                    <div className="metric-value">24/30</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-title">Completion Rate</div>
                    <div className="metric-value">80%</div>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="doorNumber">Door Number</label>
                  <input
                    type="text"
                    id="doorNumber"
                    name="doorNumber"
                    value={formData.doorNumber}
                    onChange={handleInputChange}
                    placeholder="Enter door number"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter location"
                  />
                </div>
              </div>

              <div className="form-section">
                <h2>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4"/>
                    <path d="M12 8h.01"/>
                  </svg>
                  Inspection Status
                </h2>
                <div style={{"--progress": "80%"}} className="progress-circle">
                  <div className="progress-value">80%</div>
                </div>
                <div className="form-group">
                  <label htmlFor="condition">Door Condition</label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Add inspection notes..."
                    rows="4"
                  ></textarea>
                </div>
                <button className="action-button">
                  Save Inspection
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14"/>
                    <path d="M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeDesign === 'design5' && (
          <div className="design-container design5">
            <div className="test-form">
              <div className="sidebar">
                <div className="status-header">
                  <div className="status-indicator">🔍</div>
                  <div className="status-text">
                    <div className="status-title">Active Inspection</div>
                    <div className="status-subtitle">Floor 2, Section B</div>
                  </div>
                </div>
                <div className="nav-items">
                  <div className="nav-item active">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <path d="M9 22V12h6v10"/>
                    </svg>
                    Door Details
                  </div>
                  <div className="nav-item">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 11l3 3L22 4"/>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                    Inspection Points
                  </div>
                  <div className="nav-item">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 16v-4"/>
                      <path d="M12 8h.01"/>
                    </svg>
                    Issues & Notes
                  </div>
                  <div className="nav-item">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    Upload Photos
                  </div>
                </div>
              </div>

              <div className="main-content">
                <div className="header-stats">
                  <div className="stat-card">
                    <div className="stat-icon success">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                    </div>
                    <div className="stat-info">
                      <div className="stat-value">85%</div>
                      <div className="stat-label">Completion Rate</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon warning">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                    </div>
                    <div className="stat-info">
                      <div className="stat-value">12</div>
                      <div className="stat-label">Pending Reviews</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon danger">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                    </div>
                    <div className="stat-info">
                      <div className="stat-value">5</div>
                      <div className="stat-label">Critical Issues</div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="section-header">
                    <h2>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <path d="M9 22V12h6v10"/>
                      </svg>
                      Door Information
                    </h2>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="doorNumber">Door ID</label>
                      <input
                        type="text"
                        id="doorNumber"
                        name="doorNumber"
                        value={formData.doorNumber}
                        onChange={handleInputChange}
                        placeholder="Enter door ID"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="location">Location</label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Enter location"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="building">Building</label>
                      <select
                        id="building"
                        name="building"
                        defaultValue=""
                      >
                        <option value="" disabled>Select building</option>
                        <option value="main">Main Building</option>
                        <option value="annex">Annex</option>
                        <option value="warehouse">Warehouse</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="condition">Door Condition</label>
                      <select
                        id="condition"
                        name="condition"
                        value={formData.condition}
                        onChange={handleInputChange}
                      >
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="notes">Inspection Notes</label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Add detailed notes about the door's condition..."
                      rows="4"
                    ></textarea>
                  </div>
                  <div className="action-bar">
                    <button className="action-button secondary">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      Add Photos
                    </button>
                    <button className="action-button">
                      Save & Continue
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignTestPage; 