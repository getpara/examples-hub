import { Ctx } from './definitions';
import { SignatureRes } from './types/walletTypes';
import { StorageUtils } from './StorageUtils';

export interface PlatformUtils {
  keygen (
    ctx: Ctx,
    userId: string,
    secretKey: string | null, // should be acceptable as null in RN as we don't pre-gen them
    customFunction: (params?: any) => void,
    sessionCookie: string,
  ): Promise<{
    signer: string;
    walletId: string;
  }>,

  signMessage(
    ctx: Ctx,
    userId: string,
    walletId: string,
    share: string,
    message: string,
    sessionCookie: string,
  ): Promise<SignatureRes>,

  signTransaction(
    ctx: Ctx,
    userId: string,
    walletId: string,
    share: string,
    tx: string,
    chainId: string,
    sessionCookie: string,
  ): Promise<SignatureRes>,

  sendTransaction(
    ctx: Ctx,
    userId: string,
    walletId: string,
    share: string,
    tx: string,
    chainId: string,
    sessionCookie: string,
  ): Promise<SignatureRes>,

  // TODO probably not needed as signMessage should do the same
  signHash(address: string, hash: string): Promise<{
    v: number;
    r: Buffer;
    s: Buffer;
  }>;

  generateBlumPrimes(ctx: Ctx): Promise<{p: string; q: string}>,

  localStorage: StorageUtils,

  sessionStorage: StorageUtils,

  secureStorage?: StorageUtils,

  isSyncStorage?: boolean;

  openPopup(popupUrl: string): void,
}
