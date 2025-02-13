import React, { useState, useEffect } from 'react';
import './AIAnalysis.css';

const AIAnalysis = ({ photoUrl, surveyId, photoIndex }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAnalysisStatus = async () => {
      try {
        const response = await fetch(`/api/surveys/${surveyId}/photos/${photoIndex}/analysis`);
        if (!response.ok) throw new Error('Failed to fetch analysis results');
        
        const data = await response.json();
        if (data.status === 'completed') {
          setAnalysis(data.results);
          setLoading(false);
        } else if (data.status === 'failed') {
          setError('Analysis failed. Please try again.');
          setLoading(false);
        }
        // Continue polling if status is 'pending'
      } catch (error) {
        setError('Failed to fetch analysis results');
        setLoading(false);
      }
    };

    const pollInterval = setInterval(checkAnalysisStatus, 5000); // Poll every 5 seconds

    // Initial check
    checkAnalysisStatus();

    return () => clearInterval(pollInterval);
  }, [surveyId, photoIndex]);

  const renderAnalysisResults = () => {
    if (!analysis) return null;

    return (
      <div className="analysis-results">
        <h4>AI Analysis Results</h4>
        
        {analysis.issues && analysis.issues.length > 0 ? (
          <>
            <p className="issues-found">Potential issues detected:</p>
            <ul className="issues-list">
              {analysis.issues.map((issue, index) => (
                <li key={index} className={`issue-item ${issue.severity}`}>
                  <span className="issue-severity">{issue.severity}</span>
                  <span className="issue-description">{issue.description}</span>
                  {issue.recommendation && (
                    <p className="issue-recommendation">
                      Recommendation: {issue.recommendation}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="no-issues">No issues detected</p>
        )}

        {analysis.confidence && (
          <div className="confidence-score">
            Confidence Score: {(analysis.confidence * 100).toFixed(1)}%
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="ai-analysis-container">
      <div className="analysis-header">
        <h3>AI Analysis</h3>
        {loading && <div className="loading-spinner">Analyzing image...</div>}
      </div>

      {error ? (
        <div className="analysis-error">{error}</div>
      ) : (
        renderAnalysisResults()
      )}
    </div>
  );
};

export default AIAnalysis; 