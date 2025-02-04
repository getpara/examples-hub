import Client from '@getpara/user-management-client';

import { Environment } from '../definitions.js';

export function getBaseOAuthUrl(env: Environment): string {
  switch (env) {
    case Environment.DEV:
      return 'http://localhost:8080/';
    case Environment.SANDBOX:
      return 'https://api.sandbox.usecapsule.com/';
    case Environment.BETA:
      return 'https://api.beta.usecapsule.com/';
    case Environment.PROD:
      return 'https://api.usecapsule.com/';
    default:
      throw new Error(`unsupported env: ${env}`);
  }
}

export function getBaseUrl(env: Environment): string {
  switch (env) {
    case Environment.DEV:
      return 'http://localhost:8080/';
    case Environment.SANDBOX:
      return 'https://api.sandbox.getpara.com/';
    case Environment.BETA:
      return 'https://api.beta.getpara.com/';
    case Environment.PROD:
      return 'https://api.getpara.com/';
    default:
      throw new Error(`unsupported env: ${env}`);
  }
}

export function getBaseMPCNetworkUrl(env: Environment, useWebsocket?: boolean): string {
  const prefix = useWebsocket ? 'ws' : 'http';
  switch (env) {
    case Environment.DEV:
      return `${prefix}://localhost:3000`;
    case Environment.SANDBOX:
      return `${prefix}s://mpc-network.sandbox.getpara.com`;
    case Environment.BETA:
      return `${prefix}s://mpc-network.beta.getpara.com`;
    case Environment.PROD:
      return `${prefix}s://mpc-network.prod.getpara.com`;
    default:
      throw new Error(`unsupported env: ${env}`);
  }
}

export function initClient({
  env,
  version,
  apiKey,
  partnerId,
  useFetchAdapter = false,
  retrieveSessionCookie,
  persistSessionCookie,
}: {
  env: Environment;
  version?: string;
  apiKey?: string;
  partnerId?: string;
  useFetchAdapter?: boolean;
  retrieveSessionCookie?: () => string;
  persistSessionCookie?: (cookie: string) => void;
}): Client {
  return new Client({
    userManagementHost: getBaseUrl(env),
    version: [Environment.DEV, Environment.SANDBOX].includes(env) ? 'dev' : version,
    apiKey: apiKey,
    partnerId,
    opts: { useFetchAdapter },
    retrieveSessionCookie,
    persistSessionCookie,
  });
}
