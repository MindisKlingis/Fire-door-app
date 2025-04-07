import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { categorizeDefects } from '../utils/formHelpers';
import { DEFECT_CATEGORIES } from '../constants/surveyConstants';

const DefectManager = ({ defects, onDefectAdd, onDefectRemove, onDefectUpdate }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newDefect, setNewDefect] = useState('');
  const categorizedDefects = categorizeDefects(defects);

  const handleAddDefect = useCallback(() => {
    if (!newDefect.trim() || !selectedCategory) return;

    onDefectAdd({
      id: Date.now().toString(),
      description: newDefect.trim(),
      category: selectedCategory,
      timestamp: new Date().toISOString()
    });

    setNewDefect('');
  }, [newDefect, selectedCategory, onDefectAdd]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleAddDefect();
    }
  }, [handleAddDefect]);

  return (
    <div className="defect-manager">
      <div className="defect-input-group">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          <option value="">Select Category</option>
          {Object.entries(DEFECT_CATEGORIES).map(([key, value]) => (
            <option key={key} value={value}>
              {key.charAt(0) + key.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={newDefect}
          onChange={(e) => setNewDefect(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter defect description"
          className="defect-input"
        />
        <button
          type="button"
          onClick={handleAddDefect}
          disabled={!newDefect.trim() || !selectedCategory}
          className="add-defect-btn"
        >
          Add
        </button>
      </div>

      <div className="defects-list">
        {Object.entries(categorizedDefects).map(([category, categoryDefects]) => (
          categoryDefects.length > 0 && (
            <div key={category} className="category-group">
              <h4 className="category-header">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </h4>
              {categoryDefects.map(defect => (
                <div key={defect.id} className="defect-item">
                  <span className="defect-description">{defect.description}</span>
                  <div className="defect-actions">
                    <button
                      type="button"
                      onClick={() => onDefectUpdate(defect.id)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDefectRemove(defect.id)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ))}
      </div>
    </div>
  );
};

DefectManager.propTypes = {
  defects: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired
    })
  ).isRequired,
  onDefectAdd: PropTypes.func.isRequired,
  onDefectRemove: PropTypes.func.isRequired,
  onDefectUpdate: PropTypes.func.isRequired
};

export default DefectManager; 