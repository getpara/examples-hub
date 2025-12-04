import { ParaMobile, Environment } from '@getpara/react-native-wallet';

const API_KEY = process.env.EXPO_PUBLIC_PARA_API_KEY || '';

if (!API_KEY) {
  console.warn('EXPO_PUBLIC_PARA_API_KEY is not set. Please add it to your environment variables.');
}

// Create Para singleton instance
// disableWorkers is required for React Native (no Web Worker support)
export const para = new ParaMobile(Environment.BETA, API_KEY, undefined, {
  disableWorkers: true,
});
