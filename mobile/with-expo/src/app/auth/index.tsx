import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, View, Image } from 'react-native';
import { openAuthSessionAsync } from 'expo-web-browser';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { OAuthMethod } from '@getpara/react-native-wallet';
import { APP_SCHEME } from '@/constants/envs';
import { COUNTRY_OPTIONS } from '@/constants/countryOptions';
import {
  ADDITIONAL_PROVIDERS,
  INITIAL_PROVIDERS,
  MAX_PROVIDERS_PER_ROW,
  PROVIDER_INFO,
} from '@/constants/socialProviders';
import { LoginIdentifierInput } from '@/components/auth/LoginIdentifierInput';
import { SocialLoginOptions } from '@/components/auth/SocialLoginOptions';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { usePara } from '@/hooks/usePara';
import { useLoginIdentifier } from '@/hooks/useLoginIdentifier';
import { getCreds } from '@/utils';

export default function MainAuthScreen() {
  const {
    paraClient,
    login,
    isLoggingIn,
    isLoginError,
    loginError,
    resetLogin,
    isAuthenticated,
    isAuthStatusLoading,
  } = usePara();
  const router = useRouter();
  const { method, email: oauthEmail } = useLocalSearchParams<{
    method?: string;
    email?: string;
  }>();
  const [error, setError] = useState('');
  const {
    displayValue,
    inputType,
    email,
    phoneNumber,
    countryCode,
    error: validationError,
    isValid,
    handleChange,
    setCountryCode,
    validate,
  } = useLoginIdentifier();

  const handleEmailFlow = useCallback(
    async (targetEmail: string) => {
      setError('');
      resetLogin();

      try {
        if (!paraClient) {
          setError('Authentication service not available');
          return;
        }
        const emailCredentials = { email: targetEmail };
        const userExists = await paraClient.checkIfUserExists(emailCredentials);

        if (userExists) {
          await login({ authType: 'email', email: targetEmail });
        } else {
          await paraClient.createUser(emailCredentials);
          router.navigate({
            pathname: '/auth/otp-verification',
            params: { authType: 'email', ...emailCredentials },
          });
        }
      } catch (_err) {
        setError(
          _err instanceof Error ? _err.message : 'Failed to process email login'
        );
      }
    },
    [login, paraClient, router, resetLogin]
  );

  const handlePhoneFlow = useCallback(
    async (phone: string, code: string) => {
      setError('');
      resetLogin();

      try {
        if (!paraClient) {
          setError('Authentication service not available');
          return;
        }
        const phoneCredentials = { phone, countryCode: code };
        const userExists =
          await paraClient.checkIfUserExistsByPhone(phoneCredentials);

        if (userExists) {
          await login({ authType: 'phone', phone, countryCode: code });
        } else {
          await paraClient.createUserByPhone(phoneCredentials);
          router.navigate({
            pathname: '/auth/otp-verification',
            params: { authType: 'phone', ...phoneCredentials },
          });
        }
      } catch (_err) {
        setError(
          _err instanceof Error ? _err.message : 'Failed to process phone login'
        );
      }
    },
    [login, paraClient, router, resetLogin]
  );

  useEffect(() => {
    if (isAuthStatusLoading || isAuthenticated) return;

    (async () => {
      try {
        const cached = await getCreds();
        if (cached) await login(cached);
      } catch (_err) {
        console.error('Failed to load cached credentials:', _err);
      }
    })();
  }, [isAuthStatusLoading, isAuthenticated, login]);

  useEffect(() => {
    if (paraClient && method === 'login' && oauthEmail) {
      handleEmailFlow(oauthEmail);
    }
  }, [method, oauthEmail, paraClient, handleEmailFlow, router]);

  useEffect(() => {
    if (isLoginError && loginError) {
      console.error('Login error:', loginError.message);
      setError(loginError.message);
    }
  }, [isLoginError, loginError]);

  useEffect(() => {
    return () => {
      resetLogin();
    };
  }, [resetLogin]);

  useEffect(() => {
    if (error && inputType) {
      setError('');
    }
  }, [inputType]);

  const showHelperText =
    displayValue.trim() !== '' &&
    inputType !== undefined &&
    !error &&
    !validationError;

  const handleContinue = async () => {
    setError('');

    if (!validate()) {
      return;
    }

    if (inputType === 'email' && email) {
      await handleEmailFlow(email);
    } else if (inputType === 'phone' && phoneNumber) {
      await handlePhoneFlow(phoneNumber, countryCode);
    }
  };

  const handleOauthLogin = async (provider: OAuthMethod) => {
    if (!provider) return;

    setError('');
    resetLogin();

    try {
      if (!paraClient) {
        setError('Authentication service not available');
        return;
      }
      const oauthUrl = await paraClient.getOAuthURL({
        method: provider,
        deeplinkUrl: APP_SCHEME,
      });

      await openAuthSessionAsync(oauthUrl, APP_SCHEME, {
        preferEphemeralSession: false,
      });
    } catch {
      const providerName = PROVIDER_INFO[provider]?.name || provider;
      setError(`Failed to sign in with ${providerName}`);
    }
  };

  if (!paraClient) return null;

  return (
    <View className="flex-1 bg-background px-6">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="pt-6 pb-8">
          <Image
            source={require('@/assets/para-horizontal.png')}
            className="h-9 w-auto mb-10 self-center"
            resizeMode="contain"
          />
          <Text className="text-5xl text-left text-foreground font-figtree-bold">
            Sign In
          </Text>
          <Text className="mt-2 text-left text-lg text-muted-foreground">
            Welcome to the Para Wallet Demo. Sign in to explore seamless
            authentication and wallet integration.
          </Text>
        </View>

        <View className="flex-1 pb-8 gap-y-6">
          <LoginIdentifierInput
            displayValue={displayValue}
            inputType={inputType}
            countryCode={countryCode}
            error={error || validationError}
            isValid={isValid}
            showHelperText={showHelperText}
            onChange={handleChange}
            onSubmit={handleContinue}
            onCountryCodeChange={setCountryCode}
            countryOptions={COUNTRY_OPTIONS}
            isLoading={isLoggingIn}
          />

          <View className="flex-row items-center gap-x-2 py-2">
            <Separator className="flex-1" />
            <Text className="text-center text-muted-foreground">
              or continue with
            </Text>
            <Separator className="flex-1" />
          </View>

          <SocialLoginOptions
            onSelect={handleOauthLogin}
            disabled={isLoggingIn}
            initialProviders={INITIAL_PROVIDERS}
            additionalProviders={ADDITIONAL_PROVIDERS}
            providerInfo={PROVIDER_INFO}
            maxProvidersPerRow={MAX_PROVIDERS_PER_ROW}
            excludeProviders={[OAuthMethod.FARCASTER]}
          />
        </View>

        <View className="pb-4">
          <Text className="text-sm text-center text-muted-foreground">
            This is a demo application showcasing the Para React Native Wallet
            SDK usage.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
