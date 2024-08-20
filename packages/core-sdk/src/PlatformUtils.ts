import { BackupKitEmailProps, WalletType } from '@usecapsule/user-management-client';
import { Ctx } from './definitions.js';
import { SignatureRes } from './types/walletTypes.js';
import { StorageUtils } from './StorageUtils.js';
import { PregenIdentifierType } from './CoreCapsule.js';

export interface PlatformUtils {
  getPrivateKey(ctx: Ctx, userId: string, walletId: string, share: string, sessionCookie: string): Promise<string>;

  keygen(
    ctx: Ctx,
    userId: string,
    type: Exclude<WalletType, WalletType.SOLANA>,
    secretKey: string | null, // should be acceptable as null in RN as we don't pre-gen them
    sessionCookie: string,
    emailProps?: BackupKitEmailProps,
  ): Promise<{
    signer: string;
    walletId: string;
  }>;

  preKeygen(
    ctx: Ctx,
    partnerId: string,
    pregenIdentifier: string,
    pregenIdentifierType: PregenIdentifierType,
    type: Exclude<WalletType, WalletType.SOLANA>,
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
    pregenIdentifierType: PregenIdentifierType,
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

  openPopup(popupUrl: string): void;
}
