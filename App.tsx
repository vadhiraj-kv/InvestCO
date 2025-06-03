import React, { useState, useRef } from 'react';
import { 
  SafeAreaView, 
  StatusBar, 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  Text, 
  Alert 
} from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './Login/LoginScreen';
import ForgotPasswordScreen from './ForgotPassword/ForgotPassword';
import SignUp from './Signup/Signup';
import InvestmentSurvey from './Question/UserQuestion';
import InvestmentCalculator from './Calculator/InvestmentCalculator';
import Dashboard from './Dashboard/Dashboard';
import FundDetail from './screens/FundDetail';
import EditInvestment from './screens/EditInvestment';
import FundsSidebar from './components/FundsSidebar';

// Create Stack Navigator
const Stack = createNativeStackNavigator();

// Hamburger Icon Component for the header
const HamburgerButton = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={{ padding: 8 }}>
    <View style={{ width: 24, height: 3, backgroundColor: '#7F00FF', borderRadius: 2, marginBottom: 4 }} />
    <View style={{ width: 24, height: 3, backgroundColor: '#7F00FF', borderRadius: 2, marginBottom: 4 }} />
    <View style={{ width: 24, height: 3, backgroundColor: '#7F00FF', borderRadius: 2 }} />
  </TouchableOpacity>
);

export default function App() {
  const [showMenu, setShowMenu] = useState(false);
  const navigationRef = useNavigationContainerRef();
  
  // Add a Menu component to show when hamburger is clicked
  const HamburgerMenu = () => {
    return (
      <View style={{
        position: 'absolute',
        top: 60,
        right: 10,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1000,
      }}>
        <TouchableOpacity 
          style={{
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#f0f0f0',
          }}
          onPress={() => {
            setShowMenu(false);
            navigationRef.navigate('FundsSidebar', { initialCategory: 'All' });
          }}
        >
          <Text style={{ fontSize: 16 }}>Browse Funds</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={{
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#f0f0f0',
          }}
          onPress={() => {
            setShowMenu(false);
            navigationRef.navigate('InvestmentCalculator');
          }}
        >
          <Text style={{ fontSize: 16 }}>Investment Calculator</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={{
            paddingVertical: 12,
            paddingHorizontal: 16,
          }}
          onPress={() => {
            setShowMenu(false);
            Alert.alert(
              "About InvRec",
              "This app was developed as a project by Vadhiraj. It is a demonstration of investment recommendation and portfolio management capabilities using React Native.",
              [{ text: "OK", onPress: () => console.log("OK Pressed") }]
            );
          }}
        >
          <Text style={{ fontSize: 16 }}>About</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <NavigationContainer ref={navigationRef}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
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
          <Stack.Screen
            name="InvestmentSurvey"
            component={InvestmentSurvey}
            options={{ title: 'Investment Survey' }}
          />
          <Stack.Screen 
            name="InvestmentCalculator"
            component={InvestmentCalculator}
            options={{ title: 'Investment Calculator' }}
          />
          <Stack.Screen 
            name="Dashboard"
            component={Dashboard}
            options={{
              title: 'Investment Dashboard',
              headerRight: () => (
                <HamburgerButton onPress={() => setShowMenu(prev => !prev)} />
              ),
              // This prevents going back to the calculator
              headerLeft: () => null,
              // This makes the back button go to Login when pressed
              headerBackVisible: false,
              gestureEnabled: false
            }}
          />
          <Stack.Screen 
            name="FundDetail"
            component={FundDetail}
            options={{ title: 'Fund Details' }}
          />
          <Stack.Screen 
            name="EditInvestment"
            component={EditInvestment}
            options={{ title: 'Edit Investment' }}
          />
          <Stack.Screen 
            name="FundsSidebar"
            component={FundsSidebar}
            options={{ title: 'Browse Funds' }}
          />
        </Stack.Navigator>
        
        {showMenu && <HamburgerMenu />}
      </SafeAreaView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});






