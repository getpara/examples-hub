import { BackupKitEmailProps, TPregenIdentifierType, TWalletType, SDKType } from '@getpara/user-management-client';
import { Ctx, PopupType, SignatureRes } from './types/index.js';
import { StorageUtils } from './StorageUtils.js';

export interface PlatformUtils {
  sdkType: SDKType;
  getPrivateKey(ctx: Ctx, userId: string, walletId: string, share: string, sessionCookie: string): Promise<string>;

  keygen(
    ctx: Ctx,
    userId: string,
    type: Exclude<TWalletType, 'SOLANA'>,
    secretKey: string | null, // should be acceptable as null in RN as we don't pre-gen them
    sessionCookie: string,
    emailProps?: BackupKitEmailProps,
  ): Promise<{
    signer: string;
    walletId: string;
  }>;

  refresh(
    ctx: Ctx,
    sessionCookie: string,
    userId: string,
    walletId: string,
    signer: string,
    oldPartnerId?: string,
    newPartnerId?: string,
    keyShareProtocolId?: string,
  ): Promise<{
    signer: string;
    protocolId?: string;
  }>;

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
  }>;

  signMessage(
    ctx: Ctx,
    userId: string,
    walletId: string,
    share: string,
    message: string,
    sessionCookie: string,
    isDKLS?: boolean,
    cosmosSignDoc?: string,
  ): Promise<SignatureRes>;

  signTransaction(
    ctx: Ctx,
    userId: string,
    walletId: string,
    share: string,
    tx: string,
    chainId: string,
    sessionCookie: string,
    isDKLS?: boolean,
  ): Promise<SignatureRes>;

  sendTransaction(
    ctx: Ctx,
    userId: string,
    walletId: string,
    share: string,
    tx: string,
    chainId: string,
    sessionCookie: string,
    isDKLS?: boolean,
  ): Promise<SignatureRes>;

  // TODO probably not needed as signMessage should do the same
  signHash(
    address: string,
    hash: string,
  ): Promise<{
    v: number;
    r: Buffer;
    s: Buffer;
  }>;

  ed25519Keygen(
    ctx: Ctx,
    userId: string,
    sessionCookie: string,
    emailProps?: BackupKitEmailProps,
  ): Promise<{
    signer: string;
    walletId: string;
  }>;
  ed25519Sign(
    ctx: Ctx,
    userId: string,
    walletId: string,
    share: string,
    base64Bytes: string,
    sessionCookie: string,
  ): Promise<SignatureRes>;

  ed25519PreKeygen(
    ctx: Ctx,
    pregenIdentifier: string,
    pregenIdentifierType: TPregenIdentifierType,
    sessionCookie: string,
  ): Promise<{
    signer: string;
    walletId: string;
  }>;

  localStorage: StorageUtils;

  sessionStorage: StorageUtils;

  secureStorage?: StorageUtils;

  isSyncStorage?: boolean;

  disableProviderModal?: boolean;

  openPopup(popupUrl: string, opts?: { type: PopupType }): Window;

  initializeWorker(ctx: Ctx): Promise<void>;
}
