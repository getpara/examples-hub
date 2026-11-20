import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { signInWithEmailOrPhone } from '../signIn';
import { Input } from './common/Input';
import { Button } from './common/Button';
import { StatusDisplay } from './common/StatusDisplay';

interface EmailAuthProps {
  onSuccess: () => void;
}

export const EmailAuth: React.FC<EmailAuthProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleContinue = async () => {
    if (!email) {
      setError('Please enter an email');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('Continue in the browser...');

    try {
      // Para's hosted page takes the code, then signs the user in or creates their account
      await signInWithEmailOrPhone({ email });
      setStatus('');
      onSuccess();
    } catch (err) {
      console.error(err);
      setStatus('');
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button title="Continue" onPress={handleContinue} loading={loading} />

      <StatusDisplay status={status} error={error} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
