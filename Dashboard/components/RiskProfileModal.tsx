import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet,
  TouchableWithoutFeedback
} from 'react-native';

interface RiskProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (profile: string) => void;
  currentProfile: string;
}

const RiskProfileModal = ({ 
  visible, 
  onClose, 
  onSelect,
  currentProfile
}: RiskProfileModalProps) => {
  
  const riskProfiles = [
    {
      name: 'Low',
      description: 'Conservative approach with lower risk and returns (30% Equity, 50% Debt, 10% Gold, 10% Cash)',
      color: '#4CAF50'
    },
    {
      name: 'Moderate',
      description: 'Balanced approach with moderate risk and returns (60% Equity, 25% Debt, 10% Gold, 5% Cash)',
      color: '#FFC107'
    },
    {
      name: 'High',
      description: 'Aggressive approach with higher risk and potential returns (80% Equity, 10% Debt, 5% Gold, 5% Cash)',
      color: '#F44336'
    }
  ];

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Risk Profile</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalSubtitle}>
                Choose a risk profile that matches your investment goals and comfort level
              </Text>
              
              <View style={styles.profileOptions}>
                {riskProfiles.map((profile) => (
                  <TouchableOpacity
                    key={profile.name}
                    style={[
                      styles.profileOption,
                      currentProfile === profile.name && styles.selectedProfile,
                      { borderColor: profile.color }
                    ]}
                    onPress={() => onSelect(profile.name)}
                  >
                    <View style={styles.profileHeader}>
                      <View style={[styles.profileBadge, { backgroundColor: profile.color }]}>
                        <Text style={styles.profileBadgeText}>{profile.name}</Text>
                      </View>
                      
                      {currentProfile === profile.name && (
                        <View style={styles.checkmark}>
                          <Text style={styles.checkmarkText}>✓</Text>
                        </View>
                      )}
                    </View>
                    
                    <Text style={styles.profileDescription}>
                      {profile.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#999',
    fontWeight: 'bold',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  profileOptions: {
    marginBottom: 20,
  },
  profileOption: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  selectedProfile: {
    backgroundColor: '#f8f8f8',
    borderWidth: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  profileBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#7F00FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontWeight: 'bold',
  },
  profileDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#7F00FF',
    fontWeight: '500',
  },
});

export default RiskProfileModal;