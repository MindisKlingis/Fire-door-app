const Survey = require('../models/surveyModel');
const imageAnalysisService = require('../services/imageAnalysisService');

// Create a new survey
const createSurvey = async (req, res) => {
  try {
    // Create a new survey document
    const surveyData = {
      doorNumber: req.body.doorNumber || req.body.doorPinNo,
      floor: req.body.floor,
      room: req.body.room,
      locationOfDoorSet: req.body.locationOfDoorSet,
      doorType: req.body.doorType,
      doorConfiguration: req.body.doorConfiguration || '',
      doorMaterial: req.body.doorMaterial || '',
      rating: req.body.rating,
      surveyed: req.body.surveyed,
      leafGap: req.body.leafGap,
      thresholdGap: req.body.thresholdGap,
      combinedStripsCondition: req.body.combinedStripsCondition,
      selfCloserFunctional: req.body.selfCloserFunctional,
      hingesCondition: req.body.hingesCondition,
      glazingSufficient: req.body.glazingSufficient,
      fanLightsSufficient: req.body.fanLightsSufficient,
      upgradeReplacement: req.body.upgradeReplacement,
      overallCondition: req.body.overallCondition,
      notes: req.body.notes
    };

    console.log('Received data:', req.body);
    console.log('Saving survey data:', surveyData);

    const survey = new Survey(surveyData);
    await survey.save();

    res.status(201).json({
      success: true,
      message: 'Survey created successfully',
      _id: survey._id,
      surveyData: survey
    });
  } catch (error) {
    console.error('Survey creation error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Failed to create survey',
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : null
    });
  }
};

// Get all surveys
const getAllSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find({})
      .sort('-createdAt');
    res.json(surveys);
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({ message: 'Error fetching surveys' });
  }
};

// Get a single survey by ID
const getSurveyById = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }
    res.json(survey);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a survey
const updateSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }
    
    Object.assign(survey, req.body);
    await survey.save();
    res.json(survey);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a survey
const deleteSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }
    
    await survey.deleteOne();
    res.json({ message: 'Survey deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add photos to a survey
const addPhotos = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    // Process each uploaded photo
    const photoPromises = req.files.map(async file => {
      // Perform AI analysis on the photo
      const analysisResult = await imageAnalysisService.analyzeGap(file.path);
      
      return {
        url: file.path,
        type: file.originalname,
        aiAnalysis: {
          status: analysisResult.success ? 'completed' : 'failed',
          results: analysisResult.measurements || null,
          completedAt: new Date()
        }
      };
    });

    const processedPhotos = await Promise.all(photoPromises);
    survey.photos.push(...processedPhotos);
    await survey.save();

    res.json({
      success: true,
      message: 'Photos uploaded and analyzed successfully',
      survey: survey
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to upload and analyze photos'
    });
  }
};

// Update AI analysis results for a photo
const updatePhotoAnalysis = async (req, res) => {
  try {
    const { surveyId, photoIndex } = req.params;
    const { results } = req.body;

    const survey = await Survey.findById(surveyId);
    if (!survey || !survey.photos[photoIndex]) {
      return res.status(404).json({ message: 'Survey or photo not found' });
    }

    survey.photos[photoIndex].aiAnalysis = {
      status: 'completed',
      results,
      completedAt: new Date()
    };

    await survey.save();
    res.json(survey);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const clearSurveys = async (req, res) => {
    try {
        console.log('Attempting to clear all surveys...');
        const result = await Survey.deleteMany({});
        console.log('Clear surveys result:', result);
        
        if (result.acknowledged) {
            console.log(`Successfully deleted ${result.deletedCount} surveys`);
            res.status(200).json({ 
                success: true,
                message: 'All surveys cleared successfully',
                deletedCount: result.deletedCount 
            });
        } else {
            console.error('Delete operation was not acknowledged by MongoDB');
            res.status(500).json({ 
                success: false,
                message: 'Failed to clear surveys - operation not acknowledged'
            });
        }
    } catch (error) {
        console.error('Error clearing surveys:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to clear surveys',
            error: error.message 
        });
    }
};

module.exports = {
  createSurvey,
  getAllSurveys,
  getSurveyById,
  updateSurvey,
  deleteSurvey,
  addPhotos,
  updatePhotoAnalysis,
  clearSurveys
}; 