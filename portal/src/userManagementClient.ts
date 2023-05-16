import Client from '@usecapsule/user-management-client';
import { Environment } from './library';

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

export const userManagementClient = new Client({
  userManagementHost: getBaseUrl(
    process.env.REACT_APP_ENV.toUpperCase() as Environment,
  ),
});
