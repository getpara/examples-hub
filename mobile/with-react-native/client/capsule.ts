import { CapsuleMobile, Environment } from "@usecapsule/react-native-wallet";
import Config from "react-native-config";

export const capsuleClient = new CapsuleMobile(Environment.BETA, Config.CAPSULE_API_KEY, undefined, {
  disableWorkers: true,
});
