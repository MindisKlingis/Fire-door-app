const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const WebSocketService = require('./services/websocket');
const CodeAnalyzer = require('./services/codeAnalyzer');
const chokidar = require('chokidar');

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://192.168.0.80:3000',
    'http://192.168.0.80:3001',
    'http://192.168.0.80:3002'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Origin', 'X-Requested-With', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
  preflightContinue: false
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong!'
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fire-door-survey')
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Import routes
const surveyRoutes = require('./routes/surveyRoutes');
const aiRoutes = require('./routes/aiRoutes');
const authRoutes = require('./routes/authRoutes');

// Use routes
app.use('/api/surveys', surveyRoutes);
app.use('/api', aiRoutes);
app.use('/api/auth', authRoutes);

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Create HTTP server
const server = require('http').createServer(app);

// Initialize WebSocket service
const wsService = new WebSocketService(server, path.join(__dirname, '..'));

// Set up file watcher
const watcher = chokidar.watch([
  path.join(__dirname, '..', 'src'),
  path.join(__dirname, 'routes'),
  path.join(__dirname, 'models')
], {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true
});

// Watch for file changes
watcher.on('change', async (path) => {
  console.log(`File ${path} has been changed`);
  await wsService.broadcastUpdate();
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Server is accessible at http://localhost:${PORT}`);
}); 