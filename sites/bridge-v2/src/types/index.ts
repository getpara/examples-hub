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

export interface BridgeResponse {
  method: string;
  requestId: string;
  responseData: any;
  error?: string;
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
