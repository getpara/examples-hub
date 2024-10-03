import React, { useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { capsule } from '../clients/capsule';
import { Button } from './Button';
import { toastConfig } from '../config/toastConfig';

interface LoginModalProps {
  isOpen: boolean;
  onClose: (success?: boolean, isLogin?: boolean) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateUser = async () => {
    try {
      setIsLoading(true);
      const userExists = await capsule.checkIfUserExists(email);

      if (userExists) {
        await handleExistingUser();
      } else {
        await handleNewUser();
      }
    } catch (e) {
      handleError('Create User Error', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExistingUser = async () => {
    await capsule.login();
    showSuccessToast('User logged in successfully!');
    onClose(true, false);
  };

  const handleNewUser = async () => {
    await capsule.createUser(email);
    setStep(2);
  };

  const handleVerifyCode = async () => {
    try {
      setIsLoading(true);
      const biometricsId = await capsule.verifyEmailBiometricsId(verificationCode);
      await capsule.registerPasskey(email, biometricsId, crypto);
      showSuccessToast('User created successfully!');
      onClose(true, true);
    } catch (e) {
      handleError('Verify Email Error', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (errorType: string, error: any) => {
    console.error(`${errorType}: `, error);
    showErrorToast('An error occurred, please try again.');
  };

  const showSuccessToast = (message: string) => {
    Toast.show({ type: 'success', text1: `🔥 ${message} 🔥` });
  };

  const showErrorToast = (message: string) => {
    Toast.show({ type: 'error', text1: message });
  };

  return (
    <Modal animationType="slide" visible={isOpen} onRequestClose={() => onClose()}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onClose()} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
        </View>
        <View>
          <Text style={styles.headingText}>
            {step === 1 ? 'Start signing up by entering your email' : 'Check your email for your verification code'}
          </Text>
          <TextInput
            placeholder={step === 1 ? 'Email' : 'Code'}
            placeholderTextColor="white"
            keyboardType={step === 1 ? 'email-address' : 'numeric'}
            style={styles.input}
            value={step === 1 ? email : verificationCode}
            onChangeText={text => (step === 1 ? setEmail(text) : setVerificationCode(text))}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            isLoading={isLoading}
            title={step === 1 ? 'Continue' : 'Verify'}
            onPress={step === 1 ? handleCreateUser : handleVerifyCode}
          />
        </View>
      </View>
      <Toast config={toastConfig} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    flex: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  headingText: {
    color: 'white',
    paddingBottom: 16,
    textAlign: 'center',
    fontSize: 18,
  },
  input: {
    borderColor: 'white',
    borderWidth: 1,
    color: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});

export default LoginModal;
