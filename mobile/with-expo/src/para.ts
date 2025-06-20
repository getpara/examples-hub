import { ParaMobile, Environment } from "@getpara/react-native-wallet";

// Para API key must be prefixed with EXPO_PUBLIC_ to be accessible in Expo
const API_KEY = process.env.EXPO_PUBLIC_PARA_API_KEY || "";

if (!API_KEY) {
  console.warn("Para API key not found. Please set EXPO_PUBLIC_PARA_API_KEY in your .env.local file");
}

// Initialize Para SDK singleton
// - Environment.BETA for testing, Environment.PRODUCTION for live
// - disableWorkers: required for React Native compatibility
export const para = new ParaMobile(Environment.BETA, API_KEY, undefined, {
  disableWorkers: true,
});
