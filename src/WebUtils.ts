import { Ctx } from './definitions';
import { SignatureRes } from './types/walletTypes';
import { LocalStorage } from './LocalStorage';
import { SessionStorage } from './SessionStorage';
import { keygen } from './wallet/keygen';
import { signMessage, sendTransaction, signTransaction } from './wallet/signing';
import { generateBlumPrimes } from './wallet/keygen';
import { PlatformUtils } from './PlatformUtils';

export class WebUtils implements PlatformUtils {
  keygen (
    ctx: Ctx,
    userId: string,
    secretKey: string | null, // should be acceptable as null in RN as we don't pre-gen them
    customFunction: (params?: any) => void,
    sessionCookie: string,
  ): Promise<{
    signer: string;
    walletId: string;
  }> {
    return keygen(ctx, userId, secretKey, true, customFunction, sessionCookie);
  }

  signMessage(
    ctx: Ctx,
    userId: string,
    walletId: string,
    share: string,
    message: string,
    sessionCookie: string,
  ): Promise<SignatureRes> {
    return signMessage(ctx, userId, walletId, share, message, sessionCookie);
  }

  signTransaction(
    ctx: Ctx,
    userId: string,
    walletId: string,
    share: string,
    message: string,
    sessionCookie: string,
  ): Promise<SignatureRes> {
    return signTransaction(ctx, userId, walletId, share, message, sessionCookie);
  }

  sendTransaction(
    ctx: Ctx,
    userId: string,
    walletId: string,
    share: string,
    tx: string,
    chainId: string,
    sessionCookie: string,
  ): Promise<SignatureRes> {
    return sendTransaction(ctx, userId, walletId, share, tx, chainId, sessionCookie);
  }

  signHash(_address: string, _hash: string): Promise<{
    v: number;
    r: Buffer;
    s: Buffer;
  }> {
    throw new Error('not implemented');
  }

  generateBlumPrimes = async (ctx: Ctx): Promise<{ p: string; q: string; }> => {
    return await generateBlumPrimes(ctx);
  }

  localStorage = new LocalStorage();

  sessionStorage = new SessionStorage();

  secureStorage = null;

  isSyncStorage = true;

  openPopup(popupUrl: string): void {
    window.open(popupUrl, 'popup', 'popup=true,width=400,height=500');
  }
}
