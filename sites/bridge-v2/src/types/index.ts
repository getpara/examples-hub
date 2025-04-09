import Client from '@getpara/user-management-client';
import { Environment } from '@getpara/web-sdk';
import { AxiosInstance } from 'axios';

declare global {
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
