import { vi, describe, it, expect, afterEach } from 'vitest';

import {
  BASE64_BYTES,
  BASE64_SIGNATURE,
  PARA_SHARE,
  CHAIN,
  COSMOS_PREFIX,
  COSMOS_SIGN_DOC,
  MESSAGE,
  PARTNER,
  SECRET_KEY,
  SHARE,
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
import { Ctx, getBaseMPCNetworkUrl, WalletScheme, WalletType } from '@getpara/core-sdk';
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
    it('success', async () => {
      const resp = await ed25519Keygen(TEST_CTX, USER.id);

      expect(resp).toStrictEqual({ signer: WALLET.signer, walletId: WALLET.id });
      expect(mockCreateWallet).toBeCalledTimes(1);
      expect(mockCreateWallet).toBeCalledWith(USER.id, {
        scheme: WalletScheme.ED25519,
        type: WalletType.SOLANA,
      });
      expect(mockEd25519CreateAccount).toBeCalledTimes(1);
      expect(mockEd25519CreateAccount).toBeCalledWith(
        getBaseMPCNetworkUrl(TEST_CTX.env, !TEST_CTX.disableWebSockets),
        WALLET.id,
        WALLET.protocolId,
        expect.any(Function),
      );
    });
    it('fail', async () => {
      mockEd25519CreateAccount.mockImplementationOnce((_, __, ___, cb) => {
        cb('test error', undefined);
      });

      await expect(ed25519Keygen(TEST_CTX, USER.id)).rejects.toThrowError(
        `error creating account of type SOLANA with userId ${USER.id} and walletId ${WALLET.id}`,
      );
      expect(mockCreateWallet).toBeCalledTimes(1);
      expect(mockCreateWallet).toBeCalledWith(USER.id, {
        scheme: WalletScheme.ED25519,
        type: WalletType.SOLANA,
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
    it('success', async () => {
      const resp = await ed25519PreKeygen(TEST_CTX, USER.email, 'EMAIL');

      expect(resp).toStrictEqual({ signer: WALLET.signer, walletId: WALLET.id });
      expect(mockcreatePregenWallet).toBeCalledTimes(1);
      expect(mockcreatePregenWallet).toBeCalledWith({
        pregenIdentifier: USER.email,
        pregenIdentifierType: 'EMAIL',
        scheme: WalletScheme.ED25519,
        type: WalletType.SOLANA,
      });
      expect(mockEd25519CreateAccount).toBeCalledTimes(1);
      expect(mockEd25519CreateAccount).toBeCalledWith(
        getBaseMPCNetworkUrl(TEST_CTX.env, !TEST_CTX.disableWebSockets),
        WALLET.id,
        WALLET.protocolId,
        expect.any(Function),
      );
    });
    it('fail', async () => {
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
        scheme: WalletScheme.ED25519,
        type: WalletType.SOLANA,
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
    it('success', async () => {
      const resp = await ed25519Sign(TEST_CTX, WALLET.share, USER.id, WALLET.id, BASE64_BYTES);

      expect(resp).toStrictEqual({ signature: BASE64_SIGNATURE });
      expect(mockPreSignMessage).toBeCalledTimes(1);
      expect(mockPreSignMessage).toBeCalledWith(USER.id, WALLET.id, BASE64_BYTES, WalletScheme.ED25519);
      expect(mockEd25519Sign).toBeCalledTimes(1);
      expect(mockEd25519Sign).toBeCalledWith(WALLET.share, WALLET.protocolId, BASE64_BYTES, expect.any(Function));
    });
    it('fail', async () => {
      mockEd25519Sign.mockImplementationOnce((_, __, ___, cb) => {
        cb('test error', undefined);
      });

      await expect(ed25519Sign(TEST_CTX, WALLET.share, USER.id, WALLET.id, BASE64_BYTES)).rejects.toThrowError(
        `error signing for account of type SOLANA with userId ${USER.id} and walletId ${WALLET.id}`,
      );
      expect(mockPreSignMessage).toBeCalledTimes(1);
      expect(mockPreSignMessage).toBeCalledWith(USER.id, WALLET.id, BASE64_BYTES, WalletScheme.ED25519);
      expect(mockEd25519Sign).toBeCalledTimes(1);
      expect(mockEd25519Sign).toBeCalledWith(WALLET.share, WALLET.protocolId, BASE64_BYTES, expect.any(Function));
    });
  });
  describe('keygen', () => {
    describe('success', () => {
      it('EVM', async () => {
        const resp = await keygen(TEST_CTX, USER.id, WalletType.EVM, SECRET_KEY);

        expect(resp).toStrictEqual({ signer: WALLET.signer, walletId: WALLET.id });
        expect(mockCreateWallet).toBeCalledTimes(1);
        expect(mockCreateWallet).toBeCalledWith(USER.id, {
          useTwoSigners: true,
          scheme: WalletScheme.DKLS,
          type: WalletType.EVM,
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
      it('COSMOS', async () => {
        const resp = await keygen(TEST_CTX, USER.id, WalletType.COSMOS, SECRET_KEY);

        expect(resp).toStrictEqual({ signer: WALLET.signer, walletId: WALLET.id });
        expect(mockCreateWallet).toBeCalledTimes(1);
        expect(mockCreateWallet).toBeCalledWith(USER.id, {
          useTwoSigners: true,
          scheme: WalletScheme.DKLS,
          type: WalletType.COSMOS,
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
      it('no DKLS', async () => {
        const _TEST_CTX: Ctx = { ...TEST_CTX, useDKLS: false, offloadMPCComputationURL: undefined };
        const resp = await keygen(_TEST_CTX, USER.id, WalletType.EVM, SECRET_KEY);

        expect(resp).toStrictEqual({ signer: WALLET.signer, walletId: WALLET.id });
        expect(mockCreateWallet).toBeCalledTimes(1);
        expect(mockCreateWallet).toBeCalledWith(USER.id, {
          useTwoSigners: true,
          scheme: WalletScheme.CGGMP,
          type: WalletType.EVM,
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
      it('no DKLS with offloadMPCComputationURL', async () => {
        const _TEST_CTX: Ctx = { ...TEST_CTX, useDKLS: false };
        const resp = await keygen(_TEST_CTX, USER.id, WalletType.EVM, SECRET_KEY);

        expect(resp).toStrictEqual({ signer: WALLET.signer, walletId: WALLET.id });
        expect(mockCreateWallet).toBeCalledTimes(1);
        expect(mockCreateWallet).toBeCalledWith(USER.id, {
          useTwoSigners: true,
          scheme: WalletScheme.CGGMP,
          type: WalletType.EVM,
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
    it('fail', async () => {
      mockDklsCreateAccount.mockImplementationOnce((_, __, ___, ____, _____, cb) => {
        cb('test error', undefined);
      });

      await expect(keygen(TEST_CTX, USER.id, WalletType.EVM, SECRET_KEY)).rejects.toThrowError(
        `error creating account of type ${WalletType.EVM} with userId ${USER.id} and walletId ${WALLET.id}`,
      );
      expect(mockCreateWallet).toBeCalledTimes(1);
      expect(mockCreateWallet).toBeCalledWith(USER.id, {
        useTwoSigners: true,
        scheme: WalletScheme.DKLS,
        type: WalletType.EVM,
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
      it('EVM', async () => {
        const resp = await preKeygen(TEST_CTX, PARTNER.id, USER.email, 'EMAIL', WalletType.EVM, SECRET_KEY);

        expect(resp).toStrictEqual({ signer: WALLET.signer, walletId: WALLET.id });
        expect(mockcreatePregenWallet).toBeCalledTimes(1);
        expect(mockcreatePregenWallet).toBeCalledWith({
          pregenIdentifier: USER.email,
          pregenIdentifierType: 'EMAIL',
          type: WalletType.EVM,
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
      it('COSMOS', async () => {
        const resp = await preKeygen(TEST_CTX, PARTNER.id, USER.email, 'EMAIL', WalletType.COSMOS, SECRET_KEY);

        expect(resp).toStrictEqual({ signer: WALLET.signer, walletId: WALLET.id });
        expect(mockcreatePregenWallet).toBeCalledTimes(1);
        expect(mockcreatePregenWallet).toBeCalledWith({
          pregenIdentifier: USER.email,
          pregenIdentifierType: 'EMAIL',
          type: WalletType.COSMOS,
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
    });
    it('fail', async () => {
      mockDklsCreateAccount.mockImplementationOnce((_, __, ___, ____, _____, cb) => {
        cb('test error', undefined);
      });

      await expect(preKeygen(TEST_CTX, PARTNER.id, USER.email, 'EMAIL', WalletType.EVM, SECRET_KEY)).rejects.toThrowError(
        `error creating account of type ${WalletType.EVM} with walletId ${WALLET.id}`,
      );
      expect(mockcreatePregenWallet).toBeCalledTimes(1);
      expect(mockcreatePregenWallet).toBeCalledWith({
        pregenIdentifier: USER.email,
        pregenIdentifierType: 'EMAIL',
        type: WalletType.EVM,
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
      it('DKLS', async () => {
        const resp = await signMessage(TEST_CTX, WALLET.share, WALLET.id, USER.id, MESSAGE, COSMOS_SIGN_DOC);

        expect(resp).toStrictEqual({ signature: SIGNATURE });
        expect(mockPreSignMessage).toBeCalledTimes(1);
        expect(mockPreSignMessage).toBeCalledWith(USER.id, WALLET.id, MESSAGE, null, COSMOS_SIGN_DOC);
        expect(mockDklsSignMessage).toBeCalledTimes(1);
        expect(mockDklsSignMessage).toBeCalledWith(
          WALLET.share,
          getBaseMPCNetworkUrl(TEST_CTX.env, !TEST_CTX.disableWebSockets),
          MESSAGE,
          WALLET.protocolId,
          expect.any(Function),
        );
      });
      it('no DKLS', async () => {
        const _TEST_CTX: Ctx = { ...TEST_CTX, useDKLS: false, offloadMPCComputationURL: undefined };
        const resp = await signMessage(_TEST_CTX, WALLET.share, WALLET.id, USER.id, MESSAGE, COSMOS_SIGN_DOC);

        expect(resp).toStrictEqual({ signature: SIGNATURE });
        expect(mockPreSignMessage).toBeCalledTimes(1);
        expect(mockPreSignMessage).toBeCalledWith(USER.id, WALLET.id, MESSAGE, null, COSMOS_SIGN_DOC);
        expect(mockSignMessage).toBeCalledTimes(1);
        expect(mockSignMessage).toBeCalledWith(
          WALLET.share,
          getBaseMPCNetworkUrl(_TEST_CTX.env, !_TEST_CTX.disableWebSockets),
          MESSAGE,
          WALLET.protocolId,
          expect.any(Function),
        );
      });
      it('no DKLS with offloadMPCComputationURL', async () => {
        const _TEST_CTX: Ctx = { ...TEST_CTX, useDKLS: false };
        const resp = await signMessage(_TEST_CTX, WALLET.share, WALLET.id, USER.id, MESSAGE, COSMOS_SIGN_DOC);

        expect(resp).toStrictEqual({ signature: SIGNATURE });
        expect(mockPreSignMessage).toBeCalledTimes(1);
        expect(mockPreSignMessage).toBeCalledWith(USER.id, WALLET.id, MESSAGE, null, COSMOS_SIGN_DOC);
        expect(mockMPCPost).toBeCalledTimes(1);
        expect(mockMPCPost).toBeCalledWith(`/wallets/${WALLET.id}/messages/sign`, {
          userId: USER.id,
          protocolId: WALLET.protocolId,
          message: MESSAGE,
          signer: WALLET.share,
        });
        expect(mockDklsSignMessage).not.toBeCalled();
        expect(mockSignMessage).not.toBeCalled();
      });
      it('pending tx', async () => {
        mockPreSignMessage.mockResolvedValueOnce({
          protocolId: WALLET.protocolId,
          pendingTransactionId: WALLET.pendingTransactionId,
        });
        const resp = await signMessage(TEST_CTX, WALLET.share, WALLET.id, USER.id, MESSAGE, COSMOS_SIGN_DOC);

        expect(resp).toStrictEqual({ pendingTransactionId: WALLET.pendingTransactionId });
        expect(mockPreSignMessage).toBeCalledTimes(1);
        expect(mockPreSignMessage).toBeCalledWith(USER.id, WALLET.id, MESSAGE, null, COSMOS_SIGN_DOC);
        expect(mockDklsSignMessage).not.toBeCalled();
        expect(mockSignMessage).not.toBeCalled();
      });
      it('disableWebSockets', async () => {
        const _TEST_CTX: Ctx = { ...TEST_CTX, disableWebSockets: true };
        const resp = await signMessage(_TEST_CTX, WALLET.share, WALLET.id, USER.id, MESSAGE, COSMOS_SIGN_DOC);

        expect(resp).toStrictEqual({ signature: SIGNATURE });
        expect(mockPreSignMessage).toBeCalledTimes(1);
        expect(mockPreSignMessage).toBeCalledWith(USER.id, WALLET.id, MESSAGE, null, COSMOS_SIGN_DOC);
        expect(mockDklsSignMessage).toBeCalledTimes(1);
        expect(mockDklsSignMessage).toBeCalledWith(
          JSON.stringify({ ...SHARE, disableWebSockets: true }),
          getBaseMPCNetworkUrl(_TEST_CTX.env, !_TEST_CTX.disableWebSockets),
          MESSAGE,
          WALLET.protocolId,
          expect.any(Function),
        );
      });
    });
    it('fail', async () => {
      mockDklsSignMessage.mockImplementationOnce((_, __, ___, ____, cb) => {
        cb('test error', undefined);
      });

      await expect(signMessage(TEST_CTX, WALLET.share, WALLET.id, USER.id, MESSAGE, COSMOS_SIGN_DOC)).rejects.toThrowError(
        `error signing for account with userId ${USER.id} and walletId ${WALLET.id}`,
      );
      expect(mockPreSignMessage).toBeCalledTimes(1);
      expect(mockPreSignMessage).toBeCalledWith(USER.id, WALLET.id, MESSAGE, null, COSMOS_SIGN_DOC);
      expect(mockDklsSignMessage).toBeCalledTimes(1);
      expect(mockDklsSignMessage).toBeCalledWith(
        WALLET.share,
        getBaseMPCNetworkUrl(TEST_CTX.env, !TEST_CTX.disableWebSockets),
        MESSAGE,
        WALLET.protocolId,
        expect.any(Function),
      );
    });
  });
  describe('signTransaction', () => {
    describe('success', () => {
      it('DKLS', async () => {
        const resp = await signTransaction(TEST_CTX, WALLET.share, WALLET.id, USER.id, TX, CHAIN);

        expect(resp).toStrictEqual({ signature: SIGNATURE });
        expect(mockSignTransaction).toBeCalledTimes(1);
        expect(mockSignTransaction).toBeCalledWith(USER.id, WALLET.id, { transaction: TX, chainId: CHAIN });
        expect(mockDklsSendTransaction).toBeCalledTimes(1);
        expect(mockDklsSendTransaction).toBeCalledWith(
          WALLET.share,
          getBaseMPCNetworkUrl(TEST_CTX.env, !TEST_CTX.disableWebSockets),
          TX,
          CHAIN,
          WALLET.protocolId,
          expect.any(Function),
        );
      });
      it('no DKLS', async () => {
        const _TEST_CTX: Ctx = { ...TEST_CTX, useDKLS: false, offloadMPCComputationURL: undefined };
        const resp = await signTransaction(_TEST_CTX, WALLET.share, WALLET.id, USER.id, TX, CHAIN);
        expect(resp).toStrictEqual({ signature: SIGNATURE });
        expect(mockSignTransaction).toBeCalledTimes(1);
        expect(mockSignTransaction).toBeCalledWith(USER.id, WALLET.id, { transaction: TX, chainId: CHAIN });
        expect(mockSendTransaction).toBeCalledTimes(1);
        expect(mockSendTransaction).toBeCalledWith(
          WALLET.share,
          getBaseMPCNetworkUrl(_TEST_CTX.env, !_TEST_CTX.disableWebSockets),
          TX,
          CHAIN,
          WALLET.protocolId,
          expect.any(Function),
        );
      });
      it('no DKLS with offloadMPCComputationURL', async () => {
        const _TEST_CTX: Ctx = { ...TEST_CTX, useDKLS: false };
        const resp = await signTransaction(_TEST_CTX, WALLET.share, WALLET.id, USER.id, TX, CHAIN);

        expect(resp).toStrictEqual({ signature: SIGNATURE });
        expect(mockSignTransaction).toBeCalledTimes(1);
        expect(mockSignTransaction).toBeCalledWith(USER.id, WALLET.id, { transaction: TX, chainId: CHAIN });
        expect(mockMPCPost).toBeCalledTimes(1);
        expect(mockMPCPost).toBeCalledWith(`/wallets/${WALLET.id}/transactions/send`, {
          userId: USER.id,
          protocolId: WALLET.protocolId,
          transaction: TX,
          chainId: CHAIN,
          signer: WALLET.share,
        });
        expect(mockDklsSendTransaction).not.toBeCalled();
        expect(mockSendTransaction).not.toBeCalled();
      });
      it('pending tx', async () => {
        mockSignTransaction.mockResolvedValueOnce({
          data: {
            protocolId: WALLET.protocolId,
            pendingTransactionId: WALLET.pendingTransactionId,
          },
        });
        const resp = await signTransaction(TEST_CTX, WALLET.share, WALLET.id, USER.id, TX, CHAIN);

        expect(resp).toStrictEqual({ pendingTransactionId: WALLET.pendingTransactionId });
        expect(mockSignTransaction).toBeCalledTimes(1);
        expect(mockSignTransaction).toBeCalledWith(USER.id, WALLET.id, { transaction: TX, chainId: CHAIN });
        expect(mockDklsSendTransaction).not.toBeCalled();
        expect(mockSendTransaction).not.toBeCalled();
      });
      it('disableWebSockets', async () => {
        const _TEST_CTX: Ctx = { ...TEST_CTX, disableWebSockets: true };
        const resp = await signTransaction(_TEST_CTX, WALLET.share, WALLET.id, USER.id, TX, CHAIN);

        expect(resp).toStrictEqual({ signature: SIGNATURE });
        expect(mockSignTransaction).toBeCalledTimes(1);
        expect(mockSignTransaction).toBeCalledWith(USER.id, WALLET.id, { transaction: TX, chainId: CHAIN });
        expect(mockDklsSendTransaction).toBeCalledTimes(1);
        expect(mockDklsSendTransaction).toBeCalledWith(
          JSON.stringify({ ...SHARE, disableWebSockets: true }),
          getBaseMPCNetworkUrl(_TEST_CTX.env, !_TEST_CTX.disableWebSockets),
          TX,
          CHAIN,
          WALLET.protocolId,
          expect.any(Function),
        );
      });
    });
    it('fail', async () => {
      mockDklsSendTransaction.mockImplementationOnce((_, __, ___, ____, _____, cb) => {
        cb('test error', undefined);
      });

      await expect(signTransaction(TEST_CTX, WALLET.share, WALLET.id, USER.id, TX, CHAIN)).rejects.toThrowError(
        `error signing transaction for account with userId ${USER.id} and walletId ${WALLET.id}`,
      );
      expect(mockSignTransaction).toBeCalledTimes(1);
      expect(mockSignTransaction).toBeCalledWith(USER.id, WALLET.id, { transaction: TX, chainId: CHAIN });
      expect(mockDklsSendTransaction).toBeCalledTimes(1);
      expect(mockDklsSendTransaction).toBeCalledWith(
        WALLET.share,
        getBaseMPCNetworkUrl(TEST_CTX.env, !TEST_CTX.disableWebSockets),
        TX,
        CHAIN,
        WALLET.protocolId,
        expect.any(Function),
      );
    });
  });
  describe('sendTransaction', () => {
    describe('success', () => {
      it('DKLS', async () => {
        const resp = await sendTransaction(TEST_CTX, WALLET.share, WALLET.id, USER.id, TX, CHAIN);

        expect(resp).toStrictEqual({ signature: SIGNATURE });
        expect(mockSendTransactionUserManagement).toBeCalledTimes(1);
        expect(mockSendTransactionUserManagement).toBeCalledWith(USER.id, WALLET.id, { transaction: TX, chainId: CHAIN });
        expect(mockDklsSendTransaction).toBeCalledTimes(1);
        expect(mockDklsSendTransaction).toBeCalledWith(
          WALLET.share,
          getBaseMPCNetworkUrl(TEST_CTX.env, !TEST_CTX.disableWebSockets),
          TX,
          CHAIN,
          WALLET.protocolId,
          expect.any(Function),
        );
      });
      it('no DKLS', async () => {
        const _TEST_CTX: Ctx = { ...TEST_CTX, useDKLS: false, offloadMPCComputationURL: undefined };
        const resp = await sendTransaction(_TEST_CTX, WALLET.share, WALLET.id, USER.id, TX, CHAIN);
        expect(resp).toStrictEqual({ signature: SIGNATURE });
        expect(mockSendTransactionUserManagement).toBeCalledTimes(1);
        expect(mockSendTransactionUserManagement).toBeCalledWith(USER.id, WALLET.id, { transaction: TX, chainId: CHAIN });
        expect(mockSendTransaction).toBeCalledTimes(1);
        expect(mockSendTransaction).toBeCalledWith(
          WALLET.share,
          getBaseMPCNetworkUrl(_TEST_CTX.env, !_TEST_CTX.disableWebSockets),
          TX,
          CHAIN,
          WALLET.protocolId,
          expect.any(Function),
        );
      });
      it('no DKLS with offloadMPCComputationURL', async () => {
        const _TEST_CTX: Ctx = { ...TEST_CTX, useDKLS: false };
        const resp = await sendTransaction(_TEST_CTX, WALLET.share, WALLET.id, USER.id, TX, CHAIN);

        expect(resp).toStrictEqual({ signature: SIGNATURE });
        expect(mockSendTransactionUserManagement).toBeCalledTimes(1);
        expect(mockSendTransactionUserManagement).toBeCalledWith(USER.id, WALLET.id, { transaction: TX, chainId: CHAIN });
        expect(mockMPCPost).toBeCalledTimes(1);
        expect(mockMPCPost).toBeCalledWith(`/wallets/${WALLET.id}/transactions/send`, {
          userId: USER.id,
          protocolId: WALLET.protocolId,
          transaction: TX,
          chainId: CHAIN,
          signer: WALLET.share,
        });
        expect(mockDklsSendTransaction).not.toBeCalled();
        expect(mockSendTransaction).not.toBeCalled();
      });
      it('pending tx', async () => {
        mockSendTransactionUserManagement.mockResolvedValueOnce({
          data: {
            protocolId: WALLET.protocolId,
            pendingTransactionId: WALLET.pendingTransactionId,
          },
        });
        const resp = await sendTransaction(TEST_CTX, WALLET.share, WALLET.id, USER.id, TX, CHAIN);

        expect(resp).toStrictEqual({ pendingTransactionId: WALLET.pendingTransactionId });
        expect(mockSendTransactionUserManagement).toBeCalledTimes(1);
        expect(mockSendTransactionUserManagement).toBeCalledWith(USER.id, WALLET.id, { transaction: TX, chainId: CHAIN });
        expect(mockDklsSendTransaction).not.toBeCalled();
        expect(mockSendTransaction).not.toBeCalled();
      });
      it('disableWebSockets', async () => {
        const _TEST_CTX: Ctx = { ...TEST_CTX, disableWebSockets: true };
        const resp = await sendTransaction(_TEST_CTX, WALLET.share, WALLET.id, USER.id, TX, CHAIN);

        expect(resp).toStrictEqual({ signature: SIGNATURE });
        expect(mockSendTransactionUserManagement).toBeCalledTimes(1);
        expect(mockSendTransactionUserManagement).toBeCalledWith(USER.id, WALLET.id, { transaction: TX, chainId: CHAIN });
        expect(mockDklsSendTransaction).toBeCalledTimes(1);
        expect(mockDklsSendTransaction).toBeCalledWith(
          JSON.stringify({ ...SHARE, disableWebSockets: true }),
          getBaseMPCNetworkUrl(_TEST_CTX.env, !_TEST_CTX.disableWebSockets),
          TX,
          CHAIN,
          WALLET.protocolId,
          expect.any(Function),
        );
      });
    });
    it('fail', async () => {
      mockDklsSendTransaction.mockImplementationOnce((_, __, ___, ____, _____, cb) => {
        cb('test error', undefined);
      });

      await expect(sendTransaction(TEST_CTX, WALLET.share, WALLET.id, USER.id, TX, CHAIN)).rejects.toThrowError(
        `error signing transaction to send for account with userId ${USER.id} and walletId ${WALLET.id}`,
      );
      expect(mockSendTransactionUserManagement).toBeCalledTimes(1);
      expect(mockSendTransactionUserManagement).toBeCalledWith(USER.id, WALLET.id, { transaction: TX, chainId: CHAIN });
      expect(mockDklsSendTransaction).toBeCalledTimes(1);
      expect(mockDklsSendTransaction).toBeCalledWith(
        WALLET.share,
        getBaseMPCNetworkUrl(TEST_CTX.env, !TEST_CTX.disableWebSockets),
        TX,
        CHAIN,
        WALLET.protocolId,
        expect.any(Function),
      );
    });
  });
  describe('refresh', () => {
    describe('success', () => {
      it('DKLS', async () => {
        const resp = await refresh(
          TEST_CTX,
          WALLET.share,
          WALLET.id,
          USER.id,
          PARTNER.id,
          PARTNER.id,
          WALLET.preExistingProtocolId,
        );

        expect(resp).toStrictEqual({ signer: WALLET.signer, protocolId: WALLET.protocolId });
        expect(mockRefreshKeys).toBeCalledTimes(1);
        expect(mockRefreshKeys).toBeCalledWith(USER.id, WALLET.id, PARTNER.id, PARTNER.id, WALLET.preExistingProtocolId);
        expect(mockDklsRefresh).toBeCalledTimes(1);
        expect(mockDklsRefresh).toBeCalledWith(
          WALLET.share,
          getBaseMPCNetworkUrl(TEST_CTX.env, !TEST_CTX.disableWebSockets),
          WALLET.protocolId,
          expect.any(Function),
        );
      });
      it('no DKLS', async () => {
        const _TEST_CTX: Ctx = { ...TEST_CTX, useDKLS: false, offloadMPCComputationURL: undefined };
        const resp = await refresh(
          _TEST_CTX,
          WALLET.share,
          WALLET.id,
          USER.id,
          PARTNER.id,
          PARTNER.id,
          WALLET.preExistingProtocolId,
        );

        expect(resp).toStrictEqual({ signer: WALLET.signer, protocolId: WALLET.protocolId });
        expect(mockRefreshKeys).toBeCalledTimes(1);
        expect(mockRefreshKeys).toBeCalledWith(USER.id, WALLET.id, PARTNER.id, PARTNER.id, WALLET.preExistingProtocolId);
        expect(mockRefresh).toBeCalledTimes(1);
        expect(mockRefresh).toBeCalledWith(
          WALLET.share,
          getBaseMPCNetworkUrl(TEST_CTX.env, !TEST_CTX.disableWebSockets),
          WALLET.protocolId,
          expect.any(Function),
        );
      });
      it('disableWebSockets', async () => {
        const _TEST_CTX: Ctx = { ...TEST_CTX, disableWebSockets: true };
        const resp = await refresh(
          _TEST_CTX,
          WALLET.share,
          WALLET.id,
          USER.id,
          PARTNER.id,
          PARTNER.id,
          WALLET.preExistingProtocolId,
        );

        expect(resp).toStrictEqual({ signer: WALLET.signer, protocolId: WALLET.protocolId });
        expect(mockRefreshKeys).toBeCalledTimes(1);
        expect(mockRefreshKeys).toBeCalledWith(USER.id, WALLET.id, PARTNER.id, PARTNER.id, WALLET.preExistingProtocolId);
        expect(mockDklsRefresh).toBeCalledTimes(1);
        expect(mockDklsRefresh).toBeCalledWith(
          JSON.stringify({ ...SHARE, disableWebSockets: true }),
          getBaseMPCNetworkUrl(_TEST_CTX.env, !_TEST_CTX.disableWebSockets),
          WALLET.protocolId,
          expect.any(Function),
        );
      });
    });
    it('fail', async () => {
      mockDklsRefresh.mockImplementationOnce((_, __, ___, cb) => {
        cb('test error', undefined);
      });

      await expect(
        refresh(TEST_CTX, WALLET.share, WALLET.id, USER.id, PARTNER.id, PARTNER.id, WALLET.preExistingProtocolId),
      ).rejects.toThrowError(`error refreshing keys for account with userId ${USER.id} and walletId ${WALLET.id}`);
      expect(mockRefreshKeys).toBeCalledTimes(1);
      expect(mockRefreshKeys).toBeCalledWith(USER.id, WALLET.id, PARTNER.id, PARTNER.id, WALLET.preExistingProtocolId);
      expect(mockDklsRefresh).toBeCalledTimes(1);
      expect(mockDklsRefresh).toBeCalledWith(
        WALLET.share,
        getBaseMPCNetworkUrl(TEST_CTX.env, !TEST_CTX.disableWebSockets),
        WALLET.protocolId,
        expect.any(Function),
      );
    });
  });
  describe('getPrivateKey', () => {
    describe('success', () => {
      it('with share', async () => {
        const resp = await getPrivateKey(TEST_CTX, WALLET.share, WALLET.id, USER.id);

        expect(resp).toBe(WALLET.privateKey);
        expect(mockGetParaShare).toBeCalledTimes(1);
        expect(mockGetParaShare).toBeCalledWith(USER.id, WALLET.id);
        expect(mockGetPrivateKey).toBeCalledTimes(1);
        expect(mockGetPrivateKey).toBeCalledWith(WALLET.share, PARA_SHARE, expect.any(Function));
      });
      it('no share', async () => {
        mockGetParaShare.mockResolvedValueOnce(undefined);
        const resp = await getPrivateKey(TEST_CTX, WALLET.share, WALLET.id, USER.id);

        expect(resp).toBe('');
        expect(mockGetParaShare).toBeCalledTimes(1);
        expect(mockGetParaShare).toBeCalledWith(USER.id, WALLET.id);
        expect(mockGetPrivateKey).not.toBeCalled();
      });
    });
    it('fail', async () => {
      mockGetPrivateKey.mockImplementationOnce((_, __, cb) => {
        cb('test error', undefined);
      });

      await expect(getPrivateKey(TEST_CTX, WALLET.share, WALLET.id, USER.id)).rejects.toThrowError(
        `error getting private key for account with userId ${USER.id} and walletId ${WALLET.id}`,
      );
      expect(mockGetParaShare).toBeCalledTimes(1);
      expect(mockGetParaShare).toBeCalledWith(USER.id, WALLET.id);
      expect(mockGetPrivateKey).toBeCalledTimes(1);
      expect(mockGetPrivateKey).toBeCalledWith(WALLET.share, PARA_SHARE, expect.any(Function));
    });
  });
});
