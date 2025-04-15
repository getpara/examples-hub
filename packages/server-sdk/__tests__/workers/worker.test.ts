import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest';

import * as walletUtils from '../../src/workers/walletUtils.js';
import { handleMessage, requestWasmWithRetries } from '../../src/workers/worker.js';
import {
  BASE64_BYTES,
  CHAIN,
  COSMOS_SIGN_DOC,
  MESSAGE,
  PARTNER,
  SECRET_KEY,
  SIGNATURE,
  TX,
  USER,
  WALLET,
} from '../constants.js';
import { mockGoRun, mockWASMInit, TEST_CTX } from '../setup.js';
import { Environment, WalletType } from '@getpara/core-sdk';
import * as coreSdk from '@getpara/core-sdk';

const initClientSpy = vi.spyOn(coreSdk, 'initClient');

import axios from 'axios';

const MOCK_WORK_ID = 'test-work-id';

const keygenSpy = vi.spyOn(walletUtils, 'keygen').mockImplementation(async () => ({
  signer: WALLET.signer,
  walletId: WALLET.id,
}));
const signTransactionSpy = vi.spyOn(walletUtils, 'signTransaction').mockImplementationOnce(async () => ({
  signature: SIGNATURE,
}));
const sendTransactionSpy = vi.spyOn(walletUtils, 'sendTransaction').mockImplementationOnce(async () => ({
  signature: SIGNATURE,
}));
const signMessageSpy = vi.spyOn(walletUtils, 'signMessage').mockImplementationOnce(async () => ({
  signature: SIGNATURE,
}));
const refreshSpy = vi.spyOn(walletUtils, 'refresh').mockImplementationOnce(async () => WALLET.signer);
const preKeygenSpy = vi.spyOn(walletUtils, 'preKeygen').mockImplementationOnce(async () => ({
  signer: WALLET.signer,
  walletId: WALLET.id,
}));
const getPrivateKeySpy = vi.spyOn(walletUtils, 'getPrivateKey').mockImplementationOnce(async () => WALLET.privateKey);
const ed25519KeygenSpy = vi.spyOn(walletUtils, 'ed25519Keygen').mockImplementationOnce(async () => ({
  signer: WALLET.signer,
  walletId: WALLET.id,
}));
const ed25519SignSpy = vi.spyOn(walletUtils, 'ed25519Sign').mockImplementationOnce(async () => ({
  signature: SIGNATURE,
}));
const ed25519PreKeygenSpy = vi.spyOn(walletUtils, 'ed25519PreKeygen').mockImplementationOnce(async () => ({
  signer: WALLET.signer,
  walletId: WALLET.id,
}));

vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: new ArrayBuffer() })),
  },
}));

