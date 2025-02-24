const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
  doorNumber: {
    type: String,
    required: true
  },
  floor: String,
  room: String,
  locationOfDoorSet: {
    type: String,
    required: true
  },
  doorType: String,
  doorConfiguration: String,
  doorMaterial: String,
  rating: String,
  surveyed: String,
  leafGap: String,
  thresholdGap: String,
  combinedStripsCondition: String,
  selfCloserFunctional: String,
  hingesCondition: String,
  glazingSufficient: String,
  fanLightsSufficient: String,
  upgradeReplacement: String,
  overallCondition: String,
  notes: String,
  photos: [{
    url: String,
    type: String,
    aiAnalysis: {
      status: String,
      results: mongoose.Schema.Types.Mixed,
      completedAt: Date
    }
  }],
  drawing: {
    url: String,
    uploadedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
surveySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Survey = mongoose.model('Survey', surveySchema);

// Drop the problematic index when the model is created
mongoose.connection.on('connected', async () => {
  try {
    await mongoose.connection.db.collection('surveys').dropIndex('doorId_1');
    console.log('Successfully dropped doorId_1 index');
  } catch (error) {
    // Index might not exist, which is fine
    console.log('Note: doorId_1 index not found or already dropped');
  }
});

module.exports = Survey; 