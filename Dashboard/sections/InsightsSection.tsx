import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';



interface PersonalizedTip {
  id: string;
  title: string;
  description: string;
  type: 'risk' | 'allocation' | 'strategy' | 'general';
}

interface PortfolioTrend {
  month: string;
  value: number;
  benchmark: number;
}

interface AssetAllocation {
  name: string;
  percentage: number;
  color: string;
}

interface PeerInsight {
  id: string;
  text: string;
  type: 'peer_comparison' | 'behavioral' | 'timing';
}

interface InsightsSectionProps {
  userData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    gender?: string;
    _id?: string;
  };
  params?: {
    amount: number;
    investmentType: string;
    duration: number;
    riskProfile: string;
  };
  allocation?: {
    equity: number;
    debt: number;
    gold: number;
    cash: number;
  };
}

// Helper functions
const getTipIcon = (type: string): string => {
  switch (type) {
    case 'risk': return '⚠️';
    case 'allocation': return '📊';
    case 'strategy': return '🎯';
    default: return '💡';
  }
};

const getTipIconColor = (type: string): string => {
  switch (type) {
    case 'risk': return '#FF9800';
    case 'allocation': return '#2196F3';
    case 'strategy': return '#4CAF50';
    default: return '#7F00FF';
  }
};

const getInsightTypeIcon = (type: string): string => {
  switch (type) {
    case 'peer_comparison': return '👥';
    case 'behavioral': return '🧠';
    case 'timing': return '⏰';
    default: return '📈';
  }
};

const getInsightTypeColor = (type: string): string => {
  switch (type) {
    case 'peer_comparison': return '#E91E63';
    case 'behavioral': return '#9C27B0';
    case 'timing': return '#FF5722';
    default: return '#607D8B';
  }
};

