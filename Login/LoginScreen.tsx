import React, { useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Image,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import axios from 'axios';
import styles from './LogicScreen';

// Update API URL to match your backend
const API_URL = 'http://10.0.2.2:3000/api'; // Use 10.0.2.2 instead of localhost for Android emulator

export default function Login({ navigation }) {
  const [form, setForm] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const { username, password } = form;

    // Validate form fields
    if (!username || !password) {
      Alert.alert('Error', 'Username and password are required.');
      return;
    }

    setIsLoading(true);

    try {
      // Make API call to backend
      const response = await axios.post(`${API_URL}/users/login`, {
        username,
        password,
      });
      
      setIsLoading(false);
      console.log('Login successful:', response.data);
      
      // Navigate to Investment Survey first instead of Dashboard
      navigation.navigate('InvestmentSurvey', {
        userData: response.data.user
      });
      
    } catch (error) {
      setIsLoading(false);
      console.error('Login error:', error);
      
      if (error.response) {
        Alert.alert('Error', error.response.data.error || 'Login failed');
      } else if (error.request) {
        Alert.alert('Error', 'No response from server. Please check your connection.');
      } else {
        Alert.alert('Error', 'An unexpected error occurred');
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e8ecf4' }}>
      <KeyboardAwareScrollView style={styles.container}>
        <View style={styles.header}>
          <Image
            alt="App Logo"
            resizeMode="contain"
            style={styles.headerImg}
            source={require('../Image/Invest1.png')} 
          />
          <Text style={styles.title}>
            Sign in to <Text style={{ color: '#7F00FF' }}>InvRec</Text>
          </Text>
          <Text style={styles.subtitle}>Build your Investment Idea</Text>
        </View>
        <View style={styles.form}>
          <View style={styles.input}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              keyboardType="email-address"
              onChangeText={username => setForm({ ...form, username })}
              placeholderTextColor="#6b7280"
              style={styles.inputControl}
              value={form.username} 
            />
          </View>
          <View style={styles.input}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              autoCorrect={false}
              clearButtonMode="while-editing"
              onChangeText={(password) => {
                if (password.length > 8) {
                  Alert.alert('Invalid Input', 'Password can only have a maximum of 8 digits.');
                } else if (/^\d*$/.test(password)) {
                  setForm({ ...form, password });
                }
              }}
              placeholderTextColor="#6b7280"
              style={styles.inputControl}
              secureTextEntry={true}
              value={form.password}
            />
          </View>
          <View style={styles.formAction}>
            <TouchableOpacity 
              onPress={handleLogin} 
              disabled={isLoading}
            >
              <View style={[styles.btn, isLoading && { opacity: 0.7 }]}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.btnText}>Sign in</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.formLink}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.formFooter}>
          Don't have an account? <Text style={{ textDecorationLine: 'underline' }}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
