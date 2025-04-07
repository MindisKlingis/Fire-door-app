import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import FireDoorSurveyForm from './components/FireDoorSurveyForm';
import Login from './components/Login';
import { saveSurveyData } from './api/surveyApi';
import { isAuthenticated } from './services/authService';

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const navigate = useNavigate();

  const handleSaveSurvey = async (surveyData) => {
    try {
      const result = await saveSurveyData(surveyData);
      console.log('Survey saved:', result);
      return result;
    } catch (error) {
      console.error('Error saving survey:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <FireDoorSurveyForm 
              onSave={handleSaveSurvey}
              onCancel={handleCancel}
            />
          </PrivateRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes; 