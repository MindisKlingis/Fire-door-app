# Fire Door Survey App

A modern web application for conducting fire door surveys with AI-powered analysis capabilities. This application helps inspectors efficiently document, analyze, and maintain records of fire door inspections.

## Features

- **Digital Survey Forms**: Easy-to-use forms for documenting fire door inspections
- **Photo Upload**: Multi-photo upload with drag-and-drop functionality
- **AI Analysis**: Automated analysis of door photos to detect potential compliance issues
- **Location Tracking**: GPS coordinate capture for accurate door location recording
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Validation**: Immediate feedback on form inputs
- **Dynamic Fields**: Conditional form fields based on compliance status
- **Secure Storage**: Backend API with MongoDB for reliable data storage

## Tech Stack

- **Frontend**:
  - React.js
  - React Router for navigation
  - Modern CSS with CSS Variables
  - Responsive design principles

- **Backend**:
  - Node.js
  - Express.js
  - MongoDB with Mongoose
  - Multer for file uploads

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/fire-door-survey-app.git
   cd fire-door-survey-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/fire-door-survey
   PORT=5000
   NODE_ENV=development
   ```

4. Create an uploads directory:
   ```bash
   mkdir uploads
   ```

## Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```
   This will start both the frontend and backend servers concurrently.

2. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

```
fire-door-survey-app/
├── src/                      # Frontend source files
│   ├── components/           # React components
│   ├── pages/               # Page components
│   └── utils/               # Utility functions
├── server/                   # Backend source files
│   ├── controllers/         # Route controllers
│   ├── models/             # Database models
│   └── routes/             # API routes
├── public/                  # Static files
└── uploads/                 # Uploaded files storage
```

## API Endpoints

- `POST /api/surveys` - Create a new survey
- `GET /api/surveys` - Get all surveys
- `GET /api/surveys/:id` - Get a specific survey
- `PUT /api/surveys/:id` - Update a survey
- `DELETE /api/surveys/:id` - Delete a survey
- `POST /api/surveys/:id/photos` - Upload photos for a survey
- `PUT /api/surveys/:surveyId/photos/:photoIndex/analysis` - Update photo analysis results

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@firedoorsurvey.com or create an issue in the repository.

## Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community for the tools and libraries used
