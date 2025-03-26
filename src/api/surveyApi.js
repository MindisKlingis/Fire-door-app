import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001';

export const updateSurvey = async (surveyId, surveyData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/surveys/${surveyId}`, surveyData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error updating survey:', error);
    throw error;
  }
};

export const createSurvey = async (surveyData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/surveys`, surveyData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error creating survey:', error);
    throw error;
  }
};

export const fetchSurveys = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/surveys`);
    return response.data;
  } catch (error) {
    console.error('Error fetching surveys:', error);
    throw error;
  }
};

export const uploadSurveyPhoto = async (surveyId, photoType, file) => {
  try {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('photoType', photoType);
    
    const response = await axios.post(`${API_BASE_URL}/api/surveys/${surveyId}/photos`, formData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
}; 