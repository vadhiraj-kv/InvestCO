import React, { useState } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import styles from '../Login/LogicScreen';

export default function ForgotPasswordScreen({ navigation }: { navigation: any }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleResetPassword = () => {
    if (username.trim() === '') {
      Alert.alert('Error', 'Please enter your username.');
      return;
    }

    if (email.trim() === '') {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    // If all validations pass
    Alert.alert(
      'Success',
      `Password reset instructions have been sent to the email "${email}" associated with the username "${username}".`
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e8ecf4' }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Forgot <Text style={{ color: '#7F00FF' }}>Password?</Text>
          </Text>
          <Text style={[styles.subtitle,{textAlign: 'center'}]}>
            Enter your username and email to reset your password.
          </Text>
        </View>
        <View style={styles.form}>
          <View style={styles.input}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={(text) => setUsername(text)}
              placeholder="Enter your username"
              placeholderTextColor="#6b7280"
              style={styles.inputControl}
              value={username}
            />
          </View>
          <View style={styles.input}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={(text) => setEmail(text)}
              placeholder="Enter your email"
              placeholderTextColor="#6b7280"
              style={styles.inputControl}
              value={email}
            />
          </View>
          <View style={styles.formAction}>
            <TouchableOpacity onPress={handleResetPassword}>
              <View style={styles.btn}>
                <Text style={styles.btnText}>Send Reset Instructions</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.formLink}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
