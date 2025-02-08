import { describe, expect, it } from 'vitest';
import { Environment } from '../../src/types/index.js';
import { getParaConnectBaseUrl, getParaConnectDomain, getPortalBaseURL, getPortalDomain } from '../../src/utils/index.js';

describe('url', () => {
  describe('getPortalDomain', () => {
    it('DEV', () => {
      const resp = getPortalDomain(Environment.DEV);

      expect(resp).toBe('localhost');
    });
    it('SANDBOX', () => {
      const resp = getPortalDomain(Environment.SANDBOX);

      expect(resp).toBe('app.sandbox.usecapsule.com');
    });
    it('BETA', () => {
      const resp = getPortalDomain(Environment.BETA);

      expect(resp).toBe('app.beta.usecapsule.com');
    });
    it('PROD', () => {
      const resp = getPortalDomain(Environment.PROD);

      expect(resp).toBe('app.usecapsule.com');
    });
    it('E2E', () => {
      const resp = getPortalDomain(Environment.DEV, true);

      expect(resp).toBe('localhost');
    });
    it('fail', () => {
      expect(() => getPortalDomain('fail' as Environment)).toThrowError('env: fail not supported');
    });
  });
  describe('getPortalBaseURL', () => {
    it('DEV', () => {
      const resp = getPortalBaseURL({ env: Environment.DEV });

      expect(resp).toBe('http://localhost:3003');
    });
    it('DEV - local IP', () => {
      const resp = getPortalBaseURL({ env: Environment.DEV }, true);

      expect(resp).toBe('http://127.0.0.1:3003');
    });
    it('SANDBOX', () => {
      const resp = getPortalBaseURL({ env: Environment.SANDBOX });

      expect(resp).toBe('https://app.sandbox.usecapsule.com');
    });
    it('BETA', () => {
      const resp = getPortalBaseURL({ env: Environment.BETA });

      expect(resp).toBe('https://app.beta.usecapsule.com');
    });
    it('PROD', () => {
      const resp = getPortalBaseURL({ env: Environment.PROD });

      expect(resp).toBe('https://app.usecapsule.com');
    });
    it('E2E', () => {
      const resp = getPortalBaseURL({ env: Environment.DEV, isE2E: true });

      expect(resp).toBe('http://localhost:3003');
    });
    it('E2E - WASM', () => {
      const resp = getPortalBaseURL({ env: Environment.DEV, isE2E: true }, false, true);

      expect(resp).toBe('https://app.sandbox.usecapsule.com');
    });
  });
  describe('getParaConnectDomain', () => {
    it('DEV', () => {
      const resp = getParaConnectDomain(Environment.DEV);

      expect(resp).toBe('localhost');
    });
    it('SANDBOX', () => {
      const resp = getParaConnectDomain(Environment.SANDBOX);

      expect(resp).toBe('connect.sandbox.getpara.com');
    });
    it('BETA', () => {
      const resp = getParaConnectDomain(Environment.BETA);

      expect(resp).toBe('connect.beta.getpara.com');
    });
    it('PROD', () => {
      const resp = getParaConnectDomain(Environment.PROD);

      expect(resp).toBe('connect.getpara.com');
    });
    it('fail', () => {
      expect(() => getParaConnectDomain('fail' as Environment)).toThrowError('env: fail not supported');
    });
  });
  describe('getParaConnectBaseUrl', () => {
    it('DEV', () => {
      const resp = getParaConnectBaseUrl({ env: Environment.DEV });

      expect(resp).toBe('http://localhost:3008');
    });
    it('DEV - local IP', () => {
      const resp = getParaConnectBaseUrl({ env: Environment.DEV }, true);

      expect(resp).toBe('http://127.0.0.1:3008');
    });
    it('SANDBOX', () => {
      const resp = getParaConnectBaseUrl({ env: Environment.SANDBOX });

      expect(resp).toBe('https://connect.sandbox.getpara.com');
    });
    it('BETA', () => {
      const resp = getParaConnectBaseUrl({ env: Environment.BETA });

      expect(resp).toBe('https://connect.beta.getpara.com');
    });
    it('PROD', () => {
      const resp = getParaConnectBaseUrl({ env: Environment.PROD });

      expect(resp).toBe('https://connect.getpara.com');
    });
  });
});
