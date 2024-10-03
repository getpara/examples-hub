// Copyright (c) Capsule Labs Inc. All rights reserved.

import { PlatformUtils, PregenIdentifierType } from '@usecapsule/web-sdk';
import { Ctx } from '@usecapsule/web-sdk';
import { SignatureRes } from '@usecapsule/web-sdk';
import {
  BackupKitEmailProps,
  KeyType,
  SignatureScheme,
} from '@usecapsule/user-management-client';
import { NativeModules } from 'react-native';

import { AsyncStorage } from '../AsyncStorage';
import { KeychainStorage } from '../KeychainStorage';

const { CapsuleSignerModule } = NativeModules;

async function keygenRequest(
  ctx: Ctx,
  userId: string,
  walletId: string,
  protocolId: string
): Promise<{ signer: string }> {
  const { data } = await ctx.mpcComputationClient!.post('/wallets', {
    userId,
    walletId,
    protocolId,
  });
  return data;
}

async function signMessageRequest(
  ctx: Ctx,
  userId: string,
  walletId: string,
  protocolId: string,
  message: string,
  signer: string
): Promise<{ signature: string }> {
  const { data } = await ctx.mpcComputationClient!.post(
    `/wallets/${walletId}/messages/sign`,
    {
      userId,
      protocolId,
      message,
      signer,
    }
  );
  return data;
}

async function sendTransactionRequest(
  ctx: Ctx,
  userId: string,
  walletId: string,
  protocolId: string,
  transaction: string,
  signer: string,
  chainId: string
): Promise<{ signature: string }> {
  const { data } = await ctx.mpcComputationClient!.post(
    `/wallets/${walletId}/transactions/send`,
    {
      userId,
      protocolId,
      transaction,
      signer,
      chainId,
    }
  );
  return data;
}

export class ReactNativeUtils implements PlatformUtils {
  disableProviderModal?: boolean | undefined;
  localStorage = new AsyncStorage();
  sessionStorage = new AsyncStorage();
  secureStorage = new KeychainStorage();
  isSyncStorage = false;

  // only used in web for now, can implement functionality if ever needed for mobile
  async generateBlumPrimes(_ctx: Ctx): Promise<{ p: string; q: string }> {
    throw new Error('method not implemented');
  }

  async keygen(
    ctx: Ctx,
    userId: string,
    _secretKey: string | null,
    _sessionCookie: string,
    _emailProps?: BackupKitEmailProps | undefined
  ): Promise<{ signer: string; walletId: string }> {
    const { walletId, protocolId } = await ctx.capsuleClient.createWallet(
      userId,
      {
        useTwoSigners: true,
        scheme: ctx.useDKLS ? SignatureScheme.DKLS : SignatureScheme.CGGMP,
      }
    );

    if (ctx.mpcComputationClient && !ctx.useDKLS) {
      const { signer } = await keygenRequest(ctx, userId, walletId, protocolId);
      return { signer, walletId };
    }

    const createAccountFn = !ctx.useDKLS
      ? CapsuleSignerModule.createAccount
      : CapsuleSignerModule.dklsCreateAccount;
    const signer = await createAccountFn(
      walletId,
      protocolId,
      KeyType.USER,
      userId
    );
    return { signer, walletId };
  }

  preKeygen(
    _ctx: Ctx,
    _partnerId: string,
    _email: string,
    _secretKey: string | null,
    _sessionCookie: string
  ): Promise<{ signer: string; walletId: string }> {
    throw new Error('Method not implemented.');
  }

  getPrivateKey(
    _ctx: Ctx,
    _userId: string,
    _walletId: string,
    _share: string,
    _sessionCookie: string
  ): Promise<string> {
    throw new Error('Method not implemented.');
  }

  openPopup(_popupUrl: string): void {
    throw new Error('Method not implemented.');
  }

  private async baseSignTransaction(
    ctx: Ctx,
    userId: string,
    walletId: string,
    protocolId: string,
    share: string,
    rlpEncodedTxBase64: string,
    chainId: string,
    isDKLS?: boolean
  ): Promise<SignatureRes> {
    if (ctx.mpcComputationClient && !isDKLS) {
      const signature = (
        await sendTransactionRequest(
          ctx,
          userId,
          walletId,
          protocolId,
          rlpEncodedTxBase64,
          share,
          chainId
        )
      ).signature;
      return { signature };
    }

    const sendTransactionFn = isDKLS
      ? CapsuleSignerModule.dklsSendTransaction
      : CapsuleSignerModule.sendTransaction;
    const signature = await sendTransactionFn(
      protocolId,
      share,
      rlpEncodedTxBase64,
      userId
    );
    return { signature: signature.slice(2) };
  }

