import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Alert,
  Animated
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import styles from './DashboardStyles';
import RiskProfileModal from './components/RiskProfileModal';

// Import section components
let PortfolioSectionComponent, MarketNewsSectionComponent, InsightsSectionComponent;
try {
  PortfolioSectionComponent = require('./sections/PortfolioSection').default;
} catch (e) {
  // Use placeholder if import fails
}

try {
  MarketNewsSectionComponent = require('./sections/MarketNewsSection').default;
} catch (e) {
  // Use placeholder if import fails
}

try {
  InsightsSectionComponent = require('./sections/InsightsSection').default;
} catch (e) {
  // Use placeholder if import fails
}

const Dashboard = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Extract user data from route params
  const userData = route.params?.userData || null;
  const params = route.params || {
    amount: 100000,
    investmentType: 'SIP',
    duration: 5,
    riskProfile: 'Moderate'
  };

  const sections = [
    { id: 'Portfolio', label: 'My Portfolio' },
    { id: 'Market', label: 'Market News' },
    { id: 'Insights', label: 'Insights' }
  ];

  const [activeSection, setActiveSection] = useState('Portfolio');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAllocationEditor, setShowAllocationEditor] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customAllocation, setCustomAllocation] = useState({
    equity: 40,
    debt: 30,
    gold: 20,
    cash: 10
  });
  const [editingAllocation, setEditingAllocation] = useState(null);
  const [showRiskModal, setShowRiskModal] = useState(false);

  // Get asset allocation based on risk profile
  function getAssetAllocation(riskProfile) {
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
  }

  // Get the current allocation
  function getCurrentAllocation() {
    // If we have a custom allocation, use it
    if (customAllocation) {
      return customAllocation;
    }
    
    // Otherwise, use the default allocation based on risk profile
    switch(params.riskProfile) {
      case 'Low':
        return { equity: 20, debt: 50, gold: 20, cash: 10 };
      case 'Moderate':
        return { equity: 40, debt: 30, gold: 20, cash: 10 };
      case 'High':
        return { equity: 70, debt: 15, gold: 10, cash: 5 };
      default:
        return { equity: 40, debt: 30, gold: 20, cash: 10 };
    }
  }

  // Handle opening the allocation editor
  function handleOpenAllocationEditor() {
    const currentAllocation = getCurrentAllocation();
    setEditingAllocation({...currentAllocation});
    setShowAllocationEditor(true);
  }

  // Handle saving the allocation
  function handleSaveAllocation(newAllocation) {
    setCustomAllocation(newAllocation);
    setShowAllocationEditor(false);
    
    Alert.alert(
      "Allocation Updated",
      "Your custom asset allocation has been saved successfully.",
      [{ text: "OK" }]
    );
  }

  // Handle canceling the allocation edit
  function handleCancelAllocation() {
    setShowAllocationEditor(false);
  }

  function handleRecommendationClick(category) {
    setSelectedCategory(category);
    setShowSidebar(true);
  }

  function handleFundSelection(fund) {
    setShowSidebar(false);
    navigation.navigate('FundDetail', { fund });
  }

  function handleEditInvestment() {
    navigation.navigate('EditInvestment', {
      amount: params.amount,
      investmentType: params.investmentType,
      duration: params.duration,
      riskProfile: params.riskProfile
    });
  }

  // Handle risk profile change
  function handleRiskProfileChange(newRiskProfile) {
    // Update the params with the new risk profile
    const updatedParams = {
      ...params,
      riskProfile: newRiskProfile
    };
    
    // Update route params
    navigation.setParams(updatedParams);
    
    // Reset custom allocation to null so it uses the default allocation based on risk profile
    setCustomAllocation(null);
    
    // Close modal
    setShowRiskModal(false);
    
    // Show confirmation to user with visual feedback
    Alert.alert(
      "Risk Profile Updated",
      `Your risk profile has been updated to ${newRiskProfile}. Asset allocation has been adjusted accordingly.`,
      [{ text: "OK" }]
    );
  }

  // Placeholder components
  const PortfolioSection = PortfolioSectionComponent || (({ 
    params, 
    allocation, 
    navigation, 
    handleRecommendationClick, 
    onEditInvestment,
    setShowRiskModal
  }) => {
    return (
      <View style={{ padding: 16 }}>
        {/* Changed from TouchableOpacity to View to make it non-clickable */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryCardContent}>
            <Text style={styles.summaryTitle}>Investment Summary</Text>
            <Text style={styles.summaryAmount}>₹{params.amount.toLocaleString()}</Text>
            <Text style={styles.summarySubtitle}>
              {params.investmentType === 'SIP' 
                ? `Monthly SIP for ${params.duration} year${params.duration > 1 ? 's' : ''}`
                : `One-time investment for ${params.duration} year${params.duration > 1 ? 's' : ''}`
              }
            </Text>
            <View style={styles.riskProfileBadge}>
              <Text style={styles.riskProfileText}>{params.riskProfile} Risk</Text>
            </View>
          </View>
        </View>
        
        <View style={{ marginTop: 20 }}>
          <View style={styles.allocationHeader}>
            <Text style={styles.allocationTitle}>Asset Allocation</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={handleOpenAllocationEditor}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.allocationDetails}>
            {Object.entries(allocation).map(([key, value]) => (
              <TouchableOpacity 
                key={key}
                onPress={() => handleRecommendationClick(key)}
                style={styles.allocationItem}
              >
                <View style={styles.allocationItemContent}>
                  <Text style={styles.assetName}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                  <Text style={styles.assetPercentage}>{value}%</Text>
                </View>
                <View style={styles.allocationBar}>
                  <View 
                    style={[
                      styles.allocationFill,
                      { 
                        width: `${value}%`, 
                        backgroundColor: key === 'equity' ? '#FF6384' : 
                                        key === 'debt' ? '#36A2EB' : 
                                        key === 'gold' ? '#FFCE56' : '#4BC0C0'
                      }
                    ]} 
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  });

  const MarketNewsSection = MarketNewsSectionComponent || (() => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Market News</Text>
      <Text style={{ marginTop: 10 }}>Latest market updates will appear here.</Text>
    </View>
  ));

  const InsightsSection = InsightsSectionComponent || (() => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Insights</Text>
      <Text style={{ marginTop: 10 }}>Investment insights and recommendations will appear here.</Text>
    </View>
  ));

  // Render the active section
  const renderSectionContent = () => {
    const allocation = getCurrentAllocation();
    
    switch(activeSection) {
      case 'Market':
        return <MarketNewsSection />;
      case 'Insights':
        return <InsightsSection />;
      case 'Portfolio':
      default:
        return (
          <PortfolioSection 
            params={params}
            allocation={allocation}
            navigation={navigation}
            handleRecommendationClick={handleRecommendationClick}
            onEditInvestment={handleEditInvestment}
            onRiskProfileChange={handleRiskProfileChange}
            setShowRiskModal={setShowRiskModal}
            setCustomAllocation={setCustomAllocation}
          />
        );
    }
  };

  const FundsSidebar = ({ initialCategory, onSelectFund }) => (
    <View>
      <Text style={styles.sectionTitle}>
        Recommended {initialCategory.charAt(0).toUpperCase() + initialCategory.slice(1)} Funds
      </Text>
      {['Fund 1', 'Fund 2', 'Fund 3'].map((fund, index) => (
        <TouchableOpacity 
          key={index}
          onPress={() => onSelectFund({ name: fund, category: initialCategory })}
          style={styles.priceItem}
        >
          <View style={styles.symbolContainer}>
            <Text style={styles.symbol}>{fund}</Text>
            <Text style={styles.name}>Sample {initialCategory} fund</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  // useLayoutEffect(() => {
  //   navigation.setOptions({
  //     headerRight: () => (
  //       <TouchableOpacity 
  //         style={{ padding: 8 }}
  //         onPress={() => navigation.navigate('Settings')}
  //       >
  //         <Text style={{ fontSize: 20 }}>⚙️</Text>
  //       </TouchableOpacity>
  //     )
  //   });
  // }, [navigation]);

  const renderUserInfo = () => {
    if (!userData) return null;
    
    return (
      <View style={styles.userInfoContainer}>
        <View style={styles.userInfoHeader}>
          <Text style={styles.welcomeText}>
            Welcome, {userData.firstName}
          </Text>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert(
                "Logout",
                "Are you sure you want to logout?",
                [
                  { text: "Cancel", style: "cancel" },
                  { 
                    text: "Logout", 
                    style: "destructive",
                    onPress: () => navigation.navigate('Login')
                  }
                ]
              );
            }}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const userInfoStyles = {
    userInfoContainer: {
      padding: 16,
      backgroundColor: '#f8f9fa',
      borderRadius: 8,
      marginBottom: 16,
    },
    welcomeText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
    },
    userEmail: {
      fontSize: 14,
      color: '#666',
      marginTop: 4,
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Investment Dashboard</Text>
          <Text style={styles.subtitle}>Your personalized investment plan</Text>
        </View>
        
        {renderUserInfo()}

        <View style={styles.sectionButtons}>
          {sections.map(section => (
            <TouchableOpacity
              key={section.id}
              style={[
                styles.sectionButton,
                activeSection === section.id && styles.activeSectionButton
              ]}
              onPress={() => setActiveSection(section.id)}
            >
              <Text 
                style={[
                  styles.sectionButtonText,
                  activeSection === section.id && styles.activeSectionButtonText
                ]}
              >
                {section.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {renderSectionContent()}
      </ScrollView>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSidebar}
        onRequestClose={() => setShowSidebar(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Fund Recommendations</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowSidebar(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
            <FundsSidebar 
              initialCategory={selectedCategory} 
              onSelectFund={handleFundSelection}
            />
          </View>
        </View>
      </Modal>

      {/* Create a simple inline asset allocation editor */}
      {showAllocationEditor && editingAllocation && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showAllocationEditor}
          onRequestClose={handleCancelAllocation}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Asset Allocation</Text>
                <TouchableOpacity style={styles.closeButton} onPress={handleCancelAllocation}>
                  <Text style={styles.closeButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
              
              <View style={{ padding: 16 }}>
                {Object.entries(editingAllocation).map(([key, value]) => (
                  <View key={key} style={{ marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ fontSize: 16, fontWeight: '500' }}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{value}%</Text>
                    </View>
                    <Slider
                      minimumValue={0}
                      maximumValue={100}
                      step={1}
                      value={value}
                      onValueChange={(newValue) => {
                        const newAllocation = { ...editingAllocation };
                        newAllocation[key] = newValue;
                        
                        // Adjust other values to maintain total of 100%
                        const otherKeys = Object.keys(editingAllocation).filter(k => k !== key);
                        const otherSum = otherKeys.reduce((sum, k) => sum + newAllocation[k], 0);
                        const diff = 100 - newValue - otherSum;
                        
                        if (diff !== 0 && otherSum > 0) {
                          // Distribute the difference proportionally
                          otherKeys.forEach(k => {
                            const proportion = newAllocation[k] / otherSum;
                            newAllocation[k] = Math.max(0, Math.round(newAllocation[k] + (diff * proportion)));
                          });
                        }
                        
                        setEditingAllocation(newAllocation);
                      }}
                      minimumTrackTintColor="#7F00FF"
                      maximumTrackTintColor="#e0e0e0"
                    />
                  </View>
                ))}
                
                <TouchableOpacity
                  style={{
                    backgroundColor: '#7F00FF',
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                    marginTop: 16
                  }}
                  onPress={() => handleSaveAllocation(editingAllocation)}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Save Allocation</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Risk Profile Modal */}
      <RiskProfileModal
        visible={showRiskModal}
        onClose={() => setShowRiskModal(false)}
        onSelect={handleRiskProfileChange}
        currentProfile={params.riskProfile}
      />
    </SafeAreaView>
  );
};

export default Dashboard;








































