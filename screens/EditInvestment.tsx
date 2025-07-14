import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';


type RootStackParamList = {
  EditInvestment: {
    amount: number;
    investmentType: string;
    duration: number;
    riskProfile: string;
  };
  Dashboard: {
    amount: number;
    investmentType: string;
    duration: number;
    riskProfile: string;
  };
};

type EditInvestmentRouteProp = RouteProp<RootStackParamList, 'EditInvestment'>;
type EditInvestmentNavigationProp = StackNavigationProp<RootStackParamList, 'EditInvestment'>;

export default function EditInvestment() {
  const navigation = useNavigation<EditInvestmentNavigationProp>();
  const route = useRoute<EditInvestmentRouteProp>();
  

  const { amount, investmentType, duration, riskProfile } = route.params;
  

  const [editedAmount, setEditedAmount] = useState(amount.toString());
  const [editedInvestmentType, setEditedInvestmentType] = useState(investmentType);
  const [editedDuration, setEditedDuration] = useState(duration.toString());
  const [editedRiskProfile, setEditedRiskProfile] = useState(riskProfile);
  

  const saveChanges = () => {

    const parsedAmount = parseFloat(editedAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid investment amount');
      return;
    }
    
    
    const parsedDuration = parseInt(editedDuration);
    if (editedInvestmentType === 'SIP' && (isNaN(parsedDuration) || parsedDuration <= 0)) {
      Alert.alert('Invalid Duration', 'Please enter a valid duration in years');
      return;
    }
    
   
    navigation.navigate('Dashboard', {
      amount: parsedAmount,
      investmentType: editedInvestmentType,
      duration: parsedDuration,
      riskProfile: editedRiskProfile
    });
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e8ecf4' }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Edit Investment</Text>
          <Text style={styles.subtitle}>Update your investment details</Text>
        </View>
        
        <View style={styles.form}>
          {/* Investment Amount */}
          <Text style={styles.inputLabel}>Investment Amount (₹)</Text>
          <TextInput
            style={styles.inputControl}
            keyboardType="numeric"
            value={editedAmount}
            onChangeText={setEditedAmount}
          />
          
          {/* Investment Type */}
          <Text style={[styles.inputLabel, { marginTop: 20 }]}>Investment Type</Text>
          <View style={styles.optionsRow}>
            {['SIP', 'One-time'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.option,
                  editedInvestmentType === type && styles.selectedOption,
                ]}
                onPress={() => setEditedInvestmentType(type)}
              >
                <Text style={[
                  styles.optionText,
                  editedInvestmentType === type && styles.selectedOptionText
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Duration (only for SIP) */}
          {editedInvestmentType === 'SIP' && (
            <>
              <Text style={[styles.inputLabel, { marginTop: 20 }]}>Duration (Years)</Text>
              <View style={styles.optionsRow}>
                {[1, 2, 3].map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.option,
                      parseInt(editedDuration) === year && styles.selectedOption,
                    ]}
                    onPress={() => setEditedDuration(year.toString())}
                  >
                    <Text style={[
                      styles.optionText,
                      parseInt(editedDuration) === year && styles.selectedOptionText
                    ]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
          
          {/* Risk Profile */}
          <Text style={[styles.inputLabel, { marginTop: 20 }]}>Risk Profile</Text>
          <View style={styles.optionsRow}>
            {['Low', 'Medium', 'High'].map((risk) => (
              <TouchableOpacity
                key={risk}
                style={[
                  styles.option,
                  editedRiskProfile === risk && styles.selectedOption,
                ]}
                onPress={() => setEditedRiskProfile(risk)}
              >
                <Text style={[
                  styles.optionText,
                  editedRiskProfile === risk && styles.selectedOptionText
                ]}>
                  {risk}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveChanges}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  inputControl: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  option: {
    flex: 1,
    minWidth: 80,
    margin: 5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#7F00FF',
    borderColor: '#7F00FF',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 30,
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
