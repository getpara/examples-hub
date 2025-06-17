import React, { useState } from 'react';
import { Pressable, ScrollView, View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { VerificationCodeInput } from '@/components/auth/VerificationCodeInput';
import { Text } from '~/components/ui/text';
import { usePara } from '@/hooks/usePara';
import { AuthNavigationParams, PreserveTypes } from '@/types';
import { paramsToCreds } from '@/utils';

export default function OtpVerificationScreen() {
  const { paraClient } = usePara();
  const router = useRouter();
  const routeParams =
    useLocalSearchParams<PreserveTypes<AuthNavigationParams, 'authType'>>();
  const creds = paramsToCreds(routeParams);

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleComplete = async (code: string) => {
    setIsVerifying(true);
    setError(null);
    setResendSuccess(false);

    try {
      if (!paraClient || !creds) {
        setError('Missing required configuration');
        return;
      }

      const biometricsId = await (creds.authType === 'email'
        ? paraClient.verifyEmailBiometricsId({ verificationCode: code })
        : paraClient.verifyPhoneBiometricsId({ verificationCode: code }));

      if (!biometricsId) {
        setError('Verification failed, biometrics ID not returned.');
        return;
      }

      router.navigate({
        pathname: '/auth/account-setup',
        params: { ...creds, biometricsId },
      });
    } catch (error) {
      console.error('Error verifying code:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Verification failed. Please try again.'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError(null);
    setResendSuccess(false);

    try {
      if (!paraClient || !creds) {
        setError('Missing required configuration');
        return;
      }

      await (creds.authType === 'email'
        ? paraClient.resendVerificationCode()
        : paraClient.resendVerificationCodeByPhone());
      setResendSuccess(true);
    } catch (error) {
      console.error('Error resending verification code:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to resend code. Please try again.'
      );
    } finally {
      setIsResending(false);
    }
  };

  if (!paraClient || !creds) return null;

  return (
    <View className="flex-1 bg-background px-6">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="pt-6 pb-8">
          <Text className="text-5xl text-left text-foreground font-figtree-bold">
            Verification
          </Text>
          <Text className="mt-2 text-left text-lg text-muted-foreground">
            Enter the verification code sent to your{' '}
            {creds.authType === 'email' ? 'email' : 'phone'}.
          </Text>
        </View>

        <View className="flex-1 pt-12">
          <VerificationCodeInput
            maxLength={6}
            onComplete={handleComplete}
            onClear={() => {
              setError(null);
              setResendSuccess(false);
            }}
            autoComplete={false}
          />

          {isVerifying && (
            <View className="mt-4 items-center">
              <ActivityIndicator size="small" color="#0000ff" />
              <Text className="mt-2 text-center text-muted-foreground">
                Verifying...
              </Text>
            </View>
          )}

          {error && (
            <Text className="mt-4 text-center text-red-500">{error}</Text>
          )}

          {resendSuccess && (
            <Text className="mt-4 text-center text-green-500">
              Verification code has been resent successfully.
            </Text>
          )}

          <View className="mt-8 items-center">
            <Text className="text-center text-muted-foreground mb-4">
              Didn't receive the code?
            </Text>

            {isResending ? (
              <View className="p-2">
                <ActivityIndicator size="small" color="#0000ff" />
              </View>
            ) : (
              <Pressable
                onPress={handleResend}
                accessibilityRole="button"
                accessibilityLabel="Resend verification code"
                className="p-2"
              >
                <Text className="text-primary font-bold text-lg">
                  Resend Code
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        <View className="pb-6">
          <Text className="text-center text-muted-foreground text-sm">
            This is a demo application showcasing the Para React Native Wallet
            SDK usage.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
