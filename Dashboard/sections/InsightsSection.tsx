import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';

interface MarketIndex {
  name: string;
  value: string;
  change: string;
  changePercent: string;
}

interface SectorPerformance {
  name: string;
  change: string;
}

interface EconomicIndicators {
  gdpGrowth: string;
  inflation: string;
  repoRate: string;
  gSec: string;
}

const InsightsSection: React.FC = () => {
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  
  // Market data states
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [sectorPerformance, setSectorPerformance] = useState<SectorPerformance[]>([]);
  const [economicIndicators, setEconomicIndicators] = useState<EconomicIndicators>({
    gdpGrowth: '0%',
    inflation: '0%',
    repoRate: '0%',
    gSec: '0%'
  });

  const fetchMarketInsights = async () => {
    setInsightsLoading(true);
    setInsightsError(null);
    
    try {
      const API_KEY = '2ERYE9DMYCK02SJG';
      
      // Fetch market indices data
      const indicesResponse = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=^NSEI&apikey=${API_KEY}`
      );
      
      const sensexResponse = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=^BSESN&apikey=${API_KEY}`
      );
      
      // Fetch sector performance data
      const sectorResponse = await axios.get(
        `https://www.alphavantage.co/query?function=SECTOR&apikey=${API_KEY}`
      );
      
      // Process market indices data
      if (indicesResponse.data && sensexResponse.data) {
        const niftyData = indicesResponse.data['Global Quote'];
        const sensexData = sensexResponse.data['Global Quote'];
        
        if (niftyData && sensexData) {
          setMarketIndices([
            {
              name: 'Nifty 50',
              value: parseFloat(niftyData['05. price']).toFixed(2),
              change: niftyData['09. change'],
              changePercent: niftyData['10. change percent']
            },
            {
              name: 'Sensex',
              value: parseFloat(sensexData['05. price']).toFixed(2),
              change: sensexData['09. change'],
              changePercent: sensexData['10. change percent']
            }
          ]);
        } else {
          // Fallback data if API doesn't return expected format
          setMarketIndices([
            {
              name: 'Nifty 50',
              value: '22,456.30',
              change: '+123.45',
              changePercent: '+0.55%'
            },
            {
              name: 'Sensex',
              value: '73,876.45',
              change: '+412.67',
              changePercent: '+0.56%'
            }
          ]);
        }
      } else {
        // Fallback data if API call fails
        setMarketIndices([
          {
            name: 'Nifty 50',
            value: '22,456.30',
            change: '+123.45',
            changePercent: '+0.55%'
          },
          {
            name: 'Sensex',
            value: '73,876.45',
            change: '+412.67',
            changePercent: '+0.56%'
          }
        ]);
      }
      
      // Process sector performance data
      if (sectorResponse.data && sectorResponse.data['Rank A: Real-Time Performance']) {
        const sectors = sectorResponse.data['Rank A: Real-Time Performance'];
        const formattedSectors = Object.entries(sectors).map(([name, change]) => ({
          name,
          change: `${change}`
        }));
        
        setSectorPerformance(formattedSectors);
      } else {
        // Fallback sector data
        setSectorPerformance([
          { name: 'Information Technology', change: '+1.2%' },
          { name: 'Financial Services', change: '+0.8%' },
          { name: 'Healthcare', change: '+0.5%' },
          { name: 'Energy', change: '-0.3%' },
          { name: 'Consumer Goods', change: '-0.7%' },
          { name: 'FMCG', change: '+0.3%' }
        ]);
      }
      
      // Fetch economic indicators
      await fetchEconomicIndicators();
      
      // Set the last updated time
      const now = new Date();
      const formattedTime = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
      setLastUpdated(formattedTime);
      
      console.log('Market insights fetched successfully at', formattedTime);
    } catch (error) {
      console.error('Error fetching market insights:', error);
      setInsightsError('Failed to load market insights');
      
      // Fallback data
      setMarketIndices([
        {
          name: 'Nifty 50',
          value: '22,456.30',
          change: '+123.45',
          changePercent: '+0.55%'
        },
        {
          name: 'Sensex',
          value: '73,876.45',
          change: '+412.67',
          changePercent: '+0.56%'
        }
      ]);
      
      setSectorPerformance([
        { name: 'Information Technology', change: '+1.2%' },
        { name: 'Financial Services', change: '+0.8%' },
        { name: 'Healthcare', change: '+0.5%' },
        { name: 'Energy', change: '-0.3%' },
        { name: 'Consumer Goods', change: '-0.7%' },
        { name: 'FMCG', change: '+0.3%' }
      ]);
      
      setEconomicIndicators({
        gdpGrowth: '7.2%',
        inflation: '5.1%',
        repoRate: '6.5%',
        gSec: '7.05%'
      });
    } finally {
      setInsightsLoading(false);
    }
  };

  const fetchEconomicIndicators = async () => {
    try {
      // In a real app, you would fetch this data from an API
      // For now, using static data
      setEconomicIndicators({
        gdpGrowth: '7.2%',
        inflation: '5.1%',
        repoRate: '6.5%',
        gSec: '7.05%'
      });
    } catch (error) {
      console.error('Error fetching economic indicators:', error);
      // Use fallback data
      setEconomicIndicators({
        gdpGrowth: '7.2%',
        inflation: '5.1%',
        repoRate: '6.5%',
        gSec: '7.05%'
      });
    }
  };

  // Add a manual refresh function
  const handleRefreshInsights = () => {
    fetchMarketInsights();
  };

  // Fetch insights when component mounts
  useEffect(() => {
    fetchMarketInsights();
    
    // Refresh insights every 5 minutes
    const intervalId = setInterval(fetchMarketInsights, 5 * 60 * 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <View style={styles.insightsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Market Insights & Analysis</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefreshInsights}
          disabled={insightsLoading}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      
      {lastUpdated ? (
        <Text style={styles.lastUpdatedText}>Last updated: {lastUpdated}</Text>
      ) : null}
      
      {insightsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7F00FF" />
          <Text style={styles.loadingText}>Loading market insights...</Text>
        </View>
      ) : insightsError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{insightsError}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRefreshInsights}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Market Overview */}
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Market Overview</Text>
            <View style={styles.indicesContainer}>
              {marketIndices.map((index, i) => (
                <View key={i} style={styles.indexItem}>
                  <Text style={styles.indexName}>{index.name}</Text>
                  <Text style={styles.indexValue}>{index.value}</Text>
                  <View style={styles.indexChangeContainer}>
                    <Text 
                      style={[
                        styles.indexChange, 
                        { color: index.change.includes('+') ? '#4CAF50' : '#F44336' }
                      ]}
                    >
                      {index.change} ({index.changePercent})
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
          
          {/* Sector Performance */}
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Sector Performance</Text>
            <View style={styles.sectorList}>
              {sectorPerformance.slice(0, 6).map((sector, i) => (
                <View key={i} style={styles.sectorItem}>
                  <Text style={styles.sectorName}>{sector.name}</Text>
                  <Text 
                    style={[
                      styles.sectorChange, 
                      { color: sector.change.includes('+') ? '#4CAF50' : '#F44336' }
                    ]}
                  >
                    {sector.change}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* Economic Indicators */}
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Economic Indicators</Text>
            <View style={styles.indicatorsGrid}>
              <View style={styles.indicatorItem}>
                <Text style={styles.indicatorLabel}>GDP Growth</Text>
                <Text style={styles.indicatorValue}>{economicIndicators.gdpGrowth}</Text>
              </View>
              <View style={styles.indicatorItem}>
                <Text style={styles.indicatorLabel}>Inflation</Text>
                <Text style={styles.indicatorValue}>{economicIndicators.inflation}</Text>
              </View>
              <View style={styles.indicatorItem}>
                <Text style={styles.indicatorLabel}>Repo Rate</Text>
                <Text style={styles.indicatorValue}>{economicIndicators.repoRate}</Text>
              </View>
              <View style={styles.indicatorItem}>
                <Text style={styles.indicatorLabel}>10Y G-Sec</Text>
                <Text style={styles.indicatorValue}>{economicIndicators.gSec}</Text>
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  insightsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    backgroundColor: '#7F00FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: '#e53935',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#7F00FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  insightCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  indicesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  indexItem: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  indexName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  indexValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  indexChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indexChange: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectorList: {
    gap: 8,
  },
  sectorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 8,
  },
  sectorName: {
    fontSize: 14,
    color: '#333',
  },
  sectorChange: {
    fontSize: 14,
    fontWeight: '500',
  },
  indicatorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  indicatorItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  indicatorLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  indicatorValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default InsightsSection;
