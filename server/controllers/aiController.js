// Simplified AI controller without OpenAI dependency
const imageAnalysisService = require('../services/imageAnalysisService');

const analyzeImage = async (req, res) => {
  try {
    const result = await imageAnalysisService.analyzeGap(req.file.path);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

module.exports = {
  analyzeImage
}; 