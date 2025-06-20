import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { para } from '../para';
import { Input } from './common/Input';
import { Button } from './common/Button';
import { StatusDisplay } from './common/StatusDisplay';

interface EmailAuthProps {
  onSuccess: () => void;
  onShowVerification?: () => void;
  onHideVerification?: () => void;
}

export const EmailAuth: React.FC<EmailAuthProps> = ({
  onSuccess,
  onShowVerification,
  onHideVerification,
}) => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
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
      // Call signUpOrLogIn to determine if user exists
      const authState = await para.signUpOrLogIn({ auth: { email } });

      if (authState?.stage === 'verify') {
        // New user - show OTP verification
        setShowVerification(true);
        onShowVerification?.();
        setStatus('Verification code sent to your email');
      } else if (authState?.stage === 'login') {
        // Existing user - proceed with passkey login
        setStatus('Logging in with passkey...');
        await para.loginWithPasskey();
        setStatus('');
        onSuccess();
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
      const authState = await para.verifyNewAccount({ verificationCode });

      setStatus('Creating passkey...');
      await para.registerPasskey(authState);

      setStatus('');
      onSuccess();
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
      await para.resendVerificationCode({ type: 'SIGNUP' });
      setStatus('Verification code resent');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {!showVerification ? (
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
      ) : (
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
