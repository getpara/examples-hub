import { View, Text, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

interface OAuthButtonsProps {
  onGooglePress: () => void;
  onApplePress: () => void;
  disabled?: boolean;
}

export function OAuthButtons({ onGooglePress, onApplePress, disabled }: OAuthButtonsProps) {
  return (
    <View className="gap-3">
      <TouchableOpacity
        onPress={onGooglePress}
        disabled={disabled}
        className={`flex-row items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-4 active:bg-gray-50 ${disabled ? 'opacity-50' : ''}`}>
        <View className="mr-3">
          <AntDesign name="google" size={20} color="#4285F4" />
        </View>
        <Text className="text-base font-semibold text-gray-900">Continue with Google</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onApplePress}
        disabled={disabled}
        className={`flex-row items-center justify-center rounded-xl bg-black px-6 py-4 active:bg-gray-800 ${disabled ? 'opacity-50' : ''}`}>
        <View className="mr-3">
          <AntDesign name="apple" size={20} color="#fff" />
        </View>
        <Text className="text-base font-semibold text-white">Continue with Apple</Text>
      </TouchableOpacity>
    </View>
  );
}
