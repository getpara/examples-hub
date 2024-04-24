import { BackupKitEmailProps } from '@usecapsule/user-management-client';
import { Ctx } from './definitions.js';
import { SignatureRes } from './types/walletTypes.js';
import { StorageUtils } from './StorageUtils.js';

export interface PlatformUtils {
  keygen(
    ctx: Ctx,
    userId: string,
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
    email: string,
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

  localStorage: StorageUtils;

  sessionStorage: StorageUtils;

  secureStorage?: StorageUtils;

  isSyncStorage?: boolean;

  disableProviderModal?: boolean;

  openPopup(popupUrl: string): void;
}
