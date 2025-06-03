import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// API endpoint for mutual fund data
const API_URL = 'https://api.mfapi.in/mf';

// Top funds to track (using real fund IDs from mfapi.in)
const TOP_FUNDS = [
  { id: '120503', name: 'SBI Blue Chip Fund', category: 'Equity' },
  { id: '119598', name: 'HDFC Top 100 Fund', category: 'Equity' },
  { id: '118460', name: 'ICICI Prudential Bluechip Fund', category: 'Equity' },
  { id: '118452', name: 'HDFC Corporate Bond Fund', category: 'Debt' },
  { id: '118551', name: 'ICICI Prudential Corporate Bond Fund', category: 'Debt' },
  { id: '118834', name: 'SBI Gold Fund', category: 'Gold' },
  { id: '118989', name: 'Aditya Birla Sun Life Liquid Fund', category: 'Liquid' }
];

interface FundData {
  id: string;
  name: string;
  category: string;
  nav: number;
  change: number;
  changePercent: number;
}

interface LiveFundDataProps {
  onFundSelect?: (fund: FundData) => void;
}

const LiveFundData: React.FC<LiveFundDataProps> = ({ onFundSelect }) => {
  const [funds, setFunds] = useState<FundData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch live fund data
  const fetchLiveFundData = async () => {
    setError(null);
    if (!refreshing) setLoading(true);
    
    try {
      const results: FundData[] = [];
      
      // Fetch data for each fund
      for (const fund of TOP_FUNDS) {
        try {
          const response = await axios.get(`${API_URL}/${fund.id}`);
          
          if (response.data && response.data.data && response.data.data.length > 0) {
            const latestData = response.data.data[0];
            const previousData = response.data.data[1] || { nav: latestData.nav };
            
            const nav = parseFloat(latestData.nav);
            const previousNav = parseFloat(previousData.nav);
            const change = nav - previousNav;
            const changePercent = (change / previousNav) * 100;
            
            results.push({
              id: fund.id,
              name: response.data.meta?.scheme_name || fund.name,
              category: fund.category,
              nav: nav,
              change: change,
              changePercent: changePercent
            });
          }
          
          // Small delay to avoid hitting API rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error fetching fund ${fund.id}:`, error);
        }
      }
      
      if (results.length > 0) {
        setFunds(results);
        setLastUpdated(new Date());
      } else {
        setError('No fund data available. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching live fund data:', error);
      setError('Failed to load fund data. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Set up auto-refresh for real-time data
  useEffect(() => {
    // Initial fetch
    fetchLiveFundData();
    
    // Set up interval for real-time updates (every 5 minutes)
    refreshTimerRef.current = setInterval(fetchLiveFundData, 5 * 60 * 1000);
    
    // Clean up interval on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);

  // Handle manual refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchLiveFundData();
  };

  // Handle fund selection
  const handleFundPress = (fund: FundData) => {
    if (onFundSelect) {
      onFundSelect(fund);
    }
  };

  // Format time for display
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7F00FF" />
        <Text style={styles.loadingText}>Loading live fund data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.lastUpdated}>
          Last updated: {formatTime(lastUpdated)}
        </Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <Icon 
            name="refresh" 
            size={20} 
            color="#7F00FF" 
            style={refreshing ? styles.rotating : undefined} 
          />
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={40} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRefresh}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#7F00FF']}
            />
          }
        >
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.fundNameHeader]}>Fund Name</Text>
            <Text style={[styles.headerCell, styles.navHeader]}>NAV (₹)</Text>
            <Text style={[styles.headerCell, styles.changeHeader]}>Change</Text>
          </View>
          
          {funds.map((fund) => {
            const isPositive = fund.change >= 0;
            
            return (
              <TouchableOpacity 
                key={fund.id}
                style={styles.fundRow}
                onPress={() => handleFundPress(fund)}
              >
                <View style={styles.fundNameCell}>
                  <Text style={styles.fundName} numberOfLines={2} ellipsizeMode="tail">
                    {fund.name}
                  </Text>
                  <View style={styles.categoryContainer}>
                    <Text style={[
                      styles.categoryBadge,
                      { 
                        backgroundColor: 
                          fund.category === 'Equity' ? '#FFE0E6' : 
                          fund.category === 'Debt' ? '#E0F0FF' : 
                          fund.category === 'Gold' ? '#FFF6E0' : '#E0F8F7',
                        color: 
                          fund.category === 'Equity' ? '#FF6384' : 
                          fund.category === 'Debt' ? '#36A2EB' : 
                          fund.category === 'Gold' ? '#FFCE56' : '#4BC0C0'
                      }
                    ]}>
                      {fund.category}
                    </Text>
                  </View>
                </View>
                <Text style={styles.navCell}>
                  {fund.nav.toFixed(2)}
                </Text>
                <View style={styles.changeCell}>
                  <Text style={[
                    styles.changeValue,
                    { color: isPositive ? '#4CAF50' : '#F44336' }
                  ]}>
                    {isPositive ? '+' : ''}{fund.change.toFixed(2)}
                  </Text>
                  <View style={[
                    styles.percentBadge,
                    { backgroundColor: isPositive ? '#E6F7ED' : '#FFEBEE' }
                  ]}>
                    <Text style={[
                      styles.percentValue,
                      { color: isPositive ? '#4CAF50' : '#F44336' }
                    ]}>
                      {isPositive ? '▲' : '▼'} {Math.abs(fund.changePercent).toFixed(2)}%
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
          
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              Data sourced from mfapi.in. NAV values are updated daily after market hours.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

// Define component-specific styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#F9F9F9',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#666666',
  },
  refreshButton: {
    padding: 8,
  },
  rotating: {
    transform: [{ rotate: '45deg' }],
  },
  loadingContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666666',
  },
  errorContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 10,
    fontSize: 14,
    color: '#F44336',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#7F00FF',
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerCell: {
    fontWeight: 'bold',
    color: '#666666',
    fontSize: 12,
  },
  fundNameHeader: {
    flex: 2,
  },
  navHeader: {
    flex: 1,
    textAlign: 'right',
  },
  changeHeader: {
    flex: 1,
    textAlign: 'right',
  },
  fundRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  fundNameCell: {
    flex: 2,
    justifyContent: 'center',
  },
  fundName: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    overflow: 'hidden',
  },
  navCell: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    alignSelf: 'center',
  },
  changeCell: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  changeValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  percentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  percentValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  disclaimer: {
    padding: 16,
    backgroundColor: '#F9F9F9',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
  }
});

export default LiveFundData;
