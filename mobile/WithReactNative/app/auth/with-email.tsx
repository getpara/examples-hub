import React, {useState} from 'react';
import {SafeAreaView, StyleSheet, ScrollView, View} from 'react-native';
import {Input, Button, Text} from '@rneui/themed';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import OTPVerificationComponent from '../../components/OTPVerificationComponent';
import {para} from '../../client/para';
import {randomTestEmail} from '../../util/random';
import {RootStackParamList} from '../../types';

export default function EmailAuthScreen() {
  const [email, setEmail] = useState(randomTestEmail());
  const [showOTP, setShowOTP] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleContinue = async () => {
    if (!email) return;
    setIsLoading(true);
    try {
      const authState = await para.signUpOrLogIn({auth: {email}});

      switch (authState.stage) {
        case 'verify':
          setShowOTP(true);
          break;
        case 'login':
          await para.login(authState);
          navigation.navigate('Home');
          break;
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setIsLoading(false);
  };

  const handleVerify = async (verificationCode: string) => {
    if (!verificationCode) return;
    try {
      const authState = await para.verifyNewAccount({verificationCode});
      if (authState?.passkeyId) {
        await para.registerPasskey(authState);
        navigation.navigate('Home');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Verification error:', error.message, error.stack);
      } else {
        console.error('Verification error:', error);
      }
    }
  };

  const resendOTP = async () => {
    await para.resendVerificationCode();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
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

        {!showOTP ? (
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
          <OTPVerificationComponent
            onVerify={handleVerify}
            resendOTP={resendOTP}
          />
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
