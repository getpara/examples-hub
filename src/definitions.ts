import Client from '@capsule/client/client';

export enum Environment {
  DEV = 'DEV',
  SANDBOX = 'SANDBOX',
  BETA = 'BETA',
  PROD = 'PROD',
}

export interface Ctx {
  env: Environment;
  capsuleClient: Client;
}

export function getPortalBaseURL(ctx: Ctx) {
  const { env } = ctx;
  switch (env) {
    case Environment.DEV:
      return 'http://localhost:3001';
    case Environment.SANDBOX:
      return 'https://portal.sandbox.usecapsule.com';
    case Environment.BETA:
      return 'https://portal.beta.usecapsule.com';
    case Environment.PROD:
      return 'https://portal.usecapsule.com';
    default:
      throw new Error(`env: ${env} not supported`);
  }
}
