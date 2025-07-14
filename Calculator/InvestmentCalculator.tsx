import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from './InvestmentCalculatorStyles';
import { investmentCalculatorAPI, userProfileAPI } from '../services/apiService';

export default function InvestmentCalculator({ navigation, route }) {
  // Get user data and survey results from route params
  const userData = route.params?.userData || null;
  const surveyRiskProfile = route.params?.risk || 'Medium';
  
  // Map survey risk profile to our risk levels
  const mapRiskProfile = (surveyRisk) => {
    switch(surveyRisk) {
      case 'Conservative':
      case 'Very Conservative':
        return 'Low';
      case 'Moderate':
      case 'Medium':
        return 'Moderate';
      case 'Aggressive':
      case 'Very Aggressive':
        return 'High';
      default:
        return 'Moderate';
    }
  };

  const [amountType, setAmountType] = useState('SIP');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [duration, setDuration] = useState(1);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Use risk profile from survey
  const riskProfile = mapRiskProfile(surveyRiskProfile);

  // Check if user has already completed calculator on component mount
  useEffect(() => {
    checkUserCalculatorStatus();
  }, []);

  const checkUserCalculatorStatus = async () => {
    if (!userData?._id) {
      setCheckingStatus(false);
      return;
    }

    try {
      setCheckingStatus(true);
      const statusData = await userProfileAPI.checkUserCompletionStatus(userData._id);

      if (statusData.canGoDirectlyToDashboard) {
        // User has completed both questions and calculator, go directly to dashboard
        navigation.navigate('Dashboard', {
          amount: statusData.calculatorData.totalAmount,
          investmentType: statusData.calculatorData.amountType,
          duration: statusData.calculatorData.duration,
          riskProfile: statusData.calculatorData.riskProfile,
          userData: userData
        });
        return;
      }

      if (statusData.hasCompletedCalculator) {
        // User has completed calculator, load existing data and go to dashboard
        navigation.navigate('Dashboard', {
          amount: statusData.calculatorData.totalAmount,
          investmentType: statusData.calculatorData.amountType,
          duration: statusData.calculatorData.duration,
          riskProfile: statusData.calculatorData.riskProfile,
          userData: userData
        });
        return;
      }

      // User hasn't completed calculator, load existing data if any
      if (statusData.calculatorData) {
        setInvestmentAmount(statusData.calculatorData.investmentAmount.toString());
        setAmountType(statusData.calculatorData.amountType);
        setDuration(statusData.calculatorData.duration);
        setTotal(statusData.calculatorData.totalAmount);
      }
    } catch (error) {
      console.error('Error checking calculator status:', error);
      // Continue with normal flow if API fails
    } finally {
      setCheckingStatus(false);
    }
  };

  const calculateInvestment = async () => {
    const amount = parseFloat(investmentAmount);
    if (isNaN(amount)) {
      Alert.alert('Please enter a valid investment amount');
      return;
    }

    if (!userData?._id) {
      Alert.alert('Error', 'User data not found. Please login again.');
      return;
    }

    let calculatedTotal = 0;
    if (amountType === 'SIP') {
      calculatedTotal = amount * duration * 12;
    } else {
      calculatedTotal = amount;
    }

    setTotal(calculatedTotal);

    try {
      setLoading(true);

      // Save calculator data to backend
      const surveyAnswers = {
        risk: route.params?.risk,
        goal: route.params?.goal,
        investmentDuration: route.params?.investmentDuration,
        experience: route.params?.experience
      };

      await investmentCalculatorAPI.saveCalculator(userData._id, {
        investmentAmount: amount,
        amountType: amountType,
        duration: duration,
        riskProfile: riskProfile,
        totalAmount: calculatedTotal,
        surveyAnswers: surveyAnswers
      });

      // Navigate to Dashboard with investment details AND user data
      navigation.navigate('Dashboard', {
        amount: calculatedTotal,
        investmentType: amountType,
        duration: duration,
        riskProfile: route.params?.predictedRiskProfile || riskProfile,
        userData: userData,
        predictedRiskProfile: route.params?.predictedRiskProfile,
        mlConfidence: route.params?.mlConfidence
      });
    } catch (error) {
      console.error('Error saving calculator data:', error);
      Alert.alert(
        'Error',
        'Failed to save your investment data. Please try again.',
        [
          {
            text: 'Retry',
            onPress: calculateInvestment
          },
          {
            text: 'Continue Anyway',
            onPress: () => {
              // Continue to dashboard even if save fails
              navigation.navigate('Dashboard', {
                amount: calculatedTotal,
                investmentType: amountType,
                duration: duration,
                riskProfile: route.params?.predictedRiskProfile || riskProfile,
                userData: userData,
                predictedRiskProfile: route.params?.predictedRiskProfile,
                mlConfidence: route.params?.mlConfidence
              });
            }
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while checking user status
  if (checkingStatus) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#e8ecf4', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#7F00FF" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Checking your progress...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e8ecf4' }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Investment Calculator</Text>
          <Text style={styles.subtitle}>Estimate your investment sum</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.inputLabel}>Enter Investment Amount</Text>
          <TextInput
            style={styles.inputControl}
            keyboardType="numeric"
            placeholder="Enter amount (e.g. 10000)"
            value={investmentAmount}
            onChangeText={setInvestmentAmount}
          />

          <Text style={[styles.inputLabel, { marginTop: 20 }]}>Select Investment Type</Text>
          <View style={styles.row}>
            {['SIP', 'One-time'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.option,
                  amountType === type && styles.selectedOption,
                ]}
                onPress={() => {
                  setAmountType(type);
                  if (type === 'One-time') setDuration(1);
                  setTotal(null);
                }}>
                <Text style={[styles.optionText, amountType === type && { color: 'white' }]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {amountType === 'SIP' && (
            <>
              <Text style={[styles.inputLabel, { marginTop: 20 }]}>Select Duration</Text>
              <View style={styles.row}>
                {[1, 2, 3].map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.option,
                      duration === year && styles.selectedOption,
                    ]}
                    onPress={() => {
                      setDuration(year);
                      setTotal(null);
                    }}>
                    <Text style={[styles.optionText, duration === year && { color: 'white' }]}>{year} Year</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <View style={styles.formAction}>
            <TouchableOpacity onPress={calculateInvestment} disabled={loading}>
              <View style={[styles.btn, { marginTop: 30, opacity: loading ? 0.7 : 1 }]}>
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.btnText}>Calculate</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {total !== null && (
            <View style={{ marginTop: 20, alignItems: 'center' }}>
              <Text style={styles.resultText}>
                Total Investment: ₹{total.toLocaleString()}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
