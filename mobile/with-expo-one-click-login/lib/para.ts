import { ParaMobile, Environment } from '@getpara/react-native-wallet';
import { openBrowserAsync } from 'expo-web-browser';

const API_KEY = process.env.EXPO_PUBLIC_PARA_API_KEY || '';

if (!API_KEY) {
  console.warn('EXPO_PUBLIC_PARA_API_KEY is not set. Please add it to your environment variables.');
}

// Create Para singleton instance
// disableWorkers is required for React Native (no Web Worker support)
export const para = new ParaMobile(Environment.BETA, API_KEY, undefined, {
  disableWorkers: true,
});

// Register a global handler for transaction review URLs so signing operations
// that require user approval can open the review page in an in-app browser.
// This is needed for integration paths like viem that don't pass per-call callbacks.
para.setTransactionReviewHandler((url) => {
  openBrowserAsync(url);
});
