import UserQuestions from '../model/userQuestions.model.js';

// Save user questions (survey answers)
export const saveUserQuestions = async (req, res) => {
  try {
    const { userId, risk, goal, investmentDuration, experience } = req.body;

    // Validate required fields
    if (!userId || !risk || !goal || !investmentDuration || !experience) {
      return res.status(400).json({ 
        error: 'All fields are required: userId, risk, goal, investmentDuration, experience' 
      });
    }

    // Check if user questions already exist
    const existingQuestions = await UserQuestions.findOne({ userId });
    
    if (existingQuestions) {
      // Update existing questions
      existingQuestions.risk = risk;
      existingQuestions.goal = goal;
      existingQuestions.investmentDuration = investmentDuration;
      existingQuestions.experience = experience;
      existingQuestions.completedAt = new Date();
      
      await existingQuestions.save();
      
      return res.status(200).json({
        success: true,
        message: 'User questions updated successfully',
        data: existingQuestions
      });
    } else {
      // Create new questions
      const newQuestions = new UserQuestions({
        userId,
        risk,
        goal,
        investmentDuration,
        experience
      });

      await newQuestions.save();

      return res.status(201).json({
        success: true,
        message: 'User questions saved successfully',
        data: newQuestions
      });
    }
  } catch (error) {
    console.error('Error saving user questions:', error);
    return res.status(500).json({ 
      error: 'Server error while saving user questions' 
    });
  }
};

// Get user questions by userId
export const getUserQuestions = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const userQuestions = await UserQuestions.findOne({ userId }).populate('userId', 'firstName lastName email');

    if (!userQuestions) {
      return res.status(404).json({ 
        success: false,
        message: 'User questions not found' 
      });
    }

    return res.status(200).json({
      success: true,
      data: userQuestions
    });
  } catch (error) {
    console.error('Error fetching user questions:', error);
    return res.status(500).json({ 
      error: 'Server error while fetching user questions' 
    });
  }
};

// Check if user has completed questions
export const checkUserQuestionsStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const userQuestions = await UserQuestions.findOne({ userId });

    return res.status(200).json({
      success: true,
      hasCompletedQuestions: !!userQuestions,
      data: userQuestions || null
    });
  } catch (error) {
    console.error('Error checking user questions status:', error);
    return res.status(500).json({ 
      error: 'Server error while checking user questions status' 
    });
  }
};

// Delete user questions
export const deleteUserQuestions = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const deletedQuestions = await UserQuestions.findOneAndDelete({ userId });

    if (!deletedQuestions) {
      return res.status(404).json({ 
        error: 'User questions not found' 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User questions deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user questions:', error);
    return res.status(500).json({ 
      error: 'Server error while deleting user questions' 
    });
  }
};
