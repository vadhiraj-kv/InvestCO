// Mock user service functions
// In a real app, these would connect to your backend API

export const getUserProfile = async () => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'user123',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        phone: '+91 9876543210',
        kycVerified: true,
        joinDate: '2023-01-15'
      });
    }, 500);
  });
};

export const getInvestmentData = async () => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalInvested: 250000,
        currentValue: 285000,
        returns: 14.0,
        portfolios: [
          {
            id: 'port1',
            name: 'Retirement Fund',
            invested: 150000,
            currentValue: 172500,
            returns: 15.0,
            allocation: {
              equity: 70,
              debt: 20,
              gold: 5,
              cash: 5
            }
          },
          {
            id: 'port2',
            name: 'Tax Saving',
            invested: 50000,
            currentValue: 54000,
            returns: 8.0,
            allocation: {
              equity: 80,
              debt: 20,
              gold: 0,
              cash: 0
            }
          },
          {
            id: 'port3',
            name: 'Emergency Fund',
            invested: 50000,
            currentValue: 58500,
            returns: 17.0,
            allocation: {
              equity: 30,
              debt: 40,
              gold: 10,
              cash: 20
            }
          }
        ],
        sips: [
          {
            id: 'sip1',
            name: 'Monthly Core',
            amount: 10000,
            startDate: '2023-02-01',
            nextDate: '2023-07-01'
          },
          {
            id: 'sip2',
            name: 'Tax Saving ELSS',
            amount: 5000,
            startDate: '2023-03-15',
            nextDate: '2023-07-15'
          }
        ]
      });
    }, 700);
  });
};

export const updateUserProfile = async (profileData) => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Profile updated successfully'
      });
    }, 800);
  });
};

export const updateInvestmentPlan = async (planData) => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Investment plan updated successfully',
        plan: planData
      });
    }, 600);
  });
};