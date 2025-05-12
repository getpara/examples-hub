import React, { createContext, useEffect, useState, ReactNode, useCallback } from "react";
import { ParaMobile } from "@getpara/react-native-wallet";
import { PARA_API_KEY, PARA_ENVIRONMENT } from "@/constants";

interface ParaContextState {
  para: ParaMobile | null;
  isInitialized: boolean;
  isInitializing: boolean;
  error: Error | null;
  isAuthenticated: boolean;
}

interface ParaContextActions {
  checkAuthState: () => Promise<boolean>;
}

export const ParaContext = createContext<{ state: ParaContextState; actions: ParaContextActions } | undefined>(
  undefined
);

interface ParaProviderProps {
  children: ReactNode;
}

export const ParaProvider: React.FC<ParaProviderProps> = ({ children }) => {
  const [state, setState] = useState<ParaContextState>({
    para: null,
    isInitialized: false,
    isInitializing: false,
    error: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    const initializePara = async () => {
      if (!PARA_API_KEY) {
        const error = new Error("Missing required environment variable: EXPO_PUBLIC_PARA_API_KEY");
        setState((prevState) => ({ ...prevState, error }));
        throw error;
      }

      if (!PARA_ENVIRONMENT) {
        const error = new Error("Missing required environment variable: EXPO_PUBLIC_PARA_ENVIRONMENT");
        setState((prevState) => ({ ...prevState, error }));
        throw error;
      }

      try {
        setState((prevState) => ({ ...prevState, isInitializing: true }));

        const paraInstance = new ParaMobile(PARA_ENVIRONMENT, PARA_API_KEY, undefined, {
          disableWorkers: true,
        });

        await paraInstance.init();

        const isAuthenticated = await paraInstance.isFullyLoggedIn();

        setState((prevState) => ({
          ...prevState,
          para: paraInstance,
          isInitialized: true,
          isInitializing: false,
          isAuthenticated,
          error: null,
        }));
      } catch (error) {
        setState((prevState) => ({
          ...prevState,
          isInitializing: false,
          error: error instanceof Error ? error : new Error("Unknown error during Para initialization"),
        }));
        throw error;
      }
    };

    initializePara();
  }, []);

  const checkAuthState = useCallback(async () => {
    if (!state.para) return false;

    const isAuthenticated = await state.para.isFullyLoggedIn();

    setState((prevState) => ({
      ...prevState,
      isAuthenticated,
    }));

    return isAuthenticated;
  }, [state.para]);

  const actions: ParaContextActions = {
    checkAuthState,
  };

  return <ParaContext.Provider value={{ state, actions }}>{children}</ParaContext.Provider>;
};
