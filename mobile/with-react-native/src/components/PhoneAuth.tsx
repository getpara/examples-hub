import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { signInWithEmailOrPhone } from '../signIn';
import { Input } from './common/Input';
import { Button } from './common/Button';
import { StatusDisplay } from './common/StatusDisplay';

interface PhoneAuthProps {
  onSuccess: () => void;
}

export const PhoneAuth: React.FC<PhoneAuthProps> = ({ onSuccess }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleContinue = async () => {
    if (!phone) {
      setError('Please enter a phone number');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('Continue in the browser...');

    try {
      // Phone must include country code (e.g., +1 for US). Para's hosted page takes the SMS code, then signs the
      // user in or creates their account
      await signInWithEmailOrPhone({ phone: phone as `+${number}` });
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
        label="Phone Number"
        value={phone}
        onChangeText={setPhone}
        placeholder="+1234567890"
        keyboardType="phone-pad"
      />
      <Text style={styles.hint}>Include country code (e.g., +1 for US)</Text>
      <Button title="Continue" onPress={handleContinue} loading={loading} />

      <StatusDisplay status={status} error={error} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
    marginTop: -8,
  },
});
