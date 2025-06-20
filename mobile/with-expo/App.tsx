import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, SafeAreaView, ActivityIndicator, Text } from 'react-native';
import { para } from './src/para';
import { AuthSection } from './src/components/AuthSection';
import { WalletSection } from './src/components/WalletSection';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Initialize Para SDK
    initializePara();
  }, []);

  const initializePara = async () => {
    try {
      // Initialize the Para client
      await para.init();
      
      // Check if user is already authenticated
      const isLoggedIn = await para.isFullyLoggedIn();
      if (isLoggedIn) {
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Failed to initialize Para:', err);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (isInitializing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Initializing Para SDK...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {!isAuthenticated ? (
        <AuthSection onSuccess={handleAuthSuccess} />
      ) : (
        <WalletSection onLogout={handleLogout} />
      )}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
