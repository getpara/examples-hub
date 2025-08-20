import Client, { Auth } from '@getpara/user-management-client';
import { Environment } from '@getpara/web-sdk';
import { AxiosInstance } from 'axios';

type MessageType = 'Para#init' | 'Para#invokeMethod';

export type MessageArguments<T extends MessageType | string = string> = T extends 'Para#init'
  ? {
      environment: Environment;
      apiKey: string;
      platform?: keyof typeof Platform;
      version?: string;
      isPasskeySupported?: boolean;
    }
  : T extends 'Para#invokeMethod'
    ? Record<string, any>
    : never;

type Message<T extends MessageType | string = string> = {
  data: {
    requestId: string;
    messageType: T;
    methodName: T extends 'Para#invokeMethod' ? string : never;
    arguments: MessageArguments<T>;
  };
};

declare global {
  interface WindowEventMap {
    message: Message;
  }

  interface NetworkInformation extends EventTarget {
    readonly downlink: number;
    readonly downlinkMax?: number;
    readonly effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
    readonly rtt: number;
    readonly saveData: boolean;
    readonly type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
    addEventListener(
      type: 'change',
      listener: (this: NetworkInformation, ev: Event) => any,
      options?: boolean | AddEventListenerOptions,
    ): void;
  }

  interface Navigator {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  }
}

export enum Platform {
  flutter,
  iOS,
}

// Minimal error handling - just pass through SDK errors
export const BRIDGE_ERROR_CODES = {
  METHOD_NOT_IMPLEMENTED: 'METHOD_NOT_IMPLEMENTED',
} as const;

export interface BridgeError {
  message: string;
  code?: string;
  details?: any; // Original error from SDK
}

export interface BridgeResponse {
  method: string;
  requestId: string;
  responseData: any;
  error?: string | BridgeError;
}

export interface Ctx {
  env: Environment;
  apiKey?: string;
  client: Client;
  disableWorkers?: boolean;
  offloadMPCComputationURL?: string;
  mpcComputationClient?: AxiosInstance;
  useLocalFiles?: boolean;
  useDKLS?: boolean;
  disableWebSockets: boolean;
  wasmOverride?: ArrayBuffer;
}

// Init Args
export interface ParaInitArgs {
  environment: string;
  apiKey: string;
  platform?: keyof typeof Platform;
  version?: string;
}

// Signer Interfaces
export interface EthersSignerInitArgs {
  walletId: string;
  providerUrl: string;
}

export interface SolanaSignerInitArgs {
  walletId: string;
  rpcUrl: string;
}

export interface EthersSignMessageArgs {
  message: string;
}

export interface EthersSignTransactionArgs {
  b64EncodedTx: string;
}

export interface EthersSendTransactionArgs {
  b64EncodedTx: string;
}

export interface EthersSignTypedDataArgs {
  domain: any;
  types: any;
  value: any;
}

export interface SolanaSignTransactionArgs {
  b64EncodedTx: string;
}

export interface SolanaSignVersionedTransactionArgs {
  b64EncodedTx: string;
}

export interface SolanaSendTransactionArgs {
  b64EncodedTx: string;
}

export interface CosmJsSignersInitArgs {
  walletId: string;
  prefix?: string;
  messageSigningTimeoutMs?: number;
}

export interface CosmJsSignDirectArgs {
  signerAddress: string;
  signDocBase64: string;
}

export interface CosmJsSignAminoArgs {
  signerAddress: string;
  signDocBase64: string;
}

// Auth Interfaces
export interface GeneratePasskeyArgs {
  attestationObject: any;
  clientDataJson: any;
  credentialsId: string;
  userHandle: string;
  biometricsId: string;
}

export interface VerifyWebChallengeArgs {
  publicKey: string;
  authenticatorData: any;
  clientDataJSON: any;
  signature: any;
}

export interface LoginWithPasskeyArgs {
  userId: string;
  credentialsId: string;
  userHandle: string;
}

// Arguments coming *from* the native side
export type GetWebChallengeArgs = Auth<'email' | 'phone'>;

export interface SetEmailArgs {
  email: string;
}

// Simple pass-through - just return the original error from SDK
export function normalizeError(error: any): BridgeError {
  // Try multiple ways to extract the error message from Para SDK errors
  let message = 'Unknown error';

  if (error?.message) {
    message = error.message;
  } else if (error?.error?.message) {
    message = error.error.message;
  } else if (error?.description) {
    message = error.description;
  } else if (error?.data?.message) {
    message = error.data.message;
  } else if (typeof error === 'string') {
    message = error;
  } else if (error?.toString && typeof error.toString === 'function') {
    const stringified = error.toString();
    if (stringified !== '[object Object]') {
      message = stringified;
    }
  }

  return {
    message,
    code: error?.code || error?.error?.code,
    details: error,
  };
}

// Simple error reporting to backend
export async function reportError(methodName: string, error: any, platform: Platform, version?: string): Promise<void> {
  const env = (window['para'] as any)?.env || 'unknown';

  try {
    const envUrls = {
      production: 'https://api.usecapsule.com',
      beta: 'https://api.beta.usecapsule.com',
      sandbox: 'https://api.sandbox.usecapsule.com',
    };
    const baseUrl = (window['para'] as any)?.ctx?.client?.baseUrl || envUrls[env as keyof typeof envUrls] || envUrls.sandbox;
    const userId = (window['para'] as any)?.userId;

    const payload = {
      methodName,
      error: {
        name: error?.name || 'Error',
        message: error?.message || error?.toString() || 'Unknown error',
      },
      sdkType: platform === Platform.iOS ? 'SWIFT' : 'FLUTTER',
      sdkVersion: version || 'unknown',
      environment: env,
      userId: userId || null,
    };

    await fetch(`${baseUrl}/errors/sdk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (reportingError) {
    // Log in non-production for debugging, but don't throw to avoid error loops
    if (env !== 'production') {
      console.warn('[Bridge] Error reporting failed:', reportingError);
    }
  }
}

// Minimal wrapper - just log and re-throw original error
export function withErrorHandling<T extends any[], R>(
  operation: string,
  methodName: string,
  handler: (...args: T) => Promise<R>,
  _walletType?: string,
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      const result = await handler(...args);
      // Using console.warn which is allowed by eslint config
      console.warn(`✅ ${methodName} completed`);
      return result;
    } catch (error) {
      console.error(`❌ ${methodName} failed:`, error);
      throw error; // Just re-throw the original error
    }
  };
}
