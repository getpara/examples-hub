import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Divider } from '@/components/ui';
import { AuthForm, OAuthButtons } from '@/components/features';
import { useOneClickLogin } from '@/hooks/useOneClickLogin';

export default function LoginScreen() {
  const router = useRouter();

  const handleSuccess = () => {
    router.replace('/(tabs)');
  };

  const { loginWithEmail, loginWithPhone, loginWithGoogle, loginWithApple, status, error } =
    useOneClickLogin(handleSuccess);

  const isLoading = status === 'loading' || status === 'verifying' || status === 'completing';

  const handleAuthSubmit = async (value: string, method: 'email' | 'phone') => {
    if (method === 'email') {
      await loginWithEmail(value);
    } else {
      await loginWithPhone(value);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="flex-1">
          <View className="flex-1 px-6 pb-8 pt-12">
            <View className="mb-10 items-center">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-brand-500">
                <Ionicons name="wallet-outline" size={32} color="#fff" />
              </View>
              <Text className="mb-2 text-2xl font-bold text-gray-900">Para One Click Login</Text>
              <Text className="text-center text-gray-500">Sign in to access your wallet</Text>
            </View>
            <AuthForm onSubmit={handleAuthSubmit} loading={isLoading} error={error} />
            <Divider text="or continue with" />
            <OAuthButtons
              onGooglePress={loginWithGoogle}
              onApplePress={loginWithApple}
              disabled={isLoading}
            />
          </View>
          <View className="px-6 pb-4">
            <Text className="text-center text-xs text-gray-400">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
