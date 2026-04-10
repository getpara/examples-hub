import { ParaMobile, Environment } from '@getpara/react-native-wallet';
import { openBrowserAsync } from 'expo-web-browser';

const API_KEY = process.env.EXPO_PUBLIC_PARA_API_KEY || '';

if (!API_KEY) {
  console.warn('EXPO_PUBLIC_PARA_API_KEY is not set. Please add it to your environment variables.');
}

export const para = new ParaMobile(Environment.BETA, API_KEY, undefined, {
  disableWorkers: true,
});

para.setTransactionReviewHandler((url) => {
  openBrowserAsync(url);
});
