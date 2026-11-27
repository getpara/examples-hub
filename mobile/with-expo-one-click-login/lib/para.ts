import { ParaMobile, Environment } from '@getpara/react-native-wallet';
import { openBrowserAsync } from 'expo-web-browser';

const API_KEY = process.env.EXPO_PUBLIC_PARA_API_KEY || '';
const PARA_ENV = (process.env.EXPO_PUBLIC_PARA_ENV || 'beta').toLowerCase();

const ENVIRONMENT =
  PARA_ENV === 'dev'
    ? Environment.DEV
    : PARA_ENV === 'sandbox'
      ? Environment.SANDBOX
      : Environment.BETA;

if (ENVIRONMENT === Environment.DEV) {
  const globals = globalThis as typeof globalThis & {
    __PARA_API_BASE_URL_OVERRIDE__?: string;
    __PARA_PORTAL_URL_OVERRIDE__?: string;
    __PARA_MPC_NETWORK_URL_OVERRIDE__?: string;
  };
  if (process.env.EXPO_PUBLIC_PARA_API_BASE_URL) {
    globals.__PARA_API_BASE_URL_OVERRIDE__ = process.env.EXPO_PUBLIC_PARA_API_BASE_URL;
  }
  if (process.env.EXPO_PUBLIC_PARA_PORTAL_URL) {
    globals.__PARA_PORTAL_URL_OVERRIDE__ = process.env.EXPO_PUBLIC_PARA_PORTAL_URL;
  }
  if (process.env.EXPO_PUBLIC_PARA_MPC_NETWORK_URL) {
    globals.__PARA_MPC_NETWORK_URL_OVERRIDE__ = process.env.EXPO_PUBLIC_PARA_MPC_NETWORK_URL;
  }
}

const RELYING_PARTY_ID =
  ENVIRONMENT === Environment.DEV ? process.env.EXPO_PUBLIC_PARA_RELYING_PARTY_ID || '127.0.0.1' : undefined;

if (!API_KEY) {
  console.warn('EXPO_PUBLIC_PARA_API_KEY is not set. Please add it to your environment variables.');
}

// Create Para singleton instance
// disableWorkers is required for React Native (no Web Worker support)
export const para = new ParaMobile(ENVIRONMENT, API_KEY, RELYING_PARTY_ID, {
  disableWorkers: true,
});

// Register a global handler for transaction review URLs so signing operations
// that require user approval can open the review page in an in-app browser.
// This is needed for integration paths like viem that don't pass per-call callbacks.
para.setTransactionReviewHandler((url) => {
  openBrowserAsync(url);
});
