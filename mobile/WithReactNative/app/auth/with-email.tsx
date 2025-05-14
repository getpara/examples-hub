import React, {useState} from 'react';
import {SafeAreaView, StyleSheet, ScrollView, View, Alert} from 'react-native';
import {Input, Button, Text} from '@rneui/themed';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import OTPVerificationComponent from '../../components/OTPVerificationComponent';
import {para} from '../../client/para';
import {randomTestEmail} from '../../util/random';
import {RootStackParamList} from '../../types';
import {useParaSDK} from '../../providers/ParaProvider';

export default function EmailAuthScreen() {
  const [email, setEmail] = useState(randomTestEmail());
  const [showOTP, setShowOTP] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {isInitialized} = useParaSDK();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleContinue = async () => {
    if (!email) {return;}
    if (!isInitialized) {
      setErrorMessage('Para SDK not initialized. Please try again.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Try to sign up or log in
      const authState = await para.signUpOrLogIn({auth: {email}});

      if (authState?.stage === 'verify') {
        // New user flow
        setShowOTP(true);
      } else if (authState?.stage === 'login') {
        // Existing user - use passkey login
        try {
          await para.loginWithPasskey();
          navigation.navigate('Home');
        } catch (error) {
          console.error('Detailed error:', error);
          const errorMsg = error instanceof Error ? error.message : 'Passkey login failed';
          setErrorMessage(errorMsg);
          Alert.alert('Login Error', errorMsg);
        }
      } else {
        setErrorMessage('Unexpected authentication state');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Authentication failed';
      setErrorMessage(errorMsg);
      Alert.alert('Authentication Error', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (verificationCode: string) => {
    if (!verificationCode) {return;}
    if (!isInitialized) {
      setErrorMessage('Para SDK not initialized. Please try again.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const authState = await para.verifyNewAccount({verificationCode});

      if (authState?.passkeyId) {
        try {
          await para.registerPasskey(authState);
          navigation.navigate('Home');
        } catch (error) {
          setErrorMessage('Failed to register passkey');
          Alert.alert('Passkey Error', 'Failed to register passkey');
        }
      } else {
        setErrorMessage('Missing passkey ID in authentication state');
        Alert.alert('Verification Error', 'Missing passkey ID in authentication state');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Verification failed';
      setErrorMessage(errorMsg);
      Alert.alert('Verification Error', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    if (!isInitialized) {
      setErrorMessage('Para SDK not initialized. Please try again.');
      return;
    }

    try {
      await para.resendVerificationCode();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to resend verification code';
      Alert.alert('Resend Error', errorMsg);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.headerContainer}>
          <Text h2 h2Style={styles.title}>
            {showOTP ? 'Enter Verification Code' : 'Email Authentication Demo'}
          </Text>
          <Text style={styles.subtitle}>
            {showOTP
              ? 'Enter the code sent to your email. When using @test.getpara.com, a random 6-digit code is auto-filled for rapid testing. For personal emails, check your inbox for the actual code.'
              : "Test the Para Auth SDK. A random @test.getpara.com email is pre-filled for quick testing with auto-generated codes. Use your email instead to test custom email templates from your developer portal. Test users can be managed in your portal's API key section."}
          </Text>
        </View>

        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

        {!isInitialized ? (
          <Text style={styles.statusText}>Waiting for Para SDK initialization...</Text>
        ) : !showOTP ? (
          <>
            <Input
              label="Test Email"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              containerStyle={styles.inputContainer}
              inputContainerStyle={styles.input}
            />
            <Button
              title="Continue"
              onPress={handleContinue}
              disabled={!email || isLoading}
              loading={isLoading}
              buttonStyle={styles.button}
              containerStyle={styles.buttonContainer}
            />
          </>
        ) : (
          <OTPVerificationComponent onVerify={handleVerify} resendOTP={resendOTP} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    color: '#333333',
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: 32,
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'left',
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 16,
    fontSize: 14,
  },
  statusText: {
    color: '#666666',
    marginBottom: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  inputContainer: {
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  button: {
    backgroundColor: '#fc6c58',
    borderRadius: 8,
    paddingVertical: 12,
  },
  buttonContainer: {
    width: '100%',
  },
});
