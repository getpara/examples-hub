import { useState, useEffect, useRef } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dismissAuthSession } from 'expo-web-browser';
import {
  useAuthenticateWithEmailOrPhone,
  useAuthenticateWithOAuth,
  useIsFullyLoggedIn,
  useClient,
} from '@getpara/react-native-wallet';
import type { StateSnapshot, TOAuthMethod } from '@getpara/react-native-wallet';
import { isValidEmail, isValidPhone, openAuthUrl } from '@/lib/auth';
import { APP_SCHEME } from '@/lib/constants';
import { IdentifierInput, LoadingView, ErrorView } from '@/components/AuthViews';

type AuthState = 'idle' | 'authenticating' | 'passkey' | 'error';

export default function AuthScreen() {
  const router = useRouter();
  const para = useClient();
  const { data: isLoggedIn } = useIsFullyLoggedIn();
  const { authenticateWithEmailOrPhoneAsync } = useAuthenticateWithEmailOrPhone();
  const { authenticateWithOAuthAsync } = useAuthenticateWithOAuth();

  const [authState, setAuthState] = useState<AuthState>('idle');
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const lastUrlRef = useRef<string | null>(null);
  const passkeyHandledRef = useRef(false);

  useEffect(() => {
    if (isLoggedIn) router.replace('/home');
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (!para) return;

    async function runPasskey(step: () => Promise<void>) {
      if (passkeyHandledRef.current) return;
      passkeyHandledRef.current = true;
      setAuthState('passkey');
      try {
        await step();
      } catch (error) {
        passkeyHandledRef.current = false;
        handleError(error, 'Passkey authentication failed');
      }
    }

    const unsubscribe = para.onStatePhaseChange(async (snapshot: StateSnapshot) => {
      const { authStateInfo } = snapshot;

      // A new account creates its passkey on this device once it has proven its email, phone or OAuth login
      const { isCredentialSetup, passkeyId } = authStateInfo;
      if (isCredentialSetup && passkeyId) {
        await runPasskey(() => para.registerPasskey(passkeyId));
        return;
      }

      // Para's hosted page sends and checks the email/phone code, then signs the user in or creates their account
      const { verificationUrl } = authStateInfo;
      if (verificationUrl && verificationUrl !== lastUrlRef.current) {
        lastUrlRef.current = verificationUrl;
        const result = await openAuthUrl(verificationUrl);
        if (!result.success && !passkeyHandledRef.current) setAuthState('idle');
      }
    });

    // A returning account protected by this device's passkey: the hosted page hands the sign-in back after the code
    // (or OAuth), and the pending login resolves once the passkey is proven here
    const stopPasskeyLogin = para.onPasskeyLoginRequired(() => {
      dismissAuthSession();
      void runPasskey(() => para.loginWithPasskey());
    });

    return () => {
      unsubscribe();
      stopPasskeyLogin();
    };
  }, [para]);

  function resetState() {
    setAuthState('authenticating');
    setErrorMessage('');
    lastUrlRef.current = null;
    passkeyHandledRef.current = false;
  }

  function handleError(err: unknown, fallback: string) {
    setErrorMessage(err instanceof Error ? err.message : fallback);
    setAuthState('error');
  }

  async function handleLogin() {
    const isEmail = activeTab === 'email';
    if (isEmail && !isValidEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      setAuthState('error');
      return;
    }
    if (!isEmail && !isValidPhone(phone)) {
      setErrorMessage('Please enter a valid phone number');
      setAuthState('error');
      return;
    }

    resetState();
    const auth = isEmail
      ? { email }
      : { phone: `+${phone.replace(/\D/g, '')}` as `+${number}` };

    try {
      await authenticateWithEmailOrPhoneAsync({ auth });
      router.replace('/home');
    } catch (err) {
      handleError(err, 'Authentication failed');
    }
  }

  async function handleOAuthLogin(method: TOAuthMethod) {
    resetState();
    try {
      await authenticateWithOAuthAsync({
        method,
        // Where the hosted OAuth page returns to
        appScheme: APP_SCHEME,
        redirectCallbacks: {
          onOAuthUrl: async (url) => {
            const result = await openAuthUrl(url);
            if (!result.success) {
              passkeyHandledRef.current = false;
              setAuthState('idle');
            }
          },
        },
      });
      router.replace('/home');
    } catch (err) {
      handleError(err, 'OAuth login failed');
    }
  }

  return (
    <ImageBackground source={require('@/assets/dot-grid.png')} resizeMode="cover" style={styles.background}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.spacer} />

          <View style={styles.bottom}>
            <Image source={require('@/assets/para-logo.png')} style={styles.logo} />
            <Text style={styles.title}>Passkey</Text>
            <Text style={styles.subtitle}>Sign in with native biometric</Text>

            {authState === 'idle' && (
              <IdentifierInput
                activeTab={activeTab}
                email={email}
                phone={phone}
                onTabChange={setActiveTab}
                onEmailChange={setEmail}
                onPhoneChange={setPhone}
                onSubmit={handleLogin}
                onGoogleLogin={() => handleOAuthLogin('GOOGLE')}
                onAppleLogin={() => handleOAuthLogin('APPLE')}
              />
            )}

            {authState === 'authenticating' && <LoadingView message="Authenticating..." />}

            {authState === 'passkey' && <LoadingView message="Complete passkey authentication" />}

            {authState === 'error' && (
              <ErrorView
                message={errorMessage}
                onRetry={() => {
                  setAuthState('idle');
                  setErrorMessage('');
                  passkeyHandledRef.current = false;
                }}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  spacer: {
    flex: 1,
  },
  bottom: {
    paddingBottom: 16,
  },
  logo: {
    width: 40,
    height: 40,
    marginBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1C1917',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#78716C',
    marginBottom: 28,
  },
});
