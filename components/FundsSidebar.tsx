import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

// API endpoint for mutual fund data
const API_URL = 'https://api.mfapi.in/mf';

// Fund data structure
interface Fund {
  id: string;
  name: string;
  category: string;
  nav: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
}

interface FundsSidebarProps {
  initialCategory?: string;
}

const FundsSidebar = ({ initialCategory = 'All' }: FundsSidebarProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [loading, setLoading] = useState<boolean>(true);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  
  // Update selected category when initialCategory prop changes
  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  // Categories for filter
  const categories = ['All', 'Equity', 'Debt', 'Gold', 'Liquid'];

  // Fund IDs by category (real fund IDs from mfapi.in)
  const fundIds = {
    Equity: [
      '120503', // SBI Blue Chip Fund
      '119598', // HDFC Top 100 Fund
      '120716', // Axis Long Term Equity Fund
      '118460', // ICICI Prudential Bluechip Fund
      '118989', // Aditya Birla Sun Life Frontline Equity Fund
      '122639', // Mirae Asset Large Cap Fund
      '125354', // Kotak Bluechip Fund
      '118565', // Nippon India Large Cap Fund
      '118568', // DSP Top 100 Equity Fund
      '120505', // UTI Equity Fund
      '118551', // Tata Large Cap Fund
      '118560'  // Invesco India Large Cap Fund
    ],
    Debt: [
      '118421', // ICICI Prudential Corporate Bond Fund
      '119271', // Kotak Corporate Bond Fund
      '118566', // HDFC Corporate Bond Fund
      '118429', // SBI Corporate Bond Fund
      '119387', // Aditya Birla Sun Life Corporate Bond Fund
      '118427', // Axis Corporate Debt Fund
      '119598', // DSP Corporate Bond Fund
      '118431', // Franklin India Corporate Debt Fund
      '118433', // UTI Corporate Bond Fund
      '118435', // Nippon India Corporate Bond Fund
      '118437', // IDFC Corporate Bond Fund
      '118439'  // L&T Corporate Bond Fund
    ],
    Gold: [
      '119788', // SBI Gold Fund
      '120822', // Nippon India Gold Savings Fund
      '118534', // HDFC Gold Fund
      '118551', // Kotak Gold Fund
      '119271', // Axis Gold Fund
      '120503', // ICICI Prudential Regular Gold Savings Fund
      '118989', // Aditya Birla Sun Life Gold Fund
      '118460', // UTI Gold ETF Fund of Fund
      '118566', // Quantum Gold Savings Fund
      '118429', // Invesco India Gold Fund
      '119387', // DSP World Gold Fund
      '118421'  // Tata Gold Fund
    ],
    Liquid: [
      '118989', // Aditya Birla Sun Life Liquid Fund
      '118521', // ICICI Prudential Liquid Fund
      '118566', // HDFC Liquid Fund
      '119387', // SBI Liquid Fund
      '118429', // Kotak Liquid Fund
      '118421', // Axis Liquid Fund
      '119271', // Nippon India Liquid Fund
      '118460', // UTI Liquid Cash Plan
      '120503', // DSP Liquidity Fund
      '120822', // Tata Liquid Fund
      '118534', // L&T Liquid Fund
      '118551'  // IDFC Cash Fund
    ]
  };

  // Format the last updated time
  const formatLastUpdated = (date: Date): string => {
    return date.toLocaleTimeString();
  };

  // Fetch real fund data from API
  const fetchFundData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let fundsToFetch: string[] = [];
      
      // Determine which funds to fetch based on selected category
      if (selectedCategory === 'All') {
        // Get more funds from each category for the "All" view
        Object.values(fundIds).forEach(ids => {
          fundsToFetch = [...fundsToFetch, ...ids.slice(0, 3)]; // Get top 3 from each category
        });
        
        // Remove duplicates (some funds might be in multiple categories)
        fundsToFetch = [...new Set(fundsToFetch)];
      } else {
        fundsToFetch = fundIds[selectedCategory as keyof typeof fundIds] || [];
      }
      
      // Fetch data for each fund with a slight delay between requests to avoid rate limiting
      const fetchWithDelay = async (ids: string[]) => {
        const results: (Fund | null)[] = [];
        
        for (const id of ids) {
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
                category: selectedCategory === 'All' 
                  ? getCategoryFromSchemeType(response.data.meta?.scheme_type || '')
                  : selectedCategory,
                nav: nav,
                change: change,
                changePercent: changePercent,
                lastUpdated: formatLastUpdated(new Date())
              });
            } else {
              results.push(null);
            }
            
            // Small delay to avoid hitting API rate limits
            if (ids.length > 5) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          } catch (error) {
            console.error(`Error fetching fund ${id}:`, error);
            results.push(null);
          }
        }
        
        return results;
      };
      
      const results = await fetchWithDelay(fundsToFetch);
      const validFunds = results.filter(fund => fund !== null) as Fund[];
      
      setFunds(validFunds);
    } catch (error) {
      console.error('Error fetching funds:', error);
      setError('Failed to load fund data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to determine category from scheme type
  const getCategoryFromSchemeType = (schemeType: string): string => {
    const lowerType = schemeType.toLowerCase();
    if (lowerType.includes('equity')) return 'Equity';
    if (lowerType.includes('debt') || lowerType.includes('income')) return 'Debt';
    if (lowerType.includes('gold')) return 'Gold';
    if (lowerType.includes('liquid') || lowerType.includes('money market')) return 'Liquid';
    return 'Other';
  };

  // Fetch data when component mounts or category changes
  useEffect(() => {
    fetchFundData();
    
    // Set up interval to refresh data every 5 minutes
    const intervalId = setInterval(fetchFundData, 5 * 60 * 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [selectedCategory]);

  // Filter funds by category
  const filteredFunds = selectedCategory === 'All' 
    ? funds 
    : funds.filter(fund => fund.category === selectedCategory);

  // Handle fund item press
  const handleFundPress = (fund: Fund) => {
    console.log('Fund pressed:', fund.name);
    try {
      // Navigate to FundDetail screen with the fund data
      navigation.navigate('FundDetail', { fund });
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert(
        'Navigation Error',
        'Unable to open fund details. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchFundData();
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFundData();
    setRefreshing(false);
  };

  // Render each fund item
  const renderFundItem = ({ item }: { item: Fund }) => {
    const isPositiveChange = item.change >= 0;
    
    return (
      <TouchableOpacity 
        style={styles.fundItem}
        onPress={() => handleFundPress(item)}
      >
        <View style={styles.fundInfo}>
          <Text style={styles.fundName} numberOfLines={2} ellipsizeMode="tail">
            {item.name}
          </Text>
          <View style={styles.fundMeta}>
            <Text style={styles.fundCategory}>{item.category}</Text>
            <Text style={styles.fundId}>ID: {item.id}</Text>
          </View>
        </View>
        <View style={styles.fundNav}>
          <Text style={styles.navValue}>₹{item.nav.toFixed(2)}</Text>
          <Text 
            style={[
              styles.changeValue, 
              { color: isPositiveChange ? '#4CAF50' : '#F44336' }
            ]}
          >
            {isPositiveChange ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Category filters */}
      <View style={styles.categoryFilters}>
        <FlatList
          horizontal
          data={categories}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item && styles.selectedCategory
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text 
                style={[
                  styles.categoryText,
                  selectedCategory === item && styles.selectedCategoryText
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
        />
      </View>
      
      {/* Last refresh time */}
      <View style={styles.refreshInfo}>
        <TouchableOpacity onPress={handleRefresh}>
          <Text style={styles.refreshText}>
            Last updated: {new Date().toLocaleTimeString()} (Tap to refresh)
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Fund list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7F00FF" />
          <Text style={styles.loadingText}>Loading funds...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRefresh}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredFunds}
          renderItem={renderFundItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.fundsList}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No funds found in this category</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  categoryFilters: {
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedCategory: {
    backgroundColor: '#7F00FF',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  refreshInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 16,
  },
  refreshText: {
    fontSize: 12,
    color: '#666',
    textDecorationLine: 'underline',
  },
  fundsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  fundItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#7F00FF',
  },
  fundInfo: {
    flex: 1,
    marginRight: 8,
  },
  fundName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
    flexShrink: 1,
  },
  fundMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fundCategory: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#eee',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  fundId: {
    fontSize: 10,
    color: '#999',
  },
  fundNav: {
    alignItems: 'flex-end',
  },
  navValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  changeValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: '#7F00FF',
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default FundsSidebar;



