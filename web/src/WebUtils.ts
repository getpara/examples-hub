import { Ctx } from './core/definitions';
import { SignatureRes } from './core/types/walletTypes';
import { LocalStorage } from './LocalStorage';
import { SessionStorage } from './SessionStorage';
import { keygen } from './wallet/keygen';
import { signMessage, sendTransaction, signTransaction } from './wallet/signing';
import { PlatformUtils } from './core/PlatformUtils';

export class WebUtils implements PlatformUtils {
  keygen (
    ctx: Ctx,
    userId: string,
    secretKey: string | null, // should be acceptable as null in RN as we don't pre-gen them
    sessionCookie: string,
  ): Promise<{
    signer: string;
    walletId: string;
  }> {
    return keygen(ctx, userId, secretKey, true, sessionCookie);
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
    tx: string,
    chainId: string,
    sessionCookie: string,
    isDKLS?: boolean,
  ): Promise<SignatureRes> {
    return signTransaction(ctx, userId, walletId, share, tx, chainId, sessionCookie, isDKLS);
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

  signHash(_address: string, _hash: string): Promise<{
    v: number;
    r: Buffer;
    s: Buffer;
  }> {
    throw new Error('not implemented');
  }

  localStorage = new LocalStorage();

  sessionStorage = new SessionStorage();

  secureStorage = null;

  isSyncStorage = true;

  disableProviderModal = false;

  openPopup(popupUrl: string): void {
    window.open(popupUrl, 'popup', 'popup=true,width=400,height=500');
  }
}
