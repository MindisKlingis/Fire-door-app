const fs = require('fs').promises;
const OpenAI = require('openai');

class ImageAnalysisService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('Warning: OPENAI_API_KEY not found in environment variables');
    }
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async analyzeGap(imagePath) {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return {
          success: false,
          error: 'OpenAI API key not configured'
        };
      }

      // Read the image file as base64
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');

      // Prepare the message for OpenAI Vision API
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this fire door image and measure the gaps. Focus on:\n1. Leaf gap (gap between door and frame)\n2. Threshold gap (gap under the door)\nProvide measurements in millimeters. If you can't determine exact measurements, provide estimates based on standard door dimensions."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 500
      });

      // Process the AI response
      const analysis = response.choices[0].message.content;
      
      // Extract measurements using regex
      const leafGapMatch = analysis.match(/leaf gap.*?(\d+(?:\.\d+)?)/i);
      const thresholdGapMatch = analysis.match(/threshold gap.*?(\d+(?:\.\d+)?)/i);

      return {
        success: true,
        measurements: {
          leafGap: leafGapMatch ? parseFloat(leafGapMatch[1]) : null,
          thresholdGap: thresholdGapMatch ? parseFloat(thresholdGapMatch[1]) : null,
          confidence: 0.8,
          details: [analysis]
        },
        message: 'Image analyzed successfully using OpenAI Vision'
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