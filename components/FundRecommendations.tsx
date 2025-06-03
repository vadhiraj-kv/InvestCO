import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchFundsByCategory, getTopPerformingFunds, getRecommendedFunds, Fund } from '../services/fundService';

interface FundRecommendationsProps {
  riskProfile: string;
  selectedCategory?: string;
}

const FundRecommendations: React.FC<FundRecommendationsProps> = ({ 
  riskProfile, 
  selectedCategory = 'All' 
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const navigation = useNavigation();

  // Categories for filter
  const categories = ['All', 'Equity', 'Debt', 'Gold', 'Liquid'];
  const [activeCategory, setActiveCategory] = useState<string>(selectedCategory);

  // Fetch funds based on category or risk profile
  const fetchFunds = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let fetchedFunds: Fund[] = [];
      
      if (activeCategory !== 'All') {
        // Fetch funds by selected category
        fetchedFunds = await fetchFundsByCategory(activeCategory);
      } else if (riskProfile) {
        // Fetch recommended funds based on risk profile
        fetchedFunds = await getRecommendedFunds(riskProfile);
      } else {
        // Fetch top performing funds from all categories
        const equityFunds = await getTopPerformingFunds('Equity', 3);
        const debtFunds = await getTopPerformingFunds('Debt', 2);
        const goldFunds = await getTopPerformingFunds('Gold', 1);
        const liquidFunds = await getTopPerformingFunds('Liquid', 1);
        
        fetchedFunds = [...equityFunds, ...debtFunds, ...goldFunds, ...liquidFunds];
      }
      
      setFunds(fetchedFunds);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching funds:', error);
      setError('Failed to load fund data. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchFunds();
    
    // Set up interval to refresh data every 5 minutes
    const intervalId = setInterval(fetchFunds, 5 * 60 * 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [activeCategory, riskProfile]);

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  // Handle fund item press
  const handleFundPress = (fund: Fund) => {
    navigation.navigate('FundDetail', { fund });
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchFunds();
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
            <Text style={[
              styles.fundCategory,
              { 
                backgroundColor: 
                  item.category === 'Equity' ? '#FFE0E6' : 
                  item.category === 'Debt' ? '#E0F0FF' : 
                  item.category === 'Gold' ? '#FFF6E0' : '#E0F8F7',
                color: 
                  item.category === 'Equity' ? '#FF6384' : 
                  item.category === 'Debt' ? '#36A2EB' : 
                  item.category === 'Gold' ? '#FFCE56' : '#4BC0C0'
              }
            ]}>
              {item.category}
            </Text>
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
      <View style={styles.header}>
        <Text style={styles.title}>
          {activeCategory === 'All' 
            ? `Recommended Funds for ${riskProfile} Risk` 
            : `${activeCategory} Funds`}
        </Text>
        <Text style={styles.subtitle}>
          Live NAV data from mfapi.in
        </Text>
      </View>
      
      {/* Category filter */}
      <View style={styles.categoryFilter}>
        <FlatList
          data={categories}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                activeCategory === item && styles.activeCategoryButton
              ]}
              onPress={() => handleCategoryChange(item)}
            >
              <Text 
                style={[
                  styles.categoryButtonText,
                  activeCategory === item && styles.activeCategoryButtonText
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
      
      {/* Last refresh time */}
      <View style={styles.refreshInfo}>
        <TouchableOpacity onPress={onRefresh}>
          <Text style={styles.refreshText}>
            Last updated: {lastUpdated.toLocaleTimeString()} (Tap to refresh)
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Fund list */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7F00FF" />
          <Text style={styles.loadingText}>Loading funds...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={onRefresh}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={funds}
          renderItem={renderFundItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.fundsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#7F00FF']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="alert-circle-outline" size={48} color="#999" />
              <Text style={styles.emptyText}>No funds found</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={onRefresh}
              >
                <Text style={styles.retryButtonText}>Refresh</Text>
              </TouchableOpacity>
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  categoryFilter: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  activeCategoryButton: {
    backgroundColor: '#7F00FF',
  },
  categoryButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  activeCategoryButtonText: {
    color: '#fff',
  },
  refreshInfo: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  refreshText: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,