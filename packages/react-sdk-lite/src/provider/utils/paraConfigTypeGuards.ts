import ParaWeb, { ConstructorOpts, Environment } from '@getpara/web-sdk';

export function isConfigType(obj: any): obj is { apiKey: string; env: Environment | undefined; opts?: ConstructorOpts } {
  return !!obj && typeof obj === 'object' && 'apiKey' in obj;
}

export function isParaWeb(obj: any): obj is ParaWeb {
  return obj instanceof ParaWeb;
}
