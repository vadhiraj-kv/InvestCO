import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

import styles from '../Login/LogicScreen';

export default function SignUp({ navigation }: { navigation: any }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    username: '',
    password: '',
  });

  const [isAgreed, setIsAgreed] = useState(false);
  const [gender, setGender] = useState('');

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const validateUsername = async (username: string) => {
    const existingUsernames = ['user1', 'testuser']; // Replace with your actual validation logic
    return !existingUsernames.includes(username);
  };

  const handleSignUp = async () => {
    const { firstName, lastName, phone, email, username, password } = form;

    if (!firstName || !lastName || !phone || !email || !username || !password) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (!isAgreed) {
      Alert.alert('Error', 'You must agree to the terms and conditions.');
      return;
    }

    const isUsernameValid = await validateUsername(username);
    if (!isUsernameValid) {
      Alert.alert('Error', 'Username is already taken.');
      return;
    }

    Alert.alert('Success', `Welcome, ${firstName}! Your account has been created.`);
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e8ecf4' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Create <Text style={{ color: '#7F00FF' }}>Account</Text>
            </Text>
            <Text style={styles.subtitle}>Sign up to start your investment journey.</Text>
          </View>

          <View style={styles.form}>
            {/* First Name */}
            <View style={styles.input}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                autoCapitalize="words"
                onChangeText={(text) => setForm({ ...form, firstName: text })}
                placeholder="Enter your first name"
                placeholderTextColor="#6b7280"
                style={styles.inputControl}
                value={form.firstName}
              />
            </View>

            {/* Last Name */}
            <View style={styles.input}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                autoCapitalize="words"
                onChangeText={(text) => setForm({ ...form, lastName: text })}
                placeholder="Enter your last name"
                placeholderTextColor="#6b7280"
                style={styles.inputControl}
                value={form.lastName}
              />
            </View>
            
             {/* Gender Radio Buttons */}
             <View style={styles.input}>
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginRight: 20,
                  }}
                  onPress={() => setGender('Male')}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: '#7F00FF',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 10,
                    }}
                  >
                    {gender === 'Male' && (
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: '#7F00FF',
                        }}
                      />
                    )}
                  </View>
                  <Text>Male</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  onPress={() => setGender('Female')}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: '#7F00FF',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 10,
                    }}
                  >
                    {gender === 'Female' && (
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: '#7F00FF',
                        }}
                      />
                    )}
                  </View>
                  <Text>Female</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Phone Number */}
            <View style={styles.input}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                keyboardType="phone-pad"
                onChangeText={(text) => setForm({ ...form, phone: text })}
                placeholder="Enter your phone number"
                placeholderTextColor="#6b7280"
                style={styles.inputControl}
                value={form.phone}
              />
            </View>

            {/* Email */}
            <View style={styles.input}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={(text) => setForm({ ...form, email: text })}
                placeholder="Enter your email"
                placeholderTextColor="#6b7280"
                style={styles.inputControl}
                value={form.email}
              />
            </View>

            {/* Username */}
            <View style={styles.input}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                autoCapitalize="none"
                onChangeText={(text) => setForm({ ...form, username: text })}
                placeholder="Choose a username"
                placeholderTextColor="#6b7280"
                style={styles.inputControl}
                value={form.username}
              />
            </View>

            {/* Password */}
            <View style={styles.input}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                secureTextEntry
                onChangeText={(text) => setForm({ ...form, password: text })}
                placeholder="Enter your password"
                placeholderTextColor="#6b7280"
                style={styles.inputControl}
                value={form.password}
              />
            </View>

           

            {/* Agreement Checkbox */}
            <View style={styles.input}>
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
    <TouchableOpacity
      style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#7F00FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
      }}
      onPress={() => setIsAgreed(!isAgreed)}
    >
      {isAgreed && (
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: '#7F00FF',
          }}
        />
      )}
    </TouchableOpacity>
    <Text style={{ fontSize: 14, textAlign: 'center' }}>
      I agree to the{' '}
      <Text
        style={{ textDecorationLine: 'underline', color: '#7F00FF' }}
        onPress={() => Alert.alert('Terms', 'Show Terms & Conditions')}
      >
        Terms and Conditions
      </Text>
    </Text>
  </View>
</View>


            {/* Sign Up Button */}
            <View style={styles.formAction}>
              <TouchableOpacity onPress={handleSignUp}>
                <View style={styles.btn}>
                  <Text style={styles.btnText}>Sign Up</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Redirect to Login */}
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.formFooter}>
              Already have an account?{' '}
              <Text style={{ textDecorationLine: 'underline' }}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
