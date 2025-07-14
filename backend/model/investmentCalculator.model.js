import mongoose from 'mongoose';

const investmentCalculatorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
    unique: true // Each user can only have one investment calculation
  },
  investmentAmount: {
    type: Number,
    required: true,
    min: 0
  },
  amountType: {
    type: String,
    required: true,
    enum: ['SIP', 'Lumpsum']
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 50 // Maximum 50 years
  },
  riskProfile: {
    type: String,
    required: true,
    enum: ['Low', 'Moderate', 'High']
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  // Store survey answers reference
  surveyAnswers: {
    risk: String,
    goal: String,
    investmentDuration: String,
    experience: String
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Update lastUpdated on save
investmentCalculatorSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

const InvestmentCalculator = mongoose.model('InvestmentCalculator', investmentCalculatorSchema);

export default InvestmentCalculator;
