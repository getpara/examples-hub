import { vi, describe, it, expect, afterEach } from 'vitest';

import {
  BASE64_BYTES,
  BASE64_SIGNATURE,
  PARA_SHARE,
  CHAIN,
  COSMOS_PREFIX,
  MESSAGE,
  PARTNER,
  SECRET_KEY,
  SIGNATURE,
  TX,
  USER,
  WALLET,
} from '../constants.js';
import { TEST_CTX } from '../setup.js';
import {
  ed25519Keygen,
  ed25519PreKeygen,
  ed25519Sign,
  getPrivateKey,
  keygen,
  preKeygen,
  refresh,
  sendTransaction,
  signMessage,
  signTransaction,
} from '../../src/workers/walletUtils.js';
import {
  mockCreateAccountV2,
  mockDklsCreateAccount,
  mockDklsRefresh,
  mockDklsSendTransaction,
  mockDklsSignMessage,
  mockEd25519CreateAccount,
  mockEd25519Sign,
  mockGetPrivateKey,
  mockRefresh,
  mockSendTransaction,
  mockSignMessage,
} from '../mocks/mockGlobalWalletUtils.js';
import { Ctx, getBaseMPCNetworkUrl } from '@getpara/core-sdk';
import {
  mockCreateWallet,
  mockcreatePregenWallet,
  mockGetParaShare,
  mockPreSignMessage,
  mockRefreshKeys,
  mockSendTransactionUserManagement,
  mockSignTransaction,
} from '../mocks/mockUserManagementClient.js';
import { mockMPCPost } from '../mocks/mockMPCClient.js';