  async sendTransaction(
    ctx: Ctx,
    userId: string,
    walletId: string,
    share: string,
    rlpEncodedTxBase64: string,
    chainId: string,
    _sessionCookie: string,
    isDKLS?: boolean
  ): Promise<SignatureRes> {
    const { protocolId } = (
      await ctx.capsuleClient.sendTransaction(userId, walletId, {
        transaction: rlpEncodedTxBase64,
        chainId,
      })
    ).data;
    return this.baseSignTransaction(
      ctx,
      userId,
      walletId,
      protocolId,
      share,
      rlpEncodedTxBase64,
      chainId,
      isDKLS
    );
  }

  async signHash(
    _address: string,
    _hash: string
  ): Promise<{ v: number; r: Buffer; s: Buffer }> {
    throw new Error('not implemented');
  }

  async signMessage(
    ctx: Ctx,
    userId: string,
    walletId: string,
    share: string,
    messageBase64: string, // base64 message
    _sessionCookie: string,
    isDKLS?: boolean
  ): Promise<SignatureRes> {
    const res = await ctx.capsuleClient.preSignMessage(
      userId,
      walletId,
      messageBase64
    );

    if (ctx.mpcComputationClient && !isDKLS) {
      const signature = (
        await signMessageRequest(
          ctx,
          userId,
          walletId,
          res.protocolId,
          messageBase64,
          share
        )
      ).signature;
      return { signature };
    }

    const signMessageFn = isDKLS
      ? CapsuleSignerModule.dklsSignMessage
      : CapsuleSignerModule.signMessage;
    const signature = await signMessageFn(
      res.protocolId,
      share,
      messageBase64,
      userId
    );

    if (signature.startsWith('0x')) {
      return { signature: signature.slice(2) };
    }
    return { signature };
  }

  async signTransaction(
    ctx: Ctx,
    userId: string,
    walletId: string,
    share: string,
    rlpEncodedTxBase64: string, // base64 encoding of rlp encoded tx
    chainId: string,
    _sessionCookie: string,
    isDKLS?: boolean
  ): Promise<SignatureRes> {
    const { protocolId } = (
      await ctx.capsuleClient.signTransaction(userId, walletId, {
        transaction: rlpEncodedTxBase64,
        chainId,
      })
    ).data;
    return this.baseSignTransaction(
      ctx,
      userId,
      walletId,
      protocolId,
      share,
      rlpEncodedTxBase64,
      chainId,
      isDKLS
    );
  }

  async ed25519Keygen(
    ctx: Ctx,
    userId: string,
    _sessionCookie: string,
    _emailProps?: BackupKitEmailProps,
  ): Promise<{
    signer: string;
    walletId: string;
  }> {
    const { walletId, protocolId } = await ctx.capsuleClient.createWallet(userId, {
      scheme: SignatureScheme.ED25519,
    });
  
    const signer = await CapsuleSignerModule.ed25519CreateAccount(walletId, protocolId)
    return { signer, walletId };
  }
  
  async ed25519PreKeygen(
    ctx: Ctx,
    pregenIdentifier: string,
    pregenIdentifierType: PregenIdentifierType,
    _sessionCookie: string,
  ): Promise<{
    signer: string;
    walletId: string;
  }> {
    const { walletId, protocolId } = await ctx.capsuleClient.createPregenWallet({
      pregenIdentifier,
      pregenIdentifierType,
      scheme: SignatureScheme.ED25519,
    });
  
    const signer = await CapsuleSignerModule.ed25519CreateAccount(walletId, protocolId)
    return { signer, walletId };
  }
  
  async ed25519Sign(
    ctx: Ctx,
    userId: string,
    walletId: string,
    share: string,
    base64Bytes: string,
    _sessionCookie: string,
  ): Promise<SignatureRes> {
    const { protocolId } = await ctx.capsuleClient.preSignMessage(userId, walletId, base64Bytes, SignatureScheme.ED25519);

    const base64Sig = await CapsuleSignerModule.ed25519Sign(protocolId, share, base64Bytes)
    return { signature: base64Sig };  }
}
