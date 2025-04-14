import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert
} from 'react-native';
import styles from './InvestmentCalculator'; // import your styles here

export default function InvestmentCalculator() {
  const [amountType, setAmountType] = useState<'SIP' | 'One-time' | ''>('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [duration, setDuration] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  const calculateInvestment = () => {
    const amount = parseFloat(investmentAmount);
    if (isNaN(amount)) {
      Alert.alert('Please enter a valid investment amount');
      return;
    }

    if (amountType === 'SIP' && duration) {
      const totalInvestment = amount * duration * 12;
      setTotal(totalInvestment);
    } else if (amountType === 'One-time') {
      setTotal(amount);
    } else {
      Alert.alert('Please complete all fields');
    }
  };

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
                  setAmountType(type as 'SIP' | 'One-time');
                  if (type === 'One-time') setDuration(null);
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
            <TouchableOpacity onPress={calculateInvestment}>
              <View style={[styles.btn, { marginTop: 30 }]}>
                <Text style={styles.btnText}>Calculate</Text>
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
