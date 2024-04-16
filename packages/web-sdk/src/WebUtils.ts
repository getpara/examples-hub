import { Ctx, PlatformUtils, SignatureRes } from '@usecapsule/core-sdk';
import { LocalStorage } from './LocalStorage.js';
import { SessionStorage } from './SessionStorage.js';
import { keygen, preKeygen } from './wallet/keygen.js';
import { signMessage, sendTransaction, signTransaction } from './wallet/signing.js';
import { BackupKitEmailProps } from '@usecapsule/user-management-client';

export class WebUtils implements PlatformUtils {
  keygen (
    ctx: Ctx,
    userId: string,
    secretKey: string | null, // should be acceptable as null in RN as we don't pre-gen them
    sessionCookie: string,
    emailProps: BackupKitEmailProps = {}
  ): Promise<{
    signer: string;
    walletId: string;
  }> {
    return keygen(ctx, userId, secretKey, true, sessionCookie, emailProps);
  }

  preKeygen (
    ctx: Ctx,
    partnerId: string,
    email: string,
    secretKey: string | null, // should be acceptable as null in RN as we don't pre-gen them
    sessionCookie: string,
    ): Promise<{
    signer: string;
    walletId: string;
  }> {
    return preKeygen(ctx, email, secretKey, false, partnerId, sessionCookie);
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
    const popupWindow = window.open(popupUrl, 'popup', 'popup=true,width=400,height=500');
    if (!popupWindow) {
      setTimeout(() => {
        window.open(popupUrl, '_blank');
      }, 0);
    }
  }
}
