import { vi } from 'vitest';
import { ParaSignerModule } from './mocks/mockParaSignerModule';

vi.mock('react-native', () => ({
  NativeModules: {
    ParaSignerModule,
  },
}));

import { describe, it, expect, beforeEach } from 'vitest';
import * as config from '../src/config';
import { Environment } from '@getpara/web-sdk';
import { NativeModules } from 'react-native';

describe('config.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    config.setEnv(Environment.BETA);
  });

  it('should initialize default config for BETA environment', () => {
    expect(config.userManagementServer).toBe('https://api.beta.getpara.com/');
    expect(config.portalBase).toBe('https://app.beta.usecapsule.com');
    expect(config.mpcNetworkWSServer).toBe('wss://mpc-network.beta.getpara.com');

    expect(NativeModules.ParaSignerModule.setServerUrl).toHaveBeenCalledWith('https://api.beta.getpara.com/');
    expect(NativeModules.ParaSignerModule.setWsServerUrl).toHaveBeenCalledWith('wss://mpc-network.beta.getpara.com');
  });

  const envTests = [
    {
      env: Environment.DEV,
      expected: {
        userManagementServer: 'http://localhost:8080/',
        portalBase: 'http://localhost:3003',
        mpcNetworkWSServer: 'ws://localhost:3000',
      },
    },
    {
      env: Environment.SANDBOX,
      expected: {
        userManagementServer: 'https://api.sandbox.getpara.com/',
        portalBase: 'https://app.sandbox.usecapsule.com',
        mpcNetworkWSServer: 'wss://mpc-network.sandbox.getpara.com',
      },
    },
    {
      env: Environment.BETA,
      expected: {
        userManagementServer: 'https://api.beta.getpara.com/',
        portalBase: 'https://app.beta.usecapsule.com',
        mpcNetworkWSServer: 'wss://mpc-network.beta.getpara.com',
      },
    },
    {
      env: Environment.PROD,
      expected: {
        userManagementServer: 'https://api.getpara.com/',
        portalBase: 'https://app.usecapsule.com',
        mpcNetworkWSServer: 'wss://mpc-network.getpara.com',
      },
    },
  ];

  envTests.forEach(({ env, expected }) => {
    it(`should update config for ${env} environment`, () => {
      config.setEnv(env);
      expect(config.userManagementServer).toBe(expected.userManagementServer);
      expect(config.portalBase).toBe(expected.portalBase);
      expect(config.mpcNetworkWSServer).toBe(expected.mpcNetworkWSServer);

      expect(NativeModules.ParaSignerModule.setServerUrl).toHaveBeenCalledWith(expected.userManagementServer);
      expect(NativeModules.ParaSignerModule.setWsServerUrl).toHaveBeenCalledWith(expected.mpcNetworkWSServer);
    });
  });

  it('should throw error for unsupported environment', () => {
    expect(() => config.setEnv('INVALID' as any)).toThrow('unsupported env: INVALID');
  });

  it('getPortalBaseURL should throw error for unsupported env', () => {
    expect(() => (config as any).getPortalBaseURL('BAD')).toThrow('env: BAD not supported');
  });

  it('getBaseMPCNetworkWSUrl should throw error for unsupported env', () => {
    expect(() => config.getBaseMPCNetworkWSUrl('BAD' as any)).toThrow('unsupported env: BAD');
  });

  it('DEBUG_MODE_ENABLED should be false', () => {
    expect(config.DEBUG_MODE_ENABLED).toBe(false);
  });
});
