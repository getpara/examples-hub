import { Environment } from '@usecapsule/web-sdk';
import { Partner } from './types';

export const ENV = process.env.REACT_APP_ENV
  ? (process.env.REACT_APP_ENV.toUpperCase() as Environment)
  : Environment.SANDBOX;

export const DEFAULT_PARTNER: Partner = {
  displayName: 'Capsule',
  policiesEnabled: false,
};

// TODO: move this to partner config
export const DEFAULT_HOMEPAGE_URL = 'https://www.usecapsule.com';

// STEPS
export enum AuthCreationStep {
  SELECT_DEVICE = 'SELECT_DEVICE',
  CREATING = 'CREATING',
  SUCCESS = 'SUCCESS',
}

export enum AuthLoginStep {
  SELECT_FLOW = 'SELECT_FLOW',
  WAITING = 'WAITING',
  ADD = 'ADD',
  SUCCESS = 'SUCCESS',
}

export const REDIRECT_TIMEOUT = 1000;
