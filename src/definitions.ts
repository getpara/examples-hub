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

export function getPortalBaseURL(ctx: Ctx) {
  const { env } = ctx;
  // if (location.hostname === "localhost" ) {
  //   return "http://localhost:3003"
  // }
  switch (env) {
    case Environment.DEV:
      return 'http://localhost:3003';
    case Environment.SANDBOX:
      return 'https://app.sandbox.usecapsule.com';
    case Environment.BETA:
      return 'https://app.beta.usecapsule.com';
    case Environment.PROD:
      return 'https://app.usecapsule.com';
    default:
      throw new Error(`env: ${env} not supported`);
  }
}
