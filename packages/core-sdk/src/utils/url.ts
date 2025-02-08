import { Environment } from '../types/index.js';

export function getPortalDomain(env: Environment, isE2E?: boolean) {
  if (isE2E) {
    return `localhost`;
  }
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

export function getPortalBaseURL(
  { env, isE2E }: { env: Environment; isE2E?: boolean },
  useLocalIp?: boolean,
  isForWasm?: boolean,
) {
  if (isE2E) {
    if (isForWasm) {
      return `https://app.sandbox.usecapsule.com`;
    }
    return `http://localhost:3003`;
  }
  const domain = getPortalDomain(env);
  if (env === Environment.DEV) {
    if (useLocalIp) {
      return `http://127.0.0.1:3003`;
    }
    return `http://${domain}:3003`;
  }
  return `https://${domain}`;
}

export function getParaConnectDomain(env: Environment) {
  switch (env) {
    case Environment.DEV:
      return 'localhost';
    case Environment.SANDBOX:
      return 'connect.sandbox.getpara.com';
    case Environment.BETA:
      return 'connect.beta.getpara.com';
    case Environment.PROD:
      return 'connect.getpara.com';
    default:
      throw new Error(`env: ${env} not supported`);
  }
}

export function getParaConnectBaseUrl({ env }: { env: Environment }, useLocalIp?: boolean) {
  const domain = getParaConnectDomain(env);
  if (env === Environment.DEV) {
    if (useLocalIp) {
      return `http://127.0.0.1:3008`;
    }
    return `http://${domain}:3008`;
  }
  return `https://${domain}`;
}

export function constructUrl({
  base,
  path,
  params = {},
}: {
  base: string;
  path: string;
  params?: Record<string, string | undefined | null>;
}): string {
  const url = new URL(path, base);

  Object.entries(params).forEach(([key, value]) => {
    if (!!value && value !== 'undefined' && value !== 'null') url.searchParams.set(key, value.toString());
  });

  return url.toString();
}
