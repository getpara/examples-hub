import { ParaMobile, Environment } from "@getpara/react-native-wallet";
import Config from "react-native-config";

// API key from .env file - get yours at developer.getpara.com
const API_KEY = Config.PARA_API_KEY || "";

if (!API_KEY) {
  console.warn("Para API key not found. Please set PARA_API_KEY in your .env file");
}

// Initialize Para SDK
// - Environment.BETA for testing (use Environment.PRODUCTION for live apps)
// - disableWorkers: true required for React Native compatibility
// - supportsAuthV2: true opts into the current sign-in flow (see src/signIn.ts)
export const para = new ParaMobile(Environment.BETA, API_KEY, undefined, {
  disableWorkers: true,
  supportsAuthV2: true,
});