import { PARA_API_KEY } from "@env";
import { ParaMobile, Environment } from "@getpara/react-native-wallet";

export const para = new ParaMobile(Environment.BETA, PARA_API_KEY, undefined, {
  disableWorkers: true,
});
