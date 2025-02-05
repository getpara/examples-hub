import { CapsuleMobile, Environment } from "@usecapsule/react-native-wallet";

export const capsuleClient = new CapsuleMobile(Environment.BETA, process.env.EXPO_PUBLIC_CAPSULE_API_KEY, undefined, {
  disableWorkers: true,
});
