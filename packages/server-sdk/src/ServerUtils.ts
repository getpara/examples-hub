import type { Ctx, SignatureRes, PlatformUtils, TPregenIdentifierType, TWalletType } from '@getpara/core-sdk';
import { BackupKitEmailProps, SDKType } from '@getpara/user-management-client';
import { ServerLocalStorage } from './ServerLocalStorage.js';
import { ServerSessionStorage } from './ServerSessionStorage.js';
import { keygen, preKeygen, ed25519Keygen, ed25519PreKeygen, initializeWorker } from './wallet/keygen.js';
import { signMessage, sendTransaction, signTransaction, ed25519Sign } from './wallet/signing.js';
import { getPrivateKey } from './wallet/privateKey.js';

export class ServerUtils implements PlatformUtils {
  sdkType: SDKType = 'SERVER';

  getPrivateKey(ctx: Ctx, userId: string, walletId: string, share: string, sessionCookie: string): Promise<string> {
    return getPrivateKey(ctx, userId, walletId, share, sessionCookie);
  }

  keygen(
    ctx: Ctx,
    userId: string,
    type: Exclude<TWalletType, 'SOLANA'>,
    secretKey: string | null,
    sessionCookie: string,
    emailProps?: BackupKitEmailProps,
  ): Promise<{
    signer: string;
    walletId: string;
  }> {
    return keygen(ctx, userId, type, secretKey, sessionCookie, emailProps);
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
    throw new Error('Refresh function is not implemented in the ServerUtils class.');
  }

  preKeygen(
    ctx: Ctx,
    partnerId: string,
    pregenIdentifier: string,
    pregenIdentifierType: TPregenIdentifierType,
    type: Exclude<TWalletType, 'SOLANA'>,
    secretKey: string | null, // should be acceptable as null in RN as we don't pre-gen them
    sessionCookie: string,
  ): Promise<{
    signer: string;
    walletId: string;
  }> {
    return preKeygen(ctx, pregenIdentifier, pregenIdentifierType, type, secretKey, false, partnerId, sessionCookie);
  }

  signMessage(
    ctx: Ctx,
    userId: string,
    walletId: string,
    share: string,
    message: string,
    sessionCookie: string,
    isDKLS?: boolean,
  ): Promise<SignatureRes> {
    return signMessage(ctx, userId, walletId, share, message, sessionCookie, isDKLS);
  }

  signTransaction(
    ctx: Ctx,
    userId: string,
    walletId: string,
    share: string,
    message: string,
    chainId: string,
    sessionCookie: string,
    isDKLS?: boolean,
  ): Promise<SignatureRes> {
    return signTransaction(ctx, userId, walletId, share, message, chainId, sessionCookie, isDKLS);
  }

  sendTransaction(
    ctx: Ctx,
    userId: string,
    walletId: string,
    share: string,
    tx: string,
    chainId: string,
    sessionCookie: string,
    isDKLS?: boolean,
  ): Promise<SignatureRes> {
    return sendTransaction(ctx, userId, walletId, share, tx, chainId, sessionCookie, isDKLS);
  }

  signHash(
    _address: string,
    _hash: string,
  ): Promise<{
    v: number;
    r: Buffer;
    s: Buffer;
  }> {
    throw new Error('SignHash is not implemented in the ServerUtils class.');
  }
  ed25519Keygen(
    ctx: Ctx,
    userId: string,
    sessionCookie: string,
    emailProps?: BackupKitEmailProps,
  ): Promise<{
    signer: string;
    walletId: string;
  }> {
    return ed25519Keygen(ctx, userId, sessionCookie, emailProps);
  }

  ed25519PreKeygen(
    ctx: Ctx,
    pregenIdentifier: string,
    pregenIdentifierType: TPregenIdentifierType,
    sessionCookie: string,
  ): Promise<{
    signer: string;
    walletId: string;
  }> {
    return ed25519PreKeygen(ctx, pregenIdentifier, pregenIdentifierType, sessionCookie);
  }

  ed25519Sign(
    ctx: Ctx,
    userId: string,
    walletId: string,
    share: string,
    base64Bytes: string,
    sessionCookie: string,
  ): Promise<SignatureRes> {
    return ed25519Sign(ctx, userId, walletId, share, base64Bytes, sessionCookie);
  }

  localStorage = new ServerLocalStorage();

  sessionStorage = new ServerSessionStorage();

  secureStorage = undefined;

  isSyncStorage = true;

  disableProviderModal = true;

  async openPopup(_popupUrl: string): Promise<Window> {
    throw new Error('OpenPopup is not implemented in the ServerUtils class.');
  }

  async initializeWorker(ctx: Ctx): Promise<void> {
    return initializeWorker(ctx);
  }
}
