/**
 * Sample React Native App with Para SDK integration
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';

// Import auth screens
import AuthSelection from './AuthSelection';
import EmailAuth from './auth/with-email';
import PhoneAuthScreen from './auth/with-phone';
import OauthAuthScreen from './auth/with-oauth';
import HomeScreen from './Home';

// Import sign screens
import EVMSendScreen from './sign/with-evm';
import CosmosSendScreen from './sign/with-cosmos';
import SolanaSendScreen from './sign/with-solana';

import {RootStackParamList} from '../types';
import {ParaProvider} from '../providers/ParaProvider';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <ParaProvider>
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
            <Stack.Screen name="OauthAuth" component={OauthAuthScreen} />
            <Stack.Screen name="SignEVM" component={EVMSendScreen} />
            <Stack.Screen name="SignCosmos" component={CosmosSendScreen} />
            <Stack.Screen name="SignSolana" component={SolanaSendScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </ParaProvider>
  );
}

export default App;
