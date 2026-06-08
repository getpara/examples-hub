import { useState, useCallback, useEffect, useRef } from 'react';
import { openAuthSessionAsync } from 'expo-web-browser';
import type { StateSnapshot } from '@getpara/react-native-wallet';
import { para } from '@/lib/para';
import { APP_SCHEME } from '@/lib/constants';
import type { AuthStatus } from '@/types';

interface UseOneClickLoginResult {
  status: AuthStatus;
  error: string | null;
  loginWithEmail: (email: string) => Promise<boolean>;
  loginWithPhone: (phone: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithApple: () => Promise<boolean>;
  reset: () => void;
}

export function useOneClickLogin(onSuccess: () => void): UseOneClickLoginResult {
  const [status, setStatus] = useState<AuthStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const isAuthActiveRef = useRef(false);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  // Subscribe to Para state phase changes and open portal URLs the SDK emits
  // during email/phone authentication (verification, passkey, password, PIN).
  // Only acts while an auth call is in flight.
  useEffect(() => {
    const lastUrlRef = { current: null as string | null };

    const unsubscribe = para.onStatePhaseChange((snapshot: StateSnapshot) => {
      if (!isAuthActiveRef.current) return;

      const { authStateInfo } = snapshot;
      const url =
        authStateInfo.verificationUrl ||
        authStateInfo.passkeyKnownDeviceUrl ||
        authStateInfo.passkeyUrl ||
        authStateInfo.passwordUrl ||
        authStateInfo.pinUrl;

      if (url && url !== lastUrlRef.current) {
        lastUrlRef.current = url;
        const authUrl = new URL(url);
        authUrl.searchParams.set('nativeCallbackUrl', APP_SCHEME);
        openAuthSessionAsync(authUrl.toString(), APP_SCHEME, { preferEphemeralSession: false });
      }
    });

    return unsubscribe;
  }, []);

  const runAuth = useCallback(
    async (fn: () => Promise<unknown>, errorLabel: string): Promise<boolean> => {
      try {
        reset();
        setStatus('loading');
        isAuthActiveRef.current = true;

        await fn();

        setStatus('success');
        onSuccess();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : errorLabel;
        setError(message);
        setStatus('error');
        return false;
      } finally {
        isAuthActiveRef.current = false;
      }
    },
    [reset, onSuccess]
  );

  const loginWithEmail = useCallback(
    (email: string) =>
      runAuth(() => para.authenticateWithEmailOrPhone({ auth: { email } }), 'Login failed'),
    [runAuth]
  );

  const loginWithPhone = useCallback(
    (phone: string) =>
      runAuth(
        () => para.authenticateWithEmailOrPhone({ auth: { phone: phone as `+${number}` } }),
        'Login failed'
      ),
    [runAuth]
  );

  const loginWithOAuth = useCallback(
    (method: 'GOOGLE' | 'APPLE', errorLabel: string) =>
      runAuth(
        () =>
          para.authenticateWithOAuth({
            method,
            appScheme: APP_SCHEME,
            redirectCallbacks: {
              onOAuthUrl: async (url) => {
                const browserResult = await openAuthSessionAsync(url, APP_SCHEME, {
                  preferEphemeralSession: false,
                });
                if (browserResult.type !== 'success') {
                  throw new Error(`Browser returned "${browserResult.type}"`);
                }
              },
            },
          }),
        errorLabel
      ),
    [runAuth]
  );

  const loginWithGoogle = useCallback(
    () => loginWithOAuth('GOOGLE', 'Google login failed'),
    [loginWithOAuth]
  );

  const loginWithApple = useCallback(
    () => loginWithOAuth('APPLE', 'Apple login failed'),
    [loginWithOAuth]
  );

  return {
    status,
    error,
    loginWithEmail,
    loginWithPhone,
    loginWithGoogle,
    loginWithApple,
    reset,
  };
}
