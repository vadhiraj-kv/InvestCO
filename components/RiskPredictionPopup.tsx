import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions
} from 'react-native';

interface RiskPredictionPopupProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
  prediction: {
    riskLevel: string;
    confidence: number;
    assetAllocation: {
      equity: number;
      debt: number;
      gold: number;
      cash: number;
      expectedReturn: string;
    };
    message: {
      title: string;
      description: string;
      recommendations: string[];
      confidence: string;
    };
  };
}

const RiskPredictionPopup: React.FC<RiskPredictionPopupProps> = ({
  visible,
  onClose,
  onAccept,
  prediction
}) => {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High': return '#F44336';
      case 'Moderate': return '#FF9800';
      case 'Low': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>🎯 Risk Assessment Complete!</Text>
              <Text style={styles.subtitle}>AI-powered analysis of your investment profile</Text>
            </View>

            {/* Risk Level Badge */}
            <View style={styles.riskSection}>
              <View style={[styles.riskBadge, { backgroundColor: getRiskColor(prediction.riskLevel) }]}>
                <Text style={styles.riskBadgeText}>{prediction.message.title}</Text>
                <Text style={styles.confidenceText}>Confidence: {prediction.message.confidence}</Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.descriptionSection}>
              <Text style={styles.description}>{prediction.message.description}</Text>
            </View>

            {/* Asset Allocation */}
            <View style={styles.allocationSection}>
              <Text style={styles.sectionTitle}>📊 Recommended Asset Allocation</Text>
              <View style={styles.allocationGrid}>
                <View style={styles.allocationItem}>
                  <Text style={styles.allocationLabel}>Equity</Text>
                  <Text style={[styles.allocationValue, { color: '#7F00FF' }]}>{prediction.assetAllocation.equity}%</Text>
                </View>
                <View style={styles.allocationItem}>
                  <Text style={styles.allocationLabel}>Debt</Text>
                  <Text style={[styles.allocationValue, { color: '#4CAF50' }]}>{prediction.assetAllocation.debt}%</Text>
                </View>
                <View style={styles.allocationItem}>
                  <Text style={styles.allocationLabel}>Gold</Text>
                  <Text style={[styles.allocationValue, { color: '#FFC107' }]}>{prediction.assetAllocation.gold}%</Text>
                </View>
                <View style={styles.allocationItem}>
                  <Text style={styles.allocationLabel}>Cash</Text>
                  <Text style={[styles.allocationValue, { color: '#9E9E9E' }]}>{prediction.assetAllocation.cash}%</Text>
                </View>
              </View>
              <View style={styles.expectedReturnContainer}>
                <Text style={styles.expectedReturnLabel}>Expected Annual Return:</Text>
                <Text style={styles.expectedReturnValue}>{prediction.assetAllocation.expectedReturn}</Text>
              </View>
            </View>

            {/* Recommendations */}
            <View style={styles.recommendationsSection}>
              <Text style={styles.sectionTitle}>💡 Investment Recommendations</Text>
              {prediction.message.recommendations.map((recommendation, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.recommendationBullet}>•</Text>
                  <Text style={styles.recommendationText}>{recommendation}</Text>
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
                <Text style={styles.acceptButtonText}>✅ Apply This Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: width * 0.9,
    maxHeight: height * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  riskSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  riskBadge: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 200,
  },
  riskBadgeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  confidenceText: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
  },
  descriptionSection: {
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
  },
  allocationSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  allocationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  allocationItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  allocationLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  allocationValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  expectedReturnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
  },
  expectedReturnLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  expectedReturnValue: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  recommendationsSection: {
    marginBottom: 24,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationBullet: {
    fontSize: 16,
    color: '#7F00FF',
    marginRight: 8,
    marginTop: 2,
  },
  recommendationText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
  },
  acceptButton: {
    backgroundColor: '#7F00FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RiskPredictionPopup;
