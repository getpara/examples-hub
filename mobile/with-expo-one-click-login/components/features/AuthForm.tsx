import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Button, Input } from '@/components/ui';
import { isValidEmail, isValidPhone } from '@/lib/auth';

type AuthMethod = 'email' | 'phone';

interface AuthFormProps {
  onSubmit: (value: string, method: AuthMethod) => void;
  loading?: boolean;
  error?: string | null;
}

export function AuthForm({ onSubmit, loading, error }: AuthFormProps) {
  const [method, setMethod] = useState<AuthMethod>('email');
  const [value, setValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = () => {
    setValidationError(null);

    if (method === 'email') {
      if (!isValidEmail(value)) {
        setValidationError('Please enter a valid email address');
        return;
      }
    } else {
      if (!isValidPhone(value)) {
        setValidationError('Please enter a valid phone number');
        return;
      }
    }

    onSubmit(value, method);
  };

  const handleMethodChange = (newMethod: AuthMethod) => {
    setMethod(newMethod);
    setValue('');
    setValidationError(null);
  };

  return (
    <View className="w-full">
      {/* Method Toggle */}
      <View className="mb-6 flex-row rounded-xl bg-gray-100 p-1">
        <TouchableOpacity
          onPress={() => handleMethodChange('email')}
          className="flex-1 rounded-lg py-2.5"
          style={method === 'email' ? styles.activeTab : undefined}>
          <Text
            className="text-center font-medium"
            style={{ color: method === 'email' ? '#111827' : '#6B7280' }}>
            Email
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleMethodChange('phone')}
          className="flex-1 rounded-lg py-2.5"
          style={method === 'phone' ? styles.activeTab : undefined}>
          <Text
            className="text-center font-medium"
            style={{ color: method === 'phone' ? '#111827' : '#6B7280' }}>
            Phone
          </Text>
        </TouchableOpacity>
      </View>

      {/* Input */}
      <Input
        testID="authInput"
        placeholder={method === 'email' ? 'Enter your email' : '+1 (555) 000-0000'}
        value={value}
        onChangeText={setValue}
        keyboardType={method === 'email' ? 'email-address' : 'phone-pad'}
        autoCapitalize="none"
        autoCorrect={false}
        error={validationError || error || undefined}
        editable={!loading}
      />

      {/* Submit Button */}
      <Button
        testID="continueButton"
        title="Continue"
        onPress={handleSubmit}
        loading={loading}
        disabled={!value.trim()}
        className="mt-4"
        size="lg"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
