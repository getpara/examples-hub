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
  loginWithApple: () => Promise<boolean>;
  reset: () => void;
}

export function useOneClickLogin(onSuccess: () => void): UseOneClickLoginResult {
  const [status, setStatus] = useState<AuthStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  const loginWithEmail = useCallback(
    async (email: string): Promise<boolean> => {
      try {
        reset();
        setStatus('loading');

        const authState = await para.signUpOrLogIn({ auth: { email } });

        if (authState?.stage === 'verify' && 'loginUrl' in authState && authState.loginUrl) {
          const result = await openAuthUrl(authState.loginUrl);

          if (!result.success) {
            throw new Error('Authentication was cancelled');
          }

          if (authState.nextStage === 'login') {
            await para.waitForLogin({});
          } else {
            await para.waitForWalletCreation({});
          }

          setStatus('success');
          onSuccess();
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
    [reset, onSuccess]
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
          const result = await openAuthUrl(authState.loginUrl);

          if (!result.success) {
            throw new Error('Authentication was cancelled');
          }

          if (authState.nextStage === 'login') {
            await para.waitForLogin({});
          } else {
            await para.waitForWalletCreation({});
          }

          setStatus('success');
          onSuccess();
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
    [reset, onSuccess]
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

      const authState = await para.verifyOAuth({ method: 'GOOGLE' });

      if (authState.stage === 'done') {
        if (authState.isNewUser) {
          await para.waitForWalletCreation({});
        } else {
          await para.waitForLogin({});
        }

        setStatus('success');
        onSuccess();
        return true;
      }

      throw new Error('Unexpected OAuth state');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google login failed';
      setError(message);
      setStatus('error');
      return false;
    }
  }, [reset, onSuccess]);

  const loginWithApple = useCallback(async (): Promise<boolean> => {
    try {
      reset();
      setStatus('loading');

      const oauthUrl = await para.getOAuthUrl({ method: 'APPLE' });
      const result = await openAuthUrl(oauthUrl);

      if (!result.success) {
        throw new Error('Authentication was cancelled');
      }

      const authState = await para.verifyOAuth({ method: 'APPLE' });

      if (authState.stage === 'done') {
        if (authState.isNewUser) {
          await para.waitForWalletCreation({});
        } else {
          await para.waitForLogin({});
        }

        setStatus('success');
        onSuccess();
        return true;
      }

      throw new Error('Unexpected OAuth state');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Apple login failed';
      setError(message);
      setStatus('error');
      return false;
    }
  }, [reset, onSuccess]);

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
