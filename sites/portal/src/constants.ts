import { Environment } from '@usecapsule/web-sdk';
import { Partner } from './types';

export const ENV = process.env.REACT_APP_ENV
  ? (process.env.REACT_APP_ENV.toUpperCase() as Environment)
  : Environment.SANDBOX;

export const DEFAULT_PARTNER: Partner = {
  id: 'id',
  displayName: 'Capsule',
  policiesEnabled: false,
};

// TODO: move this to partner config
export const DEFAULT_HOMEPAGE_URL = 'https://www.usecapsule.com';

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
  ADD = 'ADD',
  SELECT_WALLET = 'SELECT_WALLET',
  SUCCESS = 'SUCCESS',
  SUCCESS_FROM_KNOWN_DEVICE = 'SUCCESS_FROM_KNOWN_DEVICE',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGIN_FAILED_TROUBLESHOOTING = 'LOGIN_FAILED_TROUBLESHOOTING',
}

export const REDIRECT_TIMEOUT = 1000;

export const KNOWN_DEVICE_LOGIN_POLLING_INTERVAL = 2000;