describe('walletUtils', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('ed25519Keygen', () => {
    it('creates an account', async () => {
      const resp = await ed25519Keygen(TEST_CTX, USER.id);

      expect(resp).toStrictEqual({ signer: WALLET.signer, walletId: WALLET.id });
      expect(mockCreateWallet).toBeCalledTimes(1);
      expect(mockCreateWallet).toBeCalledWith(USER.id, {
        scheme: 'ED25519',
        type: 'SOLANA',
      });
      expect(mockEd25519CreateAccount).toBeCalledTimes(1);
      expect(mockEd25519CreateAccount).toBeCalledWith(
        getBaseMPCNetworkUrl(TEST_CTX.env, !TEST_CTX.disableWebSockets),
        WALLET.id,
        WALLET.protocolId,
        expect.any(Function),
      );
    });

    it('throws correct error when creation fails', async () => {
      mockEd25519CreateAccount.mockImplementationOnce((_, __, ___, cb) => {
        cb('test error', undefined);
      });

      await expect(ed25519Keygen(TEST_CTX, USER.id)).rejects.toThrowError(
        `error creating account of type SOLANA with userId ${USER.id} and walletId ${WALLET.id}`,
      );
      expect(mockCreateWallet).toBeCalledTimes(1);
      expect(mockCreateWallet).toBeCalledWith(USER.id, {
        scheme: 'ED25519',
        type: 'SOLANA',
      });
      expect(mockEd25519CreateAccount).toBeCalledTimes(1);
      expect(mockEd25519CreateAccount).toBeCalledWith(
        getBaseMPCNetworkUrl(TEST_CTX.env, !TEST_CTX.disableWebSockets),
        WALLET.id,
        WALLET.protocolId,
        expect.any(Function),
      );
    });
  });

  describe('ed25519PreKeygen', () => {
    it('creates an account', async () => {
      const resp = await ed25519PreKeygen(TEST_CTX, USER.email, 'EMAIL');

      expect(resp).toStrictEqual({ signer: WALLET.signer, walletId: WALLET.id });
      expect(mockcreatePregenWallet).toBeCalledTimes(1);
      expect(mockcreatePregenWallet).toBeCalledWith({
        pregenIdentifier: USER.email,
        pregenIdentifierType: 'EMAIL',
        scheme: 'ED25519',
        type: 'SOLANA',
      });
      expect(mockEd25519CreateAccount).toBeCalledTimes(1);
      expect(mockEd25519CreateAccount).toBeCalledWith(
        getBaseMPCNetworkUrl(TEST_CTX.env, !TEST_CTX.disableWebSockets),
        WALLET.id,
        WALLET.protocolId,
        expect.any(Function),
      );
    });

    it('throws correct error when creation fails', async () => {
      mockEd25519CreateAccount.mockImplementationOnce((_, __, ___, cb) => {
        cb('test error', undefined);
      });

      await expect(ed25519PreKeygen(TEST_CTX, USER.email, 'EMAIL')).rejects.toThrowError(
        `error creating account of type SOLANA with walletId ${WALLET.id}`,
      );
      expect(mockcreatePregenWallet).toBeCalledTimes(1);
      expect(mockcreatePregenWallet).toBeCalledWith({
        pregenIdentifier: USER.email,
        pregenIdentifierType: 'EMAIL',
        scheme: 'ED25519',
        type: 'SOLANA',
      });
      expect(mockEd25519CreateAccount).toBeCalledTimes(1);
      expect(mockEd25519CreateAccount).toBeCalledWith(
        getBaseMPCNetworkUrl(TEST_CTX.env, !TEST_CTX.disableWebSockets),
        WALLET.id,
        WALLET.protocolId,
        expect.any(Function),
      );
    });
  });

  describe('ed25519Sign', () => {
    it('signs a message', async () => {
      const resp = await ed25519Sign(TEST_CTX, WALLET.share, USER.id, WALLET.id, BASE64_BYTES);

      expect(resp).toStrictEqual({ signature: BASE64_SIGNATURE });
      expect(mockPreSignMessage).toBeCalledTimes(1);
      expect(mockPreSignMessage).toBeCalledWith(USER.id, WALLET.id, BASE64_BYTES, 'ED25519', undefined, expect.any(String));
      expect(mockEd25519Sign).toBeCalledTimes(1);
      expect(mockEd25519Sign).toBeCalledWith(WALLET.share, expect.any(String), BASE64_BYTES, expect.any(Function));
    });

    it('returns pending transaction ID when present', async () => {
      mockPreSignMessage.mockResolvedValueOnce({
        protocolId: WALLET.protocolId,
        pendingTransactionId: WALLET.pendingTransactionId,
      });
      const resp = await ed25519Sign(TEST_CTX, WALLET.share, USER.id, WALLET.id, BASE64_BYTES);

      expect(resp).toStrictEqual({ pendingTransactionId: WALLET.pendingTransactionId });
      expect(mockPreSignMessage).toBeCalledTimes(1);
      expect(mockPreSignMessage).toBeCalledWith(USER.id, WALLET.id, BASE64_BYTES, 'ED25519', undefined, expect.any(String));
      expect(mockEd25519Sign).toBeCalledTimes(1);
    });

    it('throws correct error when signing fails', async () => {
      mockEd25519Sign.mockImplementationOnce((_, __, ___, cb) => {
        cb('test error', undefined);
      });

      await expect(ed25519Sign(TEST_CTX, WALLET.share, USER.id, WALLET.id, BASE64_BYTES)).rejects.toThrowError(
        `error signing for account of type SOLANA with userId ${USER.id} and walletId ${WALLET.id}`,
      );
      expect(mockPreSignMessage).toBeCalledTimes(1);
      expect(mockPreSignMessage).toBeCalledWith(USER.id, WALLET.id, BASE64_BYTES, 'ED25519', undefined, expect.any(String));
      expect(mockEd25519Sign).toBeCalledTimes(1);
      expect(mockEd25519Sign).toBeCalledWith(WALLET.share, expect.any(String), BASE64_BYTES, expect.any(Function));
    });
  });

  describe('keygen', () => {
    describe('success', () => {
      it('creates an EVM account', async () => {
        const resp = await keygen(TEST_CTX, USER.id, 'EVM', SECRET_KEY);

        expect(resp).toStrictEqual({ signer: WALLET.signer, walletId: WALLET.id });
        expect(mockCreateWallet).toBeCalledTimes(1);
        expect(mockCreateWallet).toBeCalledWith(USER.id, {
          useTwoSigners: true,
          scheme: 'DKLS',
          type: 'EVM',
          cosmosPrefix: undefined,
        });
        expect(mockDklsCreateAccount).toBeCalledTimes(1);
        expect(mockDklsCreateAccount).toBeCalledWith(
          `{"walletId": "${WALLET.id}", "id":"USER", "otherId":"CAPSULE", "isReceiver": false, "disableWebSockets": ${TEST_CTX.disableWebSockets}}`,
          getBaseMPCNetworkUrl(TEST_CTX.env, !TEST_CTX.disableWebSockets),
          WALLET.protocolId,
          SECRET_KEY,
          expect.any(Function),
          expect.any(Function),
        );
      });

      it('creates a COSMOS account', async () => {
        const resp = await keygen(TEST_CTX, USER.id, 'COSMOS', SECRET_KEY);

        expect(resp).toStrictEqual({ signer: WALLET.signer, walletId: WALLET.id });
        expect(mockCreateWallet).toBeCalledTimes(1);
        expect(mockCreateWallet).toBeCalledWith(USER.id, {
          useTwoSigners: true,
          scheme: 'DKLS',
          type: 'COSMOS',
          cosmosPrefix: COSMOS_PREFIX,
        });
        expect(mockDklsCreateAccount).toBeCalledTimes(1);
        expect(mockDklsCreateAccount).toBeCalledWith(
          `{"walletId": "${WALLET.id}", "id":"USER", "otherId":"CAPSULE", "isReceiver": false, "disableWebSockets": ${TEST_CTX.disableWebSockets}}`,
          getBaseMPCNetworkUrl(TEST_CTX.env, !TEST_CTX.disableWebSockets),
          WALLET.protocolId,
          SECRET_KEY,
          expect.any(Function),
          expect.any(Function),
        );
      });

      it('creates an EVM account without DKLS', async () => {
        const _TEST_CTX: Ctx = { ...TEST_CTX, useDKLS: false };
        const resp = await keygen(_TEST_CTX, USER.id, 'EVM', SECRET_KEY);

        expect(resp).toStrictEqual({ signer: WALLET.signer, walletId: WALLET.id });
        expect(mockCreateWallet).toBeCalledTimes(1);
        expect(mockCreateWallet).toBeCalledWith(USER.id, {
          useTwoSigners: true,
          scheme: 'CGGMP',
          type: 'EVM',
          cosmosPrefix: undefined,
        });
        expect(mockCreateAccountV2).toBeCalledTimes(1);
        expect(mockCreateAccountV2).toBeCalledWith(
          `{"ServerUrl":"${getBaseMPCNetworkUrl(_TEST_CTX.env, !_TEST_CTX.disableWebSockets)}", "WalletId": "${WALLET.id}", "Id":"USER", "Ids":["USER","CAPSULE"], "Threshold":1}`,
          getBaseMPCNetworkUrl(_TEST_CTX.env, !_TEST_CTX.disableWebSockets),
          WALLET.protocolId,
          SECRET_KEY,
          expect.any(Function),
          expect.any(Function),
        );
      });

      it('creates an EVM account without DKLS and with offloadMPCComputationURL', async () => {
        const _TEST_CTX: Ctx = { ...TEST_CTX, useDKLS: false, offloadMPCComputationURL: 'https://api.sandbox.getpara.com' };

        const resp = await keygen(_TEST_CTX, USER.id, 'EVM', SECRET_KEY);

        expect(resp).toStrictEqual({ signer: WALLET.signer, walletId: WALLET.id });
        expect(mockCreateWallet).toBeCalledTimes(1);
        expect(mockCreateWallet).toBeCalledWith(USER.id, {
          useTwoSigners: true,
          scheme: 'CGGMP',
          type: 'EVM',
          cosmosPrefix: undefined,
        });
        expect(mockMPCPost).toBeCalledTimes(1);
        expect(mockMPCPost).toBeCalledWith('/wallets', {
          userId: USER.id,
          walletId: WALLET.id,
          protocolId: WALLET.protocolId,
        });
        expect(mockCreateAccountV2).not.toBeCalled();
        expect(mockDklsCreateAccount).not.toBeCalled();
      });
    });

    it('throws correct error when DKLS fails', async () => {
      mockDklsCreateAccount.mockImplementationOnce((_, __, ___, ____, _____, cb) => {
        cb('test error', undefined);
      });

      await expect(keygen(TEST_CTX, USER.id, 'EVM', SECRET_KEY)).rejects.toThrowError(
        `error creating account of type ${'EVM'} with userId ${USER.id} and walletId ${WALLET.id}`,
      );
      expect(mockCreateWallet).toBeCalledTimes(1);
      expect(mockCreateWallet).toBeCalledWith(USER.id, {
        useTwoSigners: true,
        scheme: 'DKLS',
        type: 'EVM',
        cosmosPrefix: undefined,
      });
      expect(mockDklsCreateAccount).toBeCalledTimes(1);
      expect(mockDklsCreateAccount).toBeCalledWith(
        `{"walletId": "${WALLET.id}", "id":"USER", "otherId":"CAPSULE", "isReceiver": false, "disableWebSockets": ${TEST_CTX.disableWebSockets}}`,
        getBaseMPCNetworkUrl(TEST_CTX.env, !TEST_CTX.disableWebSockets),
        WALLET.protocolId,
        SECRET_KEY,
        expect.any(Function),
        expect.any(Function),
      );
    });
  });

  describe('preKeygen', () => {
    describe('success', () => {
      it('creates an EVM account', async () => {
        const resp = await preKeygen(TEST_CTX, PARTNER.id, USER.email, 'EMAIL', 'EVM', SECRET_KEY);

        expect(resp).toStrictEqual({ signer: WALLET.signer, walletId: WALLET.id });
        expect(mockcreatePregenWallet).toBeCalledTimes(1);
        expect(mockcreatePregenWallet).toBeCalledWith({
          pregenIdentifier: USER.email,
          pregenIdentifierType: 'EMAIL',
          type: 'EVM',
          cosmosPrefix: undefined,
        });
        expect(mockDklsCreateAccount).toBeCalledTimes(1);
        expect(mockDklsCreateAccount).toBeCalledWith(
          `{"walletId": "${WALLET.id}", "id":"USER", "otherId":"CAPSULE", "isReceiver": false, "disableWebSockets": ${TEST_CTX.disableWebSockets}}`,
          getBaseMPCNetworkUrl(TEST_CTX.env, !TEST_CTX.disableWebSockets),
          WALLET.protocolId,
          SECRET_KEY,
          expect.any(Function),
          expect.any(Function),
        );
      });

      it('creates a COSMOS account', async () => {
        const resp = await preKeygen(TEST_CTX, PARTNER.id, USER.email, 'EMAIL', 'COSMOS', SECRET_KEY);

        expect(resp).toStrictEqual({ signer: WALLET.signer, walletId: WALLET.id });
        expect(mockcreatePregenWallet).toBeCalledTimes(1);
        expect(mockcreatePregenWallet).toBeCalledWith({
          pregenIdentifier: USER.email,
          pregenIdentifierType: 'EMAIL',
          type: 'COSMOS',
          cosmosPrefix: COSMOS_PREFIX,
        });
        expect(mockDklsCreateAccount).toBeCalledTimes(1);
        expect(mockDklsCreateAccount).toBeCalledWith(
          `{"walletId": "${WALLET.id}", "id":"USER", "otherId":"CAPSULE", "isReceiver": false, "disableWebSockets": ${TEST_CTX.disableWebSockets}}`,
          getBaseMPCNetworkUrl(TEST_CTX.env, !TEST_CTX.disableWebSockets),
          WALLET.protocolId,
          SECRET_KEY,
          expect.any(Function),
          expect.any(Function),
        );
      });

      it('creates an EVM account without DKLS and with offloadMPCComputationURL', async () => {
        const _TEST_CTX: Ctx = { ...TEST_CTX, useDKLS: false, offloadMPCComputationURL: 'https://api.sandbox.getpara.com' };

        const resp = await preKeygen(_TEST_CTX, PARTNER.id, USER.email, 'EMAIL', 'EVM', SECRET_KEY);

        expect(resp).toStrictEqual({ signer: WALLET.signer, walletId: WALLET.id });
        expect(mockcreatePregenWallet).toBeCalledTimes(1);
        expect(mockcreatePregenWallet).toBeCalledWith({
          pregenIdentifier: USER.email,
          pregenIdentifierType: 'EMAIL',
          type: 'EVM',
          cosmosPrefix: undefined,
        });
        expect(mockMPCPost).toBeCalledTimes(1);
        expect(mockMPCPost).toBeCalledWith('/wallets', {
          userId: PARTNER.id,
          walletId: WALLET.id,
          protocolId: WALLET.protocolId,
        });
        expect(mockDklsCreateAccount).not.toBeCalled();
      });

      it('creates an EVM account without DKLS and without offloadMPCComputationURL', async () => {
        const _TEST_CTX: Ctx = { ...TEST_CTX, useDKLS: false };

        const resp = await preKeygen(_TEST_CTX, PARTNER.id, USER.email, 'EMAIL', 'EVM', SECRET_KEY);

        expect(resp).toStrictEqual({ signer: WALLET.signer, walletId: WALLET.id });
        expect(mockcreatePregenWallet).toBeCalledTimes(1);
        expect(mockcreatePregenWallet).toBeCalledWith({
          pregenIdentifier: USER.email,
          pregenIdentifierType: 'EMAIL',
          type: 'EVM',
          cosmosPrefix: undefined,
        });
        expect(mockCreateAccountV2).toBeCalledTimes(1);
        expect(mockCreateAccountV2).toBeCalledWith(
          `{"ServerUrl":"${getBaseMPCNetworkUrl(TEST_CTX.env, !TEST_CTX.disableWebSockets)}", "WalletId": "${WALLET.id}", "Id":"USER", "Ids":["USER","CAPSULE"], "Threshold":1}`,
          getBaseMPCNetworkUrl(TEST_CTX.env, !TEST_CTX.disableWebSockets),
          WALLET.protocolId,
          SECRET_KEY,
          expect.any(Function),
          expect.any(Function),
        );
        expect(mockDklsCreateAccount).not.toBeCalled();
      });
    });

    it('throws correct error when DKLS fails', async () => {
      mockDklsCreateAccount.mockImplementationOnce((_, __, ___, ____, _____, cb) => {
        cb('test error', undefined);
      });

      await expect(preKeygen(TEST_CTX, PARTNER.id, USER.email, 'EMAIL', 'EVM', SECRET_KEY)).rejects.toThrowError(
        `error creating account of type ${'EVM'} with walletId ${WALLET.id}`,
      );
      expect(mockcreatePregenWallet).toBeCalledTimes(1);
      expect(mockcreatePregenWallet).toBeCalledWith({
        pregenIdentifier: USER.email,
        pregenIdentifierType: 'EMAIL',
        type: 'EVM',
        cosmosPrefix: undefined,
      });
      expect(mockDklsCreateAccount).toBeCalledTimes(1);
      expect(mockDklsCreateAccount).toBeCalledWith(
        `{"walletId": "${WALLET.id}", "id":"USER", "otherId":"CAPSULE", "isReceiver": false, "disableWebSockets": ${TEST_CTX.disableWebSockets}}`,
        getBaseMPCNetworkUrl(TEST_CTX.env, !TEST_CTX.disableWebSockets),
        WALLET.protocolId,
        SECRET_KEY,
        expect.any(Function),
        expect.any(Function),
      );
    });
  });

  describe('signMessage', () => {
    describe('success', () => {
      it('signs a message with DKLS', async () => {
        const resp = await signMessage(TEST_CTX, WALLET.share, WALLET.id, USER.id, MESSAGE);

        expect(resp).toStrictEqual({ signature: SIGNATURE });
        expect(mockPreSignMessage).toBeCalledTimes(1);
        expect(mockPreSignMessage).toBeCalledWith(USER.id, WALLET.id, MESSAGE, null, null, expect.any(String));
        expect(mockDklsSignMessage).toBeCalledTimes(1);
        expect(mockDklsSignMessage).toBeCalledWith(
          WALLET.share,
          getBaseMPCNetworkUrl(TEST_CTX.env, !TEST_CTX.disableWebSockets),
          MESSAGE,
          expect.any(String),
          expect.any(Function),
        );
      });

      it('signs a message without DKLS', async () => {
        const _TEST_CTX: Ctx = { ...TEST_CTX, useDKLS: false };
        const resp = await signMessage(_TEST_CTX, WALLET.share, WALLET.id, USER.id, MESSAGE);
        expect(resp).toStrictEqual({ signature: SIGNATURE });
        expect(mockPreSignMessage).toBeCalledTimes(1);
        expect(mockPreSignMessage).toBeCalledWith(USER.id, WALLET.id, MESSAGE, null, null, expect.any(String));
        expect(mockSignMessage).toBeCalledTimes(1);
        expect(mockSignMessage).toBeCalledWith(
          WALLET.share,
          getBaseMPCNetworkUrl(_TEST_CTX.env, !_TEST_CTX.disableWebSockets),
          MESSAGE,
          expect.any(String),
          expect.any(Function),
        );
      });

      it('signs a message without DKLS and with offloadMPCComputationURL', async () => {
        const _TEST_CTX: Ctx = { ...TEST_CTX, useDKLS: false, offloadMPCComputationURL: 'https://api.sandbox.getpara.com' };
        const resp = await signMessage(_TEST_CTX, WALLET.share, WALLET.id, USER.id, MESSAGE);

        expect(resp).toStrictEqual({ signature: SIGNATURE });
        expect(mockPreSignMessage).toBeCalledTimes(1);
        expect(mockPreSignMessage).toBeCalledWith(USER.id, WALLET.id, MESSAGE, null, null, expect.any(String));
        expect(mockMPCPost).toBeCalledTimes(1);
        expect(mockMPCPost).toBeCalledWith(`/wallets/${WALLET.id}/messages/sign`, {
          userId: USER.id,
          protocolId: expect.any(String),
          message: MESSAGE,
          signer: WALLET.share,
        });
        expect(mockDklsSignMessage).not.toBeCalled();
        expect(mockSignMessage).not.toBeCalled();
      });

      it('returns a pending transaction id when permissions block the transaction', async () => {
        mockPreSignMessage.mockResolvedValueOnce({
          protocolId: expect.any(String),
          pendingTransactionId: WALLET.pendingTransactionId,
        });
        const resp = await signMessage(TEST_CTX, WALLET.share, WALLET.id, USER.id, MESSAGE);

        expect(resp).toStrictEqual({ pendingTransactionId: WALLET.pendingTransactionId });
        expect(mockPreSignMessage).toBeCalledTimes(1);
        expect(mockPreSignMessage).toBeCalledWith(USER.id, WALLET.id, MESSAGE, null, null, expect.any(String));
        expect(mockDklsSignMessage).toBeCalledTimes(1);
        expect(mockSignMessage).not.toBeCalled();
      });
    });

    it('throws correct error when DKLS fails', async () => {
      mockDklsSignMessage.mockImplementationOnce((_, __, ___, ____, cb) => {
        cb('test error', undefined);
      });

      await expect(signMessage(TEST_CTX, WALLET.share, WALLET.id, USER.id, MESSAGE)).rejects.toThrowError(
        `error signing for account with userId ${USER.id} and walletId ${WALLET.id}`,
      );
      expect(mockPreSignMessage).toBeCalledTimes(1);
      expect(mockPreSignMessage).toBeCalledWith(USER.id, WALLET.id, MESSAGE, null, null, expect.any(String));
    });
  });

  describe('signTransaction', () => {
    describe('success', () => {
      it('signs transaction with DKLS', async () => {
        const resp = await signTransaction(TEST_CTX, WALLET.share, WALLET.id, USER.id, TX, CHAIN);

        expect(resp).toStrictEqual({ signature: SIGNATURE });
        expect(mockSignTransaction).toBeCalledTimes(1);
        expect(mockSignTransaction).toBeCalledWith(USER.id, WALLET.id, {
          transaction: TX,
          chainId: CHAIN,
          protocolId: expect.any(String),
        });
        expect(mockDklsSendTransaction).toBeCalledTimes(1);
        expect(mockDklsSendTransaction).toBeCalledWith(
          WALLET.share,
          getBaseMPCNetworkUrl(TEST_CTX.env, !TEST_CTX.disableWebSockets),
          TX,
          CHAIN,
          expect.any(String),
          expect.any(Function),
        );
      });

      it('signs transaction without DKLS', async () => {
        const _TEST_CTX: Ctx = { ...TEST_CTX, useDKLS: false };
        const resp = await signTransaction(_TEST_CTX, WALLET.share, WALLET.id, USER.id, TX, CHAIN);
        expect(resp).toStrictEqual({ signature: SIGNATURE });
        expect(mockSignTransaction).toBeCalledTimes(1);
        expect(mockSignTransaction).toBeCalledWith(USER.id, WALLET.id, {
          transaction: TX,
          chainId: CHAIN,
          protocolId: expect.any(String),
        });
        expect(mockSendTransaction).toBeCalledTimes(1);
        expect(mockSendTransaction).toBeCalledWith(
          WALLET.share,
          getBaseMPCNetworkUrl(_TEST_CTX.env, !_TEST_CTX.disableWebSockets),
          TX,
          CHAIN,
          expect.any(String),
          expect.any(Function),
        );
      });

      it('signs transaction without DKLS and with offloadMPCComputationURL', async () => {
        const _TEST_CTX: Ctx = { ...TEST_CTX, useDKLS: false, offloadMPCComputationURL: 'https://api.sandbox.getpara.com' };

        const resp = await signTransaction(_TEST_CTX, WALLET.share, WALLET.id, USER.id, TX, CHAIN);

        expect(resp).toStrictEqual({ signature: SIGNATURE });
        expect(mockSignTransaction).toBeCalledTimes(1);
        expect(mockSignTransaction).toBeCalledWith(USER.id, WALLET.id, {
          transaction: TX,
          chainId: CHAIN,
          protocolId: expect.any(String),
        });
        expect(mockMPCPost).toBeCalledTimes(1);
        expect(mockMPCPost).toBeCalledWith(`/wallets/${WALLET.id}/transactions/send`, {
          userId: USER.id,
          protocolId: expect.any(String),
          transaction: TX,
          chainId: CHAIN,
          signer: WALLET.share,
        });
        expect(mockDklsSendTransaction).not.toBeCalled();
        expect(mockSendTransaction).not.toBeCalled();
      });

      it('returns a pending transaction id when permissions block the transaction', async () => {
        mockSignTransaction.mockResolvedValueOnce({
          data: {
            protocolId: WALLET.protocolId,
            pendingTransactionId: WALLET.pendingTransactionId,
          },
        });
        const resp = await signTransaction(TEST_CTX, WALLET.share, WALLET.id, USER.id, TX, CHAIN);

        expect(resp).toStrictEqual({ pendingTransactionId: WALLET.pendingTransactionId });
        expect(mockSignTransaction).toBeCalledTimes(1);
        expect(mockSignTransaction).toBeCalledWith(USER.id, WALLET.id, {
          transaction: TX,
          chainId: CHAIN,
          protocolId: expect.any(String),
        });
        expect(mockDklsSendTransaction).toBeCalledTimes(1);
        expect(mockSendTransaction).not.toBeCalled();
      });

      it('throws correct error when DKLS fails', async () => {
        mockDklsSendTransaction.mockImplementationOnce((_, __, ___, ____, _____, cb) => {
          cb('test error', undefined);
        });

        await expect(signTransaction(TEST_CTX, WALLET.share, WALLET.id, USER.id, TX, CHAIN)).rejects.toThrowError(
          `error signing transaction for account with userId ${USER.id} and walletId ${WALLET.id}`,
        );
        expect(mockSignTransaction).toBeCalledTimes(1);
        expect(mockSignTransaction).toBeCalledWith(USER.id, WALLET.id, {
          transaction: TX,
          chainId: CHAIN,
          protocolId: expect.any(String),
        });
      });
    });
  });

  describe('sendTransaction', () => {
    describe('success', () => {
      it('sends transaction with DKLS', async () => {
        const resp = await sendTransaction(TEST_CTX, WALLET.share, WALLET.id, USER.id, TX, CHAIN);

        expect(resp).toStrictEqual({ signature: SIGNATURE });
        expect(mockSendTransactionUserManagement).toBeCalledTimes(1);
        expect(mockSendTransactionUserManagement).toBeCalledWith(USER.id, WALLET.id, {
          transaction: TX,
          chainId: CHAIN,
          protocolId: expect.any(String),
        });
        expect(mockDklsSendTransaction).toBeCalledTimes(1);
        expect(mockDklsSendTransaction).toBeCalledWith(
          WALLET.share,
          getBaseMPCNetworkUrl(TEST_CTX.env, !TEST_CTX.disableWebSockets),
          TX,
          CHAIN,
          expect.any(String),
          expect.any(Function),
        );
      });

      it('sends transaction without DKLS', async () => {
        const _TEST_CTX: Ctx = { ...TEST_CTX, useDKLS: false };
        const resp = await sendTransaction(_TEST_CTX, WALLET.share, WALLET.id, USER.id, TX, CHAIN);
        expect(resp).toStrictEqual({ signature: SIGNATURE });
        expect(mockSendTransactionUserManagement).toBeCalledTimes(1);
        expect(mockSendTransactionUserManagement).toBeCalledWith(USER.id, WALLET.id, {
          transaction: TX,
          chainId: CHAIN,
          protocolId: expect.any(String),
        });
        expect(mockSendTransaction).toBeCalledTimes(1);
        expect(mockSendTransaction).toBeCalledWith(
          WALLET.share,
          getBaseMPCNetworkUrl(_TEST_CTX.env, !_TEST_CTX.disableWebSockets),
          TX,
          CHAIN,
          expect.any(String),
          expect.any(Function),
        );
      });

      it('sends transaction without DKLS and with offloadMPCComputationURL', async () => {
        const _TEST_CTX: Ctx = { ...TEST_CTX, useDKLS: false, offloadMPCComputationURL: 'https://api.sandbox.getpara.com' };

        const resp = await sendTransaction(_TEST_CTX, WALLET.share, WALLET.id, USER.id, TX, CHAIN);

        expect(resp).toStrictEqual({ signature: SIGNATURE });
        expect(mockSendTransactionUserManagement).toBeCalledTimes(1);
        expect(mockSendTransactionUserManagement).toBeCalledWith(USER.id, WALLET.id, {
          transaction: TX,
          chainId: CHAIN,
          protocolId: expect.any(String),
        });
        expect(mockMPCPost).toBeCalledTimes(1);
        expect(mockMPCPost).toBeCalledWith(`/wallets/${WALLET.id}/transactions/send`, {
          userId: USER.id,
          protocolId: expect.any(String),
          transaction: TX,
          chainId: CHAIN,
          signer: WALLET.share,
        });
        expect(mockDklsSendTransaction).not.toBeCalled();
        expect(mockSendTransaction).not.toBeCalled();
      });

      it('returns a pending transaction id when permissions block the transaction', async () => {
        mockSendTransactionUserManagement.mockResolvedValueOnce({
          data: {
            protocolId: WALLET.protocolId,
            pendingTransactionId: WALLET.pendingTransactionId,
          },
        });
        const resp = await sendTransaction(TEST_CTX, WALLET.share, WALLET.id, USER.id, TX, CHAIN);

        expect(resp).toStrictEqual({ pendingTransactionId: WALLET.pendingTransactionId });
        expect(mockSendTransactionUserManagement).toBeCalledTimes(1);
        expect(mockSendTransactionUserManagement).toBeCalledWith(USER.id, WALLET.id, {
          transaction: TX,
          chainId: CHAIN,
          protocolId: expect.any(String),
        });
        expect(mockDklsSendTransaction).toBeCalledTimes(1);
        expect(mockSendTransaction).not.toBeCalled();
      });
    });

    it('throws correct error when DKLS fails', async () => {
      mockDklsSendTransaction.mockImplementationOnce((_, __, ___, ____, _____, cb) => {
        cb('test error', undefined);
      });

      await expect(sendTransaction(TEST_CTX, WALLET.share, WALLET.id, USER.id, TX, CHAIN)).rejects.toThrowError(
        `error signing transaction to send for account with userId ${USER.id} and walletId ${WALLET.id}`,
      );
      expect(mockSendTransactionUserManagement).toBeCalledTimes(1);
      expect(mockSendTransactionUserManagement).toBeCalledWith(USER.id, WALLET.id, {
        transaction: TX,
        chainId: CHAIN,
        protocolId: expect.any(String),
      });
    });
  });

  describe('refresh', () => {
    describe('success', () => {
      it('refreshes keys with DKLS', async () => {
        mockDklsRefresh.mockImplementationOnce((_, __, ___, cb) => {
          cb(null, WALLET.signer);
        });

        const resp = await refresh(TEST_CTX, WALLET.share, WALLET.id, USER.id);

        expect(resp).toStrictEqual(WALLET.signer);
        expect(mockRefreshKeys).toBeCalledTimes(1);
        expect(mockRefreshKeys).toBeCalledWith(USER.id, WALLET.id);
        expect(mockDklsRefresh).toBeCalledTimes(1);
        expect(mockDklsRefresh).toBeCalledWith(
          WALLET.share,
          getBaseMPCNetworkUrl(TEST_CTX.env, !TEST_CTX.disableWebSockets),
          WALLET.protocolId,
          expect.any(Function),
        );
      });

      it('refreshes keys without DKLS', async () => {
        mockRefresh.mockImplementationOnce((_, __, ___, cb) => {
          cb(null, WALLET.signer);
        });

        const _TEST_CTX: Ctx = { ...TEST_CTX, useDKLS: false };
        const resp = await refresh(_TEST_CTX, WALLET.share, WALLET.id, USER.id);

        expect(resp).toStrictEqual(WALLET.signer);
        expect(mockRefreshKeys).toBeCalledTimes(1);
        expect(mockRefreshKeys).toBeCalledWith(USER.id, WALLET.id);
        expect(mockRefresh).toBeCalledTimes(1);
        expect(mockRefresh).toBeCalledWith(
          WALLET.share,
          getBaseMPCNetworkUrl(_TEST_CTX.env, !_TEST_CTX.disableWebSockets),
          WALLET.protocolId,
          expect.any(Function),
        );
      });
    });

    it('throws correct error when DKLS fails', async () => {
      mockDklsRefresh.mockImplementationOnce((_, __, ___, cb) => {
        cb('test error', undefined);
      });

      await expect(refresh(TEST_CTX, WALLET.share, WALLET.id, USER.id)).rejects.toThrowError(
        `error refreshing keys for account with userId ${USER.id} and walletId ${WALLET.id}`,
      );
      expect(mockRefreshKeys).toBeCalledTimes(1);
      expect(mockRefreshKeys).toBeCalledWith(USER.id, WALLET.id);
    });
  });

  describe('getPrivateKey', () => {
    describe('success', () => {
      it('gets private key', async () => {
        const resp = await getPrivateKey(TEST_CTX, WALLET.share, WALLET.id, USER.id);

        expect(resp).toBe(WALLET.privateKey);
        expect(mockGetParaShare).toBeCalledTimes(1);
        expect(mockGetParaShare).toBeCalledWith(USER.id, WALLET.id);
        expect(mockGetPrivateKey).toBeCalledTimes(1);
        expect(mockGetPrivateKey).toBeCalledWith(WALLET.share, PARA_SHARE, expect.any(Function));
      });

      it('does not get private key when share is retrieved passed', async () => {
        mockGetParaShare.mockResolvedValueOnce(undefined);
        const resp = await getPrivateKey(TEST_CTX, WALLET.share, WALLET.id, USER.id);

        expect(resp).toBe('');
        expect(mockGetParaShare).toBeCalledTimes(1);
        expect(mockGetParaShare).toBeCalledWith(USER.id, WALLET.id);
        expect(mockGetPrivateKey).not.toBeCalled();
      });
    });

    it('throws correct error when getPrivateKey fails', async () => {
      mockGetPrivateKey.mockImplementationOnce((_, __, cb) => {
        cb('test error', undefined);
      });

      await expect(getPrivateKey(TEST_CTX, WALLET.share, WALLET.id, USER.id)).rejects.toThrowError(
        `error getting private key for account with userId ${USER.id} and walletId ${WALLET.id}`,
      );
      expect(mockGetParaShare).toBeCalledTimes(1);
      expect(mockGetParaShare).toBeCalledWith(USER.id, WALLET.id);
    });
  });
});
