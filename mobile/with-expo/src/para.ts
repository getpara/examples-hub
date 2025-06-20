import { ParaMobile, Environment } from "@getpara/react-native-wallet";

// Get API key from environment variable
const API_KEY = process.env.EXPO_PUBLIC_PARA_API_KEY || "";

if (!API_KEY) {
  console.warn("Para API key not found. Please set EXPO_PUBLIC_PARA_API_KEY in your .env.local file");
}

// Create Para client singleton
export const para = new ParaMobile(Environment.BETA, API_KEY, undefined, {
  disableWorkers: true,
});
