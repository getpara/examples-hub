import { PlatformUtils, TPregenIdentifierType } from '@getpara/web-sdk';
import { Ctx } from '@getpara/web-sdk';
import { SignatureRes } from '@getpara/web-sdk';
import { BackupKitEmailProps, KeyShareType, WalletScheme, WalletType } from '@getpara/user-management-client';
import { NativeModules } from 'react-native';

import { AsyncStorage } from '../AsyncStorage.js';
import { KeychainStorage } from '../KeychainStorage.js';

const { ParaSignerModule } = NativeModules;

async function keygenRequest(ctx: Ctx, userId: string, walletId: string, protocolId: string): Promise<{ signer: string }> {
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
  signer: string,
): Promise<{ signature: string }> {
  const { data } = await ctx.mpcComputationClient!.post(`/wallets/${walletId}/messages/sign`, {
    userId,
    protocolId,
    message,
    signer,
  });
  return data;
}

async function sendTransactionRequest(
  ctx: Ctx,
  userId: string,
  walletId: string,
  protocolId: string,
  transaction: string,
  signer: string,
  chainId: string,
): Promise<{ signature: string }> {
  const { data } = await ctx.mpcComputationClient!.post(`/wallets/${walletId}/transactions/send`, {
    userId,
    protocolId,
    transaction,
    signer,
    chainId,
  });
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
    type: Exclude<WalletType, WalletType.SOLANA>,
    _secretKey: string | null,
    _sessionCookie: string,
    _emailProps?: BackupKitEmailProps | undefined,
  ): Promise<{ signer: string; walletId: string }> {
    const { walletId, protocolId } = await ctx.client.createWallet(userId, {
      type,
      useTwoSigners: true,
      scheme: ctx.useDKLS ? WalletScheme.DKLS : WalletScheme.CGGMP,
    });

    if (ctx.mpcComputationClient && !ctx.useDKLS) {
      const { signer } = await keygenRequest(ctx, userId, walletId, protocolId);
      return { signer, walletId };
    }

    const createAccountFn = !ctx.useDKLS ? ParaSignerModule.createAccount : ParaSignerModule.dklsCreateAccount;
    const signer = await createAccountFn(walletId, protocolId, KeyShareType.USER, userId);
    return { signer, walletId };
  }

  refresh(
    _ctx: Ctx,
    _sessionCookie: string,
    _userId: string,
    _walletId: string,
    _share: string,
    _oldPartnerId?: string,
    _newPartnerId?: string,
  ): Promise<{
    signer: string;
  }> {
    throw new Error('Method not implemented.');
  }

  preKeygen(
    _ctx: Ctx,
    _partnerId: string,
    _email: string,
    _secretKey: string | null,
    _sessionCookie: string,
  ): Promise<{ signer: string; walletId: string }> {
    throw new Error('Method not implemented.');
  }

  getPrivateKey(_ctx: Ctx, _userId: string, _walletId: string, _share: string, _sessionCookie: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  openPopup(_popupUrl: string): any {
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
    isDKLS?: boolean,
  ): Promise<SignatureRes> {
    if (ctx.mpcComputationClient && !isDKLS) {
      const signature = (await sendTransactionRequest(ctx, userId, walletId, protocolId, rlpEncodedTxBase64, share, chainId))
        .signature;
      return { signature };
    }

    const sendTransactionFn = isDKLS ? ParaSignerModule.dklsSendTransaction : ParaSignerModule.sendTransaction;
    const signature = await sendTransactionFn(protocolId, share, rlpEncodedTxBase64, userId);
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
    isDKLS?: boolean,
  ): Promise<SignatureRes> {
    const { protocolId } = (
      await ctx.client.sendTransaction(userId, walletId, {
        transaction: rlpEncodedTxBase64,
        chainId,
      })
    ).data;
    return this.baseSignTransaction(ctx, userId, walletId, protocolId, share, rlpEncodedTxBase64, chainId, isDKLS);
  }

  async signHash(_address: string, _hash: string): Promise<{ v: number; r: Buffer; s: Buffer }> {
    throw new Error('not implemented');
  }

  async signMessage(
    ctx: Ctx,
    userId: string,
    walletId: string,
    share: string,
    messageBase64: string, // base64 message
    _sessionCookie: string,
    isDKLS?: boolean,
  ): Promise<SignatureRes> {
    const res = await ctx.client.preSignMessage(userId, walletId, messageBase64);

    if (ctx.mpcComputationClient && !isDKLS) {
      const signature = (await signMessageRequest(ctx, userId, walletId, res.protocolId, messageBase64, share)).signature;
      return { signature };
    }

    const signMessageFn = isDKLS ? ParaSignerModule.dklsSignMessage : ParaSignerModule.signMessage;
    const signature = await signMessageFn(res.protocolId, share, messageBase64, userId);

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
    isDKLS?: boolean,
  ): Promise<SignatureRes> {
    const { protocolId } = (
      await ctx.client.signTransaction(userId, walletId, {
        transaction: rlpEncodedTxBase64,
        chainId,
      })
    ).data;
    return this.baseSignTransaction(ctx, userId, walletId, protocolId, share, rlpEncodedTxBase64, chainId, isDKLS);
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
    const { walletId, protocolId } = await ctx.client.createWallet(userId, {
      scheme: WalletScheme.ED25519,
      type: WalletType.SOLANA,
    });

    const signer = await ParaSignerModule.ed25519CreateAccount(walletId, protocolId);
    return { signer, walletId };
  }

  async ed25519PreKeygen(
    ctx: Ctx,
    pregenIdentifier: string,
    pregenIdentifierType: TPregenIdentifierType,
    _sessionCookie: string,
  ): Promise<{
    signer: string;
    walletId: string;
  }> {
    const { walletId, protocolId } = await ctx.client.createPregenWallet({
      pregenIdentifier,
      pregenIdentifierType,
      scheme: WalletScheme.ED25519,
      type: WalletType.SOLANA,
    });

    const signer = await ParaSignerModule.ed25519CreateAccount(walletId, protocolId);
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
    const { protocolId } = await ctx.client.preSignMessage(userId, walletId, base64Bytes, WalletScheme.ED25519);

    const base64Sig = await ParaSignerModule.ed25519Sign(protocolId, share, base64Bytes);
    return { signature: base64Sig };
  }
}
