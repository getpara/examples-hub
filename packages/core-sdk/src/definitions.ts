/* eslint-disable */
global.Buffer = global.Buffer || require('buffer').Buffer;

import Client from '@usecapsule/user-management-client';
import { AxiosInstance } from 'axios';

export const is2FAEnabled = false;

export enum Environment {
  // Internal Environments
  DEV = 'DEV',
  SANDBOX = 'SANDBOX',
  BETA = 'BETA',
  PROD = 'PROD',
  // Customer-Facing Environments
  // NOTE: these resolve to the corresponding internal environments for convenience
  DEVELOPMENT = 'BETA',
  PRODUCTION = 'PROD',
}

export interface Ctx {
  env: Environment;
  apiKey?: string;
  capsuleClient: Client;
  disableWorkers?: boolean;
  offloadMPCComputationURL?: string;
  mpcComputationClient?: AxiosInstance;
  useLocalFiles?: boolean;
  useDKLS?: boolean;
  disableWebSockets: boolean;
  wasmOverride?: ArrayBuffer;
}

export enum OAuthMethod {
  GOOGLE = 'GOOGLE',
  X = 'X',
  APPLE = 'APPLE',
  DISCORD = 'DISCORD',
}

export function getPortalDomain(env: Environment) {
  switch (env) {
    case Environment.DEV:
      return 'localhost';
    case Environment.SANDBOX:
      return 'app.sandbox.usecapsule.com';
    case Environment.BETA:
      return 'app.beta.usecapsule.com';
    case Environment.PROD:
      return 'app.usecapsule.com';
    default:
      throw new Error(`env: ${env} not supported`);
  }
}

export function getPortalBaseURL({ env }: { env: Environment }, useLocalIp?: boolean) {
  const domain = getPortalDomain(env);
  if (env === Environment.DEV) {
    if (useLocalIp) {
      return `http://127.0.0.1:3003`;
    }
    return `http://${domain}:3003`;
  }
  return `https://${domain}`;
}
