import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Animated // Make sure to import Animated from react-native, not reanimated
} from 'react-native';
import { Dimensions } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './PortfolioSectionStyles';
import { getRecommendedFunds, Fund } from '../../services/fundService';

// Remove the import from reanimated if it exists
// import Animated from 'react-native-reanimated';

interface PortfolioSectionProps {
  params: {
    amount: number;
    investmentType: string;
    duration: number;
    riskProfile: string;
  };
  allocation: {
    equity: number;
    debt: number;
    gold: number;
    cash: number;
  };
  navigation: any;
  handleRecommendationClick: (category: string) => void;
  onEditInvestment: () => void;
  onRiskProfileChange: (newRiskProfile: string) => void;
  setShowRiskModal: (show: boolean) => void;
  userData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    _id?: string;
  };
}

const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  params,
  allocation: propAllocation,
  navigation,
  handleRecommendationClick,
  onEditInvestment,
  onRiskProfileChange,
  setShowRiskModal,
  userData
}) => {
  const [allocation, setAllocation] = useState({...propAllocation});
  const [loading, setLoading] = useState(false);
  const [recommendedFunds, setRecommendedFunds] = useState<Fund[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Calculate amount for each asset class
  const calculateAmount = (percentage: number) => {
    return (params.amount * percentage) / 100;
  };
  
  // Get asset allocation based on risk profile
  const getAssetAllocation = (riskProfile: string) => {
    switch(riskProfile) {
      case 'Low':
        return { equity: 30, debt: 50, gold: 10, cash: 10 };
      case 'Moderate':
        return { equity: 60, debt: 25, gold: 10, cash: 5 };
      case 'High':
        return { equity: 80, debt: 10, gold: 5, cash: 5 };
      default:
        return { equity: 60, debt: 25, gold: 10, cash: 5 }; // Default to Moderate
    }
  };
  
  // Update allocation when risk profile changes
  useEffect(() => {
    // Update allocation based on risk profile
    setAllocation(getAssetAllocation(params.riskProfile));
    
    // Fetch recommended funds based on risk profile
    const fetchFunds = async () => {
      try {
        setLoading(true);
        const funds = await getRecommendedFunds(params.riskProfile);
        setRecommendedFunds(funds);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error fetching recommended funds:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFunds();
  }, [params.riskProfile]);
  
  // Render asset allocation
  const renderAssetAllocation = () => {
    return (
      <View style={styles.allocationContainer}>
        <Text style={styles.allocationTitle}>Asset Allocation</Text>
        <Text style={styles.allocationSubtitle}>
          Based on {params.riskProfile} risk profile
        </Text>
        
        {/* Bar Chart Visualization */}
        <View style={styles.allocationChart}>
          <View style={styles.barChart}>
            {/* Equity */}
            <View style={[styles.bar, { width: `${allocation.equity}%`, backgroundColor: '#7F00FF' }]}>
              {allocation.equity >= 15 && (
                <Text style={styles.barLabel}>{allocation.equity}%</Text>
              )}
            </View>
            
            {/* Debt */}
            <View style={[styles.bar, { width: `${allocation.debt}%`, backgroundColor: '#4CAF50' }]}>
              {allocation.debt >= 15 && (
                <Text style={styles.barLabel}>{allocation.debt}%</Text>
              )}
            </View>
            
            {/* Gold */}
            <View style={[styles.bar, { width: `${allocation.gold}%`, backgroundColor: '#FFC107' }]}>
              {allocation.gold >= 15 && (
                <Text style={styles.barLabel}>{allocation.gold}%</Text>
              )}
            </View>
            
            {/* Cash */}
            <View style={[styles.bar, { width: `${allocation.cash}%`, backgroundColor: '#2196F3' }]}>
              {allocation.cash >= 15 && (
                <Text style={styles.barLabel}>{allocation.cash}%</Text>
              )}
            </View>
          </View>
        </View>
        
        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#7F00FF' }]} />
            <Text style={styles.legendText}>
              Equity: {allocation.equity}% (₹{calculateAmount(allocation.equity).toLocaleString('en-IN')})
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>
              Debt: {allocation.debt}% (₹{calculateAmount(allocation.debt).toLocaleString('en-IN')})
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FFC107' }]} />
            <Text style={styles.legendText}>
              Gold: {allocation.gold}% (₹{calculateAmount(allocation.gold).toLocaleString('en-IN')})
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#2196F3' }]} />
            <Text style={styles.legendText}>
              Cash: {allocation.cash}% (₹{calculateAmount(allocation.cash).toLocaleString('en-IN')})
            </Text>
          </View>
        </View>
        
        {/* Risk Profile Indicator */}
        <View style={styles.riskIndicator}>
          <Text style={styles.riskLabel}>Risk Profile:</Text>
          <View style={[
            styles.riskBadge, 
            { 
              backgroundColor: 
                params.riskProfile === 'Low' ? '#4CAF50' : 
                params.riskProfile === 'High' ? '#F44336' : 
                '#FFC107'
            }
          ]}>
            <Text style={styles.riskBadgeText}>{params.riskProfile}</Text>
          </View>
          <TouchableOpacity 
            style={styles.changeRiskButton}
            onPress={() => setShowRiskModal(true)}
          >
            <Text style={styles.changeRiskText}>Change</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  // Add auto-scrolling effect for recommended funds
  useEffect(() => {
    if (recommendedFunds.length > 0 && scrollViewRef.current) {
      let scrollPosition = 0;
      const maxScroll = recommendedFunds.length * 180; // Approximate width of each card + margin
      
      const scrollInterval = setInterval(() => {
        scrollPosition += 180; // Move to next card
        if (scrollPosition >= maxScroll) {
          scrollPosition = 0; // Reset to beginning
        }
        
        scrollViewRef.current?.scrollTo({ x: scrollPosition, animated: true });
      }, 3000); // Scroll every 3 seconds
      
      return () => clearInterval(scrollInterval);
    }
  }, [recommendedFunds]);

  // Add a function to handle fund card clicks
  const handleFundCardClick = (fund: Fund) => {
    // Navigate to FundDetail screen with the fund data
    navigation.navigate('FundDetail', { fund });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Portfolio</Text>
        <Text style={styles.username}>
          {userData && userData.firstName 
            ? `${userData.firstName} ${userData.lastName || ''}`
            : 'Investor'}
        </Text>
      </View>
      
      <View style={styles.investmentDetails}>
        <Text style={styles.investmentAmount}>₹{params.amount.toLocaleString('en-IN')}</Text>
        <Text style={styles.investmentType}>
          {params.investmentType === 'SIP' 
            ? `Monthly SIP for ${params.duration} years` 
            : `One-time investment for ${params.duration} years`}
        </Text>
      </View>
      
      {renderAssetAllocation()}
      
      {/* Recommended Funds Section */}
      <View style={styles.recommendationsContainer}>
        <Text style={styles.recommendationsTitle}>Recommended Funds</Text>
        <Text style={styles.recommendationsSubtitle}>Live data from mfapi.in</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#7F00FF" />
            <Text style={styles.loadingText}>Loading live fund data...</Text>
          </View>
        ) : (
          <ScrollView 
            ref={scrollViewRef}
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.fundsScrollContent}
          >
            {recommendedFunds.map((fund, index) => {
              const isPositiveChange = fund.change >= 0;
              
              return (
                <TouchableOpacity 
                  key={index}
                  style={styles.fundCard}
                  onPress={() => handleFundCardClick(fund)}
                >
                  <Text style={styles.fundName} numberOfLines={2} ellipsizeMode="tail">
                    {fund.name}
                  </Text>
                  <View style={styles.fundMeta}>
                    <Text style={[
                      styles.fundCategory,
                      { 
                        backgroundColor: 
                          fund.category === 'equity' ? '#FFE0E6' : 
                          fund.category === 'debt' ? '#E0F0FF' : 
                          fund.category === 'gold' ? '#FFF6E0' : '#E0F8F7',
                        color: 
                          fund.category === 'equity' ? '#FF6384' : 
                          fund.category === 'debt' ? '#36A2EB' : 
                          fund.category === 'gold' ? '#FFCE56' : '#4BC0C0'
                      }
                    ]}>
                      {fund.category.charAt(0).toUpperCase() + fund.category.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.fundDetails}>
                    <Text style={styles.navValue}>₹{fund.nav.toFixed(2)}</Text>
                    <Text 
                      style={[
                        styles.changeValue, 
                        { color: isPositiveChange ? '#4CAF50' : '#F44336' }
                      ]}
                    >
                      {isPositiveChange ? '+' : ''}{fund.change.toFixed(2)} ({fund.changePercent.toFixed(2)}%)
                    </Text>
                  </View>
                  <Text style={styles.fundReturn}>{fund.returns}% returns</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
        
        {lastUpdated && (
          <Text style={styles.lastUpdatedText}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Text>
        )}
      </View>
    </View>
  );
};

export default PortfolioSection;







