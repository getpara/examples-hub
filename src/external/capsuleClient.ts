import Client from '@capsule/client/client';

import { Environment } from '../definitions';

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

export function initClient(env: Environment, apiKey?: string): Client {
  return new Client({
    userManagementHost: getBaseUrl(env),
    apiKey: apiKey,
  });
}
