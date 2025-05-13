/**
 * Sample React Native App with Para SDK integration
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {ParaMobile, Environment} from '@getpara/react-native-wallet';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [paraInitialized, setParaInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  useEffect(() => {
    const initializePara = async () => {
      try {
        // Replace YOUR_API_KEY with your actual API key when ready
        const para = new ParaMobile(Environment.SANDBOX, '12e3517d125169ea9847d0da5bdcd9c9');
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
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View style={styles.container}>
          <Text
            style={[
              styles.title,
              {color: isDarkMode ? Colors.white : Colors.black},
            ]}>
            Para React Native Demo
          </Text>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <Text
              style={[
                styles.statusText,
                {color: isDarkMode ? Colors.light : Colors.dark},
              ]}>
              Para SDK status:{' '}
              {paraInitialized ? 'Initialized' : 'Initializing...'}
            </Text>
          )}

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4361ee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default App;
