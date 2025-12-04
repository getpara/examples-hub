import { useState, useCallback } from 'react';
import { para } from '@/lib/para';
import { openAuthUrl } from '@/lib/auth';
import type { AuthStatus } from '@/types';

interface UseOneClickLoginResult {
  status: AuthStatus;
  error: string | null;
  loginWithEmail: (email: string) => Promise<boolean>;
  loginWithPhone: (phone: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  reset: () => void;
}

export function useOneClickLogin(onSuccess: () => void): UseOneClickLoginResult {
  const [status, setStatus] = useState<AuthStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  const touchSession = useCallback(async () => {
    await para.touchSession();
  }, []);

  const waitForLoginAndFinish = useCallback(async () => {
    await para.waitForLogin({});
    await touchSession();
    setStatus('success');
    onSuccess();
  }, [touchSession, onSuccess]);

  const waitForSignupAndFinish = useCallback(async () => {
    await para.waitForSignup({});
    await touchSession();
    setStatus('success');
    onSuccess();
  }, [touchSession, onSuccess]);

  const loginWithEmail = useCallback(
    async (email: string): Promise<boolean> => {
      try {
        reset();
        setStatus('loading');

        const authState = await para.signUpOrLogIn({ auth: { email } });

        if (authState?.stage === 'verify' && 'loginUrl' in authState && authState.loginUrl) {
          const isOneClickLogin = authState.nextStage === 'login';

          const result = await openAuthUrl(authState.loginUrl);

          if (!result.success) {
            throw new Error('Authentication was cancelled');
          }

          if (isOneClickLogin) {
            await waitForLoginAndFinish();
          } else {
            await waitForSignupAndFinish();
          }

          return true;
        }

        throw new Error('One-click login not available for this account');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        setError(message);
        setStatus('error');
        return false;
      }
    },
    [reset, waitForLoginAndFinish, waitForSignupAndFinish]
  );

  const loginWithPhone = useCallback(
    async (phone: string): Promise<boolean> => {
      try {
        reset();
        setStatus('loading');

        const authState = await para.signUpOrLogIn({
          auth: { phone: phone as `+${number}` },
        });

        if (authState?.stage === 'verify' && 'loginUrl' in authState && authState.loginUrl) {
          const isOneClickLogin = authState.nextStage === 'login';

          const result = await openAuthUrl(authState.loginUrl);

          if (!result.success) {
            throw new Error('Authentication was cancelled');
          }

          if (isOneClickLogin) {
            await waitForLoginAndFinish();
          } else {
            await waitForSignupAndFinish();
          }

          return true;
        }

        throw new Error('One-click login not available for this account');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        setError(message);
        setStatus('error');
        return false;
      }
    },
    [reset, waitForLoginAndFinish, waitForSignupAndFinish]
  );

  const loginWithGoogle = useCallback(async (): Promise<boolean> => {
    try {
      reset();
      setStatus('loading');

      const oauthUrl = await para.getOAuthUrl({ method: 'GOOGLE' });

      const result = await openAuthUrl(oauthUrl);

      if (!result.success) {
        throw new Error('Authentication was cancelled');
      }

      await waitForLoginAndFinish();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google login failed';
      setError(message);
      setStatus('error');
      return false;
    }
  }, [reset, waitForLoginAndFinish]);

  return {
    status,
    error,
    loginWithEmail,
    loginWithPhone,
    loginWithGoogle,
    reset,
  };
}
