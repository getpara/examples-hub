import { describe, expect, it, vi } from 'vitest';
import { Environment } from '../../src/types';
import { initClient } from '../../src/external/mpcComputationClient';
import { getBaseMPCNetworkUrl } from '../../src';

const DEFAULT_AXIOS_ADAPTER = ['xhr', 'http', 'fetch'];

describe('mpcComputationClient', () => {
  describe('initClient', () => {
    it('no adapter', () => {
      const resp = initClient(getBaseMPCNetworkUrl(Environment.DEV), false);

      expect(resp.defaults.adapter).toBeTypeOf('object');
      expect(resp.defaults.adapter).toStrictEqual(DEFAULT_AXIOS_ADAPTER);
      expect(resp.getUri()).toBe(getBaseMPCNetworkUrl(Environment.DEV));
    });
    describe('with adapter', () => {
      it('success', async () => {
        const resp = initClient(getBaseMPCNetworkUrl(Environment.DEV), true);

        expect(resp.defaults.adapter).toBeTypeOf('function');
        expect(resp.getUri()).toBe(getBaseMPCNetworkUrl(Environment.DEV));

        const resolvedFetch = vi.fn().mockResolvedValue({ text: async () => Promise.resolve({}) });
        global.fetch = resolvedFetch;

        await expect(resp.get('/')).resolves.not.toThrowError();
        expect(resolvedFetch).toBeCalled();
      });
      it('fail', async () => {
        const resp = initClient(getBaseMPCNetworkUrl(Environment.DEV), true);

        expect(resp.defaults.adapter).toBeTypeOf('function');
        expect(resp.getUri()).toBe(getBaseMPCNetworkUrl(Environment.DEV));

        const resolvedFetch = vi.fn().mockRejectedValue('test fail');
        global.fetch = resolvedFetch;

        await expect(resp.get('/')).rejects.toThrowError('test fail');
        expect(resolvedFetch).toBeCalled();
      });
    });
  });
});
