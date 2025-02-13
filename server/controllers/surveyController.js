const Survey = require('../models/surveyModel');
const imageAnalysisService = require('../services/imageAnalysisService');

// Create a new survey
exports.createSurvey = async (req, res) => {
  try {
    // Create a new survey document
    const surveyData = {
      doorId: `DOOR-${Date.now()}`,
      location: {
        text: req.body.locationOfDoorSet
      },
      fireResistanceRating: req.body.rating,
      doorType: req.body.doorType,
      surveyed: req.body.surveyed,
      upgradeReplacement: req.body.upgradeReplacement,
      overallCondition: req.body.overallCondition,
      room: req.body.room,
      floor: req.body.floor,
      complianceStatus: req.body.overallCondition === 'Poor' ? 'Non-compliant' : 'Compliant',
      inspectionDate: new Date(),
      conditionDetails: JSON.stringify({
        leafGap: req.body.leafGap,
        thresholdGap: req.body.thresholdGap,
        combinedStripsCondition: req.body.combinedStripsCondition,
        selfCloserFunctional: req.body.selfCloserFunctional,
        hingesCondition: req.body.hingesCondition,
        glazingSufficient: req.body.glazingSufficient,
        fanLightsSufficient: req.body.fanLightsSufficient,
        notes: req.body.notes
      }),
      inspectorName: 'Anonymous',
      photos: []
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
exports.getAllSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find().sort({ createdAt: -1 });
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single survey by ID
exports.getSurveyById = async (req, res) => {
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
exports.updateSurvey = async (req, res) => {
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
exports.deleteSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }
    
    await survey.remove();
    res.json({ message: 'Survey deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add photos to a survey
exports.addPhotos = async (req, res) => {
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
        aiAnalysis: {
          status: analysisResult.success ? 'completed' : 'failed',
          results: analysisResult.measurements || null,
          completedAt: new Date()
        }
      };
    });

    const processedPhotos = await Promise.all(photoPromises);
    survey.photos.push(...processedPhotos);

    // Update survey measurements if AI analysis was successful
    const successfulAnalyses = processedPhotos
      .filter(photo => photo.aiAnalysis.status === 'completed' && photo.aiAnalysis.results)
      .map(photo => photo.aiAnalysis.results);

    if (successfulAnalyses.length > 0) {
      // Calculate average measurements from all successful analyses
      const avgMeasurements = successfulAnalyses.reduce((acc, curr) => ({
        leafGap: (acc.leafGap || 0) + (curr.leafGap || 0),
        thresholdGap: (acc.thresholdGap || 0) + (curr.thresholdGap || 0),
        confidence: (acc.confidence || 0) + (curr.confidence || 0)
      }), {});

      const numAnalyses = successfulAnalyses.length;
      const updatedData = {
        leafGap: Math.round(avgMeasurements.leafGap / numAnalyses).toString(),
        thresholdGap: Math.round(avgMeasurements.thresholdGap / numAnalyses).toString()
      };

      // Update the condition details with AI measurements
      const conditionDetails = JSON.parse(survey.conditionDetails);
      Object.assign(conditionDetails, updatedData);
      survey.conditionDetails = JSON.stringify(conditionDetails);
    }

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
exports.updatePhotoAnalysis = async (req, res) => {
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