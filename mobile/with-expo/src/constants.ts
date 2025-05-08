import { Environment } from "@getpara/react-native-wallet";

export const APP_SCHEME = "para-expo";
export const PARA_API_KEY = process.env.EXPO_PUBLIC_PARA_API_KEY;
export const PARA_ENVIRONMENT = (process.env.EXPO_PUBLIC_PARA_ENVIRONMENT as Environment) || Environment.BETA;

