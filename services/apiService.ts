// API service for backend communication
// Multiple URL options - try them in order until one works
const POSSIBLE_URLS = [
  'http://10.0.2.2:3000/api',      // Android emulator
  'http://localhost:3000/api',      // iOS simulator / Web
  'http://127.0.0.1:3000/api',     // Alternative localhost
  'http://192.168.1.100:3000/api', // Physical device (update with your IP)
];

let BASE_URL = POSSIBLE_URLS[0]; // Start with Android emulator

// Function to test and find working URL
const findWorkingURL = async () => {
  for (const url of POSSIBLE_URLS) {
    try {
      console.log(`Testing URL: ${url}/test`);
      const response = await fetch(`${url}/test`, {
        method: 'GET',
        timeout: 5000 // 5 second timeout
      });
      if (response.ok) {
        console.log(`✅ Working URL found: ${url}`);
        BASE_URL = url;
        return url;
      }
    } catch (error) {
      console.log(`❌ Failed URL: ${url}`, error.message);
    }
  }
  throw new Error('No working backend URL found');
};

// Test API connectivity
export const testAPI = {
  checkConnection: async () => {
    try {
      console.log('Testing connection to:', `${BASE_URL}/test`);
      const response = await fetch(`${BASE_URL}/test`);
      const data = await response.json();
      console.log('Test response:', data);
      return data;
    } catch (error) {
      console.error('Connection test failed, trying to find working URL...');
      // Try to find a working URL
      await findWorkingURL();
      // Retry with the new URL
      const response = await fetch(`${BASE_URL}/test`);
      const data = await response.json();
      console.log('Test response with new URL:', data);
      return data;
    }
  }
};

// User Questions API
export const userQuestionsAPI = {
  // Save user questions (survey answers)
  saveQuestions: async (userId: string, questionsData: {
    risk: string;
    goal: string;
    investmentDuration: string;
    experience: string;
  }) => {
    try {
      console.log('Attempting to save questions to:', `${BASE_URL}/questions/save`);
      console.log('Request data:', { userId, ...questionsData });

      const response = await fetch(`${BASE_URL}/questions/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...questionsData
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save questions');
      }

      return data;
    } catch (error) {
      console.error('Error saving questions:', error);
      console.error('Error details:', error.message);
      throw error;
    }
  },

  // Get user questions
  getQuestions: async (userId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/questions/${userId}`);
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, data: null };
        }
        throw new Error(data.error || 'Failed to fetch questions');
      }

      return data;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  },

  // Check if user has completed questions
  checkQuestionsStatus: async (userId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/questions/status/${userId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check questions status');
      }

      return data;
    } catch (error) {
      console.error('Error checking questions status:', error);
      throw error;
    }
  }
};

// Investment Calculator API
export const investmentCalculatorAPI = {
  // Save investment calculator data
  saveCalculator: async (userId: string, calculatorData: {
    investmentAmount: number;
    amountType: string;
    duration: number;
    riskProfile: string;
    totalAmount: number;
    surveyAnswers?: any;
  }) => {
    try {
      const response = await fetch(`${BASE_URL}/calculator/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...calculatorData
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save calculator data');
      }

      return data;
    } catch (error) {
      console.error('Error saving calculator data:', error);
      throw error;
    }
  },

  // Get investment calculator data
  getCalculator: async (userId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/calculator/${userId}`);
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, data: null };
        }
        throw new Error(data.error || 'Failed to fetch calculator data');
      }

      return data;
    } catch (error) {
      console.error('Error fetching calculator data:', error);
      throw error;
    }
  },

  // Check if user has completed calculator
  checkCalculatorStatus: async (userId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/calculator/status/${userId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check calculator status');
      }

      return data;
    } catch (error) {
      console.error('Error checking calculator status:', error);
      throw error;
    }
  },

  // Get user's complete profile (questions + calculator)
  getUserCompleteProfile: async (userId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/calculator/profile/${userId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user profile');
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
};

// Combined API for checking user completion status
export const userProfileAPI = {
  // Check if user has completed both questions and calculator
  checkUserCompletionStatus: async (userId: string) => {
    try {
      const profileData = await investmentCalculatorAPI.getUserCompleteProfile(userId);
      
      return {
        success: true,
        hasCompletedQuestions: profileData.hasCompletedQuestions,
        hasCompletedCalculator: profileData.hasCompletedCalculator,
        questionsData: profileData.questionsData,
        calculatorData: profileData.calculatorData,
        shouldSkipQuestions: profileData.hasCompletedQuestions,
        shouldSkipCalculator: profileData.hasCompletedCalculator,
        canGoDirectlyToDashboard: profileData.hasCompletedQuestions && profileData.hasCompletedCalculator
      };
    } catch (error) {
      console.error('Error checking user completion status:', error);
      // Return default values if API fails
      return {
        success: false,
        hasCompletedQuestions: false,
        hasCompletedCalculator: false,
        questionsData: null,
        calculatorData: null,
        shouldSkipQuestions: false,
        shouldSkipCalculator: false,
        canGoDirectlyToDashboard: false
      };
    }
  }
};

// Risk Assessment API
export const riskAssessmentAPI = {
  // Assess user risk based on survey responses
  assessRisk: async (userId: string, surveyData: any, investmentAmount?: number, timeHorizon?: string) => {
    try {
      console.log('Assessing risk for user:', userId);
      const response = await fetch(`${BASE_URL}/risk/assess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          surveyData,
          investmentAmount,
          timeHorizon
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assess risk');
      }

      return data;
    } catch (error) {
      console.error('Error assessing risk:', error);
      throw error;
    }
  },

  // Get asset allocation for specific risk level
  getAssetAllocation: async (riskLevel: string, investmentAmount?: number, timeHorizon?: string) => {
    try {
      const params = new URLSearchParams({
        riskLevel,
        ...(investmentAmount && { investmentAmount: investmentAmount.toString() }),
        ...(timeHorizon && { timeHorizon })
      });

      const response = await fetch(`${BASE_URL}/risk/allocation?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get asset allocation');
      }

      return data;
    } catch (error) {
      console.error('Error getting asset allocation:', error);
      throw error;
    }
  },

  // Get risk level explanation
  getRiskExplanation: async (riskLevel: string) => {
    try {
      const response = await fetch(`${BASE_URL}/risk/explanation/${riskLevel}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get risk explanation');
      }

      return data;
    } catch (error) {
      console.error('Error getting risk explanation:', error);
      throw error;
    }
  }
};
