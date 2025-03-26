const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
  doorNumber: {
    type: String,
    required: true
  },
  floor: String,
  room: String,
  locationOfDoorSet: String,
  doorType: String,
  doorConfiguration: mongoose.Schema.Types.Mixed,
  doorMaterial: mongoose.Schema.Types.Mixed,
  rating: String,
  thirdPartyCertification: mongoose.Schema.Types.Mixed,
  surveyed: String,
  surveyedReason: String,
  surveyedCustomReason: String,
  isFlagged: Boolean,
  leafGap: mongoose.Schema.Types.Mixed,
  thresholdGap: String,
  leafThickness: String,
  measurements: mongoose.Schema.Types.Mixed,
  combinedStripsCondition: String,
  combinedStripsDefect: String,
  selfCloserFunctional: String,
  selfCloserDefect: String,
  selfCloserCustomDefect: String,
  hingesCondition: String,
  hingesDefect: String,
  hingesCustomDefect: String,
  frameCondition: String,
  frameDefect: String,
  frameCustomDefect: String,
  handlesSufficient: String,
  handlesDefect: String,
  handlesCustomDefect: String,
  signageSatisfactory: String,
  signageDefect: String,
  signageCustomDefect: String,
  glazingSufficient: String,
  glazingDefect: String,
  glazingCustomDefect: String,
  upgradeReplacement: String,
  overallCondition: String,
  conditionDetails: String,
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