import { ParaMobile, Environment } from "@getpara/react-native-wallet";

export const para = new ParaMobile(Environment.BETA, process.env.EXPO_PUBLIC_PARA_API_KEY, undefined, {
  disableWorkers: true,
});
