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
export const para = new ParaMobile(Environment.BETA, API_KEY, undefined, {
  disableWorkers: true,
});