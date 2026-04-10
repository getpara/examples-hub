import { useState, useEffect, useRef } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useAuthenticateWithEmailOrPhone,
  useAuthenticateWithOAuth,
  useIsFullyLoggedIn,
  useClient,
} from '@getpara/react-native-wallet';
import { openAuthUrl, isValidEmail, isValidPhone } from '@/lib/auth';
import { IdentifierInput, LoadingView, ErrorView } from '@/components/AuthViews';
import type { StateSnapshot, TOAuthMethod } from '@getpara/react-native-wallet';

type AuthState = 'idle' | 'authenticating' | 'awaiting_browser' | 'error';

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
  const canceledRef = useRef(false);

  useEffect(() => {
    if (isLoggedIn) router.replace('/home');
  }, [isLoggedIn, router]);

  // Open the portal verification URL when it becomes available
  useEffect(() => {
    if (!para) return;
    const unsubscribe = para.onStatePhaseChange(async (snapshot: StateSnapshot) => {
      const { authPhase, authStateInfo } = snapshot;
      if (
        authPhase === 'awaiting_session_start' &&
        authStateInfo.verificationUrl &&
        authStateInfo.verificationUrl !== lastUrlRef.current
      ) {
        lastUrlRef.current = authStateInfo.verificationUrl;
        setAuthState('awaiting_browser');
        const result = await openAuthUrl(authStateInfo.verificationUrl);
        if (result.success) {
          setAuthState('authenticating');
        } else {
          canceledRef.current = true;
          setAuthState('idle');
        }
      }
    });
    return unsubscribe;
  }, [para]);

  function resetState() {
    setAuthState('authenticating');
    setErrorMessage('');
    lastUrlRef.current = null;
    canceledRef.current = false;
  }

  function handleError(err: unknown, fallback: string) {
    if (canceledRef.current) return;
    setErrorMessage(err instanceof Error ? err.message : fallback);
    setAuthState('error');
  }

  async function handleLogin() {
    const isEmail = activeTab === 'email';
    if (isEmail && !isValidEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      setAuthState('error');
      return;
    }
    if (!isEmail && !isValidPhone(phone)) {
      setErrorMessage('Please enter a valid phone number.');
      setAuthState('error');
      return;
    }

    resetState();
    const auth = isEmail
      ? { email }
      : { phone: `+${phone.replace(/\D/g, '')}` as `+${number}` };

    try {
      await authenticateWithEmailOrPhoneAsync({
        auth,
        sessionPollingCallbacks: { isCanceled: () => canceledRef.current },
      });
      if (!canceledRef.current) router.replace('/home');
    } catch (err) {
      handleError(err, 'Authentication failed.');
    }
  }

  async function handleOAuthLogin(method: TOAuthMethod) {
    resetState();
    try {
      await authenticateWithOAuthAsync({
        method,
        redirectCallbacks: {
          onOAuthUrl: async (url) => {
            const result = await openAuthUrl(url);
            if (!result.success) {
              canceledRef.current = true;
              setAuthState('idle');
            }
          },
        },
        sessionPollingCallbacks: { isCanceled: () => canceledRef.current },
      });
      if (!canceledRef.current) router.replace('/home');
    } catch (err) {
      handleError(err, 'OAuth login failed.');
    }
  }

  return (
    <ImageBackground
      source={require('@/assets/dot-grid.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.spacer} />

          <View style={styles.bottom}>
            <Image source={require('@/assets/para-logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>Basic Login</Text>
            <Text style={styles.subtitle}>Sign in with email, phone, or Google</Text>

            <View style={styles.form}>
              {authState === 'idle' && (
                <IdentifierInput
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  email={email}
                  onEmailChange={setEmail}
                  phone={phone}
                  onPhoneChange={setPhone}
                  onSubmit={handleLogin}
                  onGoogleLogin={() => handleOAuthLogin('GOOGLE')}
                  onAppleLogin={() => handleOAuthLogin('APPLE')}
                />
              )}

              {authState === 'authenticating' && <LoadingView message="Signing in..." />}

              {authState === 'awaiting_browser' && (
                <LoadingView message="Complete verification in the browser" />
              )}

              {authState === 'error' && (
                <ErrorView
                  message={errorMessage}
                  onRetry={() => { setAuthState('idle'); setErrorMessage(''); }}
                />
              )}
            </View>
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
  form: {
    gap: 0,
  },
});
