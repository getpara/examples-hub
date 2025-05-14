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

// Import the Para instance from the client folder
import {para} from '../client/para';

// Import auth screens
import AuthSelection from './AuthSelection';
import EmailAuth from './auth/with-email';
import PhoneAuth from './auth/with-phone';
import OauthAuth from './auth/with-oauth';

import {RootStackParamList} from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function HomeScreen({navigation}: any) {
  const [paraInitialized, setParaInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializePara = async () => {
      try {
        // Para is already initialized in client/para.ts
        setParaInitialized(true);
        console.log('Para SDK initialized successfully');
      } catch (err) {
        console.error('Failed to initialize Para SDK:', err);
        setError('Failed to initialize Para SDK');
      }
    };

    initializePara();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Para React Native Demo</Text>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <Text style={styles.statusText}>
          Para SDK status: {paraInitialized ? 'Initialized' : 'Initializing...'}
        </Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AuthSelection')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AuthSelection" component={AuthSelection} />
          <Stack.Screen name="EmailAuth" component={EmailAuth} />
          <Stack.Screen name="PhoneAuth" component={PhoneAuth} />
          <Stack.Screen name="OauthAuth" component={OauthAuth} />
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
