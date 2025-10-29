import { Environment, PartnerEntity } from '@getpara/web-sdk';

export const ENV = import.meta.env.VITE_ENVIRONMENT
  ? (import.meta.env.VITE_ENVIRONMENT.toUpperCase() as Environment)
  : Environment.SANDBOX;

export const DEFAULT_API_KEY = import.meta.env.VITE_CAPSULE_API_KEY ?? 'PLACEHOLDER';

export const PARA_PORTAL_ID = import.meta.env.VITE_PARA_PORTAL_ID
  ? (import.meta.env.VITE_PARA_PORTAL_ID as string)
  : '4bdd84d3-7606-406f-8321-19721cac17a1';

export const DEFAULT_PARTNER: PartnerEntity = {
  id: 'id',
  displayName: 'Para',
  policiesEnabled: false,
} as PartnerEntity;

// TODO: move this to partner config
export const DEFAULT_HOMEPAGE_URL = 'https://www.getpara.com';

// STEPS
export enum AuthCreationStep {
  MANUAL_CREATION = 'MANUAL_CREATION',
  CREATING = 'CREATING',
  SUCCESS = 'SUCCESS',
}

export enum AuthLoginStep {
  MANUAL_LOGIN = 'MANUAL_LOGIN',
  WAITING = 'WAITING',
  ENTER_PASSWORD = 'ENTER_PASSWORD',
  ENTER_PIN = 'ENTER_PIN',
  ADD = 'ADD',
  SELECT_WALLET = 'SELECT_WALLET',
  SUCCESS = 'SUCCESS',
  SUCCESS_FROM_KNOWN_DEVICE = 'SUCCESS_FROM_KNOWN_DEVICE',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGIN_FAILED_TROUBLESHOOTING = 'LOGIN_FAILED_TROUBLESHOOTING',
  AUTH_VERIFICATION = 'AUTH_VERIFICATION',
  OTP = 'OTP',
  OAUTH_CALLBACK = 'OAUTH_CALLBACK',
  FARCASTER = 'FARCASTER',
  TELEGRAM = 'TELEGRAM',
  BASIC_LOGIN_UPGRADE = 'BASIC_LOGIN_UPGRADE',
  EXTERNAL_WALLET = 'EXTERNAL_WALLET',
}

export const REDIRECT_TIMEOUT = 1000;

export const KNOWN_DEVICE_LOGIN_POLLING_INTERVAL = 2000;

export function PARA_CONNECT_DOMAINS() {
  switch (ENV) {
    case Environment.DEV:
      return ['http://localhost:3008'];
    case Environment.SANDBOX:
      return ['connect.sandbox.getpara.com'];
    case Environment.BETA:
      return ['connect.beta.getpara.com'];
    case Environment.PROD:
      return ['connect.getpara.com'];
    default:
      throw new Error(`env: ${ENV} not supported`);
  }
}

export const RETRIEVED_WALLETS_KEY = '@PARA-PORTAL/retrievedWallets';
