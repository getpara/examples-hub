/**
 * Sample React Native App with Para SDK integration
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';

// Import auth screens
import AuthSelection from './AuthSelection';
import EmailAuth from './auth/with-email';
import PhoneAuthScreen from './auth/with-phone';
import HomeScreen from './Home';

// Import sign screens
import EVMSendScreen from './sign/with-evm';
import CosmosSendScreen from './sign/with-cosmos';
import SolanaSendScreen from './sign/with-solana';

import {RootStackParamList} from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="AuthSelection"
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AuthSelection" component={AuthSelection} />
          <Stack.Screen name="EmailAuth" component={EmailAuth} />
          <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
          <Stack.Screen name="SignEVM" component={EVMSendScreen} />
          <Stack.Screen name="SignCosmos" component={CosmosSendScreen} />
          <Stack.Screen name="SignSolana" component={SolanaSendScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  statusText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 24,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 24,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#fc6c58',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App;
