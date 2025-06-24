import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { para } from '../para';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import { Input } from './common/Input';
import { Button } from './common/Button';
import { StatusDisplay } from './common/StatusDisplay';
import { SecurityChoice } from './SecurityChoice';

interface EmailAuthProps {
  onSuccess: () => void;
  onShowVerification?: () => void;
  onHideVerification?: () => void;
  onShowSecurityChoice?: () => void;
  onHideSecurityChoice?: () => void;
}

export const EmailAuth: React.FC<EmailAuthProps> = ({
  onSuccess,
  onShowVerification,
  onHideVerification,
  onShowSecurityChoice,
  onHideSecurityChoice,
}) => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [showSecurityChoice, setShowSecurityChoice] = useState(false);
  const [authState, setAuthState] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Call onHideVerification when component unmounts or verification is hidden
    return () => {
      if (showVerification) {
        onHideVerification?.();
      }
    };
  }, [showVerification, onHideVerification]);

  const handleContinue = async () => {
    if (!email) {
      setError('Please enter an email');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('Checking email...');

    try {
      // Determines if user exists or needs to sign up
      const authStateResult = await para.signUpOrLogIn({ auth: { email } });
      setAuthState(authStateResult);

      if (authStateResult?.stage === 'verify') {
        // New user - needs OTP verification
        setShowVerification(true);
        onShowVerification?.();
        setStatus('Verification code sent to your email');
      } else if (authStateResult?.stage === 'login') {
        // Existing user - check if they use password or passkey
        if (authStateResult.passwordUrl) {
          // User has password-based security
          setStatus('Redirecting to password login...');
          const APP_SCHEME_EMAIL = 'para-sdk-demo';
          const APP_SCHEME_REDIRECT_URL = `${APP_SCHEME_EMAIL}://para`;
          
          await InAppBrowser.openAuth(authStateResult.passwordUrl, APP_SCHEME_REDIRECT_URL);
          await para.waitForLogin({});
          setStatus('');
          onSuccess();
        } else {
          // User has passkey-based security
          setStatus('Logging in with passkey...');
          await para.loginWithPasskey();
          setStatus('');
          onSuccess();
        }
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!verificationCode) {
      setError('Please enter verification code');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('Verifying code...');

    try {
      // Verify OTP code
      const verifiedAuthState = await para.verifyNewAccount({ verificationCode });
      setAuthState(verifiedAuthState);

      // Show security choice instead of auto-creating passkey
      setShowVerification(false);
      setShowSecurityChoice(true);
      onHideVerification?.();
      onShowSecurityChoice?.();
      setStatus('');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setLoading(true);
    setError('');
    setStatus('Resending code...');

    try {
      // Request new OTP code
      await para.resendVerificationCode({ type: 'SIGNUP' });
      setStatus('Verification code resent');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityChoice = async (choice: 'passkey' | 'password') => {
    setLoading(true);
    setError('');

    try {
      if (choice === 'passkey') {
        // Register passkey for future logins
        setStatus('Creating passkey...');
        await para.registerPasskey(authState);
        setStatus('');
        onHideSecurityChoice?.();
        onSuccess();
      } else {
        // Redirect to password creation
        setStatus('Redirecting to password creation...');
        const APP_SCHEME_EMAIL = 'para-sdk-demo';
        const APP_SCHEME_REDIRECT_URL = `${APP_SCHEME_EMAIL}://para`;
        
        await InAppBrowser.openAuth(authState.passwordUrl, APP_SCHEME_REDIRECT_URL);
        await para.waitForWalletCreation({});
        setStatus('');
        onHideSecurityChoice?.();
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Security setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {!showVerification && !showSecurityChoice ? (
        <>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Button title="Continue" onPress={handleContinue} loading={loading} />
        </>
      ) : showVerification ? (
        <>
          <Text style={styles.subtitle}>
            Enter verification code sent to {email}
          </Text>
          <Input
            label="Verification Code"
            value={verificationCode}
            onChangeText={text => setVerificationCode(text.slice(0, 6))}
            placeholder="Enter 6-digit code"
            keyboardType="number-pad"
            maxLength={6}
          />

          {(email.endsWith('@usecapsule.com') ||
            email.endsWith('@getpara.com')) && (
            <View style={styles.betaReminder}>
              <Text style={styles.betaReminderText}>
                <Text style={styles.betaBold}>Beta Testing:</Text> Any random
                OTP will work
              </Text>
            </View>
          )}

          <Button
            title="Verify"
            onPress={handleVerification}
            loading={loading}
          />
          <View style={{ height: 16 }} />
          <Button
            title="Resend Code"
            onPress={resendCode}
            variant="secondary"
            disabled={loading}
          />
        </>
      ) : (
        <SecurityChoice onChoice={handleSecurityChoice} loading={loading} />
      )}

      <StatusDisplay status={status} error={error} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  betaReminder: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    marginTop: -8,
  },
  betaReminderText: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
  },
  betaBold: {
    fontWeight: '700',
    color: '#000000',
  },
});
