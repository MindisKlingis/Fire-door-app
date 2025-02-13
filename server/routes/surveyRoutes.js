const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const surveyController = require('../controllers/surveyController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    req.fileValidationError = 'Only image files are allowed!';
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
}).array('photos', 10);

// Survey routes
router.post('/', surveyController.createSurvey);
router.get('/', surveyController.getAllSurveys);
router.get('/:id', surveyController.getSurveyById);
router.put('/:id', surveyController.updateSurvey);
router.delete('/:id', surveyController.deleteSurvey);

// Photo upload route with enhanced error handling
router.post('/:id/photos', (req, res) => {
  upload(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB'
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message
      });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    // If file validation error occurred
    if (req.fileValidationError) {
      return res.status(400).json({
        success: false,
        message: req.fileValidationError
      });
    }

    // Check if files were actually uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one file'
      });
    }

    try {
      // Process the uploaded files
      await surveyController.addPhotos(req, res);
    } catch (error) {
      console.error('Photo processing error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error processing uploaded photos',
        error: error.message
      });
    }
  });
});

router.put('/:surveyId/photos/:photoIndex/analysis', surveyController.updatePhotoAnalysis);

module.exports = router; 