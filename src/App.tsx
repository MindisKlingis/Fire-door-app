import React from 'react';
import './App.css';
import { ThemeSwitcher } from './components/ThemeSwitcher/ThemeSwitcher';

function App() {
  return (
    <div className="App">
      <ThemeSwitcher />
      <header className="App-header glass">
        <h1>Fire Door App</h1>
        <p>Efficient fire door management and inspection</p>
      </header>
      <main>
        <div className="feature-grid">
          <div className="feature-card glass">
            <div className="feature-icon">🔍</div>
            <h2>Inspection Management</h2>
            <p>Streamline your fire door inspection process</p>
          </div>
          <div className="feature-card glass">
            <div className="feature-icon">📱</div>
            <h2>Mobile First</h2>
            <p>Work efficiently on any device</p>
          </div>
          <div className="feature-card glass">
            <div className="feature-icon">📊</div>
            <h2>Detailed Reports</h2>
            <p>Generate comprehensive inspection reports</p>
          </div>
        </div>
        <div className="action-buttons">
          <button className="start-survey-button glass">Start New Survey</button>
          <button className="ai-survey-button glass">AI-Assisted Survey</button>
          <button className="architecture-button glass">View Architecture</button>
          <button className="design-test-button glass">Design Test</button>
        </div>
      </main>
    </div>
  );
}

export default App; 