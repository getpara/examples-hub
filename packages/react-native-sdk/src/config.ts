// Copyright (c) Capsule Labs Inc. All rights reserved.

import { NativeModules } from 'react-native';
import { Environment } from '@usecapsule/web-sdk';

function getPortalBaseURL(env: Environment) {
  switch (env) {
    case Environment.DEV:
      return 'http://localhost:3003';
    case Environment.SANDBOX:
      return 'https://app.sandbox.usecapsule.com';
    case Environment.BETA:
      return 'https://app.beta.usecapsule.com';
    case Environment.PROD:
      return 'https://app.usecapsule.com';
    default:
      throw new Error(`env: ${env} not supported`);
  }
}

function getBaseUrl(env: Environment): string {
  switch (env) {
    case Environment.DEV:
      return 'http://localhost:8080/';
    case Environment.SANDBOX:
      return 'https://api.sandbox.usecapsule.com/';
    case Environment.BETA:
      return 'https://api.beta.usecapsule.com/';
    case Environment.PROD:
      return 'https://api.usecapsule.com/';
    default:
      throw new Error(`unsupported env: ${env}`);
  }
}

export function getBaseMPCNetworkWSUrl(env: Environment): string {
  switch (env) {
    case Environment.DEV:
      return `ws://localhost:3000`;
    case Environment.SANDBOX:
      return `wss://mpc-network.sandbox.usecapsule.com`;
    case Environment.BETA:
      return `wss://mpc-network.beta.usecapsule.com`;
    case Environment.PROD:
      return `wss://mpc-network.usecapsule.com`;
    default:
      throw new Error(`unsupported env: ${env}`);
  }
}

export let userManagementServer = getBaseUrl(Environment.BETA);
export let portalBase = getPortalBaseURL(Environment.BETA);
export let mpcNetworkWSServer = getBaseMPCNetworkWSUrl(Environment.BETA);

export function setEnv(env: Environment) {
  userManagementServer = getBaseUrl(env);
  portalBase = getPortalBaseURL(env);
  mpcNetworkWSServer = getBaseMPCNetworkWSUrl(env);
  init();
}

const { CapsuleSignerModule } = NativeModules;
export const DEBUG_MODE_ENABLED = false;

function init() {
  CapsuleSignerModule.setServerUrl(userManagementServer);
  CapsuleSignerModule.setWsServerUrl(mpcNetworkWSServer);
}

init();
