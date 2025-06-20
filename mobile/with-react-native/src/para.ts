import { ParaMobile, Environment } from "@getpara/react-native-wallet";
import Config from "react-native-config";

// Get API key from environment variable
const API_KEY = Config.PARA_API_KEY || "";

if (!API_KEY) {
  console.warn("Para API key not found. Please set PARA_API_KEY in your .env file");
}

// Create Para client singleton
export const para = new ParaMobile(Environment.BETA, API_KEY, undefined, {
  disableWorkers: true,
});