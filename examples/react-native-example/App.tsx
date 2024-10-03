import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, Text, View, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/config/toastConfig';
import { capsule } from './src/clients/capsule';
import LoginStep from './src/components/LoginStep';
import UseWalletStep from './src/components/UseWalletStep';
import PolyfillCrypto from 'react-native-webview-crypto';

enum AppStep {
  Login = 1,
  UseWallet = 2,
}

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.Login);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await capsule.init();
      if (await capsule.isSessionActive()) {
        setStep(AppStep.UseWallet);
      }
    } catch (error) {
      console.error('Initialization Error: ', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const goToUseWalletStep = () => {
    setStep(AppStep.UseWallet);
  };

  const handleLogout = () => {
    setStep(AppStep.Login);
  };

  const renderContent = () => {
    if (isInitializing || isCreatingWallet) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          {isCreatingWallet && <Text style={styles.loadingText}>Creating Wallet...</Text>}
        </View>
      );
    }

    return (
      <>
        {step === AppStep.Login ? (
          <LoginStep goToNextStep={goToUseWalletStep} setIsCreatingWallet={setIsCreatingWallet} />
        ) : (
          <UseWalletStep onLogout={handleLogout} />
        )}
      </>
    );
  };

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <PolyfillCrypto />
        <View style={styles.container}>
          <Text style={styles.title}>
            Capsule{'\n'}React Native Sample App{'\n'}v0.73
          </Text>
          {renderContent()}
        </View>
      </SafeAreaView>
      <Toast config={toastConfig} />
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    backgroundColor: 'black',
    flex: 1,
    padding: 24,
  },
  title: {
    textAlign: 'center',
    color: 'white',
    fontSize: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 18,
    paddingTop: 8,
  },
});

export default App;
