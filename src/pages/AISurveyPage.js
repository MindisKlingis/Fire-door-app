import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './AISurveyPage.css';

const AISurveyPage = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysis(null);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysis(null);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const generateExcelReport = (analysisData) => {
    const wb = XLSX.utils.book_new();
    const data = [
      ['Fire Door AI Analysis Report'],
      ['Generated Date', new Date().toLocaleString()],
      [''],
      ['Analysis Results'],
      ['Parameter', 'Value', 'Notes'],
      ['Door Type', analysisData.doorType, analysisData.doorTypeNotes],
      ['Fire Rating', analysisData.fireRating, analysisData.fireRatingNotes],
      ['Leaf Gap', analysisData.leafGap + 'mm', analysisData.leafGapNotes],
      ['Threshold Gap', analysisData.thresholdGap + 'mm', analysisData.thresholdGapNotes],
      ['Seals Condition', analysisData.sealsCondition, analysisData.sealsNotes],
      ['Hinges Condition', analysisData.hingesCondition, analysisData.hingesNotes],
      ['Glass Panels', analysisData.glassCondition, analysisData.glassNotes],
      [''],
      ['Overall Assessment'],
      ['Compliance Status', analysisData.complianceStatus],
      ['Risk Level', analysisData.riskLevel],
      ['Recommended Actions', analysisData.recommendations],
      ['Additional Notes', analysisData.additionalNotes]
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{ wch: 20 }, { wch: 30 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, ws, 'AI Analysis');
    XLSX.writeFile(wb, `fire-door-ai-analysis-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const analyzeImage = async () => {
    if (!selectedFile) {
      setError('Please select an image to analyze');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('photo', selectedFile);

    try {
      const response = await fetch('http://localhost:5001/api/analyze-door', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to analyze image');
      }

      if (!data.analysis) {
        throw new Error('No analysis results received');
      }
      
      setAnalysis(data.analysis);
      generateExcelReport(data.analysis);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-survey-page">
      <header className="ai-survey-header">
        <h1>AI Door Survey Analysis</h1>
        <p>Upload a door photo for instant AI-powered analysis</p>
      </header>

      <main className="ai-survey-content">
        <div 
          className="upload-section"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {!previewUrl ? (
            <>
              <div className="upload-prompt">
                <span className="upload-icon">📸</span>
                <p>Drag & drop your door photo here or</p>
                <label className="upload-button">
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </>
          ) : (
            <div className="preview-section">
              <img src={previewUrl} alt="Door preview" className="door-preview" />
              <button 
                className="change-photo"
                onClick={() => {
                  setPreviewUrl(null);
                  setSelectedFile(null);
                  setAnalysis(null);
                }}
              >
                Change Photo
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {previewUrl && !analysis && !loading && (
          <button 
            className="analyze-button"
            onClick={analyzeImage}
            disabled={loading}
          >
            {loading ? 'Analyzing...' : 'Start Analysis'}
          </button>
        )}

        {loading && (
          <div className="loading-section">
            <div className="loading-spinner"></div>
            <p>Analyzing door photo...</p>
          </div>
        )}

        {analysis && (
          <div className="analysis-results">
            <h2>Analysis Results</h2>
            
            <div className="result-section">
              <h3>Door Specifications</h3>
              <div className="result-grid">
                <div className="result-item">
                  <label>Door Type</label>
                  <span>{analysis.doorType}</span>
                </div>
                <div className="result-item">
                  <label>Fire Rating</label>
                  <span>{analysis.fireRating}</span>
                </div>
              </div>
            </div>

            <div className="result-section">
              <h3>Measurements</h3>
              <div className="result-grid">
                <div className="result-item">
                  <label>Leaf Gap</label>
                  <span>{analysis.leafGap}mm</span>
                </div>
                <div className="result-item">
                  <label>Threshold Gap</label>
                  <span>{analysis.thresholdGap}mm</span>
                </div>
              </div>
            </div>

            <div className="result-section">
              <h3>Condition Assessment</h3>
              <div className="result-grid">
                <div className="result-item">
                  <label>Seals Condition</label>
                  <span>{analysis.sealsCondition}</span>
                </div>
                <div className="result-item">
                  <label>Hinges Condition</label>
                  <span>{analysis.hingesCondition}</span>
                </div>
                <div className="result-item">
                  <label>Glass Panels</label>
                  <span>{analysis.glassCondition}</span>
                </div>
              </div>
            </div>

            <div className="result-section">
              <h3>Overall Assessment</h3>
              <div className="assessment-box">
                <div className={`compliance-status ${analysis.complianceStatus.toLowerCase()}`}>
                  {analysis.complianceStatus}
                </div>
                <div className={`risk-level ${analysis.riskLevel.toLowerCase()}`}>
                  Risk Level: {analysis.riskLevel}
                </div>
              </div>
            </div>

            <div className="result-section">
              <h3>Recommendations</h3>
              <p className="recommendations">{analysis.recommendations}</p>
            </div>

            <div className="action-buttons">
              <button 
                className="download-button"
                onClick={() => generateExcelReport(analysis)}
              >
                Download Report
              </button>
              <button 
                className="new-analysis-button"
                onClick={() => {
                  setPreviewUrl(null);
                  setSelectedFile(null);
                  setAnalysis(null);
                }}
              >
                New Analysis
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AISurveyPage; 