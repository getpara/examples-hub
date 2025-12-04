import { forwardRef } from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, hint, className, ...inputProps }, ref) => {
    return (
      <View className="w-full">
        {label && <Text className="mb-1.5 text-sm font-medium text-gray-700">{label}</Text>}
        <TextInput
          ref={ref}
          className={`w-full rounded-xl border bg-gray-50 px-4 py-3.5 text-base text-gray-900 ${
            error ? 'border-red-500' : 'border-gray-200'
          } ${className || ''}`}
          placeholderTextColor="#9CA3AF"
          {...inputProps}
        />
        {error && <Text className="mt-1 text-sm text-red-500">{error}</Text>}
        {hint && !error && <Text className="mt-1 text-sm text-gray-500">{hint}</Text>}
      </View>
    );
  }
);

Input.displayName = 'Input';
