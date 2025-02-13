const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
  doorId: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    text: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  fireResistanceRating: {
    type: String,
    required: true,
    enum: ['FD30', 'FD30s', 'FD60', 'FD60s']
  },
  complianceStatus: {
    type: String,
    required: true,
    enum: ['Compliant', 'Non-compliant']
  },
  inspectionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  conditionDetails: {
    type: String,
    required: true
  },
  inspectorName: {
    type: String,
    default: 'Anonymous'
  },
  followUpActions: {
    type: String,
    required: function() {
      return this.complianceStatus === 'Non-compliant';
    }
  },
  photos: [{
    url: String,
    aiAnalysis: {
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
      },
      results: Object,
      completedAt: Date
    }
  }],
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

module.exports = mongoose.model('Survey', surveySchema); 