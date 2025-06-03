import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated
} from 'react-native';
import Slider from '@react-native-community/slider';

interface AssetAllocation {
  equity: number;
  debt: number;
  gold: number;
  cash: number;
}

interface AssetAllocationEditorProps {
  initialAllocation: AssetAllocation;
  onSave: (allocation: AssetAllocation) => void;
  onCancel: () => void;
}

const AssetAllocationEditor = ({ initialAllocation, onSave, onCancel }: AssetAllocationEditorProps) => {
  const [allocation, setAllocation] = useState<AssetAllocation>({...initialAllocation});
  const [total, setTotal] = useState<number>(100);
  const [isAdjusting, setIsAdjusting] = useState<boolean>(false);
  
  // Update total whenever allocation changes
  useEffect(() => {
    const newTotal = allocation.equity + allocation.debt + allocation.gold + allocation.cash;
    setTotal(newTotal);
  }, [allocation]);
  
  // Handle slider changes with improved distribution
  const handleSliderChange = (value: number, assetType: keyof AssetAllocation) => {
    setIsAdjusting(true);
    
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
  
  // Handle slider release
  const handleSliderComplete = () => {
    setIsAdjusting(false);
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
    <View style={styles.container}>
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
            onSlidingComplete={handleSliderComplete}
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
            onSlidingComplete={handleSliderComplete}
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
            onSlidingComplete={handleSliderComplete}
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
            onSlidingComplete={handleSliderComplete}
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
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  allocationContainer: {
    marginTop: 8,
  },
  allocationItem: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  assetPercentage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  slider: {
    height: 40,
    marginHorizontal: -10,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: -10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  invalidTotal: {
    color: '#F44336',
  },
  buttonContainer: {
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#7F00FF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AssetAllocationEditor;


