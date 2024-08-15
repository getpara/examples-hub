import Client from '@usecapsule/user-management-client';

import { Environment } from '../definitions.js';

export function getBaseUrl(env: Environment): string {
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

export function getBaseMPCNetworkUrl(env: Environment, useWebsocket?: boolean): string {
  const prefix = useWebsocket ? 'ws' : 'http';
  switch (env) {
    case Environment.DEV:
      return `${prefix}://localhost:3000`;
    case Environment.SANDBOX:
      return `${prefix}s://mpc-network.sandbox.usecapsule.com`;
    case Environment.BETA:
      return `${prefix}s://mpc-network.beta.usecapsule.com`;
    case Environment.PROD:
      return `${prefix}s://mpc-network.prod.usecapsule.com`;
    default:
      throw new Error(`unsupported env: ${env}`);
  }
}

export function initClient(
  env: Environment,
  version?: string,
  apiKey?: string,
  useFetchAdapter?: boolean,
  retrieveSessionCookie?: () => string,
  persistSessionCookie?: (cookie: string) => void,
): Client {
  return new Client({
    userManagementHost: getBaseUrl(env),
    version,
    apiKey: apiKey,
    opts: { useFetchAdapter },
    retrieveSessionCookie,
    persistSessionCookie,
  });
}
