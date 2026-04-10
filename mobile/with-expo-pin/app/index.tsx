import { useState, useEffect, useRef } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  useAuthenticateWithEmailOrPhone,
  useAuthenticateWithOAuth,
  useVerifyNewAccount,
  useResendVerificationCode,
  useIsFullyLoggedIn,
  useClient,
} from '@getpara/react-native-wallet';
import type { StateSnapshot, TOAuthMethod } from '@getpara/react-native-wallet';
import { openAuthUrl, isValidEmail, isValidPhone } from '@/lib/auth';
import { IdentifierInput, OtpVerifyView, LoadingView, ErrorView } from '@/components/AuthComponents';

type AuthState = 'idle' | 'authenticating' | 'verifying' | 'awaiting_browser' | 'error';

export default function AuthScreen() {
  const router = useRouter();
  const para = useClient();
  const { data: isLoggedIn } = useIsFullyLoggedIn();
  const { authenticateWithEmailOrPhoneAsync } = useAuthenticateWithEmailOrPhone();
  const { authenticateWithOAuthAsync } = useAuthenticateWithOAuth();
  const { verifyNewAccountAsync } = useVerifyNewAccount();
  const { resendVerificationCodeAsync } = useResendVerificationCode();

  const [authState, setAuthState] = useState<AuthState>('idle');
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const lastUrlRef = useRef<string | null>(null);
  const canceledRef = useRef(false);

  useEffect(() => {
    if (isLoggedIn) router.replace('/home');
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (!para) return;

    const unsubscribe = para.onStatePhaseChange(async (snapshot: StateSnapshot) => {
      const { authPhase, authStateInfo } = snapshot;

      if (authPhase === 'awaiting_account_verification') {
        setAuthState('verifying');
      }

      if (
        authPhase === 'awaiting_session_start' &&
        authStateInfo.pinUrl &&
        authStateInfo.pinUrl !== lastUrlRef.current
      ) {
        lastUrlRef.current = authStateInfo.pinUrl;
        setAuthState('awaiting_browser');
        const result = await openAuthUrl(authStateInfo.pinUrl);
        if (!result.success) {
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
    const auth = isEmail ? { email } : { phone: `+${phone.replace(/\D/g, '')}` as `+${number}` };

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
            if (result.success) {
              setAuthState('authenticating');
            } else {
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

  async function handleVerify() {
    if (otpCode.length < 4) {
      setErrorMessage('Please enter the verification code.');
      setAuthState('error');
      return;
    }

    setAuthState('authenticating');
    setErrorMessage('');

    try {
      await verifyNewAccountAsync({ verificationCode: otpCode });
    } catch (err) {
      handleError(err, 'Verification failed.');
    }
  }

  async function handleResendCode() {
    try {
      await resendVerificationCodeAsync({ type: 'SIGNUP' });
      setOtpCode('');
      setAuthState('verifying');
    } catch (err) {
      handleError(err, 'Failed to resend code.');
    }
  }

  return (
    <ImageBackground source={require('@/assets/dot-grid.png')} resizeMode="cover" style={styles.background}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.spacer} />
          <View style={styles.bottom}>
            <Image source={require('@/assets/para-logo.png')} style={styles.logo} />
            <Text style={styles.title}>PIN</Text>
            <Text style={styles.subtitle}>Sign in with email, phone, or Google</Text>

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

            {authState === 'authenticating' && <LoadingView message="Authenticating..." />}

            {authState === 'verifying' && (
              <OtpVerifyView
                otpCode={otpCode}
                onOtpChange={setOtpCode}
                onVerify={handleVerify}
                onResend={handleResendCode}
              />
            )}

            {authState === 'awaiting_browser' && <LoadingView message="Complete PIN setup in the browser" />}

            {authState === 'error' && (
              <ErrorView
                message={errorMessage}
                onRetry={() => {
                  setAuthState('idle');
                  setErrorMessage('');
                  setOtpCode('');
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
