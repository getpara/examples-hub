import React, {useState} from 'react';
import {SafeAreaView, StyleSheet, ScrollView, View, Alert, Linking, AlertButton} from 'react-native';
import {Input, Button, Text} from '@rneui/themed';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import OTPVerificationComponent from '../../components/OTPVerificationComponent';
import {para} from '../../client/para';
import {RootStackParamList} from '../../types';
import {randomTestPhone} from '../../util/random';
import {parsePhoneNumberFromString} from 'libphonenumber-js';
import {useParaSDK} from '../../providers/ParaProvider';
import InAppBrowser from 'react-native-inappbrowser-reborn';

const APP_SCHEME_REDIRECT_URL = 'com.usecapsule.example.reactnative://';

export default function PhoneAuthScreen() {
  const [countryCode, setCountryCode] = useState('+1');
  const [phone, setPhoneNumber] = useState(randomTestPhone());
  const [showOTP, setShowOTP] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {isInitialized} = useParaSDK();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleContinue = async () => {
    if (!countryCode || !phone) {
      return;
    }
    if (!isInitialized) {
      setErrorMessage('Para SDK not initialized. Please try again.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const fullPhoneNumber = countryCode + phone;
    const phoneNumberInstance = parsePhoneNumberFromString(fullPhoneNumber);

    if (!phoneNumberInstance || !phoneNumberInstance.isValid()) {
      setErrorMessage('Invalid phone number. Please check the country code and number.');
      Alert.alert('Input Error', 'Invalid phone number. Please check the country code and number.');
      setIsLoading(false);
      return;
    }

    const e164Number = phoneNumberInstance.number as `+${number}`;

    try {
      const authState = await para.signUpOrLogIn({
        auth: {phone: e164Number},
      });

      if (authState?.stage === 'verify') {
        setShowOTP(true);
      } else if (authState?.stage === 'login') {
        // Existing user - give option for passkey or password
        const {passwordUrl} = authState; // Assuming loginWithPasskey is native

        const loginOptions: AlertButton[] = [
          {
            text: 'Login with Passkey',
            onPress: async () => {
              setIsLoading(true);
              setErrorMessage(null);
              try {
                await para.loginWithPasskey();
                navigation.navigate('Home');
              } catch (error) {
                console.error('Passkey login error:', error);
                const errorMsg = error instanceof Error ? error.message : 'Passkey login failed';
                setErrorMessage(errorMsg);
                Alert.alert('Login Error', errorMsg);
              } finally {
                setIsLoading(false);
              }
            },
          },
        ];

        if (passwordUrl) {
          loginOptions.push({
            text: 'Login with Password',
            onPress: async () => {
              setIsLoading(true);
              setErrorMessage(null);
              try {
                if (await InAppBrowser.isAvailable()) {
                  const originalUrl = new URL(passwordUrl);
                  originalUrl.searchParams.append('nativeCallbackUrl', APP_SCHEME_REDIRECT_URL);
                  const finalPasswordUrl = originalUrl.toString();

                  await InAppBrowser.openAuth(finalPasswordUrl, APP_SCHEME_REDIRECT_URL, {
                    dismissButtonStyle: 'cancel',
                    animated: true,
                    enableUrlBarHiding: true,
                    enableDefaultShare: false,
                  });
                  await para.waitForLogin({});
                  navigation.navigate('Home');
                } else {
                  Linking.openURL(passwordUrl);
                  Alert.alert('Redirecting...', 'Please complete login in your browser and return to the app.');
                }
              } catch (error) {
                console.error('Password login error:', error);
                const errorMsg = error instanceof Error ? error.message : 'Password login failed';
                setErrorMessage(errorMsg);
                Alert.alert('Login Error', errorMsg);
              } finally {
                setIsLoading(false);
              }
            },
          });
        }

        loginOptions.push({
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setIsLoading(false),
        });

        if (loginOptions.length > 1) {
          // More than just 'Cancel' or only Passkey
          Alert.alert('Login Options', 'How would you like to log in?', loginOptions);
        } else if (loginOptions.length === 1 && loginOptions[0].text !== 'Cancel') {
          // Only one login option (Passkey), proceed directly - though current logic always adds Cancel
          // This path might not be hit with current AlertButton construction, but kept for logical completeness
          // Or, if we decide to not show alert for single option, trigger it here.
          // For now, Alert is always shown if any method is present.
        } else {
          setErrorMessage('No login methods available.');
          Alert.alert('Login Error', 'No login methods available.');
        }
        // Fallback to setIsLoading(false) is in the Alert onPress for Cancel or in finally blocks
      } else {
        setErrorMessage('Unexpected authentication state');
        Alert.alert('Authentication Error', 'Unexpected authentication state');
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
    if (!verificationCode) {
      return;
    }
    if (!isInitialized) {
      setErrorMessage('Para SDK not initialized. Please try again.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const authState = await para.verifyNewAccount({verificationCode});

      const {passwordUrl, passkeyId, isPasskeySupported} = authState;

      const isPasskeyOptionAvailable = passkeyId && isPasskeySupported;
      const isPasswordOptionAvailable = !!passwordUrl;

      if (isPasskeyOptionAvailable && isPasswordOptionAvailable) {
        // Both options available, show alert
        const setupOptions: AlertButton[] = [
          {
            text: 'Set up Passkey',
            onPress: async () => {
              setIsLoading(true);
              setErrorMessage(null);
              try {
                await para.registerPasskey(authState); // Native passkey registration
                navigation.navigate('Home');
              } catch (error) {
                console.error('Native Passkey registration error:', error);
                const errorMsg = error instanceof Error ? error.message : 'Failed to register passkey';
                setErrorMessage(errorMsg);
                Alert.alert('Passkey Setup Error', errorMsg);
              } finally {
                setIsLoading(false);
              }
            },
          },
          {
            text: 'Set up Password',
            onPress: async () => {
              setIsLoading(true);
              setErrorMessage(null);
              try {
                if (await InAppBrowser.isAvailable()) {
                  const originalUrl = new URL(passwordUrl!);
                  originalUrl.searchParams.append('nativeCallbackUrl', APP_SCHEME_REDIRECT_URL);
                  const finalPasswordUrl = originalUrl.toString();

                  await InAppBrowser.openAuth(finalPasswordUrl, APP_SCHEME_REDIRECT_URL, {
                    dismissButtonStyle: 'cancel',
                    animated: true,
                    enableUrlBarHiding: true,
                    enableDefaultShare: false,
                  });
                  await para.waitForWalletCreation({});
                  navigation.navigate('Home');
                } else {
                  Linking.openURL(passwordUrl!);
                  Alert.alert(
                    'Redirecting...',
                    'Please complete password setup in your browser and return to the app.',
                  );
                }
              } catch (error) {
                console.error('Password setup error:', error);
                const errorMsg = error instanceof Error ? error.message : 'Failed to set up password';
                setErrorMessage(errorMsg);
                Alert.alert('Password Setup Error', errorMsg);
              } finally {
                setIsLoading(false);
              }
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setIsLoading(false),
          },
        ];
        Alert.alert('Secure Your Account', 'Choose a method to secure your account:', setupOptions);
      } else if (isPasskeyOptionAvailable) {
        // Only Passkey option available, proceed directly
        setIsLoading(true);
        setErrorMessage(null);
        try {
          await para.registerPasskey(authState); // Native passkey registration
          navigation.navigate('Home');
        } catch (error) {
          console.error('Native Passkey registration error:', error);
          const errorMsg = error instanceof Error ? error.message : 'Failed to register passkey';
          setErrorMessage(errorMsg);
          Alert.alert('Passkey Setup Error', errorMsg);
        } finally {
          setIsLoading(false);
        }
      } else if (isPasswordOptionAvailable) {
        // Only Password option available, proceed directly
        setIsLoading(true);
        setErrorMessage(null);
        try {
          if (await InAppBrowser.isAvailable()) {
            const originalUrl = new URL(passwordUrl!);
            originalUrl.searchParams.append('nativeCallbackUrl', APP_SCHEME_REDIRECT_URL);
            const finalPasswordUrl = originalUrl.toString();

            await InAppBrowser.openAuth(finalPasswordUrl, APP_SCHEME_REDIRECT_URL, {
              dismissButtonStyle: 'cancel',
              animated: true,
              enableUrlBarHiding: true,
              enableDefaultShare: false,
            });
            await para.waitForWalletCreation({});
            navigation.navigate('Home');
          } else {
            Linking.openURL(passwordUrl!);
            Alert.alert('Redirecting...', 'Please complete password setup in your browser and return to the app.');
          }
        } catch (error) {
          console.error('Password setup error:', error);
          const errorMsg = error instanceof Error ? error.message : 'Failed to set up password';
          setErrorMessage(errorMsg);
          Alert.alert('Password Setup Error', errorMsg);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Neither option available
        setErrorMessage('No account setup options available. Please check your Para configuration.');
        Alert.alert('Setup Error', 'No account setup options available.');
        setIsLoading(false);
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
      Alert.alert('Code Resent', 'A new verification code has been sent.');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to resend verification code';
      setErrorMessage(errorMsg);
      Alert.alert('Resend Error', errorMsg);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.headerContainer}>
          <Text h2 h2Style={styles.title}>
            {showOTP ? 'Enter Verification Code' : 'Phone Authentication Demo'}
          </Text>
          <Text style={styles.subtitle}>
            {showOTP
              ? 'Enter the code sent to your phone. When using a +1-XXX-555-XXXX test number, a random 6-digit code is auto-filled for rapid testing. For personal numbers, check your phone for the actual code.'
              : "Test the Para Auth SDK. A random test number (+1-XXX-555-XXXX) is pre-filled for quick testing with auto-generated codes. Use your phone number instead to test actual SMS delivery. Test users can be managed in your portal's API key section."}
          </Text>
        </View>

        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

        {!isInitialized ? (
          <Text style={styles.statusText}>Waiting for Para SDK initialization...</Text>
        ) : !showOTP ? (
          <>
            <View style={styles.phoneInputContainer}>
              <Input
                label="Code"
                placeholder="+1"
                value={countryCode}
                onChangeText={setCountryCode}
                keyboardType="phone-pad"
                containerStyle={styles.countryCodeInput}
                inputContainerStyle={styles.input}
              />
              <Input
                label="Number"
                placeholder="Phone Number"
                value={phone}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                containerStyle={styles.phoneNumberInput}
                inputContainerStyle={styles.input}
              />
            </View>
            <Button
              title="Continue"
              onPress={handleContinue}
              disabled={!countryCode || !phone || isLoading}
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
  phoneInputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  countryCodeInput: {
    flex: 1,
    marginRight: 8,
    paddingHorizontal: 0,
  },
  phoneNumberInput: {
    flex: 3,
    paddingHorizontal: 0,
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
