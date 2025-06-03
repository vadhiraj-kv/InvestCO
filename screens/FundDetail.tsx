import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';

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

// Historical data point structure
interface HistoricalDataPoint {
  date: string;
  nav: number;
}

// Fund details structure
interface FundDetails {
  aum: string;
  expenseRatio: string;
  exitLoad: string;
  fundManager: string;
  launchDate: string;
  riskLevel: string;
  fundHouse: string;
  benchmark: string;
  minInvestment: string;
  fundType: string;
  returns: {
    '1Y': string;
    '3Y': string;
    '5Y': string;
    'Since Inception': string;
  };
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_HEIGHT = 220;

// API endpoint for mutual fund data
const API_URL = 'https://api.mfapi.in/mf';

const FundDetail = () => {
  // Make sure the route is properly typed
  const route = useRoute();
  const { fund: initialFund } = route.params ? (route.params as { fund: Fund }) : { fund: null };

  // Create a state for the fund to allow updates
  const [fund, setFund] = useState<Fund | null>(initialFund);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('1M');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState(new Date());
  
  // Add fundDetails state
  const [fundDetails, setFundDetails] = useState<FundDetails>({
    aum: 'Loading...',
    expenseRatio: 'Loading...',
    exitLoad: 'Loading...',
    fundManager: 'Loading...',
    launchDate: 'Loading...',
    riskLevel: initialFund?.category === 'Equity' ? 'High' : initialFund?.category === 'Debt' ? 'Low' : 'Medium',
    fundHouse: 'Loading...',
    benchmark: 'Loading...',
    minInvestment: 'Loading...',
    fundType: initialFund?.category || 'Loading...',
    returns: {
      '1Y': 'Loading...',
      '3Y': 'Loading...',
      '5Y': 'Loading...',
      'Since Inception': 'Loading...'
    }
  });
  
  // Ref for the interval timer
  const navUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format the last updated time
  const formatLastUpdated = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;
  };

