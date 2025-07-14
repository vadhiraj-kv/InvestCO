import React, { useState, useEffect } from 'react';


import styles from './UserQuestionStyles'
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { userQuestionsAPI, userProfileAPI, testAPI } from '../services/apiService';
import { mlRiskService } from '../services/mlRiskService';
import RiskPredictionPopup from '../components/RiskPredictionPopup';

export default function InvestmentSurvey({ navigation, route }) {
  // Get user data from route params
  const userData = route.params?.userData || null;

  const [answers, setAnswers] = useState({
    risk: '',
    goal: '',
    investmentDuration: '',
    experience: '',
  });
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [showRiskPopup, setShowRiskPopup] = useState(false);
  const [riskPrediction, setRiskPrediction] = useState<any>(null);
  const [isRetake, setIsRetake] = useState(false);

  // Check if user has already completed questions on component mount
  useEffect(() => {
    // Check if this is a retake survey
    if (route.params?.isRetake) {
      setIsRetake(true);
      setCheckingStatus(false); // Skip status check for retakes
    } else {
      checkUserStatus();
    }
  }, []);

  const checkUserStatus = async () => {
    if (!userData?._id) {
      setCheckingStatus(false);
      return;
    }

    try {
      setCheckingStatus(true);

      // First test the connection
      console.log('Testing API connection...');
      await testAPI.checkConnection();
      console.log('API connection successful!');

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

      if (statusData.shouldSkipQuestions) {
        // User has completed questions, go to calculator
        navigation.navigate('InvestmentCalculator', {
          risk: statusData.questionsData.risk,
          goal: statusData.questionsData.goal,
          investmentDuration: statusData.questionsData.investmentDuration,
          experience: statusData.questionsData.experience,
          userData: userData
        });
        return;
      }

      // User hasn't completed questions, load existing data if any
      if (statusData.questionsData) {
        setAnswers({
          risk: statusData.questionsData.risk || '',
          goal: statusData.questionsData.goal || '',
          investmentDuration: statusData.questionsData.investmentDuration || '',
          experience: statusData.questionsData.experience || '',
        });
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      // Continue with normal flow if API fails
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleSelect = (question: string, option: string) => {
    setAnswers({ ...answers, [question]: option });
  };

  const isFormComplete = Object.values(answers).every((val) => val !== '');

  const handleSubmit = async () => {
    if (!isFormComplete) {
      Alert.alert('Incomplete', 'Please answer all the questions before submitting.');
      return;
    }

    if (!userData?._id) {
      Alert.alert('Error', 'User data not found. Please login again.');
      return;
    }

    try {
      setLoading(true);

      // Save questions to backend (this will update existing responses for retakes)
      await userQuestionsAPI.saveQuestions(userData._id, answers);

      // Generate ML risk prediction
      const prediction = await mlRiskService.predictRisk(answers);
      setRiskPrediction(prediction);
      setShowRiskPopup(true);

    } catch (error) {
      console.error('Error saving questions:', error);
      Alert.alert(
        'Error',
        'Failed to save your answers. Please try again.',
        [
          {
            text: 'Retry',
            onPress: handleSubmit
          },
          {
            text: 'Continue Anyway',
            onPress: async () => {
              // Generate prediction and show popup even if save fails
              try {
                const prediction = await mlRiskService.predictRisk(answers);
                setRiskPrediction(prediction);
                setShowRiskPopup(true);
              } catch (error) {
                console.error('Error in fallback prediction:', error);
                Alert.alert('Error', 'Unable to generate risk prediction. Please try again.');
              }
            }
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptPrediction = () => {
    setShowRiskPopup(false);

    if (isRetake) {
      // For retakes, go back to Dashboard with updated risk profile
      navigation.navigate('Dashboard', {
        amount: route.params?.amount || 100000,
        investmentType: route.params?.investmentType || 'SIP',
        duration: route.params?.duration || 12,
        riskProfile: riskPrediction.riskLevel,
        userData: userData,
        predictedRiskProfile: riskPrediction.riskLevel,
        mlConfidence: riskPrediction.confidence,
        isUpdated: true // Flag to show update message
      });
    } else {
      // For new users, go to calculator
      navigation.navigate('InvestmentCalculator', {
        risk: answers.risk,
        goal: answers.goal,
        investmentDuration: answers.investmentDuration,
        experience: answers.experience,
        userData: userData,
        predictedRiskProfile: riskPrediction.riskLevel,
        mlConfidence: riskPrediction.confidence
      });
    }
  };

  const handleClosePrediction = () => {
    setShowRiskPopup(false);

    if (isRetake) {
      // For retakes, go back to Dashboard without changes
      navigation.goBack();
    } else {
      // For new users, go to calculator with original answers
      navigation.navigate('InvestmentCalculator', {
        risk: answers.risk,
        goal: answers.goal,
        investmentDuration: answers.investmentDuration,
        experience: answers.experience,
        userData: userData
      });
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
      <KeyboardAwareScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Investment Survey</Text>
          <Text style={styles.subtitle}>Tell us about your risk tolerance and goals</Text>
        </View>

        <View style={styles.form}>
          {/* Risk Tolerance */}
          <Text style={styles.inputLabel}>1. How would you describe your risk tolerance?</Text>
          {['Low', 'Medium', 'High'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.option, answers.risk === option && styles.selectedOption]}
              onPress={() => handleSelect('risk', option)}
            >
              <Text style={[styles.optionText, answers.risk === option && { color: 'white' }]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Investment Goal */}
          <Text style={styles.inputLabel}>2. What is your primary investment goal?</Text>
          {['Wealth Growth', 'Retirement', 'Short-Term Gains', 'Passive Income'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.option, answers.goal === option && styles.selectedOption]}
              onPress={() => handleSelect('goal', option)}
            >
              <Text style={[styles.optionText, answers.goal === option && { color: 'white' }]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Investment Duration */}
          <Text style={styles.inputLabel}>3. How long do you plan to invest?</Text>
          {['Short-term (1-3 years)', 'Medium-term (3-7 years)', 'Long-term (7+ years)'].map(
            (option) => (
              <TouchableOpacity
                key={option}
                style={[styles.option, answers.investmentDuration === option && styles.selectedOption]}
                onPress={() => handleSelect('investmentDuration', option)}
              >
                <Text
                  style={[styles.optionText, answers.investmentDuration === option && { color: 'white' }]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            )
          )}

          {/* Experience */}
          <Text style={styles.inputLabel}>4. What is your investment experience?</Text>
          {['Beginner', 'Intermediate', 'Advanced'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.option, answers.experience === option && styles.selectedOption]}
              onPress={() => handleSelect('experience', option)}
            >
              <Text style={[styles.optionText, answers.experience === option && { color: 'white' }]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Submit Button */}
          <View style={styles.formAction}>
            <TouchableOpacity onPress={handleSubmit} disabled={loading}>
              <View style={[styles.btn, { marginBottom: 20, opacity: loading ? 0.7 : 1 }]}>
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.btnText}>Submit</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>

      {/* Risk Prediction Popup */}
      {riskPrediction && (
        <RiskPredictionPopup
          visible={showRiskPopup}
          onClose={handleClosePrediction}
          onAccept={handleAcceptPrediction}
          prediction={riskPrediction}
        />
      )}
    </SafeAreaView>
  );
}
