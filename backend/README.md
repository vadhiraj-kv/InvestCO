# Investment App Backend

This backend handles user authentication, survey questions, and investment calculator data.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the backend directory:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/investment-app
   ```

3. **Start the Server**
   ```bash
   npm start
   ```

## API Endpoints

### User Routes (`/api/users`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /profile/:id` - Get user profile
- `GET /all` - Get all users

### User Questions Routes (`/api/questions`)
- `POST /save` - Save user survey answers
- `GET /:userId` - Get user questions by userId
- `GET /status/:userId` - Check if user has completed questions
- `DELETE /:userId` - Delete user questions

### Investment Calculator Routes (`/api/calculator`)
- `POST /save` - Save investment calculator data
- `GET /:userId` - Get calculator data by userId
- `GET /status/:userId` - Check if user has completed calculator
- `GET /profile/:userId` - Get complete user profile (questions + calculator)
- `DELETE /:userId` - Delete calculator data

## Data Models

### UserQuestions
- `userId` - Reference to Users collection
- `risk` - Risk tolerance (Low, Medium, High)
- `goal` - Investment goal
- `investmentDuration` - Investment duration
- `experience` - Investment experience
- `completedAt` - Completion timestamp

### InvestmentCalculator
- `userId` - Reference to Users collection
- `investmentAmount` - Investment amount
- `amountType` - SIP or Lumpsum
- `duration` - Investment duration in years
- `riskProfile` - Risk profile (Low, Moderate, High)
- `totalAmount` - Calculated total amount
- `surveyAnswers` - Reference to survey answers
- `completedAt` - Completion timestamp

## Features

1. **User Progress Tracking** - Tracks if user has completed questions and calculator
2. **Data Persistence** - Saves all user inputs to MongoDB
3. **Skip Logic** - Users who have completed steps are automatically redirected
4. **Error Handling** - Graceful error handling with fallbacks
5. **Data Validation** - Input validation on all endpoints

## Testing

The frontend will automatically check user completion status and:
- Skip questions if already completed
- Skip calculator if already completed  
- Go directly to dashboard if both are completed
- Load existing data if partially completed
