import React from 'react';
import { Navigate } from 'react-router-dom';
import LandingPage from '../components/LandingPage';
import LoginForm from '../components/LoginForm';
import CustomerInfoForm from '../components/CustomerInfoForm';
import FireDoorSurveyForm from '../components/FireDoorSurveyForm';
import SystemArchitecture from '../components/SystemArchitecture';
import DesignTestPage from '../components/DesignTestPage';
import ButtonTestPage from '../components/ButtonTestPage';
import TestingControls from '../components/TestingControls';

// Protected Route component
export const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

// Route configurations
export const routes = [
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginForm />,
  },
  {
    path: '/customer-info',
    element: (
      <ProtectedRoute>
        <CustomerInfoForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/survey',
    element: (
      <ProtectedRoute>
        <FireDoorSurveyForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/architecture',
    element: <SystemArchitecture />,
  },
  {
    path: '/design-test',
    element: <DesignTestPage />,
  },
  {
    path: '/button-test',
    element: <ButtonTestPage />,
  },
  {
    path: '/testing-controls',
    element: <TestingControls />,
  },
]; 