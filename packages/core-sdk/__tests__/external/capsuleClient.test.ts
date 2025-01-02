import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Environment } from '../../src/definitions';
import { getBaseMPCNetworkUrl, getBaseUrl, initClient } from '../../src/external/capsuleClient';
import Client from '@usecapsule/user-management-client';

describe('capsuleClient', () => {
  describe('getBaseUrl', () => {
    it('dev', () => {
      const resp = getBaseUrl(Environment.DEV);
      expect(resp).toBe('http://localhost:8080/');
    });
    it('sandbox', () => {
      const resp = getBaseUrl(Environment.SANDBOX);
      expect(resp).toBe('https://api.sandbox.usecapsule.com/');
    });
    it('beta', () => {
      const resp = getBaseUrl(Environment.BETA);
      expect(resp).toBe('https://api.beta.usecapsule.com/');
      const resp1 = getBaseUrl(Environment.DEVELOPMENT);
      expect(resp1).toBe('https://api.beta.usecapsule.com/');
    });
    it('dev', () => {
      const resp = getBaseUrl(Environment.PROD);
      expect(resp).toBe('https://api.usecapsule.com/');
      const resp1 = getBaseUrl(Environment.PRODUCTION);
      expect(resp1).toBe('https://api.usecapsule.com/');
    });
    it('unsupported env', () => {
      expect(() => getBaseUrl('test' as Environment)).toThrowError('unsupported env: test');
    });
  });

  describe('getBaseMPCNetworkUrl', () => {
    describe('http', () => {
      it('dev', () => {
        const resp = getBaseMPCNetworkUrl(Environment.DEV);
        expect(resp).toBe('http://localhost:3000');
      });
      it('sandbox', () => {
        const resp = getBaseMPCNetworkUrl(Environment.SANDBOX);
        expect(resp).toBe('https://mpc-network.sandbox.usecapsule.com');
      });
      it('beta', () => {
        const resp = getBaseMPCNetworkUrl(Environment.BETA);
        expect(resp).toBe('https://mpc-network.beta.usecapsule.com');
        const resp1 = getBaseMPCNetworkUrl(Environment.DEVELOPMENT);
        expect(resp1).toBe('https://mpc-network.beta.usecapsule.com');
      });
      it('dev', () => {
        const resp = getBaseMPCNetworkUrl(Environment.PROD);
        expect(resp).toBe('https://mpc-network.prod.usecapsule.com');
        const resp1 = getBaseMPCNetworkUrl(Environment.PRODUCTION);
        expect(resp1).toBe('https://mpc-network.prod.usecapsule.com');
      });
      it('unsupported env', () => {
        expect(() => getBaseMPCNetworkUrl('test' as Environment)).toThrowError('unsupported env: test');
      });
    });
    describe('ws', () => {
      it('dev', () => {
        const resp = getBaseMPCNetworkUrl(Environment.DEV, true);
        expect(resp).toBe('ws://localhost:3000');
      });
      it('sandbox', () => {
        const resp = getBaseMPCNetworkUrl(Environment.SANDBOX, true);
        expect(resp).toBe('wss://mpc-network.sandbox.usecapsule.com');
      });
      it('beta', () => {
        const resp = getBaseMPCNetworkUrl(Environment.BETA, true);
        expect(resp).toBe('wss://mpc-network.beta.usecapsule.com');
        const resp1 = getBaseMPCNetworkUrl(Environment.DEVELOPMENT, true);
        expect(resp1).toBe('wss://mpc-network.beta.usecapsule.com');
      });
      it('dev', () => {
        const resp = getBaseMPCNetworkUrl(Environment.PROD, true);
        expect(resp).toBe('wss://mpc-network.prod.usecapsule.com');
        const resp1 = getBaseMPCNetworkUrl(Environment.PRODUCTION, true);
        expect(resp1).toBe('wss://mpc-network.prod.usecapsule.com');
      });
      it('unsupported env', () => {
        expect(() => getBaseMPCNetworkUrl('test' as Environment, true)).toThrowError('unsupported env: test');
      });
    });
  });

  describe('initClient', () => {
    beforeEach(() => {
      vi.unmock('@usecapsule/user-management-client');
    });

    it('returns client - dev', () => {
      const resp = initClient(Environment.DEV);
      expect(resp).toBeInstanceOf(Client);
    });
    it('returns client - prod', () => {
      const resp = initClient(Environment.PROD);
      expect(resp).toBeInstanceOf(Client);
    });
  });
});
