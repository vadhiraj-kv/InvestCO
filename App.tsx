import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './Login/LoginScreen';
import ForgotPasswordScreen from './ForgotPassword/ForgotPassword'; // Import ForgotPasswordScreen
import SignUp from './Signup/Signup';

// Create Stack Navigator
const Stack = createStackNavigator();

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state

  // Function to handle login
  const handleLoginSuccess = () => {
    setIsLoggedIn(true); // Set the login state to true
  };

  return (
    <NavigationContainer>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Stack.Navigator initialRouteName="Login">
          {/* Login Screen */}
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          {/* Forgot Password Screen */}
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ title: 'Forgot Password' }}
          />
          <Stack.Screen
            name="Signup"
            component={SignUp}
            options={{ title: 'Signup' }}
          />
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,  //full screen 
    justifyContent: 'center',
    padding: 2, // padding around the edges
  },
});

export default App;
