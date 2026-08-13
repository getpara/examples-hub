import type ParaCore from "@getpara/core-sdk";
import { Environment, Para as ParaServer } from "@getpara/server-sdk";

export function createParaServer(environment: Environment, apiKey: string): ParaCore {
  // The published server SDK disables claimPregenWallets with a throwing override whose wider
  // return type makes the class incompatible with the signer integrations' ParaCore input.
  return new ParaServer(environment, apiKey) as ParaCore;
}
