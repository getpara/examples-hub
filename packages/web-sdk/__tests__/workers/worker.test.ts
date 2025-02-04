import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest';

import * as walletUtils from '../../src/workers/walletUtils.js';
import { handleMessage } from '../../src/workers/worker.js';
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

const mockPostMessage = vi.fn();

const keygenSpy = vi.spyOn(walletUtils, 'keygen').mockImplementationOnce(async () => ({
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
const refreshSpy = vi
  .spyOn(walletUtils, 'refresh')
  .mockImplementationOnce(async () => ({ signer: WALLET.signer, protocolId: WALLET.protocolId }));
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

  describe('handleMessage', () => {
    it('no env', async () => {
      const resp = await handleMessage(
        {
          data: {
            functionType: 'KEYGEN',
            params: { userId: USER.id, secretKey: SECRET_KEY, type: WalletType.EVM },
            ...TEST_CTX,
            env: '' as Environment,
          },
        },
        mockPostMessage,
        false,
      );

      expect(resp).toBeTruthy();
      expect(keygenSpy).not.toBeCalled();
      expect(mockPostMessage).not.toBeCalled();
      expect(mockGoRun).not.toBeCalled();
      expect(mockWASMInit).not.toBeCalled();
    });
    it('keygen - with offloadMPCComputationURL', async () => {
      const _TEST_CTX = {
        ...TEST_CTX,
        disableWorkers: undefined,
      };

      const resp = await handleMessage(
        {
          data: {
            functionType: 'KEYGEN',
            params: { userId: USER.id, secretKey: SECRET_KEY, type: WalletType.EVM },
            ..._TEST_CTX,
          },
        },
        mockPostMessage,
        false,
      );

      expect(resp).toBeFalsy();
      expect(keygenSpy).toBeCalledTimes(1);
      expect(keygenSpy).toBeCalledWith(
        { ..._TEST_CTX, mpcComputationClient: expect.any(Function) },
        USER.id,
        WalletType.EVM,
        SECRET_KEY,
      );
      expect(mockPostMessage).toBeCalledTimes(1);
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

      const resp = await handleMessage(
        {
          data: {
            functionType: 'KEYGEN',
            params: { userId: USER.id, secretKey: SECRET_KEY, type: WalletType.EVM },
            ..._TEST_CTX,
          },
        },
        mockPostMessage,
        false,
      );

      expect(resp).toBeFalsy();
      expect(keygenSpy).toBeCalledTimes(1);
      expect(keygenSpy).toBeCalledWith({ ..._TEST_CTX }, USER.id, WalletType.EVM, SECRET_KEY);
      expect(mockPostMessage).toBeCalledTimes(1);
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

      const resp = await handleMessage(
        {
          data: {
            functionType: 'SIGN_TRANSACTION',
            params: { userId: USER.id, share: WALLET.share, walletId: WALLET.id, tx: TX, chainId: CHAIN },
            ..._TEST_CTX,
          },
        },
        mockPostMessage,
        false,
      );

      expect(resp).toBeFalsy();
      expect(signTransactionSpy).toBeCalledTimes(1);
      expect(signTransactionSpy).toBeCalledWith({ ..._TEST_CTX }, WALLET.share, WALLET.id, USER.id, TX, CHAIN);
      expect(mockPostMessage).toBeCalledTimes(1);
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

      const resp = await handleMessage(
        {
          data: {
            functionType: 'SEND_TRANSACTION',
            params: { userId: USER.id, share: WALLET.share, walletId: WALLET.id, tx: TX, chainId: CHAIN },
            ..._TEST_CTX,
          },
        },
        mockPostMessage,
        false,
      );

      expect(resp).toBeFalsy();
      expect(sendTransactionSpy).toBeCalledTimes(1);
      expect(sendTransactionSpy).toBeCalledWith({ ..._TEST_CTX }, WALLET.share, WALLET.id, USER.id, TX, CHAIN);
      expect(mockPostMessage).toBeCalledTimes(1);
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

      const resp = await handleMessage(
        {
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
          },
        },
        mockPostMessage,
        false,
      );

      expect(resp).toBeFalsy();
      expect(signMessageSpy).toBeCalledTimes(1);
      expect(signMessageSpy).toBeCalledWith({ ..._TEST_CTX }, WALLET.share, WALLET.id, USER.id, MESSAGE, COSMOS_SIGN_DOC);
      expect(mockPostMessage).toBeCalledTimes(1);
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

      const resp = await handleMessage(
        {
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
          },
        },
        mockPostMessage,
        false,
      );

      expect(resp).toBeFalsy();
      expect(refreshSpy).toBeCalledTimes(1);
      expect(refreshSpy).toBeCalledWith(
        { ..._TEST_CTX },
        WALLET.share,
        WALLET.id,
        USER.id,
        PARTNER.id,
        PARTNER.id,
        WALLET.preExistingProtocolId,
      );
      expect(mockPostMessage).toBeCalledTimes(1);
      expect(mockPostMessage).toBeCalledWith(WALLET.signer);
      expect(mockGoRun).toBeCalledTimes(1);
      expect(mockWASMInit).toBeCalledTimes(1);
    });
    it('refresh - returnObject', async () => {
      const _TEST_CTX = {
        ...TEST_CTX,
        disableWorkers: undefined,
        offloadMPCComputationURL: undefined,
        mpcComputationClient: undefined,
      };

      const resp = await handleMessage(
        {
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
            returnObject: true,
            ..._TEST_CTX,
          },
        },
        mockPostMessage,
        false,
      );

      expect(resp).toBeFalsy();
      expect(refreshSpy).toBeCalledTimes(1);
      expect(refreshSpy).toBeCalledWith(
        { ..._TEST_CTX },
        WALLET.share,
        WALLET.id,
        USER.id,
        PARTNER.id,
        PARTNER.id,
        WALLET.preExistingProtocolId,
      );
      expect(mockPostMessage).toBeCalledTimes(1);
      expect(mockPostMessage).toBeCalledWith({
        protocolId: WALLET.protocolId,
        signer: WALLET.signer,
      });
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

      const resp = await handleMessage(
        {
          data: {
            functionType: 'PREKEYGEN',
            params: {
              email: USER.email,
              secretKey: SECRET_KEY,
              type: WalletType.EVM,
              partnerId: PARTNER.id,
            },
            ..._TEST_CTX,
          },
        },
        mockPostMessage,
        false,
      );

      expect(resp).toBeFalsy();
      expect(preKeygenSpy).toBeCalledTimes(1);
      expect(preKeygenSpy).toBeCalledWith({ ..._TEST_CTX }, PARTNER.id, USER.email, 'EMAIL', WalletType.EVM, SECRET_KEY);
      expect(mockPostMessage).toBeCalledTimes(1);
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

      const resp = await handleMessage(
        {
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
          },
        },
        mockPostMessage,
        false,
      );

      expect(resp).toBeFalsy();
      expect(preKeygenSpy).toBeCalledTimes(1);
      expect(preKeygenSpy).toBeCalledWith({ ..._TEST_CTX }, PARTNER.id, USER.email, 'EMAIL', WalletType.EVM, SECRET_KEY);
      expect(mockPostMessage).toBeCalledTimes(1);
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

      const resp = await handleMessage(
        {
          data: {
            functionType: 'GET_PRIVATE_KEY',
            params: {
              userId: USER.id,
              share: WALLET.share,
              walletId: WALLET.id,
            },
            ..._TEST_CTX,
          },
        },
        mockPostMessage,
        false,
      );

      expect(resp).toBeFalsy();
      expect(getPrivateKeySpy).toBeCalledTimes(1);
      expect(getPrivateKeySpy).toBeCalledWith({ ..._TEST_CTX }, WALLET.share, WALLET.id, USER.id);
      expect(mockPostMessage).toBeCalledTimes(1);
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

      const resp = await handleMessage(
        {
          data: {
            functionType: 'ED25519_KEYGEN',
            params: {
              userId: USER.id,
            },
            ..._TEST_CTX,
          },
        },
        mockPostMessage,
        false,
      );

      expect(resp).toBeFalsy();
      expect(ed25519KeygenSpy).toBeCalledTimes(1);
      expect(ed25519KeygenSpy).toBeCalledWith({ ..._TEST_CTX }, USER.id);
      expect(mockPostMessage).toBeCalledTimes(1);
      expect(mockGoRun).toBeCalledTimes(1);
      expect(mockWASMInit).toBeCalledTimes(1);
    });
    it('ed25519Sign', async () => {
      const _TEST_CTX = {
        ...TEST_CTX,
        disableWorkers: undefined,
        offloadMPCComputationURL: undefined,
        mpcComputationClient: undefined,
      };

      const resp = await handleMessage(
        {
          data: {
            functionType: 'ED25519_SIGN',
            params: {
              userId: USER.id,
              share: WALLET.share,
              walletId: WALLET.id,
              base64Bytes: BASE64_BYTES,
            },
            ..._TEST_CTX,
          },
        },
        mockPostMessage,
        false,
      );

      expect(resp).toBeFalsy();
      expect(ed25519SignSpy).toBeCalledTimes(1);
      expect(ed25519SignSpy).toBeCalledWith({ ..._TEST_CTX }, WALLET.share, USER.id, WALLET.id, BASE64_BYTES);
      expect(mockPostMessage).toBeCalledTimes(1);
      expect(mockGoRun).toBeCalledTimes(1);
      expect(mockWASMInit).toBeCalledTimes(1);
    });
    it('ed25519PreKeygen - old', async () => {
      const _TEST_CTX = {
        ...TEST_CTX,
        disableWorkers: undefined,
        offloadMPCComputationURL: undefined,
        mpcComputationClient: undefined,
      };

      const resp = await handleMessage(
        {
          data: {
            functionType: 'ED25519_PREKEYGEN',
            params: {
              email: USER.email,
            },
            ..._TEST_CTX,
          },
        },
        mockPostMessage,
        false,
      );

      expect(resp).toBeFalsy();
      expect(ed25519PreKeygenSpy).toBeCalledTimes(1);
      expect(ed25519PreKeygenSpy).toBeCalledWith({ ..._TEST_CTX }, USER.email, 'EMAIL');
      expect(mockPostMessage).toBeCalledTimes(1);
      expect(mockGoRun).toBeCalledTimes(1);
      expect(mockWASMInit).toBeCalledTimes(1);
    });
    it('ed25519PreKeygen - new', async () => {
      const _TEST_CTX = {
        ...TEST_CTX,
        disableWorkers: undefined,
        offloadMPCComputationURL: undefined,
        mpcComputationClient: undefined,
      };

      const resp = await handleMessage(
        {
          data: {
            functionType: 'ED25519_PREKEYGEN',
            params: {
              pregenIdentifier: USER.email,
              pregenIdentifierType: 'EMAIL',
            },
            ..._TEST_CTX,
          },
        },
        mockPostMessage,
        false,
      );

      expect(resp).toBeFalsy();
      expect(ed25519PreKeygenSpy).toBeCalledTimes(1);
      expect(ed25519PreKeygenSpy).toBeCalledWith({ ..._TEST_CTX }, USER.email, 'EMAIL');
      expect(mockPostMessage).toBeCalledTimes(1);
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
        handleMessage(
          {
            data: {
              functionType: 'INVALID',
              params: {},
              ..._TEST_CTX,
            },
          },
          mockPostMessage,
          false,
        ),
      ).rejects.toThrowError(`functionType: INVALID not supported`);
      expect(mockPostMessage).not.toBeCalled();
      expect(mockGoRun).toBeCalledTimes(1);
      expect(mockWASMInit).toBeCalledTimes(1);
    });
    it('fail - DISABLE_WASM_FETCH', async () => {
      process.env.DISABLE_WASM_FETCH = 'true';
      const _TEST_CTX = {
        ...TEST_CTX,
        disableWorkers: undefined,
        offloadMPCComputationURL: undefined,
        mpcComputationClient: undefined,
      };

      await expect(
        handleMessage(
          {
            data: {
              functionType: 'KEYGEN',
              params: {},
              ..._TEST_CTX,
            },
          },
          mockPostMessage,
          false,
        ),
      ).rejects.toThrowError('fetching wasm file is disabled');
      expect(mockPostMessage).not.toBeCalled();
      expect(mockGoRun).not.toBeCalled();
      expect(mockWASMInit).not.toBeCalled();
    });
  });
});
