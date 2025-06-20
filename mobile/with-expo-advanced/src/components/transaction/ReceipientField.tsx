import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '~/components/ui/text';
import { Input } from '~/components/ui/input';
import { AlertCircle, CheckCircle } from '@/components/icons';
import { Clipboard as ClipboardIcon } from 'lucide-react-native';
import * as ExpoClipboard from 'expo-clipboard';
import { formatAddress } from '@/utils/formattingUtils';
import { SupportedWalletType } from '@/types';

export interface RecipientFieldProps {
  value: string;
  onChange: (value: string) => void;
  networkType: SupportedWalletType;
  isValid: boolean;
  errorMessage: string;
  successMessage: string;
  placeholder: string;
  networkName: string;
  label?: string;
}

export function RecipientField({
  value,
  onChange,
  networkType,
  isValid,
  errorMessage,
  successMessage,
  placeholder,
  networkName: _networkName,
  label = 'Recipient address',
}: RecipientFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasting, setIsPasting] = useState(false);

  const handlePaste = async () => {
    try {
      setIsPasting(true);
      const clipboardContent = await ExpoClipboard.getStringAsync();
      if (clipboardContent) {
        onChange(clipboardContent);
      }
    } catch (error) {
      console.error('Error pasting from clipboard:', error);
    } finally {
      setIsPasting(false);
    }
  };

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-foreground mb-2">{label}</Text>

      <View
        className={`rounded-lg border ${
          errorMessage
            ? 'border-destructive'
            : isValid && value
              ? 'border-green-500'
              : isFocused
                ? 'border-primary'
                : 'border-border'
        } bg-background overflow-hidden`}
      >
        <View className="flex-row items-center">
          <Input
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            className="flex-1 border-0 h-14 text-base"
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />

          <TouchableOpacity
            onPress={handlePaste}
            disabled={isPasting}
            className="px-4 h-full justify-center"
            accessibilityLabel="Paste address from clipboard"
          >
            <ClipboardIcon size={20} className="text-muted-foreground" />
          </TouchableOpacity>
        </View>
      </View>

      {successMessage && (
        <View className="mt-2 flex-row items-center">
          <CheckCircle size={16} className="text-green-500 mr-2" />
          <Text className="text-sm text-muted-foreground">
            {successMessage}
          </Text>
        </View>
      )}

      {errorMessage && (
        <View className="mt-2 flex-row items-center">
          <AlertCircle size={16} className="text-destructive mr-2" />
          <Text className="text-sm text-destructive">{errorMessage}</Text>
        </View>
      )}

      {value && value.length > 10 && (
        <View className="mt-1">
          <Text className="text-xs text-muted-foreground">
            Sending to: {formatAddress(value, networkType)}
          </Text>
        </View>
      )}
    </View>
  );
}