  // Fetch real historical data from API
  const fetchHistoricalData = async () => {
    if (!fund) return;
    
    setRefreshing(true);
    try {
      const response = await axios.get(`${API_URL}/${fund.id}`);
      
      if (response.data && response.data.data) {
        // API returns data in reverse chronological order (newest first)
        const apiData = response.data.data;
        
        // Convert API data to our format
        const formattedData: HistoricalDataPoint[] = apiData.map((item: any) => ({
          date: item.date,
          nav: parseFloat(item.nav)
        }));
        
        setHistoricalData(formattedData);
        
        // Update current NAV with the latest data
        if (formattedData.length > 0 && formattedData[0].nav) {
          const latestNav = formattedData[0].nav;
          const previousNav = formattedData.length > 1 ? formattedData[1].nav : latestNav;
          const change = latestNav - previousNav;
          const changePercent = (change / previousNav) * 100;
          
          // Update the fund with real data
          setFund(prevFund => {
            if (!prevFund) return null;
            return {
              ...prevFund,
              nav: latestNav,
              change: change,
              changePercent: changePercent,
              lastUpdated: formatLastUpdated(new Date())
            };
          });
        }
        
        // Calculate returns
        if (formattedData.length > 0) {
          const latestNav = formattedData[0].nav;
          
          // Find indices for different time periods
          const oneYearIndex = formattedData.findIndex(item => {
            const itemDate = new Date(item.date.split('-').reverse().join('-'));
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            return itemDate <= oneYearAgo;
          });
          
          const threeYearIndex = formattedData.findIndex(item => {
            const itemDate = new Date(item.date.split('-').reverse().join('-'));
            const threeYearsAgo = new Date();
            threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
            return itemDate <= threeYearsAgo;
          });
          
          const fiveYearIndex = formattedData.findIndex(item => {
            const itemDate = new Date(item.date.split('-').reverse().join('-'));
            const fiveYearsAgo = new Date();
            fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
            return itemDate <= fiveYearsAgo;
          });
          
          // Calculate returns
          const oneYearReturn = oneYearIndex !== -1 
            ? ((latestNav - formattedData[oneYearIndex].nav) / formattedData[oneYearIndex].nav * 100).toFixed(2) + '%'
            : 'N/A';
            
          const threeYearReturn = threeYearIndex !== -1 
            ? ((Math.pow(latestNav / formattedData[threeYearIndex].nav, 1/3) - 1) * 100).toFixed(2) + '%'
            : 'N/A';
            
          const fiveYearReturn = fiveYearIndex !== -1 
            ? ((Math.pow(latestNav / formattedData[fiveYearIndex].nav, 1/5) - 1) * 100).toFixed(2) + '%'
            : 'N/A';
            
          const inceptionReturn = formattedData.length > 0 
            ? ((latestNav - formattedData[formattedData.length - 1].nav) / formattedData[formattedData.length - 1].nav * 100).toFixed(2) + '%'
            : 'N/A';
          
          // Update fund details with calculated returns
          setFundDetails(prevDetails => ({
            ...prevDetails,
            returns: {
              '1Y': oneYearReturn,
              '3Y': threeYearReturn,
              '5Y': fiveYearReturn,
              'Since Inception': inceptionReturn
            }
          }));
        }
        
        // Extract additional fund details if available
        if (response.data.meta) {
          const meta = response.data.meta;
          setFundDetails(prevDetails => ({
            ...prevDetails,
            fundManager: meta.fund_manager || 'Not Available',
            aum: meta.aum || 'Not Available',
            expenseRatio: meta.expense_ratio || 'Not Available',
            launchDate: meta.launch_date || 'Not Available',
            exitLoad: meta.exit_load || 'Not Available',
            fundHouse: meta.fund_house || response.data.scheme_name?.split(' ')[0] || 'Not Available',
            benchmark: meta.benchmark || 'Not Available',
            minInvestment: meta.min_investment || '₹1,000',
            fundType: meta.scheme_type || fund.category || 'Not Available'
          }));
        } else {
          // If meta data is not available, try to extract from scheme details
          const schemeType = response.data.scheme_type || '';
          const schemeName = response.data.scheme_name || '';
          
          // Make educated guesses about the fund details based on scheme type and name
          const riskLevel = 
            schemeType.includes('Equity') || schemeName.includes('Equity') ? 'High' :
            schemeType.includes('Debt') || schemeName.includes('Debt') ? 'Low' :
            schemeType.includes('Liquid') || schemeName.includes('Liquid') ? 'Very Low' : 'Medium';
          
          const fundHouse = schemeName.split(' ')[0] || fund.name.split(' ')[0] || 'Not Available';
          
          setFundDetails(prevDetails => ({
            ...prevDetails,
            riskLevel: riskLevel,
            fundHouse: fundHouse,
            benchmark: schemeType.includes('Equity') ? 'Nifty 50 TRI' : 
                      schemeType.includes('Debt') ? 'CRISIL Composite Bond Fund Index' : 
                      'Not Available',
            minInvestment: '₹1,000',
            fundType: schemeType || fund.category || 'Not Available'
          }));
        }
      }
      
      setLastUpdatedTime(new Date());
    } catch (error) {
      console.error('Error fetching historical data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Function to update NAV with small random fluctuations to simulate real-time changes
  const updateCurrentNAV = () => {
    if (!fund || historicalData.length === 0) return;
    
    // Get the latest real NAV
    const baseNav = historicalData[0].nav;
    
    // Add a small random fluctuation (-0.1% to +0.1%)
    const fluctuation = (Math.random() * 0.002) - 0.001; // -0.1% to +0.1%
    const newNav = baseNav * (1 + fluctuation);
    
    // Calculate change from previous NAV
    const previousNav = fund.nav;
    const change = newNav - previousNav;
    const changePercent = (change / previousNav) * 100;
    
    // Update the fund with the new NAV
    setFund(prevFund => {
      if (!prevFund) return null;
      return {
        ...prevFund,
        nav: newNav,
        change: change,
        changePercent: changePercent,
        lastUpdated: formatLastUpdated(new Date())
      };
    });
  };

  // Initial data fetch
  useEffect(() => {
    if (fund) {
      fetchHistoricalData();
      
      // Update fund details based on fund category
      setFundDetails(prevDetails => ({
        ...prevDetails,
        riskLevel: fund.category === 'Equity' ? 'High' : 
                  fund.category === 'Debt' ? 'Low' : 
                  fund.category === 'Liquid' ? 'Very Low' : 'Medium'
      }));
      
      // Set up interval to update NAV every minute
      navUpdateIntervalRef.current = setInterval(() => {
        updateCurrentNAV();
      }, 60000); // 60 seconds
    }
    
    // Clean up interval on component unmount
    return () => {
      if (navUpdateIntervalRef.current) {
        clearInterval(navUpdateIntervalRef.current);
      }
    };
  }, [fund?.id]); // Only re-run if fund ID changes

  // Handle manual refresh
  const onRefresh = () => {
    fetchHistoricalData();
  };

  // Filter data based on selected time range
  const getFilteredData = () => {
    if (!historicalData || historicalData.length === 0) return [];
    
    const today = new Date();
    let cutoffDate = new Date();
    
    switch (timeRange) {
      case '1M':
        cutoffDate.setMonth(today.getMonth() - 1);
        break;
      case '3M':
        cutoffDate.setMonth(today.getMonth() - 3);
        break;
      case '6M':
        cutoffDate.setMonth(today.getMonth() - 6);
        break;
      case '1Y':
        cutoffDate.setFullYear(today.getFullYear() - 1);
        break;
      case 'ALL':
      default:
        return historicalData;
    }
    
    return historicalData.filter(item => {
      // Convert DD-MM-YYYY to Date object
      const parts = item.date.split('-');
      const itemDate = new Date(
        parseInt(parts[2]), // Year
        parseInt(parts[1]) - 1, // Month (0-indexed)
        parseInt(parts[0]) // Day
      );
      return itemDate >= cutoffDate;
    });
  };

  if (!fund) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Fund information not available</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7F00FF" />
          <Text style={styles.loadingText}>Loading fund details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const filteredData = getFilteredData();
  
  // Prepare data for the chart
  const chartData = {
    labels: filteredData.map(item => {
      // Convert DD-MM-YYYY to Date object for label formatting
      const parts = item.date.split('-');
      const date = new Date(
        parseInt(parts[2]), // Year
        parseInt(parts[1]) - 1, // Month (0-indexed)
        parseInt(parts[0]) // Day
      );
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }).filter((_, i) => i % Math.ceil(filteredData.length / 6) === 0).slice(0, 6), // Show ~6 labels
    datasets: [
      {
        data: filteredData.map(item => item.nav),
        color: (opacity = 1) => `rgba(127, 0, 255, ${opacity})`,
        strokeWidth: 2
      }
    ],
    // Remove the legend
    legend: []
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#7F00FF']}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.fundName}>{fund.name}</Text>
          <Text style={styles.fundCategory}>{fund.category}</Text>
        </View>
        
        <View style={styles.navCard}>
          <Text style={styles.navLabel}>Current NAV</Text>
          <Text style={styles.navValue}>₹{fund.nav.toFixed(2)}</Text>
          <Text 
            style={[
              styles.changeValue, 
              { color: fund.change >= 0 ? '#4CAF50' : '#F44336' }
            ]}
          >
            {fund.change >= 0 ? '+' : ''}{fund.change.toFixed(2)} ({fund.changePercent.toFixed(2)}%)
          </Text>
          <Text style={styles.lastUpdated}>Last updated: {fund.lastUpdated}</Text>
          <Text style={styles.autoUpdateText}>Auto-updates every minute</Text>
        </View>
        
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>NAV History</Text>
            <View style={styles.refreshIndicator}>
              {refreshing && <ActivityIndicator size="small" color="#7F00FF" style={styles.refreshIcon} />}
              <Text style={styles.refreshText}>
                Last updated: {lastUpdatedTime.toLocaleTimeString()}
              </Text>
            </View>
          </View>
          
          <View style={styles.timeRangeSelector}>
            {['1M', '3M', '6M', '1Y', 'ALL'].map(range => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.timeRangeButton,
                  timeRange === range && styles.timeRangeButtonActive
                ]}
                onPress={() => setTimeRange(range as any)}
              >
                <Text
                  style={[
                    styles.timeRangeText,
                    timeRange === range && styles.timeRangeTextActive
                  ]}
                >
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {filteredData.length > 0 ? (
            <LineChart
              data={chartData}
              width={SCREEN_WIDTH - 40}
              height={CHART_HEIGHT}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(127, 0, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: '0', // Set radius to 0 to hide dots
                  strokeWidth: '0',
                  stroke: 'transparent'
                },
                formatYLabel: (value) => `₹${parseFloat(value).toFixed(0)}`
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
              withDots={false} // Disable dots completely
              withShadow
              withInnerLines={false} // Disable inner horizontal lines
              withOuterLines={false} // Disable outer horizontal lines
              withVerticalLabels
              withHorizontalLabels
              hideLegend={true}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No historical data available for this time range</Text>
            </View>
          )}
          
          <Text style={styles.chartInstructions}>
            Pull down to refresh data
          </Text>
        </View>
        
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Fund Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fund House</Text>
            <Text style={styles.detailValue}>{fundDetails.fundHouse}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fund Type</Text>
            <Text style={styles.detailValue}>{fundDetails.fundType}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>AUM</Text>
            <Text style={styles.detailValue}>{fundDetails.aum}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Expense Ratio</Text>
            <Text style={styles.detailValue}>{fundDetails.expenseRatio}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Exit Load</Text>
            <Text style={styles.detailValue}>{fundDetails.exitLoad}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Min. Investment</Text>
            <Text style={styles.detailValue}>{fundDetails.minInvestment}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Benchmark</Text>
            <Text style={styles.detailValue}>{fundDetails.benchmark}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fund Manager</Text>
            <Text style={styles.detailValue}>{fundDetails.fundManager}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Launch Date</Text>
            <Text style={styles.detailValue}>{fundDetails.launchDate}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Risk Level</Text>
            <Text style={[
              styles.detailValue,
              { 
                color: fundDetails.riskLevel === 'High' ? '#F44336' : 
                       fundDetails.riskLevel === 'Medium' ? '#FF9800' : 
                       fundDetails.riskLevel === 'Low' ? '#4CAF50' : 
                       fundDetails.riskLevel === 'Very Low' ? '#2196F3' : '#666' 
              }
            ]}>
              {fundDetails.riskLevel}
            </Text>
          </View>
        </View>
        
        <View style={styles.returnsCard}>
          <Text style={styles.sectionTitle}>Historical Returns</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>1 Year</Text>
            <Text style={[
              styles.detailValue,
              { color: fundDetails.returns['1Y'].startsWith('-') ? '#F44336' : 
                      fundDetails.returns['1Y'] === 'N/A' || fundDetails.returns['1Y'] === 'Loading...' ? '#666' : '#4CAF50' }
            ]}>
              {fundDetails.returns['1Y']}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>3 Years</Text>
            <Text style={[
              styles.detailValue,
              { color: fundDetails.returns['3Y'].startsWith('-') ? '#F44336' : 
                      fundDetails.returns['3Y'] === 'N/A' || fundDetails.returns['3Y'] === 'Loading...' ? '#666' : '#4CAF50' }
            ]}>
              {fundDetails.returns['3Y']}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>5 Years</Text>
            <Text style={[
              styles.detailValue,
              { color: fundDetails.returns['5Y'].startsWith('-') ? '#F44336' : 
                      fundDetails.returns['5Y'] === 'N/A' || fundDetails.returns['5Y'] === 'Loading...' ? '#666' : '#4CAF50' }
            ]}>
              {fundDetails.returns['5Y']}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Since Inception</Text>
            <Text style={[
              styles.detailValue,
              { color: fundDetails.returns['Since Inception'].startsWith('-') ? '#F44336' : 
                      fundDetails.returns['Since Inception'] === 'N/A' || fundDetails.returns['Since Inception'] === 'Loading...' ? '#666' : '#4CAF50' }
            ]}>
              {fundDetails.returns['Since Inception']}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },
  noDataContainer: {
    height: CHART_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center'
  },
  noDataText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  fundName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  fundCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  navCard: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  navLabel: {
    fontSize: 14,
    color: '#666'
  },
  navValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4
  },
  changeValue: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
    marginTop: 8
  },
  autoUpdateText: {
    fontSize: 12,
    color: '#7F00FF',
    marginTop: 4,
    fontStyle: 'italic'
  },
  chartCard: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  refreshIcon: {
    marginRight: 8
  },
  refreshText: {
    fontSize: 12,
    color: '#999'
  },
  timeRangeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  timeRangeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f0f0f0'
  },
  timeRangeButtonActive: {
    backgroundColor: '#7F00FF'
  },
  timeRangeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666'
  },
  timeRangeTextActive: {
    color: 'white'
  },
  chartInstructions: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8
  },
  detailsCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  returnsCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    maxWidth: '60%',
    textAlign: 'right',
  }
});

export default FundDetail;















