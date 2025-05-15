import React, {createContext, useState, useContext, useEffect, ReactNode} from 'react';
import {para} from '../client/para';
import {Alert} from 'react-native';

// Define the context type
type ParaContextType = {
  isInitialized: boolean;
  isInitializing: boolean;
  initError: string | null;
  sdkInfo: Record<string, any>;
};

// Create the context with default values
const ParaContext = createContext<ParaContextType>({
  isInitialized: false,
  isInitializing: false,
  initError: null,
  sdkInfo: {},
});

// Export a hook to use the Para context
export const useParaSDK = () => useContext(ParaContext);

type ParaProviderProps = {
  children: ReactNode;
};

export const ParaProvider: React.FC<ParaProviderProps> = ({children}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [sdkInfo, setSdkInfo] = useState<Record<string, any>>({});

  useEffect(() => {
    // Collect SDK info
    const collectSdkInfo = () => {
      const info: Record<string, any> = {};

      try {
        info.constructorName = para.constructor?.name || 'Unknown';

        // Check what methods are available on para
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(para)).filter(
          method => typeof (para as any)[method] === 'function' && method !== 'constructor',
        );

        info.availableMethods = methods;

        // Check specific methods
        info.hasGetOAuthUrl = typeof para.getOAuthUrl === 'function';
        info.hasVerifyOAuth = typeof para.verifyOAuth === 'function';
        info.hasSignUpOrLogIn = typeof para.signUpOrLogIn === 'function';

        setSdkInfo(info);
      } catch (error) {
        console.error('Error collecting SDK info:', error);
      }
    };

    // Initialize the Para SDK
    const initializePara = async () => {
      console.log('Initializing Para SDK at the provider level...');
      setIsInitializing(true);

      try {
        await para.init();
        console.log('Para SDK initialized successfully!');
        setIsInitialized(true);
        collectSdkInfo();
      } catch (error) {
        console.error('Failed to initialize Para SDK:', error);
        const errorMsg = error instanceof Error ? error.message : 'Failed to initialize Para SDK';
        setInitError(errorMsg);
        Alert.alert('SDK Initialization Error', errorMsg);
      } finally {
        setIsInitializing(false);
      }
    };

    initializePara();

    // No cleanup needed for this effect
  }, []);

  // Value to be provided to consuming components
  const contextValue: ParaContextType = {
    isInitialized,
    isInitializing,
    initError,
    sdkInfo,
  };

  return <ParaContext.Provider value={contextValue}>{children}</ParaContext.Provider>;
};
