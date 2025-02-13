const OpenAI = require('openai');
const fs = require('fs').promises;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.analyzeDoorPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No photo uploaded'
      });
    }

    // Read the image file as base64
    const imageBuffer = await fs.readFile(req.file.path);
    const base64Image = imageBuffer.toString('base64');

    // Prepare the message for OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this fire door image and provide a detailed assessment. Include:\n1. Door type (single/double/leaf & half)\n2. Fire rating estimation\n3. Leaf gap measurements\n4. Threshold gap measurements\n5. Seals condition\n6. Hinges condition\n7. Glass panels condition (if present)\n8. Overall compliance status\n9. Risk level assessment\n10. Specific recommendations"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    // Process the AI response
    const analysis = response.choices[0].message.content;
    
    // Parse the analysis text to extract structured data
    const analysisData = {
      doorType: extractFromAnalysis(analysis, 'door type', 'Single'),
      fireRating: extractFromAnalysis(analysis, 'fire rating', 'FD30'),
      leafGap: extractMeasurement(analysis, 'leaf gap', 3),
      thresholdGap: extractMeasurement(analysis, 'threshold gap', 8),
      sealsCondition: extractCondition(analysis, 'seals'),
      hingesCondition: extractCondition(analysis, 'hinges'),
      glassCondition: extractCondition(analysis, 'glass'),
      complianceStatus: determineComplianceStatus(analysis),
      riskLevel: determineRiskLevel(analysis),
      recommendations: extractRecommendations(analysis),
      doorTypeNotes: extractNotes(analysis, 'door type'),
      fireRatingNotes: extractNotes(analysis, 'fire rating'),
      leafGapNotes: extractNotes(analysis, 'leaf gap'),
      thresholdGapNotes: extractNotes(analysis, 'threshold gap'),
      sealsNotes: extractNotes(analysis, 'seals'),
      hingesNotes: extractNotes(analysis, 'hinges'),
      glassNotes: extractNotes(analysis, 'glass'),
      additionalNotes: extractAdditionalNotes(analysis)
    };

    // Clean up the uploaded file
    await fs.unlink(req.file.path);

    res.json({
      success: true,
      analysis: analysisData
    });

  } catch (error) {
    console.error('AI Analysis error:', error);
    
    // Clean up the uploaded file in case of error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    let errorMessage = 'Failed to analyze photo';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
};

// Helper functions to extract information from AI analysis text
function extractFromAnalysis(text, category, defaultValue) {
  const regex = new RegExp(`${category}[:\\s-]+(\\w+(?:\\s+\\w+)*)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : defaultValue;
}

function extractMeasurement(text, category, defaultValue) {
  const regex = new RegExp(`${category}[:\\s-]+([\\d.]+)\\s*mm`, 'i');
  const match = text.match(regex);
  return match ? parseFloat(match[1]) : defaultValue;
}

function extractCondition(text, category) {
  const regex = new RegExp(`${category}[^.]*?(?:condition|status)[:\\s-]+(\\w+)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : 'Not specified';
}

function determineComplianceStatus(text) {
  if (text.toLowerCase().includes('non-compliant') || 
      text.toLowerCase().includes('not compliant')) {
    return 'Non-compliant';
  }
  if (text.toLowerCase().includes('compliant')) {
    return 'Compliant';
  }
  return 'Requires Assessment';
}

function determineRiskLevel(text) {
  const lowRiskTerms = ['low risk', 'minor', 'good condition'];
  const highRiskTerms = ['high risk', 'severe', 'critical', 'immediate action'];
  
  const textLower = text.toLowerCase();
  
  if (highRiskTerms.some(term => textLower.includes(term))) {
    return 'High';
  }
  if (lowRiskTerms.some(term => textLower.includes(term))) {
    return 'Low';
  }
  return 'Medium';
}

function extractRecommendations(text) {
  const recommendationRegex = /recommend(?:ation|ed)?s?:?\s*([^.]+(?:\.[^.]+)*)/i;
  const match = text.match(recommendationRegex);
  return match ? match[1].trim() : 'No specific recommendations provided';
}

function extractNotes(text, category) {
  const sentences = text.split(/[.!?]+/);
  const relevantSentences = sentences.filter(sentence => 
    sentence.toLowerCase().includes(category.toLowerCase())
  );
  return relevantSentences.length > 0 ? 
    relevantSentences.join('. ').trim() : 
    'No specific notes available';
}

function extractAdditionalNotes(text) {
  const excludeCategories = ['door type', 'fire rating', 'leaf gap', 'threshold gap', 
    'seals', 'hinges', 'glass', 'compliance', 'risk', 'recommend'];
  
  const sentences = text.split(/[.!?]+/);
  const additionalSentences = sentences.filter(sentence => 
    !excludeCategories.some(category => 
      sentence.toLowerCase().includes(category.toLowerCase())
    )
  );
  
  return additionalSentences.length > 0 ? 
    additionalSentences.join('. ').trim() : 
    'No additional notes available';
} 