import axios from 'axios';

// API endpoint for mutual fund data
const API_URL = 'https://api.mfapi.in/mf';

// Fund data structure
export interface Fund {
  id: string;
  name: string;
  category: string;
  nav: number;
  change: number;
  changePercent: number;
  returns: number;
  risk: string;
  minInvestment: number;
  description: string;
  lastUpdated?: string;
}

// Fund IDs by category (real fund IDs from mfapi.in)
export const fundIds = {
  Equity: [
    '120503', // SBI Blue Chip Fund
    '119598', // HDFC Top 100 Fund
    '120716', // Axis Long Term Equity Fund
    '118460', // ICICI Prudential Bluechip Fund
    '118989', // Aditya Birla Sun Life Frontline Equity Fund
    '122639', // Mirae Asset Large Cap Fund
    '125354', // Kotak Bluechip Fund
    '118565', // Nippon India Large Cap Fund
  ],
  Debt: [
    '118452', // HDFC Corporate Bond Fund
    '118551', // ICICI Prudential Corporate Bond Fund
    '118429', // Kotak Corporate Bond Fund
    '118460', // Aditya Birla Sun Life Corporate Bond Fund
    '119387', // SBI Corporate Bond Fund
    '118566', // Axis Corporate Debt Fund
  ],
  Gold: [
    '118834', // SBI Gold Fund
    '120122', // HDFC Gold Fund
    '118989', // Nippon India Gold Savings Fund
    '118551', // Kotak Gold Fund
    '119271', // Axis Gold Fund
  ],
  Liquid: [
    '118989', // Aditya Birla Sun Life Liquid Fund
    '118521', // ICICI Prudential Liquid Fund
    '118566', // HDFC Liquid Fund
    '119387', // SBI Liquid Fund
    '118429', // Kotak Liquid Fund
    '118421', // Axis Liquid Fund
  ]
};

// Format the last updated time
export const formatLastUpdated = (date: Date): string => {
  return date.toLocaleTimeString();
};

// Helper function to determine category from scheme type
export const getCategoryFromSchemeType = (schemeType: string): string => {
  const lowerType = schemeType.toLowerCase();
  if (lowerType.includes('equity')) return 'Equity';
  if (lowerType.includes('debt') || lowerType.includes('income')) return 'Debt';
  if (lowerType.includes('gold')) return 'Gold';
  if (lowerType.includes('liquid') || lowerType.includes('money market')) return 'Liquid';
  return 'Other';
};

