import InvestmentCalculator from '../model/investmentCalculator.model.js';
import UserQuestions from '../model/userQuestions.model.js';

// Save investment calculator data
export const saveInvestmentCalculator = async (req, res) => {
  try {
    const { 
      userId, 
      investmentAmount, 
      amountType, 
      duration, 
      riskProfile, 
      totalAmount,
      surveyAnswers 
    } = req.body;

    // Validate required fields
    if (!userId || !investmentAmount || !amountType || !duration || !riskProfile || !totalAmount) {
      return res.status(400).json({ 
        error: 'All fields are required: userId, investmentAmount, amountType, duration, riskProfile, totalAmount' 
      });
    }

    // Validate amount type
    if (!['SIP', 'Lumpsum'].includes(amountType)) {
      return res.status(400).json({ 
        error: 'Amount type must be either SIP or Lumpsum' 
      });
    }

    // Validate risk profile
    if (!['Low', 'Moderate', 'High'].includes(riskProfile)) {
      return res.status(400).json({ 
        error: 'Risk profile must be Low, Moderate, or High' 
      });
    }

    // Check if investment calculator data already exists
    const existingCalculator = await InvestmentCalculator.findOne({ userId });
    
    if (existingCalculator) {
      // Update existing calculator data
      existingCalculator.investmentAmount = investmentAmount;
      existingCalculator.amountType = amountType;
      existingCalculator.duration = duration;
      existingCalculator.riskProfile = riskProfile;
      existingCalculator.totalAmount = totalAmount;
      existingCalculator.surveyAnswers = surveyAnswers || existingCalculator.surveyAnswers;
      existingCalculator.completedAt = new Date();
      
      await existingCalculator.save();
      
      return res.status(200).json({
        success: true,
        message: 'Investment calculator data updated successfully',
        data: existingCalculator
      });
    } else {
      // Create new calculator data
      const newCalculator = new InvestmentCalculator({
        userId,
        investmentAmount,
        amountType,
        duration,
        riskProfile,
        totalAmount,
        surveyAnswers
      });

      await newCalculator.save();

      return res.status(201).json({
        success: true,
        message: 'Investment calculator data saved successfully',
        data: newCalculator
      });
    }
  } catch (error) {
    console.error('Error saving investment calculator data:', error);
    return res.status(500).json({ 
      error: 'Server error while saving investment calculator data' 
    });
  }
};

// Get investment calculator data by userId
export const getInvestmentCalculator = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const calculatorData = await InvestmentCalculator.findOne({ userId }).populate('userId', 'firstName lastName email');

    if (!calculatorData) {
      return res.status(404).json({ 
        success: false,
        message: 'Investment calculator data not found' 
      });
    }

    return res.status(200).json({
      success: true,
      data: calculatorData
    });
  } catch (error) {
    console.error('Error fetching investment calculator data:', error);
    return res.status(500).json({ 
      error: 'Server error while fetching investment calculator data' 
    });
  }
};

// Check if user has completed investment calculator
export const checkInvestmentCalculatorStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const calculatorData = await InvestmentCalculator.findOne({ userId });

    return res.status(200).json({
      success: true,
      hasCompletedCalculator: !!calculatorData,
      data: calculatorData || null
    });
  } catch (error) {
    console.error('Error checking investment calculator status:', error);
    return res.status(500).json({ 
      error: 'Server error while checking investment calculator status' 
    });
  }
};

// Get user's complete profile (questions + calculator)
export const getUserCompleteProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get both questions and calculator data
    const [questionsData, calculatorData] = await Promise.all([
      UserQuestions.findOne({ userId }),
      InvestmentCalculator.findOne({ userId })
    ]);

    return res.status(200).json({
      success: true,
      hasCompletedQuestions: !!questionsData,
      hasCompletedCalculator: !!calculatorData,
      questionsData: questionsData || null,
      calculatorData: calculatorData || null
    });
  } catch (error) {
    console.error('Error fetching user complete profile:', error);
    return res.status(500).json({ 
      error: 'Server error while fetching user complete profile' 
    });
  }
};

// Delete investment calculator data
export const deleteInvestmentCalculator = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const deletedCalculator = await InvestmentCalculator.findOneAndDelete({ userId });

    if (!deletedCalculator) {
      return res.status(404).json({ 
        error: 'Investment calculator data not found' 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Investment calculator data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting investment calculator data:', error);
    return res.status(500).json({ 
      error: 'Server error while deleting investment calculator data' 
    });
  }
};