const InsightsSection: React.FC<InsightsSectionProps> = ({
  userData,
  params = { amount: 100000, investmentType: 'SIP', duration: 5, riskProfile: 'Moderate' },
  allocation = { equity: 60, debt: 25, gold: 10, cash: 5 }
}) => {
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  
  // New sections data states
  const [personalizedTips, setPersonalizedTips] = useState<PersonalizedTip[]>([]);
  const [portfolioTrends, setPortfolioTrends] = useState<PortfolioTrend[]>([]);
  const [assetAllocation, setAssetAllocation] = useState<AssetAllocation[]>([]);
  const [peerInsights, setPeerInsights] = useState<PeerInsight[]>([]);

  const fetchInsights = async () => {
    setInsightsLoading(true);
    setInsightsError(null);

    try {
      // Initialize personalized sections data
      initializePersonalizedTips();
      initializePortfolioTrends();
      initializeAssetAllocation();
      initializePeerInsights();

      // Set the last updated time
      const now = new Date();
      const formattedTime = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
      setLastUpdated(formattedTime);

      console.log('Personalized insights updated at', formattedTime);
    } catch (error) {
      console.error('Error loading insights:', error);
      setInsightsError('Failed to load personalized insights');

      // Initialize with fallback data
      initializePersonalizedTips();
      initializePortfolioTrends();
      initializeAssetAllocation();
      initializePeerInsights();
    } finally {
      setInsightsLoading(false);
    }
  };



  const initializePersonalizedTips = () => {
    const tips: PersonalizedTip[] = [];

    // Risk-based tips
    if (params.riskProfile === 'High') {
      if (allocation.equity > 80) {
        tips.push({
          id: '1',
          title: 'Consider Diversification',
          description: `You're heavily invested in high-risk assets (${allocation.equity}% equity) — consider adding 15-20% in debt-based mutual funds for stability.`,
          type: 'risk'
        });
      }
    } else if (params.riskProfile === 'Low') {
      if (allocation.equity < 40) {
        tips.push({
          id: '2',
          title: 'Growth Opportunity',
          description: `With ${params.duration} years investment horizon, consider increasing equity allocation to 40-50% for better long-term growth.`,
          type: 'allocation'
        });
      }
    }

    // Duration-based tips
    if (params.duration >= 10) {
      tips.push({
        id: '3',
        title: 'Long-term Strategy',
        description: `With ${params.duration} years investment horizon, equity-heavy allocation (60-70%) can maximize your wealth creation potential.`,
        type: 'strategy'
      });
    } else if (params.duration <= 3) {
      tips.push({
        id: '4',
        title: 'Short-term Focus',
        description: `For ${params.duration} year investment, prioritize debt funds (50-60%) and liquid funds for capital protection.`,
        type: 'strategy'
      });
    }

    // Investment type based tips
    if (params.investmentType === 'SIP') {
      tips.push({
        id: '5',
        title: 'SIP Advantage',
        description: `Your monthly SIP of ₹${(params.amount / (params.duration * 12)).toLocaleString('en-IN')} benefits from rupee cost averaging. Consider increasing by 10% annually.`,
        type: 'strategy'
      });
    }

    // Amount-based tips
    if (params.amount > 500000) {
      tips.push({
        id: '6',
        title: 'Tax Optimization',
        description: `With ₹${params.amount.toLocaleString('en-IN')} investment, consider ELSS funds for tax benefits under Section 80C.`,
        type: 'general'
      });
    }

    // Default tip if no specific conditions met
    if (tips.length === 0) {
      tips.push({
        id: '7',
        title: 'Balanced Approach',
        description: `Your current ${params.riskProfile.toLowerCase()} risk profile with ${allocation.equity}% equity allocation looks well-balanced for ${params.duration} year investment.`,
        type: 'general'
      });
    }

    // Limit to 2 tips maximum
    setPersonalizedTips(tips.slice(0, 2));
  };

  const initializePortfolioTrends = () => {
    // Generate realistic portfolio growth data based on investment parameters
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const trends: PortfolioTrend[] = [];

    // Base monthly investment for SIP or initial amount for lumpsum
    const monthlyInvestment = params.investmentType === 'SIP'
      ? params.amount / (params.duration * 12)
      : params.amount;

    // Expected returns based on risk profile and allocation
    const expectedAnnualReturn = calculateExpectedReturn();
    const monthlyReturnRate = expectedAnnualReturn / 12 / 100;

    // Benchmark return (assume Nifty 50 average ~12% annually)
    const benchmarkAnnualReturn = 12;
    const benchmarkMonthlyRate = benchmarkAnnualReturn / 12 / 100;

    let cumulativeInvestment = 0;
    let portfolioValue = 0;
    let benchmarkValue = 0;

    months.forEach((month, index) => {
      if (params.investmentType === 'SIP') {
        cumulativeInvestment += monthlyInvestment;
        // For SIP, add monthly investment and apply returns
        portfolioValue = cumulativeInvestment * (1 + monthlyReturnRate * (index + 1));
        benchmarkValue = cumulativeInvestment * (1 + benchmarkMonthlyRate * (index + 1));
      } else {
        // For lumpsum, apply compound returns
        if (index === 0) {
          cumulativeInvestment = monthlyInvestment;
          portfolioValue = monthlyInvestment;
          benchmarkValue = monthlyInvestment;
        } else {
          portfolioValue = portfolioValue * (1 + monthlyReturnRate + (Math.random() - 0.5) * 0.02); // Add some volatility
          benchmarkValue = benchmarkValue * (1 + benchmarkMonthlyRate + (Math.random() - 0.5) * 0.015);
        }
      }

      trends.push({
        month,
        value: Math.round(portfolioValue),
        benchmark: Math.round(benchmarkValue)
      });
    });

    setPortfolioTrends(trends);
  };

  const calculateExpectedReturn = (): number => {
    // Calculate weighted average expected return based on allocation
    const equityReturn = 14; // Expected equity return %
    const debtReturn = 7;    // Expected debt return %
    const goldReturn = 8;    // Expected gold return %
    const cashReturn = 4;    // Expected cash return %

    return (
      (allocation.equity * equityReturn +
       allocation.debt * debtReturn +
       allocation.gold * goldReturn +
       allocation.cash * cashReturn) / 100
    );
  };

  const initializeAssetAllocation = () => {
    // Use real allocation data from props
    const allocationData: AssetAllocation[] = [
      { name: 'Equity', percentage: allocation.equity, color: '#7F00FF' },
      { name: 'Debt', percentage: allocation.debt, color: '#4CAF50' },
      { name: 'Gold', percentage: allocation.gold, color: '#FFC107' },
      { name: 'Cash', percentage: allocation.cash, color: '#9E9E9E' }
    ].filter(item => item.percentage > 0); // Only show non-zero allocations

    setAssetAllocation(allocationData);
  };

  const initializePeerInsights = () => {
    const insights: PeerInsight[] = [];

    // Portfolio size based insights
    if (params.amount >= 500000) {
      insights.push({
        id: '1',
        text: `78% of users with ₹${Math.floor(params.amount/100000)}L+ portfolios also invest in Gold ETFs for diversification.`,
        type: 'peer_comparison'
      });
    } else if (params.amount >= 100000) {
      insights.push({
        id: '2',
        text: `65% of users with similar portfolio size (₹${Math.floor(params.amount/100000)}L) prefer SIP over lumpsum investments.`,
        type: 'peer_comparison'
      });
    }

    // Risk profile based insights
    if (params.riskProfile === 'High') {
      insights.push({
        id: '3',
        text: `High-risk investors like you typically see 15-18% annual returns over ${params.duration}+ year periods.`,
        type: 'behavioral'
      });
    } else if (params.riskProfile === 'Low') {
      insights.push({
        id: '4',
        text: `Conservative investors with similar profiles achieve 8-10% stable returns with lower volatility.`,
        type: 'behavioral'
      });
    }

    // Investment type insights
    if (params.investmentType === 'SIP') {
      insights.push({
        id: '5',
        text: `SIP investors who started in 2024 are seeing 14% better returns compared to lumpsum investors due to market volatility.`,
        type: 'timing'
      });
    }

    // Duration based insights
    if (params.duration >= 10) {
      insights.push({
        id: '6',
        text: `Investors with ${params.duration}+ year horizons who stayed invested through market cycles achieved 16% average annual returns.`,
        type: 'timing'
      });
    }

    // Gender-based insights (if userData available)
    if (userData?.gender) {
      const genderInsight = userData.gender === 'Female'
        ? "Female investors typically outperform male investors by 2-3% due to disciplined long-term approach."
        : "Male investors who follow systematic investment plans achieve better results than those who time the market.";

      insights.push({
        id: '7',
        text: genderInsight,
        type: 'behavioral'
      });
    }

    // Allocation specific insights
    if (allocation.equity > 70) {
      insights.push({
        id: '8',
        text: `Users with ${allocation.equity}%+ equity allocation experienced 20% higher returns during bull markets but 15% higher volatility.`,
        type: 'behavioral'
      });
    }

    // Limit to 2 insights and randomize selection
    const shuffled = insights.sort(() => 0.5 - Math.random());
    setPeerInsights(shuffled.slice(0, 2));
  };

  // Add a manual refresh function
  const handleRefreshInsights = () => {
    fetchInsights();
  };

  // Fetch insights when component mounts
  useEffect(() => {
    fetchInsights();

    // Refresh insights every 5 minutes
    const intervalId = setInterval(fetchInsights, 5 * 60 * 1000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [params, allocation, userData]); // Re-run when props change

  return (
    <View style={styles.insightsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Personalized Investment Insights</Text>
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
          <Text style={styles.loadingText}>Loading personalized insights...</Text>
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

          {/* Section 1: Personalized Investment Tips */}
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Personalized Investment Tips</Text>
            <View style={styles.tipsContainer}>
              {personalizedTips.map((tip) => (
                <View key={tip.id} style={styles.tipItem}>
                  <View style={[styles.tipIcon, { backgroundColor: getTipIconColor(tip.type) }]}>
                    <Text style={styles.tipIconText}>{getTipIcon(tip.type)}</Text>
                  </View>
                  <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>{tip.title}</Text>
                    <Text style={styles.tipDescription}>{tip.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Section 2: Portfolio Trends */}
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Portfolio Trends</Text>

            {/* Simple Line Chart Representation */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartSubtitle}>Portfolio Growth vs Benchmark</Text>
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#7F00FF' }]} />
                  <Text style={styles.legendText}>Your Portfolio</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#FF6B6B' }]} />
                  <Text style={styles.legendText}>Nifty 50</Text>
                </View>
              </View>

              {/* Simple chart visualization */}
              <View style={styles.simpleChart}>
                {portfolioTrends.map((trend, index) => (
                  <View key={index} style={styles.chartBar}>
                    <Text style={styles.chartMonth}>{trend.month}</Text>
                    <View style={styles.barContainer}>
                      <View
                        style={[
                          styles.portfolioBar,
                          { height: (trend.value / 120000) * 60 }
                        ]}
                      />
                      <View
                        style={[
                          styles.benchmarkBar,
                          { height: (trend.benchmark / 120000) * 60 }
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Asset Allocation Pie Chart */}
            <View style={styles.allocationContainer}>
              <Text style={styles.chartSubtitle}>Asset Allocation</Text>
              <View style={styles.allocationChart}>
                {assetAllocation.map((asset, index) => (
                  <View key={index} style={styles.allocationItem}>
                    <View style={[styles.allocationColor, { backgroundColor: asset.color }]} />
                    <Text style={styles.allocationText}>{asset.name}: {asset.percentage}%</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Section 3: Peer & Behavioral Insights */}
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Peer & Behavioral Insights</Text>
            <View style={styles.peerInsightsContainer}>
              {peerInsights.map((insight) => (
                <View key={insight.id} style={styles.peerInsightItem}>
                  <View style={[styles.insightTypeIcon, { backgroundColor: getInsightTypeColor(insight.type) }]}>
                    <Text style={styles.insightTypeText}>{getInsightTypeIcon(insight.type)}</Text>
                  </View>
                  <Text style={styles.peerInsightText}>{insight.text}</Text>
                </View>
              ))}
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
  // New styles for personalized tips
  tipsContainer: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#7F00FF',
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipIconText: {
    fontSize: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  // Portfolio trends styles
  chartContainer: {
    marginBottom: 16,
  },
  chartSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  simpleChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  chartMonth: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  portfolioBar: {
    width: 8,
    backgroundColor: '#7F00FF',
    borderRadius: 2,
  },
  benchmarkBar: {
    width: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 2,
  },
  // Asset allocation styles
  allocationContainer: {
    marginTop: 16,
  },
  allocationChart: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
  },
  allocationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  allocationColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  allocationText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  // Peer insights styles
  peerInsightsContainer: {
    gap: 12,
  },
  peerInsightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
  },
  insightTypeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  insightTypeText: {
    fontSize: 14,
  },
  peerInsightText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default InsightsSection;
