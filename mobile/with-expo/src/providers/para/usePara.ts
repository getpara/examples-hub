import { useContext } from "react";
import { ParaContext } from "./paraContext";

export const usePara = () => {
  const context = useContext(ParaContext);

  if (context === undefined) {
    throw new Error("usePara must be used within a ParaProvider");
  }

  const { state, actions } = context;

  return {
    para: state.para,
    isInitialized: state.isInitialized,
    isInitializing: state.isInitializing,
    isAuthenticated: state.isAuthenticated,
    error: state.error,
    isReady: state.isInitialized && !state.error,
    hasError:
      !!state.error && state.error.message !== "Missing required environment variable: EXPO_PUBLIC_PARA_API_KEY",
    login: actions.login,
    logout: actions.logout,
    registerPasskey: actions.registerPasskey,
  };
};
