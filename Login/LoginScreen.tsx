import React, { useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Image,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {Alert} from 'react-native'
import styles from './LogicScreen'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
export default function Login({navigation}) {
  const [form, setForm] = useState({
    username: '',
    password: '',
  });
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e8ecf4' }}>
      <KeyboardAwareScrollView style={styles.container}>
        <View style={styles.header}>
        <Image
            alt="App Logo"
            resizeMode="contain"
            style={styles.headerImg}
            source={require('../Image/Invest1.png')} // Use require for local images
            />

          <Text style={styles.title}>
            Sign in to <Text style={{ color: '#7F00FF' }}>InvRec</Text>
          </Text>
          <Text style={styles.subtitle}>
            Build your Investment Idea
          </Text>
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
              value={form.username} />
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
                    setForm({ ...form, password }); // Update state only if valid
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
              onPress={() => {
                // handle onPress
              }}>
              <View style={styles.btn}>
                <Text style={styles.btnText}>Sign in</Text>
              </View>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
             onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.formLink}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
      <TouchableOpacity
        onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.formFooter}>
          Don't have an account?{' '}
          <Text style={{ textDecorationLine: 'underline' }}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}