import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Dashboard from '../Dashboard/Dashboard';
import InvestmentCalculator from '../Calculator/InvestmentCalculator';
import FundDetail from '../screens/FundDetail';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Calculator">
        <Stack.Screen 
          name="Calculator" 
          component={InvestmentCalculator} 
          options={{ title: 'Investment Calculator' }}
        />
        <Stack.Screen 
          name="Dashboard" 
          component={Dashboard} 
          options={{ 
            title: 'Investment Dashboard',
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen 
          name="FundDetail" 
          component={FundDetail} 
          options={{ 
            title: 'Fund Details',
            headerBackTitle: 'Back'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