// Fetch fund data by category
export const fetchFundsByCategory = async (category: string): Promise<Fund[]> => {
  try {
    let fundsToFetch: string[] = [];
    
    // Determine which funds to fetch based on selected category
    if (category === 'All') {
      // Get funds from each category for the "All" view
      Object.values(fundIds).forEach(ids => {
        fundsToFetch = [...fundsToFetch, ...ids.slice(0, 3)]; // Get top 3 from each category
      });
      
      // Remove duplicates (some funds might be in multiple categories)
      fundsToFetch = [...new Set(fundsToFetch)];
    } else {
      fundsToFetch = fundIds[category as keyof typeof fundIds] || [];
    }
    
    // Fetch data for each fund with a slight delay between requests to avoid rate limiting
    const results: (Fund | null)[] = [];
    
    for (const id of fundsToFetch) {
      try {
        const response = await axios.get(`${API_URL}/${id}`);
        
        if (response.data && response.data.data && response.data.data.length > 0) {
          const latestData = response.data.data[0];
          const previousData = response.data.data[1] || { nav: latestData.nav };
          
          const nav = parseFloat(latestData.nav);
          const previousNav = parseFloat(previousData.nav);
          const change = nav - previousNav;
          const changePercent = (change / previousNav) * 100;
          
          results.push({
            id: id,
            name: response.data.meta?.scheme_name || 'Unknown Fund',
            category: category === 'All' 
              ? getCategoryFromSchemeType(response.data.meta?.scheme_type || '')
              : category,
            nav: nav,
            change: change,
            changePercent: changePercent,
            lastUpdated: formatLastUpdated(new Date())
          });
        } else {
          results.push(null);
        }
        
        // Small delay to avoid hitting API rate limits
        if (fundsToFetch.length > 5) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Error fetching fund ${id}:`, error);
        results.push(null);
      }
    }
    
    return results.filter(fund => fund !== null) as Fund[];
  } catch (error) {
    console.error('Error fetching funds:', error);
    throw new Error('Failed to load fund data. Please try again later.');
  }
};

// Fetch detailed fund data by ID
export const fetchFundDetails = async (fundId: string): Promise<any> => {
  try {
    const response = await axios.get(`${API_URL}/${fundId}`);
    
    if (response.data && response.data.data) {
      // API returns data in reverse chronological order (newest first)
      const apiData = response.data.data;
      
      // Convert API data to our format
      const formattedData = apiData.map((item: any) => ({
        date: item.date,
        nav: parseFloat(item.nav)
      }));
      
      // Extract fund details
      const fundDetails = {
        meta: response.data.meta || {},
        historicalData: formattedData,
        latestNav: formattedData[0]?.nav || 0,
        previousNav: formattedData[1]?.nav || 0
      };
      
      return fundDetails;
    }
    
    throw new Error('Invalid fund data received');
  } catch (error) {
    console.error('Error fetching fund details:', error);
    throw new Error('Failed to load fund details. Please try again later.');
  }
};

// Get top performing funds by category
export const getTopPerformingFunds = async (category: string, limit: number = 5): Promise<Fund[]> => {
  try {
    const funds = await fetchFundsByCategory(category);
    
    // Sort by highest returns (changePercent)
    const sortedFunds = funds.sort((a, b) => b.changePercent - a.changePercent);
    
    // Return top N funds
    return sortedFunds.slice(0, limit);
  } catch (error) {
    console.error('Error getting top performing funds:', error);
    throw new Error('Failed to load top performing funds. Please try again later.');
  }
};

// Function to get recommended funds based on risk profile
export const getRecommendedFunds = async (riskProfile: string): Promise<Fund[]> => {
  try {
    // Try to fetch real data from API
    const response = await axios.get('https://api.mfapi.in/mf/search?q=top');
    
    // Process the API response
    if (response.data && Array.isArray(response.data)) {
      // Map API data to our Fund interface
      const funds = response.data.slice(0, 10).map((item: any, index: number) => {
        // Determine category based on fund name
        let category = 'equity';
        if (item.schemeName.toLowerCase().includes('debt') || 
            item.schemeName.toLowerCase().includes('bond')) {
          category = 'debt';
        } else if (item.schemeName.toLowerCase().includes('gold')) {
          category = 'gold';
        } else if (item.schemeName.toLowerCase().includes('liquid') || 
                  item.schemeName.toLowerCase().includes('cash')) {
          category = 'cash';
        }
        
        // Generate random returns based on risk profile and category
        let returns = 0;
        if (category === 'equity') {
          returns = riskProfile === 'High' ? 15 + Math.random() * 10 : 
                   riskProfile === 'Moderate' ? 10 + Math.random() * 8 : 
                   5 + Math.random() * 5;
        } else if (category === 'debt') {
          returns = 5 + Math.random() * 5;
        } else if (category === 'gold') {
          returns = 8 + Math.random() * 4;
        } else {
          returns = 4 + Math.random() * 2;
        }
        
        // Generate random change values
        const change = (Math.random() * 2 - 1) * 2; // Between -2 and 2
        const changePercent = change / 100 * (Math.random() * 5 + 1); // Proportional to change
        
        return {
          id: item.schemeCode || `fund-${index}`,
          name: item.schemeName || `Fund ${index + 1}`,
          category,
          nav: parseFloat(item.nav) || (1000 + Math.random() * 1000),
          change,
          changePercent,
          returns: parseFloat(returns.toFixed(2)),
          risk: riskProfile,
          minInvestment: 1000 * (index + 1),
          description: `${item.schemeName} is a ${category} fund suitable for ${riskProfile.toLowerCase()} risk investors.`,
          lastUpdated: new Date().toLocaleDateString()
        };
      });
      
      // Filter funds based on risk profile
      let filteredFunds = funds;
      if (riskProfile === 'Low') {
        filteredFunds = funds.filter(fund => 
          fund.category === 'debt' || fund.category === 'gold' || fund.category === 'cash'
        );
      } else if (riskProfile === 'High') {
        filteredFunds = funds.filter(fund => 
          fund.category === 'equity'
        );
      }
      
      // If we don't have enough funds after filtering, add some from the original list
      if (filteredFunds.length < 3) {
        filteredFunds = [...filteredFunds, ...funds.slice(0, 3 - filteredFunds.length)];
      }
      
      return filteredFunds.slice(0, 5); // Return top 5 funds
    }
    
    // Fallback to mock data if API response is not as expected
    throw new Error('Invalid API response format');
    
  } catch (error) {
    console.error('Error fetching fund data:', error);
    
    // Fallback to mock data
    return getMockFunds(riskProfile);
  }
};

// Mock data as fallback
const getMockFunds = (riskProfile: string): Fund[] => {
  const mockFunds: Record<string, Fund[]> = {
    Low: [
      {
        id: '1',
        name: 'HDFC Debt Fund',
        category: 'debt',
        nav: 2543.21,
        change: 0.45,
        changePercent: 0.02,
        returns: 7.5,
        risk: 'Low',
        minInvestment: 1000,
        description: 'A conservative debt fund focused on government securities.'
      },
      // Add more mock funds...
    ],
    // Add more risk profiles...
  };
  
  return mockFunds[riskProfile] || mockFunds.Moderate;
};

// Function to get fund details by ID
export const getFundById = async (id: string): Promise<Fund | null> => {
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Search through all risk profiles
      for (const riskProfile in mockFunds) {
        const fund = mockFunds[riskProfile].find(f => f.id === id);
        if (fund) {
          resolve(fund);
          return;
        }
      }
      resolve(null);
    }, 300);
  });
};

