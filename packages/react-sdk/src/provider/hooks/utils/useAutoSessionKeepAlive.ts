import { useEffect, useRef } from 'react';
import { useAccount, useKeepSessionAlive, useLogout } from '../index.js';
import { useInternalClient } from './useInternalClient.js';

const SESSION_CHECK_INTERVAL = 60000;
const SESSION_REFRESH_THRESHOLD = 300000;

export const useAutoSessionKeepAlive = ({ disabled }: { disabled?: boolean }) => {
  const client = useInternalClient();
  const { data: account } = useAccount();
  const { logoutAsync } = useLogout();
  const { keepSessionAliveAsync } = useKeepSessionAlive();

  const sessionCheckInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!client || disabled) {
      clearSessionMonitoring();
      return;
    }

    if (account?.isConnected && !client.isUsingExternalWallet()) {
      setupSessionMonitoring();
    } else {
      clearSessionMonitoring();
    }

    return () => clearSessionMonitoring();
  }, [client, account, disabled]);

  const getSessionExpiry = async (): Promise<Date | null> => {
    try {
      const sessionCookie = await client.retrieveSessionCookie();
      if (!sessionCookie) return null;

      const expiresMatch = sessionCookie.match(/Expires=([^;]+)/);
      return expiresMatch ? new Date(expiresMatch[1]) : null;
    } catch (err) {
      return null;
    }
  };

  const setupSessionMonitoring = () => {
    clearSessionMonitoring();

    sessionCheckInterval.current = setInterval(async () => {
      const expiry = await getSessionExpiry();
      if (!expiry) {
        await logoutAsync();
        clearSessionMonitoring();
        return;
      }

      const timeUntilExpiry = expiry.getTime() - Date.now();

      if (timeUntilExpiry <= 0) {
        await logoutAsync();
        clearSessionMonitoring();
        return;
      }

      if (timeUntilExpiry <= SESSION_REFRESH_THRESHOLD) {
        try {
          await keepSessionAliveAsync();
          setupSessionMonitoring();
        } catch (err) {
          console.error('Failed to keep session alive:', err);
          await logoutAsync();
          clearSessionMonitoring();
        }
        return;
      }
    }, SESSION_CHECK_INTERVAL);
  };

  const clearSessionMonitoring = () => {
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
    }
  };
};
