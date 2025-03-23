import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DependencyGraph from './DependencyGraph';
import websocketClient from '../services/websocket';
import './SystemArchitecture.css';

const SystemArchitecture = () => {
  const [activeLayer, setActiveLayer] = useState('all');
  const [showDependencyGraph, setShowDependencyGraph] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [systemStructure, setSystemStructure] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    // Connect to WebSocket when component mounts
    websocketClient.connect();

    // Subscribe to updates
    const unsubscribe = websocketClient.subscribe((data) => {
      setSystemStructure(data);
      setLastUpdate(new Date().toLocaleTimeString());
    });

    // Request initial data
    websocketClient.requestUpdate();

    // Cleanup on unmount
    return () => {
      unsubscribe();
      websocketClient.disconnect();
    };
  }, []);

  const handleRefresh = () => {
    websocketClient.requestUpdate();
  };

  const handleLayerClick = (layer) => {
    setActiveLayer(layer);
    setSelectedComponent(null);
  };

  const handleComponentClick = (component) => {
    setSelectedComponent(component);
  };

  if (!systemStructure) {
    return <div className="loading">Loading system architecture...</div>;
  }

  return (
    <div className="system-architecture">
      <Link to="/" className="back-button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Home
      </Link>

      <div className="architecture-header">
        <h1>System Architecture</h1>
        <div className="view-controls">
          <button 
            className="view-button"
            onClick={() => setShowDependencyGraph(!showDependencyGraph)}
          >
            {showDependencyGraph ? 'Show Layers' : 'Show Dependencies'}
          </button>
          <button className="refresh-button" onClick={handleRefresh}>
            Refresh
          </button>
          <span className="last-update">
            Last updated: {lastUpdate}
          </span>
        </div>
      </div>

      <div className="nav-section">
        <div className="nav-title">View Layers</div>
        <div className="architecture-nav">
          {['all', 'frontend', 'backend', 'database'].map(layer => (
            <button
              key={layer}
              className={`nav-button ${activeLayer === layer ? 'active' : ''}`}
              onClick={() => handleLayerClick(layer)}
            >
              {layer.charAt(0).toUpperCase() + layer.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="architecture-container">
        {showDependencyGraph ? (
          <DependencyGraph data={systemStructure?.dependencies?.d3Format} />
        ) : (
          <>
            {(activeLayer === 'all' || activeLayer === 'frontend') && (
              <div className="layer frontend-layer">
                <h2>Frontend Components</h2>
                <div className="components">
                  {systemStructure.frontend.components.map(component => (
                    <div
                      key={component.path}
                      className={`component ${selectedComponent?.path === component.path ? 'selected' : ''}`}
                      onClick={() => handleComponentClick(component)}
                    >
                      <h3>{component.name}</h3>
                      <p>Path: {component.path}</p>
                      <p>Last Modified: {new Date(component.lastModified).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(activeLayer === 'all' || activeLayer === 'backend') && (
              <div className="layer backend-layer">
                <h2>Backend Services</h2>
                <div className="components">
                  {systemStructure.backend.routes.map(route => (
                    <div
                      key={route.path}
                      className="component"
                      onClick={() => handleComponentClick(route)}
                    >
                      <h3>{route.method} {route.path}</h3>
                      <p>Controller: {route.controller}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(activeLayer === 'all' || activeLayer === 'database') && (
              <div className="layer database-layer">
                <h2>Database Schema</h2>
                <div className="components">
                  {systemStructure.database.collections.map(collection => (
                    <div
                      key={collection.name}
                      className="component"
                      onClick={() => handleComponentClick(collection)}
                    >
                      <h3>{collection.name}</h3>
                      <p>Documents: {collection.documentCount}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {selectedComponent && (
          <div className="component-details">
            <h2>Component Details</h2>
            <pre>{JSON.stringify(selectedComponent, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="system-health">
        <h2>System Health</h2>
        <div className="metrics">
          <div className="metric">
            <span>API Response Time</span>
            <span>{systemStructure.metrics.avgResponseTime}ms</span>
          </div>
          <div className="metric">
            <span>Active Connections</span>
            <span>{systemStructure.metrics.activeConnections}</span>
          </div>
          <div className="metric">
            <span>Cache Hit Rate</span>
            <span>{systemStructure.metrics.cacheHitRate}%</span>
          </div>
          <div className="metric">
            <span>Total Files</span>
            <span>{systemStructure.metrics.totalFiles}</span>
          </div>
          <div className="metric">
            <span>Total Lines</span>
            <span>{systemStructure.metrics.totalLines.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <footer className="architecture-footer">
        <div className="documentation-links">
          <Link to="/docs/api">API Documentation</Link>
          <Link to="/docs/components">Component Guide</Link>
          <Link to="/docs/deployment">Deployment Guide</Link>
        </div>
      </footer>
    </div>
  );
};

export default SystemArchitecture; 