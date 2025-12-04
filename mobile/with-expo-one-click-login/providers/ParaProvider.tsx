import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { para } from '@/lib/para';
import { useWallets } from '@/hooks/useWallets';
import type { User, Wallet } from '@/types';

interface ParaContextValue {
  isReady: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  wallets: Wallet[];
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  setAuthenticated: (authenticated: boolean) => void;
}

const ParaContext = createContext<ParaContextValue | null>(null);

interface ParaProviderProps {
  children: ReactNode;
}

export function ParaProvider({ children }: ParaProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const { wallets, loadWallets, clearWallets } = useWallets();

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);

      const loggedIn = await para.isFullyLoggedIn();

      if (loggedIn) {
        setIsAuthenticated(true);
        await loadWallets();
      } else {
        setIsAuthenticated(false);
        setUser(null);
        clearWallets();
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [loadWallets, clearWallets]);

  const logout = useCallback(async () => {
    try {
      await para.logout();
      setIsAuthenticated(false);
      setUser(null);
      clearWallets();
    } catch {
      // Logout failed silently
    }
  }, [clearWallets]);

  const refreshAuth = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  const setAuthenticated = useCallback(
    (authenticated: boolean) => {
      setIsAuthenticated(authenticated);
      if (authenticated) {
        loadWallets();
      } else {
        clearWallets();
      }
    },
    [loadWallets, clearWallets]
  );

  // Initialize Para SDK, then check auth
  useEffect(() => {
    const initialize = async () => {
      try {
        await para.init();
        setIsReady(true);
        await checkAuth();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to initialize Para';
        setInitError(message);
      }
    };

    initialize();
  }, [checkAuth]);

  if (initError) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Text className="mb-2 text-center text-lg font-semibold text-red-500">
          Initialization Error
        </Text>
        <Text className="text-center text-gray-600">{initError}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-gray-500">Initializing...</Text>
      </View>
    );
  }

  return (
    <ParaContext.Provider
      value={{
        isReady,
        isAuthenticated,
        isLoading,
        user,
        wallets,
        logout,
        refreshAuth,
        setAuthenticated,
      }}>
      {children}
    </ParaContext.Provider>
  );
}

export function usePara() {
  const context = useContext(ParaContext);
  if (!context) {
    throw new Error('usePara must be used within a ParaProvider');
  }
  return context;
}