describe('worker', () => {
  beforeEach(async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        arrayBuffer: () => Promise.resolve(new ArrayBuffer()),
      } as Response),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('requestWasmWithRetries', () => {
    it('retries on failure and succeeds eventually', async () => {
      const mockGet = vi.mocked(axios.get);
      mockGet
        .mockRejectedValueOnce(new Error('Network error 1'))
        .mockRejectedValueOnce(new Error('Network error 2'))
        .mockResolvedValueOnce({ data: new ArrayBuffer(8) });

      const result = await requestWasmWithRetries(TEST_CTX, 3);

      expect(mockGet).toHaveBeenCalledTimes(3);
      expect(result?.data).toBeInstanceOf(ArrayBuffer);
      mockGet.mockRestore();
    });

    it('fails after exhausting all retries', async () => {
      const mockError = new Error('Persistent network error');
      const mockGet = vi.mocked(axios.get);
      mockGet.mockRejectedValue(mockError);

      await expect(requestWasmWithRetries(TEST_CTX, 3)).rejects.toThrow(mockError);
      expect(mockGet).toHaveBeenCalledTimes(3);
      mockGet.mockRestore();
    });
  });

  describe('handleMessage', () => {
    it('no env', async () => {
      await expect(
        handleMessage({
          data: {
            functionType: 'KEYGEN',
            params: { userId: USER.id, secretKey: SECRET_KEY, type: WalletType.EVM },
            ...TEST_CTX,
            env: 'FAKE_ENV' as Environment,
            workId: MOCK_WORK_ID,
          },
        }),
      ).rejects.toThrowError('unsupported env: FAKE_ENV');

      expect(keygenSpy).not.toBeCalled();
      expect(mockGoRun).not.toBeCalled();
      expect(mockWASMInit).not.toBeCalled();
    });
    it('keygen - with offloadMPCComputationURL', async () => {
      const _TEST_CTX = {
        ...TEST_CTX,
        disableWorkers: undefined,
        offloadMPCComputationURL: 'offloadurl',
      };

      const resp = await handleMessage({
        data: {
          functionType: 'KEYGEN',
          params: { userId: USER.id, secretKey: SECRET_KEY, type: WalletType.EVM },
          ..._TEST_CTX,
          workId: MOCK_WORK_ID,
        },
      });

      expect(resp).toEqual({
        signer: WALLET.signer,
        walletId: WALLET.id,
        workId: MOCK_WORK_ID,
      });
      expect(keygenSpy).toBeCalledTimes(1);
      expect(keygenSpy).toBeCalledWith(
        { ..._TEST_CTX, mpcComputationClient: expect.any(Function) },
        USER.id,
        WalletType.EVM,
        SECRET_KEY,
      );
      expect(mockGoRun).toBeCalledTimes(1);
      expect(mockWASMInit).toBeCalledTimes(1);
    });
    it('keygen', async () => {
      const _TEST_CTX = {
        ...TEST_CTX,
        disableWorkers: undefined,
        offloadMPCComputationURL: undefined,
        mpcComputationClient: undefined,
      };

      const resp = await handleMessage({
        data: {
          functionType: 'KEYGEN',
          params: { userId: USER.id, secretKey: SECRET_KEY, type: WalletType.EVM },
          ..._TEST_CTX,
          workId: MOCK_WORK_ID,
        },
      });

      expect(resp).toEqual({
        signer: WALLET.signer,
        walletId: WALLET.id,
        workId: MOCK_WORK_ID,
      });
      expect(keygenSpy).toBeCalledTimes(1);
      expect(keygenSpy).toBeCalledWith({ ..._TEST_CTX }, USER.id, WalletType.EVM, SECRET_KEY);
      expect(mockGoRun).toBeCalledTimes(1);
      expect(mockWASMInit).toBeCalledTimes(1);
    });
    it('signTransaction', async () => {
      const _TEST_CTX = {
        ...TEST_CTX,
        disableWorkers: undefined,
        offloadMPCComputationURL: undefined,
        mpcComputationClient: undefined,
      };

      const resp = await handleMessage({
        data: {
          functionType: 'SIGN_TRANSACTION',
          params: { userId: USER.id, share: WALLET.share, walletId: WALLET.id, tx: TX, chainId: CHAIN },
          ..._TEST_CTX,
          workId: MOCK_WORK_ID,
        },
      });

      expect(resp).toEqual({
        signature: SIGNATURE,
        workId: MOCK_WORK_ID,
      });
      expect(signTransactionSpy).toBeCalledTimes(1);
      expect(signTransactionSpy).toBeCalledWith({ ..._TEST_CTX }, WALLET.share, WALLET.id, USER.id, TX, CHAIN);
      expect(mockGoRun).toBeCalledTimes(1);
      expect(mockWASMInit).toBeCalledTimes(1);
    });
    it('sendTransaction', async () => {
      const _TEST_CTX = {
        ...TEST_CTX,
        disableWorkers: undefined,
        offloadMPCComputationURL: undefined,
        mpcComputationClient: undefined,
      };

      const resp = await handleMessage({
        data: {
          functionType: 'SEND_TRANSACTION',
          params: { userId: USER.id, share: WALLET.share, walletId: WALLET.id, tx: TX, chainId: CHAIN },
          ..._TEST_CTX,
          workId: MOCK_WORK_ID,
        },
      });

      expect(resp).toEqual({
        signature: SIGNATURE,
        workId: MOCK_WORK_ID,
      });
      expect(sendTransactionSpy).toBeCalledTimes(1);
      expect(sendTransactionSpy).toBeCalledWith({ ..._TEST_CTX }, WALLET.share, WALLET.id, USER.id, TX, CHAIN);
      expect(mockGoRun).toBeCalledTimes(1);
      expect(mockWASMInit).toBeCalledTimes(1);
    });
    it('signMessage', async () => {
      const _TEST_CTX = {
        ...TEST_CTX,
        disableWorkers: undefined,
        offloadMPCComputationURL: undefined,
        mpcComputationClient: undefined,
      };

      const resp = await handleMessage({
        data: {
          functionType: 'SIGN_MESSAGE',
          params: {
            userId: USER.id,
            share: WALLET.share,
            walletId: WALLET.id,
            message: MESSAGE,
            cosmosSignDoc: COSMOS_SIGN_DOC,
          },
          ..._TEST_CTX,
          workId: MOCK_WORK_ID,
        },
      });

      expect(resp).toEqual({
        signature: SIGNATURE,
        workId: MOCK_WORK_ID,
      });
      expect(signMessageSpy).toBeCalledTimes(1);
      expect(signMessageSpy).toBeCalledWith({ ..._TEST_CTX }, WALLET.share, WALLET.id, USER.id, MESSAGE);
      expect(mockGoRun).toBeCalledTimes(1);
      expect(mockWASMInit).toBeCalledTimes(1);
    });
    it('refresh', async () => {
      const _TEST_CTX = {
        ...TEST_CTX,
        disableWorkers: undefined,
        offloadMPCComputationURL: undefined,
        mpcComputationClient: undefined,
      };

      const resp = await handleMessage({
        data: {
          functionType: 'REFRESH',
          params: {
            userId: USER.id,
            share: WALLET.share,
            walletId: WALLET.id,
            oldPartnerId: PARTNER.id,
            newPartnerId: PARTNER.id,
            keyShareProtocolId: WALLET.preExistingProtocolId,
          },
          ..._TEST_CTX,
          workId: MOCK_WORK_ID,
        },
      });

      expect(resp).toEqual({
        signer: WALLET.signer,
        workId: MOCK_WORK_ID,
      });
      expect(refreshSpy).toBeCalledTimes(1);
      expect(refreshSpy).toBeCalledWith({ ..._TEST_CTX }, WALLET.share, WALLET.id, USER.id);
      expect(mockGoRun).toBeCalledTimes(1);
      expect(mockWASMInit).toBeCalledTimes(1);
    });
    it('preKeygen - old', async () => {
      const _TEST_CTX = {
        ...TEST_CTX,
        disableWorkers: undefined,
        offloadMPCComputationURL: undefined,
        mpcComputationClient: undefined,
      };

      const resp = await handleMessage({
        data: {
          functionType: 'PREKEYGEN',
          params: {
            email: USER.email,
            secretKey: SECRET_KEY,
            type: WalletType.EVM,
            partnerId: PARTNER.id,
          },
          ..._TEST_CTX,
          workId: MOCK_WORK_ID,
        },
      });

      expect(resp).toEqual({
        signer: WALLET.signer,
        walletId: WALLET.id,
        workId: MOCK_WORK_ID,
      });
      expect(preKeygenSpy).toBeCalledTimes(1);
      expect(preKeygenSpy).toBeCalledWith({ ..._TEST_CTX }, PARTNER.id, USER.email, 'EMAIL', WalletType.EVM, SECRET_KEY);
      expect(mockGoRun).toBeCalledTimes(1);
      expect(mockWASMInit).toBeCalledTimes(1);
    });
    it('preKeygen - new', async () => {
      const _TEST_CTX = {
        ...TEST_CTX,
        disableWorkers: undefined,
        offloadMPCComputationURL: undefined,
        mpcComputationClient: undefined,
      };

      const resp = await handleMessage({
        data: {
          functionType: 'PREKEYGEN',
          params: {
            pregenIdentifier: USER.email,
            pregenIdentifierType: 'EMAIL',
            secretKey: SECRET_KEY,
            type: WalletType.EVM,
            partnerId: PARTNER.id,
          },
          ..._TEST_CTX,
          workId: MOCK_WORK_ID,
        },
      });

      expect(resp).toEqual({
        signer: WALLET.signer,
        walletId: WALLET.id,
        workId: MOCK_WORK_ID,
      });
      expect(preKeygenSpy).toBeCalledTimes(1);
      expect(preKeygenSpy).toBeCalledWith({ ..._TEST_CTX }, PARTNER.id, USER.email, 'EMAIL', WalletType.EVM, SECRET_KEY);
      expect(mockGoRun).toBeCalledTimes(1);
      expect(mockWASMInit).toBeCalledTimes(1);
    });
    it('getPrivateKey', async () => {
      const _TEST_CTX = {
        ...TEST_CTX,
        disableWorkers: undefined,
        offloadMPCComputationURL: undefined,
        mpcComputationClient: undefined,
      };

      const resp = await handleMessage({
        data: {
          functionType: 'GET_PRIVATE_KEY',
          params: {
            userId: USER.id,
            share: WALLET.share,
            walletId: WALLET.id,
          },
          ..._TEST_CTX,
          workId: MOCK_WORK_ID,
        },
      });

      expect(resp).toEqual({
        privateKey: WALLET.privateKey,
        workId: MOCK_WORK_ID,
      });
      expect(getPrivateKeySpy).toBeCalledTimes(1);
      expect(getPrivateKeySpy).toBeCalledWith({ ..._TEST_CTX }, WALLET.share, WALLET.id, USER.id);
      expect(mockGoRun).toBeCalledTimes(1);
      expect(mockWASMInit).toBeCalledTimes(1);
    });
    it('ed25519Keygen', async () => {
      const _TEST_CTX = {
        ...TEST_CTX,
        disableWorkers: undefined,
        offloadMPCComputationURL: undefined,
        mpcComputationClient: undefined,
      };

      const resp = await handleMessage({
        data: {
          functionType: 'ED25519_KEYGEN',
          params: {
            userId: USER.id,
          },
          ..._TEST_CTX,
          workId: MOCK_WORK_ID,
        },
      });

      expect(resp).toEqual({
        signer: WALLET.signer,
        walletId: WALLET.id,
        workId: MOCK_WORK_ID,
      });
      expect(ed25519KeygenSpy).toBeCalledTimes(1);
      expect(ed25519KeygenSpy).toBeCalledWith({ ..._TEST_CTX }, USER.id);
      expect(mockWASMInit).toBeCalledTimes(1);
    });
    it('ed25519Sign', async () => {
      const _TEST_CTX = {
        ...TEST_CTX,
        disableWorkers: undefined,
        offloadMPCComputationURL: undefined,
        mpcComputationClient: undefined,
      };

      const resp = await handleMessage({
        data: {
          functionType: 'ED25519_SIGN',
          params: {
            userId: USER.id,
            share: WALLET.share,
            walletId: WALLET.id,
            base64Bytes: BASE64_BYTES,
          },
          ..._TEST_CTX,
          workId: MOCK_WORK_ID,
        },
      });

      expect(resp).toEqual({
        signature: SIGNATURE,
        workId: MOCK_WORK_ID,
      });
      expect(ed25519SignSpy).toBeCalledTimes(1);
      expect(ed25519SignSpy).toBeCalledWith({ ..._TEST_CTX }, WALLET.share, USER.id, WALLET.id, BASE64_BYTES);
      expect(mockGoRun).toBeCalledTimes(1);
      expect(mockWASMInit).toBeCalledTimes(1);
    });
    it('ed25519PreKeygen - old', async () => {
      const testSessionCookie = 'test-session-cookie';
      const _TEST_CTX = {
        ...TEST_CTX,
        disableWorkers: undefined,
        offloadMPCComputationURL: undefined,
        mpcComputationClient: undefined,
      };

      const resp = await handleMessage({
        data: {
          functionType: 'ED25519_PREKEYGEN',
          params: {
            email: USER.email,
          },
          ..._TEST_CTX,
          workId: MOCK_WORK_ID,
          sessionCookie: testSessionCookie,
        },
      });

      expect(resp).toEqual({
        signer: WALLET.signer,
        walletId: WALLET.id,
        workId: MOCK_WORK_ID,
      });
      expect(ed25519PreKeygenSpy).toBeCalledTimes(1);
      expect(ed25519PreKeygenSpy).toBeCalledWith({ ..._TEST_CTX }, USER.email, 'EMAIL');
      expect(mockGoRun).toBeCalledTimes(1);
      expect(mockWASMInit).toBeCalledTimes(1);

      expect(initClientSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          retrieveSessionCookie: expect.any(Function),
        }),
      );
      const initClientCall = initClientSpy.mock.calls[0][0];
      expect(initClientCall.retrieveSessionCookie()).toBe(testSessionCookie);
    });
    it('ed25519PreKeygen - new', async () => {
      const _TEST_CTX = {
        ...TEST_CTX,
        disableWorkers: undefined,
        offloadMPCComputationURL: undefined,
        mpcComputationClient: undefined,
      };

      const resp = await handleMessage({
        data: {
          functionType: 'ED25519_PREKEYGEN',
          params: {
            pregenIdentifier: USER.email,
            pregenIdentifierType: 'EMAIL',
          },
          ..._TEST_CTX,
          workId: MOCK_WORK_ID,
        },
      });

      expect(resp).toEqual({
        signer: WALLET.signer,
        walletId: WALLET.id,
        workId: MOCK_WORK_ID,
      });
      expect(ed25519PreKeygenSpy).toBeCalledTimes(1);
      expect(ed25519PreKeygenSpy).toBeCalledWith({ ..._TEST_CTX }, USER.email, 'EMAIL');
      expect(mockGoRun).toBeCalledTimes(1);
      expect(mockWASMInit).toBeCalledTimes(1);
    });
    it('fail - invalid function type', async () => {
      const _TEST_CTX = {
        ...TEST_CTX,
        disableWorkers: undefined,
        offloadMPCComputationURL: undefined,
        mpcComputationClient: undefined,
      };

      await expect(
        handleMessage({
          data: {
            functionType: 'INVALID',
            params: {},
            ..._TEST_CTX,
            workId: MOCK_WORK_ID,
          },
        }),
      ).rejects.toThrowError(`functionType: INVALID not supported`);
      expect(mockWASMInit).toBeCalledTimes(1);
    });
  });
});
