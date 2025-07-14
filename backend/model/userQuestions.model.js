import mongoose from 'mongoose';

const userQuestionsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
    unique: true // Each user can only have one set of questions
  },
  risk: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High']
  },
  goal: {
    type: String,
    required: true,
    enum: ['Wealth Growth', 'Retirement', 'Short-Term Gains', 'Passive Income']
  },
  investmentDuration: {
    type: String,
    required: true,
    enum: ['Short-term (1-3 years)', 'Medium-term (3-7 years)', 'Long-term (7+ years)']
  },
  experience: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const UserQuestions = mongoose.model('UserQuestions', userQuestionsSchema);

export default UserQuestions;
