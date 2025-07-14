import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import userRoutes from './routes/user.routes.js';
import userQuestionsRoutes from './routes/userQuestions.routes.js';
import investmentCalculatorRoutes from './routes/investmentCalculator.routes.js';


dotenv.config();

const app = express();

app.use(express.json());

// Test route
app.get('/api/test', (_, res) => {
  res.json({
    success: true,
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  });
});





// Routes
app.use('/api/users', userRoutes);
app.use('/api/questions', userQuestionsRoutes);
app.use('/api/calculator', investmentCalculatorRoutes);

// ML Risk Prediction Route
console.log('Registering ML prediction route: /api/risk/predict');
app.post('/api/risk/predict', async (req, res) => {
  console.log('ML prediction route called');
  try {
    const { surveyResponses } = req.body;

    if (!surveyResponses) {
      return res.status(400).json({
        success: false,
        error: 'Survey responses are required'
      });
    }

    console.log('Survey-based ML Risk Prediction Request:', surveyResponses);

    // Call Python ML model with survey responses
    const { spawn } = require('child_process');
    const path = require('path');

    const pythonScriptPath = path.join(__dirname, '..', 'ml_models', 'predict_survey_risk.py');
    const surveyDataJson = JSON.stringify(surveyResponses);

    console.log('Calling Python script:', pythonScriptPath);
    console.log('With data:', surveyDataJson);
    console.log('Working directory:', process.cwd());

    const pythonProcess = spawn('python', [pythonScriptPath, surveyDataJson], {
      timeout: 15000 // 15 second timeout
    });

    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const prediction = JSON.parse(result.trim());
          console.log('ML Prediction Result:', prediction);

          res.json({
            success: true,
            prediction: prediction,
            method: 'survey_based_ml',
            timestamp: new Date().toISOString()
          });
        } catch (parseError) {
          console.error('Failed to parse ML result:', parseError);
          console.error('Raw result:', result);
          res.status(500).json({
            success: false,
            error: 'Failed to parse ML prediction result'
          });
        }
      } else {
        console.error('Python script failed with code:', code);
        console.error('Error output:', error);
        res.status(500).json({
          success: false,
          error: 'ML prediction failed'
        });
      }
    });

    pythonProcess.on('error', (err) => {
      console.error('Failed to start Python process:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to start ML prediction process'
      });
    });

    // Add timeout
    setTimeout(() => {
      pythonProcess.kill();
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'ML prediction timeout'
        });
      }
    }, 15000);

  } catch (error) {
    console.error('Risk prediction error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Simple test risk route
app.get('/api/risk/test', (_, res) => {
  res.json({
    success: true,
    message: 'Risk route is working!',
    timestamp: new Date().toISOString()
  });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port http://localhost:${PORT}`);
});
