import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ButtonTestPage.css';

const ButtonTestPage = () => {
  const [activeTest, setActiveTest] = useState('buttons');
  const [selectedOption, setSelectedOption] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [sliderValue, setSliderValue] = useState(50);
  const [searchInput, setSearchInput] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const options = [
    'Critical', 'Poor', 'Fair', 'Good', 'Excellent'
  ];

  const conditions = [
    { value: 'critical', label: 'Critical', icon: '⚠️' },
    { value: 'poor', label: 'Poor', icon: '😟' },
    { value: 'fair', label: 'Fair', icon: '😐' },
    { value: 'good', label: 'Good', icon: '😊' },
    { value: 'excellent', label: 'Excellent', icon: '🌟' }
  ];

  const handleTagSelect = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="button-test-page">
      <Link to="/" className="back-button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Home
      </Link>

      <header className="test-header">
        <h1>Interactive Elements Testing</h1>
        <p>Experiment with different button styles and selection patterns</p>
      </header>

      <div className="test-controls">
        <button
          className={`test-button ${activeTest === 'buttons' ? 'active' : ''}`}
          onClick={() => setActiveTest('buttons')}
        >
          Button Styles
        </button>
        <button
          className={`test-button ${activeTest === 'dropdowns' ? 'active' : ''}`}
          onClick={() => setActiveTest('dropdowns')}
        >
          Dropdown Patterns
        </button>
        <button
          className={`test-button ${activeTest === 'sliders' ? 'active' : ''}`}
          onClick={() => setActiveTest('sliders')}
        >
          Slider Controls
        </button>
        <button
          className={`test-button ${activeTest === 'chips' ? 'active' : ''}`}
          onClick={() => setActiveTest('chips')}
        >
          Chip Selection
        </button>
      </div>

      <div className="test-preview">
        {activeTest === 'buttons' && (
          <div className="test-section">
            <h2>Button Variations</h2>
            
            <div className="button-grid">
              <div className="button-group">
                <h3>Primary Buttons</h3>
                <button className="btn-primary">Standard Button</button>
                <button className="btn-primary with-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                  With Icon
                </button>
                <button className="btn-primary loading">
                  <span className="loader"></span>
                  Loading...
                </button>
              </div>

              <div className="button-group">
                <h3>Secondary Buttons</h3>
                <button className="btn-secondary">Outlined Button</button>
                <button className="btn-secondary with-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Upload
                </button>
                <button className="btn-secondary disabled" disabled>Disabled</button>
              </div>

              <div className="button-group">
                <h3>Action Buttons</h3>
                <button className="btn-action success">Save Changes</button>
                <button className="btn-action warning">Review Required</button>
                <button className="btn-action danger">Delete Item</button>
              </div>

              <div className="button-group">
                <h3>Toggle Buttons</h3>
                <div className="toggle-group">
                  <button className="toggle-btn active">Day</button>
                  <button className="toggle-btn">Week</button>
                  <button className="toggle-btn">Month</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTest === 'dropdowns' && (
          <div className="test-section">
            <h2>Dropdown Patterns</h2>
            
            <div className="dropdown-grid">
              <div className="dropdown-group">
                <h3>Standard Dropdown</h3>
                <select className="standard-select" value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
                  <option value="">Select condition...</option>
                  {options.map(option => (
                    <option key={option} value={option.toLowerCase()}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="dropdown-group">
                <h3>Searchable Dropdown</h3>
                <div className="searchable-dropdown">
                  <input
                    type="text"
                    placeholder="Search options..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onClick={() => setIsDropdownOpen(true)}
                  />
                  {isDropdownOpen && (
                    <div className="dropdown-options">
                      {options
                        .filter(option => option.toLowerCase().includes(searchInput.toLowerCase()))
                        .map(option => (
                          <div
                            key={option}
                            className="dropdown-option"
                            onClick={() => {
                              setSearchInput(option);
                              setIsDropdownOpen(false);
                            }}
                          >
                            {option}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="dropdown-group">
                <h3>Custom Input Dropdown</h3>
                <div className="custom-dropdown">
                  <input
                    type="text"
                    placeholder="Enter or select value..."
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    list="custom-options"
                  />
                  <datalist id="custom-options">
                    {options.map(option => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="dropdown-group">
                <h3>Rich Dropdown</h3>
                <div className="rich-dropdown">
                  <select className="rich-select" value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
                    <option value="">Select condition...</option>
                    {conditions.map(condition => (
                      <option key={condition.value} value={condition.value}>
                        {condition.icon} {condition.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTest === 'sliders' && (
          <div className="test-section">
            <h2>Slider Controls</h2>
            
            <div className="slider-grid">
              <div className="slider-group">
                <h3>Basic Slider</h3>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderValue}
                  onChange={(e) => setSliderValue(e.target.value)}
                  className="basic-slider"
                />
                <div className="slider-value">{sliderValue}%</div>
              </div>

              <div className="slider-group">
                <h3>Stepped Slider</h3>
                <div className="stepped-slider">
                  <input
                    type="range"
                    min="0"
                    max="4"
                    step="1"
                    value={conditions.findIndex(c => c.value === selectedOption)}
                    onChange={(e) => setSelectedOption(conditions[e.target.value].value)}
                    className="step-slider"
                  />
                  <div className="step-markers">
                    {conditions.map((condition, index) => (
                      <div key={index} className="step-marker">
                        <div className="step-icon">{condition.icon}</div>
                        <div className="step-label">{condition.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="slider-group">
                <h3>Range Slider</h3>
                <div className="range-slider">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderValue}
                    onChange={(e) => setSliderValue(e.target.value)}
                    className="range-input"
                  />
                  <div className="range-labels">
                    <span>Critical</span>
                    <span>Poor</span>
                    <span>Fair</span>
                    <span>Good</span>
                    <span>Excellent</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTest === 'chips' && (
          <div className="test-section">
            <h2>Chip Selection</h2>
            
            <div className="chips-grid">
              <div className="chips-group">
                <h3>Single Select Chips</h3>
                <div className="chip-container">
                  {conditions.map(condition => (
                    <button
                      key={condition.value}
                      className={`chip ${selectedOption === condition.value ? 'active' : ''}`}
                      onClick={() => setSelectedOption(condition.value)}
                    >
                      {condition.icon} {condition.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="chips-group">
                <h3>Multi Select Chips</h3>
                <div className="chip-container">
                  {conditions.map(condition => (
                    <button
                      key={condition.value}
                      className={`chip ${selectedTags.includes(condition.value) ? 'active' : ''}`}
                      onClick={() => handleTagSelect(condition.value)}
                    >
                      {condition.icon} {condition.label}
                      {selectedTags.includes(condition.value) && (
                        <svg className="chip-remove" viewBox="0 0 24 24">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="chips-group">
                <h3>Filter Chips</h3>
                <div className="chip-container">
                  <button className="chip filter active">
                    <svg viewBox="0 0 24 24">
                      <path d="M3 6v2h18V6H3zm0 7h18v-2H3v2zm0 7h18v-2H3v2z"/>
                    </svg>
                    All
                  </button>
                  <button className="chip filter">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Active
                  </button>
                  <button className="chip filter">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    Issues
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ButtonTestPage; 