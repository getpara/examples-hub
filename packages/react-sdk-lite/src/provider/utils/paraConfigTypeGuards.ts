import ParaWeb, { ConstructorOpts, Environment } from '@getpara/web-sdk';

export function isConfigType(obj: any): obj is { env: Environment; apiKey: string; opts?: ConstructorOpts } {
  return !!obj && typeof obj === 'object' && 'env' in obj && 'apiKey' in obj;
}

export function isParaWeb(obj: any): obj is ParaWeb {
  return obj instanceof ParaWeb;
}
