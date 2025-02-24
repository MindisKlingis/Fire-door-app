const fs = require('fs').promises;

class ImageAnalysisService {
  constructor() {
    this.isAIEnabled = false;
    if (!process.env.OPENAI_API_KEY) {
      console.warn('Warning: OPENAI_API_KEY not found in environment variables. AI analysis will be disabled.');
    } else {
      this.isAIEnabled = true;
    }
  }

  async analyzeGap(imagePath) {
    try {
      if (!this.isAIEnabled) {
        return {
          success: true,
          measurements: {
            leafGap: null,
            thresholdGap: null,
            confidence: 0,
            details: ['AI analysis is disabled']
          },
          message: 'AI analysis is disabled. Manual measurements required.'
        };
      }

      // Since AI is disabled, we'll just return a placeholder response
      return {
        success: true,
        measurements: {
          leafGap: null,
          thresholdGap: null,
          confidence: 0,
          details: ['AI analysis is disabled']
        },
        message: 'AI analysis is disabled. Manual measurements required.'
      };
    } catch (error) {
      console.error('Error analyzing image:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export a singleton instance
const imageAnalysisService = new ImageAnalysisService();
module.exports = imageAnalysisService; 