import React, { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { capsule } from '../clients/capsule';
import { Button } from './Button';
import LoginModal from './LoginModal';

interface LoginStepProps {
  goToNextStep: () => void;
  setIsCreatingWallet: (isCreating: boolean) => void;
}

const LoginStep: React.FC<LoginStepProps> = ({ goToNextStep, setIsCreatingWallet }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleModalClose = async (success?: boolean, needsWallet?: boolean) => {
    setIsLoginModalOpen(false);
    if (success) {
      await handleSuccessfulLogin(needsWallet);
    }
  };

  const handleSuccessfulLogin = async (needsWallet?: boolean) => {
    try {
      setIsCreatingWallet(true);
      goToNextStep();

      if (needsWallet) {
        await createWallet();
      }
    } catch (error) {
      handleError('Wallet Creation Error', error);
    } finally {
      setIsCreatingWallet(false);
    }
  };

  const createWallet = async () => {
    await capsule.createWalletPerMissingType();
    showSuccessToast('Wallet created successfully!');
  };

  const handleLogin = async () => {
    try {
      await capsule.login();
      handleModalClose(true, false);
    } catch (error) {
      handleError('Login Error', error);
    }
  };

  const handleError = (errorType: string, error: any) => {
    console.error(`${errorType}: `, error);
    showErrorToast('An error occurred. Please try again.');
  };

  const showSuccessToast = (message: string) => {
    Toast.show({ type: 'success', text1: `🔥 ${message} 🔥` });
  };

  const showErrorToast = (message: string) => {
    Toast.show({ type: 'error', text1: message });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login to continue</Text>
      <Button title="Login" onPress={handleLogin} />
      <Button title="Sign Up" onPress={() => setIsLoginModalOpen(true)} />
      <LoginModal isOpen={isLoginModalOpen} onClose={handleModalClose} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 36,
  },
  title: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default LoginStep;
