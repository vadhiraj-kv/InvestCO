import React, { useState } from 'react';


import styles from './UserQuestion'
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';

export default function InvestmentSurvey() {
  const navigation = useNavigation();

  const [answers, setAnswers] = useState({
    risk: '',
    goal: '',
    investmentDuration: '',
    experience: '',
  });

  const handleSelect = (question: string, option: string) => {
    setAnswers({ ...answers, [question]: option });
  };

  const isFormComplete = Object.values(answers).every((val) => val !== '');

  const handleSubmit = () => {
    if (!isFormComplete) {
      Alert.alert('Incomplete', 'Please answer all the questions before submitting.');
      return;
    }
    navigation.navigate('InvestmentCalculator');
  };

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
            <TouchableOpacity onPress={handleSubmit}>
              <View style={[styles.btn, { marginBottom: 20 }]}>
                <Text style={styles.btnText}>Submit</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
