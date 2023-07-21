import Client from '@usecapsule/user-management-client';
import { AxiosInstance } from 'axios';

export enum Environment {
  DEV = 'DEV',
  SANDBOX = 'SANDBOX',
  BETA = 'BETA',
  PROD = 'PROD',
}

export interface Ctx {
  env: Environment;
  apiKey?: string;
  capsuleClient: Client;
  disableWorkers?: boolean;
  offloadMPCComputationURL?: string;
  mpcComputationClient?: AxiosInstance;
  useLocalFiles?: boolean;
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

export function getPortalBaseURL({ env }: { env: Environment }) {
  const domain = getPortalDomain(env);
  if (env === Environment.DEV) {
    return `http://${domain}:3003`;
  }
  return `https://${domain}`;
}
