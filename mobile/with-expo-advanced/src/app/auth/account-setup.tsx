import React, { useEffect, useState, useCallback } from 'react';
import { Pressable, View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '~/components/ui/text';
import { usePara } from '@/hooks/usePara';
import { useWallets } from '@/hooks/useWallets';
import { CheckCircle } from '@/components/icons';
import {
  AuthNavigationParamsWithBiometrics,
  PreserveTypes,
  SetupStep,
} from '@/types';
import { paramsToCreds } from '@/utils';
import { WalletType } from '@getpara/react-native-wallet';

export default function AccountSetupScreen() {
  const {
    paraClient,
    registerPasskey,
    registerPasskeyError,
    isRegisteringPasskey,
    resetRegisterPasskey,
  } = usePara();
  const {
    createWalletsPerType,
    isCreatingWalletsPerType,
    createWalletsPerTypeError,
    resetCreateWalletsPerType,
  } = useWallets();
  const router = useRouter();
  const routeParams =
    useLocalSearchParams<
      PreserveTypes<AuthNavigationParamsWithBiometrics, 'authType'>
    >();
  const creds = paramsToCreds(routeParams);

  const [setupStep, setSetupStep] = useState<SetupStep>(SetupStep.INITIALIZING);
  const [error, setError] = useState<string | null>(null);
  const [hasStartedSetup, setHasStartedSetup] = useState(false);

  const createWallet = useCallback(async () => {
    setSetupStep(SetupStep.CREATING_WALLET);
    setError(null);
    // Reset any previous wallet creation errors
    resetCreateWalletsPerType();

    try {
      createWalletsPerType({
        types: [WalletType.EVM, WalletType.SOLANA],
        skipDistribute: false,
      });
    } catch (error) {
      console.error('Error creating wallet:', error);
      setError('Failed to create wallet. Please try again.');
      setSetupStep(SetupStep.WALLET_ERROR);
    }
  }, [createWalletsPerType, resetCreateWalletsPerType]);

  const setupAccount = useCallback(async () => {
    if (!routeParams.biometricsId || !creds) return;
    setSetupStep(SetupStep.REGISTERING_PASSKEY);
    setError(null);

    resetRegisterPasskey();

    try {
      await registerPasskey({
        ...creds,
        biometricsId: routeParams.biometricsId,
      });
      createWallet();
    } catch (error) {
      console.error('Error registering passkey:', error);
      setError('Failed to register passkey. Please try again.');
      setSetupStep(SetupStep.PASSKEY_ERROR);
    }
  }, [
    routeParams.biometricsId,
    resetRegisterPasskey,
    registerPasskey,
    creds,
    createWallet,
  ]);

  useEffect(() => {
    if (registerPasskeyError) {
      setError(
        registerPasskeyError.message ||
          'Failed to register passkey. Please try again.'
      );
      setSetupStep(SetupStep.PASSKEY_ERROR);
    }
  }, [registerPasskeyError]);

  useEffect(() => {
    if (createWalletsPerTypeError) {
      setError(
        createWalletsPerTypeError.message ||
          'Failed to create wallet. Please try again.'
      );
      setSetupStep(SetupStep.WALLET_ERROR);
    }
  }, [createWalletsPerTypeError]);

  useEffect(() => {
    if (paraClient && routeParams.biometricsId && !hasStartedSetup) {
      setHasStartedSetup(true);
      setupAccount();
    }
  }, [paraClient, routeParams.biometricsId, hasStartedSetup]);

  useEffect(() => {
    if (setupStep === SetupStep.CREATING_WALLET && !isCreatingWalletsPerType) {
      if (!createWalletsPerTypeError) {
        setSetupStep(SetupStep.SUCCESS);
        setTimeout(() => {
          router.navigate('/home');
        }, 1000);
      }
    }
  }, [isCreatingWalletsPerType, createWalletsPerTypeError, setupStep, router]);

  if (!paraClient) return null;

  const renderStepContent = () => {
    switch (setupStep) {
      case SetupStep.INITIALIZING:
      case SetupStep.REGISTERING_PASSKEY:
        return (
          <View className="items-center">
            <ActivityIndicator size="large" color="#6366f1" className="mb-4" />
            <Text className="text-center text-muted-foreground">
              {isRegisteringPasskey
                ? 'Registering your passkey...'
                : 'Initializing...'}
            </Text>
          </View>
        );

      case SetupStep.CREATING_WALLET:
        return (
          <View className="items-center">
            <ActivityIndicator size="large" color="#6366f1" className="mb-4" />
            <Text className="text-center text-muted-foreground">
              Creating your wallet...
            </Text>
          </View>
        );

      case SetupStep.PASSKEY_ERROR:
        return (
          <View className="items-center">
            <Text className="text-center text-red-500 mb-4">{error}</Text>
            <Pressable
              onPress={() => {
                resetRegisterPasskey();
                setError(null);
                setupAccount();
              }}
              accessibilityRole="button"
              accessibilityLabel="Retry passkey registration"
              className="bg-primary py-3 px-6 rounded-lg"
            >
              <Text className="text-white font-bold">
                Retry Passkey Registration
              </Text>
            </Pressable>
          </View>
        );

      case SetupStep.WALLET_ERROR:
        return (
          <View className="items-center">
            <Text className="text-center text-red-500 mb-4">{error}</Text>
            <Pressable
              onPress={() => {
                resetCreateWalletsPerType();
                setError(null);
                createWallet();
              }}
              accessibilityRole="button"
              accessibilityLabel="Retry wallet creation"
              className="bg-primary py-3 px-6 rounded-lg"
            >
              <Text className="text-white font-bold">
                Retry Wallet Creation
              </Text>
            </Pressable>
          </View>
        );

      case SetupStep.SUCCESS:
        return (
          <View className="items-center">
            <CheckCircle className="text-green-500 mb-4" size={64} />
            <Text className="text-center text-lg font-bold mb-2">
              Account Created Successfully!
            </Text>
            <Text className="text-center text-muted-foreground">
              Your passkey and wallet have been set up.
            </Text>
            <Text className="text-center text-muted-foreground mt-2">
              Redirecting to home...
            </Text>
          </View>
        );
    }
  };

  return (
    <View className="flex-1 bg-background px-6">
      <View className="pt-6 pb-8">
        <Text className="text-5xl text-left text-foreground font-figtree-bold">
          Account Setup
        </Text>
        <Text className="mt-2 text-left text-lg text-muted-foreground">
          We're setting up your account and wallet. This may take a moment.
        </Text>
      </View>
      <View className="flex-1 justify-center items-center pt-12">
        {renderStepContent()}
      </View>
      <View className="pb-6">
        <Text className="text-center text-muted-foreground text-sm">
          This is a demo application showcasing the Para React Native Wallet SDK
          usage.
        </Text>
      </View>
    </View>
  );
}
