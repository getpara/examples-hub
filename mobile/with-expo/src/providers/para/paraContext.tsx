import React, { createContext, useEffect, useState, ReactNode, useCallback } from "react";
import { ParaMobile } from "@getpara/react-native-wallet";
import { PARA_API_KEY, PARA_ENVIRONMENT } from "@/constants";
import { AuthCreds } from "@/types";
import { clearCreds, saveCreds } from "@/util/credentialStore";
import { credsToParaAuth } from "@/util/authHelpers";

interface ParaContextState {
  para: ParaMobile | null;
  isInitialized: boolean;
  isInitializing: boolean;
  error: Error | null;
  isAuthenticated: boolean;
}

interface ParaContextActions {
  login(args: AuthCreds): Promise<void>;
  logout(): Promise<void>;
  registerPasskey(args: AuthCreds & { biometricsId: string }): Promise<void>;
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
        setState((prevState) => ({ ...prevState, error: error }));
        throw error;
      }

      if (!PARA_ENVIRONMENT) {
        const error = new Error("Missing required environment variable: EXPO_PUBLIC_PARA_ENVIRONMENT");
        setState((prevState) => ({ ...prevState, error: error as Error | null }));
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

  const login = useCallback(
    async (args: AuthCreds) => {
      if (!state.para) throw new Error("Para instance is not initialized");

      try {
        await state.para.login(credsToParaAuth(args));
        setState((prevState) => ({ ...prevState, isAuthenticated: true }));
        saveCreds(args);
      } catch (error) {
        clearCreds();
        throw error;
      }
    },
    [state.para]
  );

  const logout = useCallback(async () => {
    if (!state.para) throw new Error("Para instance is not initialized");

    try {
      await state.para.logout();
      setState((prevState) => ({ ...prevState, isAuthenticated: false }));
      clearCreds();
    } catch (error) {
      setState((prevState) => ({ ...prevState, error: error as Error | null }));
      throw error;
    }
  }, [state.para]);

  const registerPasskey = useCallback(
    async (args: AuthCreds & { biometricsId: string }) => {
      if (!state.para) throw new Error("Para instance is not initialized");

      try {
        await state.para.registerPasskey({
          ...args,
        });
        setState((prevState) => ({ ...prevState, isAuthenticated: true }));
      } catch (error) {
        setState((prevState) => ({ ...prevState, error: error as Error | null }));
        throw error;
      }
    },
    [state.para]
  );

  const actions: ParaContextActions = {
    login,
    logout,
    registerPasskey,
  };

  return <ParaContext.Provider value={{ state, actions }}>{children}</ParaContext.Provider>;
};
