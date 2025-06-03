import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal
} from 'react-native';
import Slider from '@react-native-community/slider';

interface AssetAllocation {
  equity: number;
  debt: number;
  gold: number;
  cash: number;
}

interface CustomAssetAllocationEditorProps {
  visible: boolean;
  initialAllocation: AssetAllocation;
  onSave: (allocation: AssetAllocation) => void;
  onCancel: () => void;
}

const CustomAssetAllocationEditor = ({ 
  visible, 
  initialAllocation, 
  onSave, 
  onCancel 
}: CustomAssetAllocationEditorProps) => {
  const [allocation, setAllocation] = useState<AssetAllocation>({...initialAllocation});
  const [total, setTotal] = useState<number>(100);
  
  // Reset allocation when initialAllocation changes
  useEffect(() => {
    if (visible) {
      setAllocation({...initialAllocation});
    }
  }, [visible, initialAllocation]);
  
  // Update total whenever allocation changes
  useEffect(() => {
    const newTotal = allocation.equity + allocation.debt + allocation.gold + allocation.cash;
    setTotal(newTotal);
  }, [allocation]);
  
  // Handle slider changes with improved distribution
  const handleSliderChange = (value: number, assetType: keyof AssetAllocation) => {
    // Calculate the difference from previous value
    const diff = value - allocation[assetType];
    
    // Create a new allocation object
    const newAllocation = { ...allocation };
    newAllocation[assetType] = value;
    
    // Adjust other values proportionally to maintain total of 100%
    const otherTypes = Object.keys(allocation).filter(key => key !== assetType) as Array<keyof AssetAllocation>;
    
    // Calculate sum of other types
    const otherSum = otherTypes.reduce((sum, type) => sum + allocation[type], 0);
    
    if (otherSum > 0) {
      // Distribute the difference proportionally
      otherTypes.forEach(type => {
        const proportion = allocation[type] / otherSum;
        newAllocation[type] = Math.max(0, allocation[type] - (diff * proportion));
      });
    }
    
    // Round values to integers and ensure they sum to 100
    let roundedAllocation = { ...newAllocation };
    let roundedSum = 0;
    
    Object.keys(roundedAllocation).forEach(key => {
      const assetKey = key as keyof AssetAllocation;
      roundedAllocation[assetKey] = Math.round(roundedAllocation[assetKey]);
      roundedSum += roundedAllocation[assetKey];
    });
    
    // Adjust for rounding errors
    if (roundedSum !== 100) {
      // Find the asset with the largest value to adjust
      const largestAsset = Object.keys(roundedAllocation).reduce(
        (a, b) => roundedAllocation[a as keyof AssetAllocation] > roundedAllocation[b as keyof AssetAllocation] ? a : b
      ) as keyof AssetAllocation;
      
      roundedAllocation[largestAsset] += (100 - roundedSum);
    }
    
    setAllocation(roundedAllocation);
  };
  
  // Handle save button press
  const handleSave = () => {
    if (total !== 100) {
      Alert.alert('Invalid Allocation', 'Total allocation must equal 100%');
      return;
    }
    onSave(allocation);
  };
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Adjust Asset Allocation</Text>
          <Text style={styles.subtitle}>Drag sliders to adjust allocation percentages</Text>
          
          <View style={styles.allocationContainer}>
            {/* Equity */}
            <View style={styles.allocationItem}>
              <View style={styles.labelRow}>
                <Text style={styles.assetName}>Equity</Text>
                <Text style={styles.assetPercentage}>{allocation.equity}%</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                step={1}
                value={allocation.equity}
                onValueChange={(value) => handleSliderChange(value, 'equity')}
                minimumTrackTintColor="#7F00FF"
                maximumTrackTintColor="#e0e0e0"
                thumbTintColor="#7F00FF"
              />
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${allocation.equity}%`, backgroundColor: '#7F00FF' }
                  ]} 
                />
              </View>
            </View>
            
            {/* Debt */}
            <View style={styles.allocationItem}>
              <View style={styles.labelRow}>
                <Text style={styles.assetName}>Debt</Text>
                <Text style={styles.assetPercentage}>{allocation.debt}%</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                step={1}
                value={allocation.debt}
                onValueChange={(value) => handleSliderChange(value, 'debt')}
                minimumTrackTintColor="#4CAF50"
                maximumTrackTintColor="#e0e0e0"
                thumbTintColor="#4CAF50"
              />
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${allocation.debt}%`, backgroundColor: '#4CAF50' }
                  ]} 
                />
              </View>
            </View>
            
            {/* Gold */}
            <View style={styles.allocationItem}>
              <View style={styles.labelRow}>
                <Text style={styles.assetName}>Gold</Text>
                <Text style={styles.assetPercentage}>{allocation.gold}%</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                step={1}
                value={allocation.gold}
                onValueChange={(value) => handleSliderChange(value, 'gold')}
                minimumTrackTintColor="#FFC107"
                maximumTrackTintColor="#e0e0e0"
                thumbTintColor="#FFC107"
              />
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${allocation.gold}%`, backgroundColor: '#FFC107' }
                  ]} 
                />
              </View>
            </View>
            
            {/* Cash */}
            <View style={styles.allocationItem}>
              <View style={styles.labelRow}>
                <Text style={styles.assetName}>Cash</Text>
                <Text style={styles.assetPercentage}>{allocation.cash}%</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                step={1}
                value={allocation.cash}
                onValueChange={(value) => handleSliderChange(value, 'cash')}
                minimumTrackTintColor="#2196F3"
                maximumTrackTintColor="#e0e0e0"
                thumbTintColor="#2196F3"
              />
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${allocation.cash}%`, backgroundColor: '#2196F3' }
                  ]} 
                />
              </View>
            </View>
          </View>
          
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={[
              styles.totalValue,
              total !== 100 ? styles.invalidTotal : null
            ]}>
              {total}%
            </Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Allocation</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  allocationContainer: {
    marginBottom: 20,
  },
  allocationItem: {
    marginBottom: 15,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '500',
  },
  assetPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  invalidTotal: {
    color: 'red',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CustomAssetAllocationEditor;