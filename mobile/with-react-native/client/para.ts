import { ParaMobile, Environment } from "@getpara/react-native-wallet";

export const para = new ParaMobile(Environment.BETA, process.env.PARA_API_KEY, undefined, {
  disableWorkers: true,
});
